"use client";

import Link from "next/link";
import { useUtente } from "@/components/Providers";
import { BarraProgresso, BottomNav, ChipStato } from "@/components/ui";
import { LEZIONI, PERCORSO } from "@/lib/percorso";

const ALTRI = [
  { emoji: "🌱", titolo: "Investire con gli ETF", livello: "Base", capitoli: 10, sfondo: "from-[#c9a24a] to-[#5b4a1c]" },
  { emoji: "🏛️", titolo: "Il mercato obbligazionario", livello: "Intermedio", capitoli: 13, sfondo: "from-[#5d7393] to-[#1d2a3d]" },
  { emoji: "🧾", titolo: "Sopravvivi alla burocrazia", livello: "Intermedio", capitoli: 12, sfondo: "from-[#c98a4a] to-[#4d2f17]" },
];

export default function Academy() {
  const { progresso, toast } = useUtente();
  const tappe = LEZIONI.length + 1;
  const fatte = progresso.lezioni + (progresso.quiz ? 1 : 0);

  return (
    <>
      <header className="flex items-center justify-end gap-2 px-4 pt-4">
        <ChipStato />
        <span className="grid size-11 place-items-center rounded-full bg-soft text-2xl">🤖</span>
      </header>

      <h2 className="px-4 pt-6 text-[28px] font-bold tracking-tight">📖 Continua a studiare</h2>
      <div className="px-4 pt-4">
        <Link href="/percorso" className="block overflow-hidden rounded-3xl border-[1.5px] border-line transition active:scale-[0.98]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PERCORSO.cover} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="flex flex-col gap-3 p-5">
            <span className="flex items-center gap-2 text-sm tracking-wide text-muted uppercase">
              <span className="grid size-8 place-items-center rounded-full bg-soft">⭐</span>
              {PERCORSO.livello}
            </span>
            <span className="text-2xl font-bold">{PERCORSO.titolo}</span>
            <BarraProgresso valore={(fatte / tappe) * 100} className="mt-2 h-3" />
            <span className="mt-2 w-fit rounded-full bg-soft px-3 py-1 text-sm">📖 {LEZIONI.length} lezioni + quiz</span>
          </div>
        </Link>
      </div>

      <h2 className="px-4 pt-8 text-[28px] font-bold tracking-tight">🤓 Potrebbe interessarti</h2>
      <div className="flex snap-x gap-3 overflow-x-auto px-4 pt-4 pb-6">
        {ALTRI.map((c) => (
          <button
            key={c.titolo}
            onClick={() => toast("Questo corso non è nel prototipo")}
            className="w-64 shrink-0 snap-start overflow-hidden rounded-3xl border-[1.5px] border-line text-left"
          >
            <div className={`grid aspect-[16/10] place-items-center bg-gradient-to-br text-6xl ${c.sfondo}`}>{c.emoji}</div>
            <div className="flex flex-col gap-2 p-4">
              <span className="flex items-center gap-2 text-sm tracking-wide text-muted uppercase">
                <span className="grid size-7 place-items-center rounded-full bg-soft text-sm">⭐</span>
                {c.livello}
              </span>
              <span className="truncate text-xl font-bold">{c.titolo}</span>
              <span className="w-fit rounded-full bg-soft px-3 py-1 text-sm">📖 {c.capitoli} capitoli</span>
            </div>
          </button>
        ))}
      </div>

      <BottomNav attiva="academy" />
    </>
  );
}
