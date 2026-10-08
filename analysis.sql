-- =====================================================================================================
-- Finanz · Insurance Path · Business Case
-- Every number in the PDF comes from one of the queries below.
--
-- Input: the Mixpanel export (export_mixpanel_assicurazioni.xlsx, sheet 1) loaded as a table `finanz`
-- with its columns as they are: event, time, distinct_id, "$os", "$app_version_string", ramo,
-- onboarding_intent, lesson_number, quiz_score, source, "$insert_id". `time` as a timestamp.
-- Written for Postgres (Supabase); also runs on DuckDB.
-- =====================================================================================================


-- -----------------------------------------------------------------------------------------------------
-- 0. Cleaning
-- -----------------------------------------------------------------------------------------------------

-- 0a. Drop the 6 internal test accounts.
create or replace view finanz_clean as
select * from finanz
where distinct_id not in ('demo_investor', 'qa.android', 'qa.ios', 'test_qa1', 'test_qa2', 'test_walter');

-- 0b. Merge the insurance-line labels (rc auto / RC Auto / Rc_auto, Dentale / dental, casa + trailing space,
--     vita_tcm into vita) and label the onboarding answer.
create or replace view finanz_norm as
select *,
  case when lower(trim(ramo)) in ('rc_auto', 'rc auto') then 'rc_auto'
       when lower(trim(ramo)) in ('dentale', 'dental')  then 'dentale'
       when lower(trim(ramo)) in ('vita', 'vita_tcm')   then 'vita'
       else lower(trim(ramo)) end                                   as line,
  case when onboarding_intent like 'S%'      then 'already_insured'   -- "Sì, ne ho già una o più"
       when onboarding_intent like 'No, ma%' then 'high_intent'       -- "No, ma sto pensando di farne una"
       when onboarding_intent = 'No'         then 'no_intent'
       else 'no_answer' end                                         as intent
from finanz_clean;

-- 0c. One row per user: the build they started on, when each step happened, and the payout of their line.
create or replace view finanz_users as
with starts as (
  select distinct on (distinct_id) distinct_id, time as started_at, "$os" as os, "$app_version_string" as app_version
  from finanz_norm
  where event = 'Path Started'
  order by distinct_id, time
),
u as (
  select n.distinct_id,
    max(n.line)                                                                   as line,
    max(n.intent)                                                                 as intent,
    bool_or(n.event = 'Path Started')                                             as started,
    bool_or(n.event = 'Lesson Completed' and n.lesson_number::text in ('1', '1.0')) as l1,
    bool_or(n.event = 'Lesson Completed' and n.lesson_number::text in ('2', '2.0')) as l2,
    bool_or(n.event = 'Lesson Completed' and n.lesson_number::text in ('3', '3.0')) as l3,
    bool_or(n.event = 'Lesson Completed' and n.lesson_number::text in ('4', '4.0')) as l4,
    bool_or(n.event = 'Quiz Completed')                                           as quiz,
    bool_or(n.event = 'Path Completed')                                           as completed,
    bool_or(n.event = 'Partner Screen Viewed')                                    as viewed,
    count(*) filter (where n.event = 'Partner Screen Viewed')                      as n_views,
    bool_or(n.event = 'Partner CTA Clicked')                                      as clicked,
    bool_or(n.event = 'Quote Requested')                                          as quoted,
    bool_or(n.event = 'Policy Activated')                                         as activated,
    min(n.time) filter (where n.event = 'Path Completed')                         as completed_at,
    min(n.time) filter (where n.event = 'Partner Screen Viewed')                  as viewed_at,
    min(n.time) filter (where n.event = 'Partner CTA Clicked')                    as clicked_at,
    min(n.time) filter (where n.event = 'Policy Activated')                       as activated_at,
    max(n.time)                                                                   as last_event_at,
    max(case when n.event = 'Quiz Completed' then n.quiz_score::text end)          as quiz_score
  from finanz_norm n
  group by n.distinct_id
)
select u.*, s.started_at, s.os, s.app_version,
  (s.os = 'Android' and s.app_version = '4.12.0')                                 as bug_build,
  case u.line when 'rc_auto' then 45 when 'casa' then 40 when 'salute' then 75
              when 'vita' then 80 when 'dentale' then 35 end                      as payout
