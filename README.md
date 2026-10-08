# Finanz · Percorso Assicurazioni (prototipo)

Il prototipo del percorso Academy sulle assicurazioni, per il Business Case Finanz.

## Avvio

```bash
npm install
npm run dev                  # http://localhost:3000
```

## Com'è fatto

Il prototipo riproduce l'app Finanz: Home, Academy, mappa del percorso "Assicurati", 4 lezioni fatte di card (teoria, "Mettiti alla prova", vero o falso, sondaggi, un simulatore), quiz finale, fine percorso e schermata partner. Sul telefono funziona come un'app: il tasto o il gesto indietro torna alla card precedente, i bottom sheet si chiudono trascinandoli giù, la X chiede conferma prima di uscire.

| Schermata | Evento Mixpanel |
|---|---|
| Apertura della mappa del percorso | `Path Started` |
| Ultima card di ogni lezione, bottone "Continua" | `Lesson Completed` (`lesson_number`) |
| Ultima domanda del quiz finale | `Quiz Completed` (`quiz_score`: risposte giuste al primo tentativo) |
| Schermata "Percorso completato" | `Path Completed` |
| Schermata "Trova la tua polizza" | `Partner Screen Viewed` |
| Bottone "Confronta le polizze" | `Partner CTA Clicked` |
| Modulo inviato sul sito del partner | `Quote Requested` (nella realtà è un postback del partner) |

`Policy Activated` arriva dal partner giorni dopo, quindi qui non c'è.

Sugli schermi larghi, il pannello a destra mostra gli eventi mentre usi il percorso. Dalla striscia verde in cima alla Home (o dall'avatar) cambi utente di prova: ognuno ha un ramo e una risposta diversa alla domanda di onboarding "Hai attualmente delle assicurazioni?". Lì trovi anche le scorciatoie per ricominciare o saltare al quiz e alla schermata partner. L'avanzamento resta salvato nel browser.

```
app/page.tsx                     Home
app/academy/page.tsx             Academy
app/percorso/page.tsx            mappa del percorso
app/percorso/lezione/            lezioni e quiz finale, card per card (?n=1..4 o n=quiz, &c=card)
app/percorso/completato/         fine percorso
app/percorso/partner/            schermata partner (due versioni)
app/comparatore/page.tsx         sito del partner (simulato, pagine A e B)
components/PromemoriaPolizza.tsx promemoria per chi esce prima della schermata partner
components/Schede.tsx            le card delle lezioni
components/ui.tsx                chrome, bottoni, bottom sheet, barra in basso
lib/percorso.ts                  testi di lezioni e quiz
lib/navigazione.ts               cronologia card per card (tasto indietro)
lib/utenti.ts                    utenti di prova
lib/track.ts                     tracciamento eventi
analysis.sql                     le query dietro ogni numero del PDF (Postgres/Supabase, gira anche su DuckDB)
```

Cambia quello che vuoi: è un punto di partenza, non un vincolo.

## Cosa ho cambiato (Business Case)

**"Trova la tua polizza" per chi ha già una polizza.** Chi all'onboarding risponde "Sì, ne ho già una o più" vede una versione diversa: sceglie quale polizza confrontare (5 rami, ognuno con una riga su cosa copre, il ramo del percorso per primo) e, se vuole, apre cosa controllare prima di confrontare. Tutti gli altri vedono la schermata di sempre. Finanz spiega e non consiglia: il ramo lo sceglie l'utente.

**Sito del partner: pagine A e B (proposta per il partner).** Il bottone apre una pagina generica diversa in base alla risposta di onboarding: B per chi ha già una polizza (5 rami con un prezzo di partenza, di esempio, e un promemoria prima della scadenza), A per tutti gli altri (5 rami con un prezzo di partenza, di esempio). Finanz sceglie solo la pagina: non indica una polizza e non precompila il modulo.

**Fine percorso e promemoria.** "Percorso completato" mostra che manca un ultimo passo; chi esce prima della schermata partner trova un promemoria in Home e in Academy (al massimo 3 volte, si può chiudere). Per provarlo: scorciatoia "Completato, uscito prima del partner".

| Dove | Evento nuovo o proprietà nuova |
|---|---|
| Schermata "Trova la tua polizza" | `Partner Screen Viewed` (`versione`: `gia_assicurato` o `standard`) |
| Scelta del ramo (versione per chi ha già una polizza) | `Partner Line Selected` (`ramo_scelto`) |
| "Cosa controllare prima di confrontare" aperto | `Partner Checklist Opened` (`ramo_scelto`) |
| Bottone "Confronta le polizze" | `Partner CTA Clicked` (`versione`, `ramo_scelto`, `pagina_partner`: A o B) |
| Sito del partner, pagina A o B | `Partner Page Viewed` (`pagina`, postback) |
| Modulo inviato sul sito del partner | `Quote Requested` (`pagina`, `ramo_scelto`, postback) |
| Promemoria prima della scadenza (pagina B) | `Renewal Reminder Requested` (`ramo_scelto`, `mese_scadenza`, postback) |
| Promemoria in Home e Academy | `Partner Reminder Shown` / `Clicked` / `Dismissed` |

Per provare le due versioni: Giulia, Sara e Paolo hanno già una polizza (versione nuova, pagina B); Marco, Elena e Luca vedono la schermata di sempre e la pagina A.

## Verificare i numeri

Ogni numero del PDF esce da `analysis.sql`. Salva il primo foglio dell'export come CSV, poi:

- **Supabase:** importa il CSV come tabella `finanz` con la colonna `time` di tipo `timestamptz` (Table Editor → Import data from CSV), apri il SQL Editor, incolla `analysis.sql` ed esegui.
- **DuckDB:**

```sql
create table finanz as select * from read_csv('export_mixpanel_assicurazioni.csv', header=true, all_varchar=true);
alter table finanz alter column time type timestamp using cast(time as timestamp);
.read analysis.sql
```

## Pubblicare

Il modo più rapido è Vercel: importa il tuo repo da https://vercel.com/new e pubblica. Il link che ti dà Vercel è quello da mandarci.
