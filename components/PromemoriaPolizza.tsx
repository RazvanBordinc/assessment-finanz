"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { Overlay } from "@/components/Overlay";
import { Icona } from "@/components/ui";
import { NOME_RAMO } from "@/lib/utenti";

// Al massimo 3 volte, poi smette: un promemoria, non una pubblicità.
const MAX_MOSTRATO = 3;
// Dopo i toast (2,2 s), così non si sovrappongono.
const RITARDO_MS = 2500;

// Il 7,4% di chi completa il percorso esce sulla schermata "Percorso completato" e non vede mai
// la schermata partner, che oggi è l'unica occasione. Questo promemoria resta fisso in basso
// (Home e Academy) finché l'utente non ci arriva, lo chiude o l'ha già visto 3 volte.
// Testo neutro: spiega il passo successivo, non consiglia una polizza.
export function PromemoriaPolizza() {
  const { utente, progresso, aggiornaPromemoria, track } = useUtente();
  const router = useRouter();
  const promemoria = progresso.promemoria ?? { mostrato: 0, chiuso: false };
  const idoneo = progresso.quiz && !progresso.partnerVisto && !promemoria.chiuso;

  // Conta una sola comparsa per ogni visita della pagina.
  const contato = useRef(false);
  const [attivo, setAttivo] = useState(false);

  useEffect(() => {
    if (!idoneo || contato.current || promemoria.mostrato >= MAX_MOSTRATO) return;
    // Arriva poco dopo l'apertura della pagina, come una notifica, e non finisce sotto i toast.
    // Il progresso arriva da localStorage dopo il mount: la decisione si prende qui, una volta.
    const t = setTimeout(() => {
      contato.current = true;
      setAttivo(true);
      aggiornaPromemoria((p) => ({ ...p, mostrato: p.mostrato + 1 }));
      track("Partner Reminder Shown", { mostrato: promemoria.mostrato + 1 });
    }, RITARDO_MS);
    return () => clearTimeout(t);
  }, [idoneo, promemoria.mostrato, aggiornaPromemoria, track]);

  if (!idoneo || !attivo) return null;

  const apri = () => {
    track("Partner Reminder Clicked");
    router.push("/percorso/partner");
  };

  const chiudi = () => {
    track("Partner Reminder Dismissed");
    aggiornaPromemoria((p) => ({ ...p, chiuso: true }));
  };

  return (
    <Overlay>
      <div className="absolute inset-x-4 bottom-[104px] z-30 animate-toast">
        <div className="flex items-start gap-3 rounded-3xl bg-forest p-4 text-white shadow-[0_8px_28px_rgba(14,15,12,0.28)]">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-kiwi-100 text-2xl">🛡️</span>
          <button onClick={apri} className="flex flex-1 flex-col gap-1 text-left">
            <span className="text-xs font-semibold tracking-wide text-kiwi-400 uppercase">Manca un ultimo passo</span>
            <span className="text-[15px] leading-snug font-semibold">
              Confronta le offerte per la polizza {NOME_RAMO[utente.ramo]} in pochi minuti →
            </span>
            <span className="text-xs text-white/70">Gratis e senza impegno</span>
          </button>
          <button
            onClick={chiudi}
            aria-label="Chiudi il promemoria"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 transition active:scale-90"
          >
            <Icona nome="x" size={16} />
          </button>
        </div>
      </div>
    </Overlay>
  );
}