from u left join starts s on s.distinct_id = u.distinct_id;


-- -----------------------------------------------------------------------------------------------------
-- 1. The funnel, step by step (page 1): unique users per step, % of the previous step
-- -----------------------------------------------------------------------------------------------------
with f as (
  select 1 as n, 'Started the path' as step, count(*) filter (where started) as users from finanz_users
  union all select 2,  'Lesson 1',                count(*) filter (where l1)        from finanz_users
  union all select 3,  'Lesson 2',                count(*) filter (where l2)        from finanz_users
  union all select 4,  'Lesson 3',                count(*) filter (where l3)        from finanz_users
  union all select 5,  'Lesson 4',                count(*) filter (where l4)        from finanz_users
  union all select 6,  'Quiz',                    count(*) filter (where quiz)      from finanz_users
  union all select 7,  'Path completed',          count(*) filter (where completed) from finanz_users
  union all select 8,  'Saw the partner screen',  count(*) filter (where viewed)    from finanz_users
  union all select 9,  'Clicked the partner CTA', count(*) filter (where clicked)   from finanz_users
  union all select 10, 'Asked for a quote',       count(*) filter (where quoted)    from finanz_users
  union all select 11, 'Policy activated',        count(*) filter (where activated) from finanz_users
)
select n, step, users,
  round(100.0 * users / lag(users) over (order by n), 1) as pct_of_previous_step
from f order by n;


-- -----------------------------------------------------------------------------------------------------
-- 2. Bottleneck 1 (page 2): already insured vs the other answers, step by step
--    -> 4,358 vs 2,678 started; 17.1% vs 29.6% click; 20.8% vs 45.8% quote after clicking; 0.7% vs 2.2%
-- -----------------------------------------------------------------------------------------------------
select intent,
  count(*) filter (where started)                                                          as started_the_path,
  count(*) filter (where viewed)                                                           as viewed_partner_screen,
  count(*) filter (where viewed and clicked)                                               as clicked,
  round(100.0 * count(*) filter (where viewed and clicked) / count(*) filter (where viewed), 1) as click_rate,
  count(*) filter (where quoted)                                                           as quotes,
  round(100.0 * count(*) filter (where quoted) / count(*) filter (where clicked), 1)       as quote_rate_after_click,
  count(*) filter (where activated)                                                        as policies,
  round(100.0 * count(*) filter (where activated) / count(*) filter (where started), 1)    as activation_rate
from finanz_users
group by intent order by intent;

-- 2b. The same gap on every line (already insured 13-20% vs high intent 25-34%)
select line, intent,
  count(*) filter (where viewed)                                                                as viewers,
  round(100.0 * count(*) filter (where viewed and clicked) / count(*) filter (where viewed), 1) as click_rate
from finanz_users
where intent in ('already_insured', 'high_intent')
group by line, intent order by line, intent;


-- -----------------------------------------------------------------------------------------------------
-- 3. Bottleneck 2 (page 3): Android 4.12.0 vs every other build
--    -> 1,165 vs 7,835 started; lesson 3 26.0% vs 77.1%; path 22.7% vs 69.9%; 681 vs 568 stuck
-- -----------------------------------------------------------------------------------------------------
select case when bug_build then 'Android 4.12.0' else 'every other build' end         as build,
  count(*)                                                                             as started_the_path,
  round(100.0 * count(*) filter (where l2) / count(*), 1)                              as completed_lesson_2,
  round(100.0 * count(*) filter (where l3) / count(*), 1)                              as completed_lesson_3,
  round(100.0 * count(*) filter (where completed) / count(*), 1)                       as completed_the_path,
  count(*) filter (where l2 and not l3)                                                as finished_l2_not_l3
from finanz_users where started
group by 1 order by 1;

-- 3b. When: first start on 4.12.0 (12 May), first start on the fix 4.12.1 (week of 8 Jun),
--     users still starting on 4.12.0 from 8 Jun (175)
select
  (select min(started_at) from finanz_users where bug_build)                                    as first_start_4_12_0,
  (select min(started_at) from finanz_users where os = 'Android' and app_version = '4.12.1')     as first_start_4_12_1,
  (select count(*) from finanz_users where bug_build and started_at >= timestamp '2026-06-08')   as still_on_4_12_0_from_8_jun;

