"use client";

import Link from "next/link";
import { useState } from "react";
import { useUtente } from "@/components/Providers";
import { BottomNav, ChipStato, Icona } from "@/components/ui";
import { PannelloTester } from "@/components/PannelloTester";
import { PromemoriaPolizza } from "@/components/PromemoriaPolizza";
import { LEZIONI, PERCORSO } from "@/lib/percorso";

export default function Home() {
  const { utente, progresso, toast } = useUtente();
  const [tester, setTester] = useState(false);

  const finito = progresso.quiz;
  const iniziato = progresso.lezioni > 0;
  const prossima = LEZIONI[Math.min(progresso.lezioni, LEZIONI.length - 1)];
  const emojiCentro = finito ? "🏆" : progresso.lezioni === LEZIONI.length ? "🎓" : prossima.emoji;
  const tappe = LEZIONI.length + 1;
  const fatte = progresso.lezioni + (progresso.quiz ? 1 : 0);

  return (
    <>
      <button
        onClick={() => setTester(true)}
        className="flex items-center justify-between gap-3 bg-forest px-4 py-2 text-left text-xs text-white"
      >
        <span>
          🧪 Utente di prova: <b>{utente.nome}</b>, {utente.eta} anni · {utente.os}
        </span>
        <span className="shrink-0 font-semibold text-kiwi-400 underline">Cambia</span>
      </button>

      <header className="flex items-center justify-end gap-2 px-4 pt-4">
        <ChipStato />
        <button
          onClick={() => setTester(true)}
          aria-label="Profilo"
          className="grid size-11 place-items-center rounded-full bg-soft text-2xl"
        >
          🤖
        </button>
      </header>

      <div className="flex gap-4 px-4 pt-5">
        <Link href="/academy" className="flex flex-col items-center gap-1.5 text-sm">
          <span className="grid size-[88px] place-items-center rounded-full border-4 border-line bg-kiwi-50 text-5xl">📚</span>
          Academy
        </Link>
        <button
          onClick={() => toast("Questa sezione non è nel prototipo")}
          className="flex flex-col items-center gap-1.5 text-sm"
        >
          <span className="grid size-[88px] place-items-center rounded-full border-4 border-line bg-kiwi-50 text-5xl">📱</span>
          App
        </button>
      </div>

      <section className="px-4 pt-6">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-b from-forest-deep via-forest-deep to-black px-5 pt-6 pb-5 text-white">
          <div className="relative flex h-44 items-center justify-center">
            {/* tappa precedente e successiva, come nella Home dell'app */}
            <div className="absolute top-[62px] left-[22px] h-[29px] w-[calc(50%-102px)] rounded-bl-2xl border-b-[5px] border-l-[5px] border-dashed border-white/25" />
            <div className="absolute top-1/2 right-[52px] h-0 w-[calc(50%-132px)] -translate-y-1/2 border-t-[5px] border-dashed border-white/25" />
            <span
              className={`absolute top-1 -left-1 grid size-14 place-items-center rounded-full ${iniziato ? "bg-[#3d5a35] text-white" : "bg-[#1c3a12] text-white/30"}`}
            >
              <Icona nome="check" size={28} stroke={3} />
            </span>
            <span className="absolute top-1/2 -right-3 grid size-16 -translate-y-1/2 place-items-center rounded-full border-2 border-white/10 text-white/30">
              <Icona nome="lock" size={26} />
            </span>
            <Anello valore={fatte / tappe}>
              <span className="grid size-24 place-items-center rounded-full bg-white text-5xl">{emojiCentro}</span>
            </Anello>
          </div>
          <p className="mt-4 text-center text-[32px] font-bold">{PERCORSO.titolo}</p>
          <Link
            href="/percorso"
            className="mt-5 flex h-14 items-center justify-center rounded-full bg-kiwi-400 text-lg font-semibold text-forest transition active:scale-[0.97]"
          >
            {finito ? "Ripassa il percorso" : iniziato ? "Continua il tuo viaggio!" : "Inizia il tuo viaggio!"}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 px-4 pt-4 pb-6">
        <div className="relative flex h-40 flex-col items-center justify-center gap-2 rounded-3xl border-[1.5px] border-green-600 font-bold text-green-600">
          <span className="absolute top-2 right-2 rounded-full bg-soft px-2.5 py-0.5 text-sm text-ink">0 🛡️</span>
          <span className="text-5xl">🔥</span>
          Serie attiva
        </div>
        <Link
          href="/percorso"
          className="flex h-40 flex-col items-center justify-center gap-2 rounded-3xl border-[1.5px] border-green-600 font-bold text-green-600"
        >
          <span className="text-5xl">🏋️</span>
          Ripassa
        </Link>
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-3xl border-[1.5px] border-line px-2 text-center text-sm font-semibold">
          <span className="text-4xl">🔒</span>
          Sblocca dopo 15 lezioni
          <span className="h-2 w-full overflow-hidden rounded-full bg-line">
            <span className="block h-full bg-forest" style={{ width: `${(fatte / 15) * 100}%` }} />
          </span>
        </div>
      </section>

      <BottomNav attiva="home" />
      <PromemoriaPolizza />
      {tester && <PannelloTester onClose={() => setTester(false)} />}
    </>
  );
}

// Anello di avanzamento attorno all'emoji della prossima tappa.
function Anello({ valore, children }: { valore: number; children: React.ReactNode }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-40 place-items-center">
      <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="#a2ec70"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${c * Math.max(valore, 0.04)} ${c}`}
        />
      </svg>
      {children}
    </div>
  );
}
