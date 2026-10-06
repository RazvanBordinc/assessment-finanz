"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { BottomBar, ChipStato, Icona, PrimaryButton, SecondaryButton, TastoTondo } from "@/components/ui";
import { NOME_RAMO, type Ramo } from "@/lib/utenti";

const OGGETTO: Partial<Record<Ramo, string>> = { casa: "casa del tuo immobile" };
const AVVISO: Partial<Record<Ramo, string>> = { vita: "Ti chiederemo anche qualche dato sulla tua salute." };

// La schermata che porta al comparatore del partner, dopo il percorso.
export default function SchermataPartner() {
  const { utente, track } = useUtente();
  const router = useRouter();
  const tracciato = useRef(false);

  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    track("Partner Screen Viewed");
  }, [track]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-4">
        <TastoTondo label="Chiudi" onClick={() => router.push("/")}>
          <Icona nome="x" size={22} />
        </TastoTondo>
        <ChipStato serie={false} />
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4 pb-8">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">🛡️ Trova la tua polizza</h1>
        <p className="text-lg leading-snug font-semibold">
          Confronta in pochi minuti le offerte di tante compagnie per la polizza{" "}
          {OGGETTO[utente.ramo] ?? NOME_RAMO[utente.ramo]}.
        </p>
        <p className="rounded-2xl bg-box-azzurro px-6 py-4 text-lg leading-relaxed">
          Un solo modulo, tanti preventivi. Vedi prezzi, massimali e franchigie uno accanto all&apos;altro.
        </p>
        <p className="rounded-2xl bg-box-giallo px-6 py-4 text-lg leading-relaxed">
          Il confronto è gratis e non ti impegna. {AVVISO[utente.ramo]}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          Finanz non è un intermediario assicurativo e non ti consiglia una polizza specifica. Il confronto è offerto da un
          partner iscritto al Registro Unico degli Intermediari (RUI).
        </p>
      </div>

      <BottomBar>
        <PrimaryButton
          onClick={() => {
            track("Partner CTA Clicked");
            router.push("/comparatore");
          }}
        >
          Confronta le polizze
        </PrimaryButton>
        <SecondaryButton onClick={() => router.push("/")}>Torna alla Home</SecondaryButton>
      </BottomBar>
    </div>
  );
}