-- 3c. Users who finished lesson 2 but not lesson 3 and still show a later event (0: they really got stuck)
select count(*) as stuck_users_with_a_later_event
from finanz_users
where l2 and not l3 and (l4 or quiz or completed or viewed or clicked);


-- -----------------------------------------------------------------------------------------------------
-- 4. What the path earned (page 4): 98 policies, EUR 5,200
-- -----------------------------------------------------------------------------------------------------
select line, count(*) as policies, min(payout) as payout, sum(payout) as revenue
from finanz_users where activated
group by line order by revenue desc;

select count(*) as policies, sum(payout) as revenue from finanz_users where activated;

-- 4b. Each user activated at most one policy (0 users with more than one)
select count(*) as users_with_more_than_one_policy
from (select distinct_id from finanz_norm where event = 'Policy Activated' group by distinct_id having count(*) > 1) x;

-- 4c. By month (Apr 1,530 · May 1,770 · Jun 1,470 · Jul 430); July policies all come from June starters
select date_trunc('month', activated_at) as month, count(*) as policies, sum(payout) as revenue,
  count(*) filter (where date_trunc('month', started_at) = timestamp '2026-06-01') as from_june_starters
from finanz_users where activated
group by 1 order by 1;


-- -----------------------------------------------------------------------------------------------------
-- 5. Cost of Bottleneck 1, per 3 months (EUR 487-1,187, median 837)
--    Extra clicks if already-insured users clicked like everyone else (low), the midpoint, or like
--    high-intent users (high); each extra click valued at what their clicks earn today (EUR 3.66).
-- -----------------------------------------------------------------------------------------------------
with s as (
  select
    count(*) filter (where intent = 'already_insured' and viewed)                               as viewers,
    count(*) filter (where intent = 'already_insured' and viewed and clicked)                   as clicks,
    sum(case when intent = 'already_insured' and activated then payout else 0 end)              as revenue,
    1.0 * count(*) filter (where intent <> 'already_insured' and viewed and clicked)
        / count(*) filter (where intent <> 'already_insured' and viewed)                        as rate_everyone_else,
    1.0 * count(*) filter (where intent = 'high_intent' and viewed and clicked)
        / count(*) filter (where intent = 'high_intent' and viewed)                             as rate_high_intent
  from finanz_users
)
select viewers, clicks, revenue,
  round(100.0 * clicks / viewers, 1)                                                         as click_rate_today,
  round(100 * rate_everyone_else, 1)                                                         as rate_everyone_else,
  round(100 * rate_high_intent, 1)                                                           as rate_high_intent,
  round(1.0 * revenue / clicks, 2)                                                           as eur_per_click,
  round((viewers * rate_everyone_else - clicks) * revenue / clicks)                          as cost_low,
  round((viewers * (rate_everyone_else + rate_high_intent) / 2 - clicks) * revenue / clicks) as cost_median,
  round((viewers * rate_high_intent - clicks) * revenue / clicks)                            as cost_high,
  round(4 * (viewers * rate_everyone_else - clicks) * revenue / clicks)                      as per_year_low,
  round(4 * (viewers * rate_high_intent - clicks) * revenue / clicks)                        as per_year_high
from s;


