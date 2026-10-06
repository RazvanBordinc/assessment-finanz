"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { Chip, Icona, PrimaryButton } from "@/components/ui";
import { PERCORSO, QUIZ } from "@/lib/percorso";

export default function Page() {
  return (
    <Suspense>
      <PercorsoCompletato />
    </Suspense>
  );
}

function PercorsoCompletato() {
  const { track, kiwi } = useUtente();
  const router = useRouter();
  const punteggio = Number(useSearchParams().get("punteggio") ?? QUIZ.length);
  const tracciato = useRef(false);

  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    track("Path Completed");
  }, [track]);

  return (
    <div className="flex flex-1 flex-col bg-forest text-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => router.push("/")}
          aria-label="Torna alla Home"
          className="grid size-10 place-items-center rounded-full bg-white/15 transition active:scale-90"
        >
          <Icona nome="x" size={22} />
        </button>
        <div className="flex gap-2 [&>span]:border-white/40">
          <Chip>∞ 💛</Chip>
          <Chip>{kiwi.toLocaleString("it-IT")} 🥝</Chip>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-6 text-center">
        <span className="grid size-44 animate-pop place-items-center rounded-full bg-kiwi-100 text-[88px]">🏆</span>
        <p className="font-display text-[56px] leading-[0.95] font-bold text-kiwi-400 uppercase">
          Percorso
          <br />
          completato
        </p>
        <p className="text-base leading-snug">
          Ora sai come nasce il prezzo, come leggere una polizza e come confrontare le offerte.
        </p>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-16 w-40 items-center justify-center rounded-2xl border-2 border-kiwi-400 text-2xl font-semibold">
              🥝 {PERCORSO.kiwiTraguardo}
            </span>
            <span className="text-sm">Kiwi guadagnati</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-16 w-40 items-center justify-center rounded-2xl border-2 border-kiwi-400 text-2xl font-semibold">
              🎯 {punteggio}/{QUIZ.length}
            </span>
            <span className="text-sm">Risposte giuste</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 px-4 pb-6">
        <PrimaryButton onClick={() => router.push("/percorso/partner")}>Prosegui</PrimaryButton>
      </div>
    </div>
  );
}