-- -----------------------------------------------------------------------------------------------------
-- 6. Cost of Bottleneck 2 (EUR 571-840, median 635)
--    What 4.12.0 starters earned (EUR 0.103 each) vs other builds in the same weeks (starts from Monday
--    11 May, the week 4.12.0 appeared), all other builds, and other Android builds; x 1,165 starters.
-- -----------------------------------------------------------------------------------------------------
with r as (
  select
    count(*) filter (where bug_build)                                                                as bug_starters,
    1.0 * sum(case when bug_build and activated then payout else 0 end) / count(*) filter (where bug_build) as eur_bug,
    1.0 * sum(case when not bug_build and started_at >= timestamp '2026-05-11' and activated then payout else 0 end)
        / count(*) filter (where not bug_build and started_at >= timestamp '2026-05-11')            as eur_same_weeks,
    1.0 * sum(case when not bug_build and activated then payout else 0 end)
        / count(*) filter (where not bug_build)                                                      as eur_all_other,
    1.0 * sum(case when not bug_build and os = 'Android' and activated then payout else 0 end)
        / count(*) filter (where not bug_build and os = 'Android')                                   as eur_other_android
  from finanz_users where started
)
select bug_starters,
  round(eur_bug, 3)                                    as eur_per_starter_4_12_0,
  round(eur_same_weeks, 3)                             as eur_same_weeks,
  round(eur_all_other, 3)                              as eur_all_other_builds,
  round(eur_other_android, 3)                          as eur_other_android,
  round(bug_starters * (eur_same_weeks - eur_bug))     as cost_low,
  round(bug_starters * (eur_all_other - eur_bug))      as cost_median,
  round(bug_starters * (eur_other_android - eur_bug))  as cost_high
from r;


-- -----------------------------------------------------------------------------------------------------
-- 7. Completion screen drop (pages 4 and 9)
-- -----------------------------------------------------------------------------------------------------

-- 7a. 422 completers (7.4%) never see the partner screen; 0 of them come back; cost up to 422 x 5,200/5,319
select
  count(*) filter (where completed and not viewed)                                               as left_on_path_completed,
  round(100.0 * count(*) filter (where completed and not viewed) / count(*) filter (where completed), 1) as pct_of_completers,
  count(*) filter (where completed and not viewed and last_event_at > completed_at)              as came_back_later,
  round(100.0 * count(*) filter (where viewed) / count(*) filter (where completed), 1)           as pct_completers_reaching_partner_screen,
  round(count(*) filter (where completed and not viewed) * 5200.0 / count(*) filter (where viewed)) as cost_up_to
from finanz_users;

-- 7b. Same drop on every line (6.3-8.3%)
select line, round(100.0 * count(*) filter (where not viewed) / count(*), 1) as pct_leaving
from finanz_users where completed group by line order by line;

-- 7c. Same on every build (91.7-93.9% reach the partner screen)
select os, app_version, round(100.0 * count(*) filter (where viewed) / count(*), 1) as pct_reaching_partner_screen
from finanz_users where completed group by os, app_version order by os, app_version;

-- 7d. Those who continue reach the partner screen within 3 seconds
select
  percentile_cont(0.5) within group (order by extract(epoch from (viewed_at - completed_at))) as median_seconds,
  percentile_cont(0.9) within group (order by extract(epoch from (viewed_at - completed_at))) as p90_seconds,
  max(extract(epoch from (viewed_at - completed_at)))                                          as max_seconds
from finanz_users where completed and viewed and viewed_at >= completed_at;

-- 7e. The partner screen is seen once: nobody saw it twice (0). 63 users have the view logged twice, but with the
--     same timestamp and the same $insert_id: one view tracked twice, not a second visit.
select
  count(*) filter (where view_events >= 2)   as users_with_the_view_logged_twice,
  count(*) filter (where separate_views >= 2) as users_who_saw_it_twice
from (select distinct_id, count(*) as view_events, count(distinct time) as separate_views
      from finanz_norm where event = 'Partner Screen Viewed' group by distinct_id) v;


-- -----------------------------------------------------------------------------------------------------
-- 8. Quiz score doesn't explain the partner-screen drop (click rate 18.6-21.0% across scores 2-5)
-- -----------------------------------------------------------------------------------------------------
select quiz_score, count(*) as viewers,
  round(100.0 * count(*) filter (where clicked) / count(*), 1) as click_rate
from finanz_users where viewed and quiz_score is not null
group by quiz_score order by quiz_score;


-- -----------------------------------------------------------------------------------------------------
-- 9. Beyond the app (page 7): 1,047 -> 346; 88% of quotes from already insured + high intent (61.6% high
--    intent alone); "No" + no answer = ~13% of clickers
-- -----------------------------------------------------------------------------------------------------
select intent,
  count(*) filter (where clicked)                                                                as clickers,
  round(100.0 * count(*) filter (where clicked) / sum(count(*) filter (where clicked)) over (), 1) as pct_of_clickers,
  count(*) filter (where quoted)                                                                 as quotes,
  round(100.0 * count(*) filter (where quoted) / sum(count(*) filter (where quoted)) over (), 1)   as pct_of_quotes
from finanz_users
group by intent order by intent;


-- -----------------------------------------------------------------------------------------------------
-- 10. How I'd test it (page 6)
-- -----------------------------------------------------------------------------------------------------

-- 10a. About 200 already-insured users see the partner screen a week (2,597 over the 13 weeks of starts)
select count(*) filter (where intent = 'already_insured' and viewed)          as viewers,
  round(count(*) filter (where intent = 'already_insured' and viewed) / 13.0) as per_week
from finanz_users;

-- 10b. Users per group to spot a rise from 17.1% to 22.2% (two-sided 5% significance, 80% power): 936
select ceil(power(1.959964 * sqrt(2 * pb * (1 - pb)) + 0.841621 * sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2)
            / power(p2 - p1, 2)) as users_per_group
from (select 443.0 / 2597 as p1, 0.222 as p2, (443.0 / 2597 + 0.222) / 2 as pb) x;


-- -----------------------------------------------------------------------------------------------------
-- 11. Notes on the numbers (page 9)
-- -----------------------------------------------------------------------------------------------------

-- 11a. Dates: starts 1 Apr - 30 Jun 2026, activity until 12 Jul
select min(started_at) as first_start, max(started_at) as last_start, max(last_event_at) as last_event
from finanz_users;

-- 11b. EUR 0.58 per user who started; 650-750 new users a week (full weeks)
select round(5200.0 / count(*), 3) as eur_per_starter from finanz_users where started;

select date_trunc('week', started_at) as week, count(*) as new_users
from finanz_users
where started and started_at >= timestamp '2026-04-06' and started_at < timestamp '2026-06-29'
group by 1 order by 1;

-- 11c. Days from click to policy: median 8.3, max 14.7
select
  round((percentile_cont(0.5) within group (order by extract(epoch from (activated_at - clicked_at)) / 86400))::numeric, 1) as median_days,
  round((max(extract(epoch from (activated_at - clicked_at)) / 86400))::numeric, 1)                                          as max_days
from finanz_users where activated and clicked;

-- 11d. Still to come: clicks in the last 14 days converted at 5.8 per 100 vs 9.6 before, so ~3 policies (~EUR 140)
with cut as (select max(time) - interval '14 days' as t from finanz_norm),
c as (
  select
    count(*) filter (where clicked_at >= cut.t)                                       as recent_clicks,
    100.0 * count(*) filter (where clicked_at >= cut.t and activated)
          / count(*) filter (where clicked_at >= cut.t)                               as recent_per_100,
    100.0 * count(*) filter (where clicked_at < cut.t and activated)
          / count(*) filter (where clicked_at < cut.t)                                as older_per_100
  from finanz_users, cut where clicked
)
select recent_clicks, round(recent_per_100, 1) as recent_per_100, round(older_per_100, 1) as older_per_100,
  round(recent_clicks * (older_per_100 - recent_per_100) / 100, 1)                     as policies_still_to_come,
  round(recent_clicks * (older_per_100 - recent_per_100) / 100 * 5200 / 98)            as eur_still_to_come
from c;


-- -----------------------------------------------------------------------------------------------------
-- 12. Data checks behind the cleaning
-- -----------------------------------------------------------------------------------------------------

-- 12a. Events from the 6 test accounts
select distinct_id, count(*) as events from finanz
where distinct_id in ('demo_investor', 'qa.android', 'qa.ios', 'test_qa1', 'test_qa2', 'test_walter')
group by distinct_id order by distinct_id;

-- 12b. Raw line labels before merging
select ramo, count(*) as events from finanz_clean group by ramo order by events desc;

-- 12c. Events that fire twice (e.g. the quiz): users with more than one Quiz Completed
select count(*) as users_with_quiz_twice
from (select distinct_id from finanz_clean where event = 'Quiz Completed' group by distinct_id having count(*) > 1) x;
