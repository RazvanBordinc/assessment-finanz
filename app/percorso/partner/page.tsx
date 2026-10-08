"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { BottomBar, ChipStato, Icona, PrimaryButton, SecondaryButton, TastoTondo } from "@/components/ui";
import { NOME_RAMO, RAMI, type Ramo } from "@/lib/utenti";

const OGGETTO: Partial<Record<Ramo, string>> = { casa: "casa del tuo immobile" };
const AVVISO: Partial<Record<Ramo, string>> = { vita: "Ti chiederemo anche qualche dato sulla tua salute." };

// Chi all'onboarding ha risposto di avere già una o più polizze: clicca il 17,1% contro il 29,6%
// di chi non ne ha ma ci sta pensando. Per loro la schermata cambia; per tutti gli altri resta com'è.
const GIA_ASSICURATO = "Sì, ne ho già una o più";

// Cosa copre ogni ramo, in una riga. Spiega, non consiglia: il ramo lo sceglie l'utente.
const COSA_COPRE: Record<Ramo, string> = {
  rc_auto: "Obbligatoria per guidare: copre i danni che causi ad altri.",
  casa: "Protegge l'abitazione da danni come incendio o perdite d'acqua.",
  salute: "Rimborsa visite, esami e ricoveri.",
  vita: "Un capitale per i tuoi cari se ti succede qualcosa.",
  dentale: "Copre visite e cure dal dentista.",
};

// Cosa guardare prima di confrontare: contenuto educativo, uguale per chiunque scelga quel ramo.
const COSA_CONTROLLARE: Record<Ramo, string[]> = {
  rc_auto: [
    "Il massimale: fino a quanto paga la compagnia se causi un incidente.",
    "La classe di merito, da cui dipende gran parte del prezzo.",
    "La scadenza: l'RC auto dura un anno e non si rinnova da sola, quindi ogni anno puoi confrontare.",
  ],
  casa: [
    "Cosa copre: solo l'incendio o anche acqua, furto e danni a terzi.",
    "Il valore assicurato dell'abitazione, se è ancora aggiornato.",
    "La franchigia: la parte di ogni danno che resta a tuo carico.",
  ],
  salute: [
    "Se rimborsa le spese o funziona con una rete di strutture convenzionate.",
    "Il massimale annuo e le spese escluse.",
    "Le carenze: i primi mesi in cui una nuova polizza non copre ancora.",
  ],
  vita: [
    "Il capitale assicurato: basta ancora per chi dipende da te?",
    "Fino a quando dura la copertura.",
    "I beneficiari indicati nella polizza.",
  ],
  dentale: [
    "Quali cure copre: solo prevenzione o anche interventi.",
    "Se ci sono dentisti convenzionati vicino a te.",
    "Le carenze: i primi mesi in cui una nuova polizza non copre ancora.",
  ],
};

const maiuscola = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// La schermata che porta al comparatore del partner, dopo il percorso.
export default function SchermataPartner() {
  const { utente, track, segnaPartnerVisto } = useUtente();
  const router = useRouter();
  const tracciato = useRef(false);
  const giaAssicurato = utente.onboarding_intent === GIA_ASSICURATO;
  const versione = giaAssicurato ? "gia_assicurato" : "standard";

  // Il ramo scelto qui; finché l'utente non tocca nulla resta quello del suo percorso.
  const [scelto, setScelto] = useState<Ramo | null>(null);
  // "Cosa controllare" resta chiuso: la schermata parte corta, il dettaglio è per chi lo vuole.
  const [checklist, setChecklist] = useState(false);
  const ramo = giaAssicurato ? (scelto ?? utente.ramo) : utente.ramo;

  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    track("Partner Screen Viewed", { versione });
    // Da qui in poi il promemoria non serve più.
    segnaPartnerVisto();
  }, [track, segnaPartnerVisto, versione]);

  // Il partner apre una pagina generica diversa (A o B) a seconda della risposta di onboarding.
  // Finanz sceglie solo la pagina: non indica una polizza e non precompila il modulo.
  const confronta = () => {
    const pagina = giaAssicurato ? "B" : "A";
    track("Partner CTA Clicked", { versione, ramo_scelto: ramo, pagina_partner: pagina });
    router.push(`/comparatore?pagina=${pagina}&ramo=${ramo}`);
  };

  const scegli = (r: Ramo) => {
    setScelto(r);
    track("Partner Line Selected", { ramo_scelto: r });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-4">
        <TastoTondo label="Chiudi" onClick={() => router.push("/")}>
          <Icona nome="x" size={22} />
        </TastoTondo>
        <ChipStato serie={false} />
      </div>

      {giaAssicurato ? (
        <div className="flex flex-col gap-5 px-4 pt-4 pb-8">
          <h1 className="text-[34px] leading-tight font-bold tracking-tight">🛡️ Trova la tua polizza</h1>
          <p className="text-lg leading-snug font-semibold">
            Hai già una polizza? Controlla se ti copre ancora bene, confrontandola con le offerte di oggi.
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold tracking-wide text-muted uppercase">Quale polizza vuoi confrontare?</p>
            {[utente.ramo, ...RAMI.filter((r) => r !== utente.ramo)].map((r) => (
              <button
                key={r}
                onClick={() => scegli(r)}
                aria-pressed={r === ramo}
                className={`flex flex-col gap-0.5 rounded-2xl border-2 px-4 py-3 text-left transition active:scale-[0.98] ${
                  r === ramo ? "border-forest bg-kiwi-50" : "border-line bg-white"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold">{maiuscola(NOME_RAMO[r])}</span>
                  {r === utente.ramo && (
                    <span className="rounded-full bg-kiwi-100 px-2 py-0.5 text-xs font-semibold text-forest">
                      Il tuo percorso
                    </span>
                  )}
                </span>
                <span className="text-sm leading-snug text-muted">{COSA_COPRE[r]}</span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-box-azzurro">
            <button
              onClick={() => {
                if (!checklist) track("Partner Checklist Opened", { ramo_scelto: ramo });
                setChecklist(!checklist);
              }}
              aria-expanded={checklist}
              className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left text-lg leading-snug font-semibold"
            >
              Cosa controllare prima di confrontare
              <span className={`shrink-0 transition ${checklist ? "rotate-180" : ""}`}>
                <Icona nome="chevron" size={22} />
              </span>
            </button>
            {checklist && (
              <ul className="flex list-disc flex-col gap-1.5 pr-6 pb-4 pl-11 leading-relaxed">
                {COSA_CONTROLLARE[ramo].map((punto) => (
                  <li key={punto}>{punto}</li>
                ))}
              </ul>
            )}
          </div>
          <p className="rounded-2xl bg-box-giallo px-6 py-4 text-lg leading-relaxed">
            Il confronto è gratis e non ti impegna. {AVVISO[ramo]}
          </p>
          <p className="text-sm leading-relaxed text-muted">
            Finanz non è un intermediario assicurativo e non ti consiglia una polizza specifica. Il confronto è offerto da un
            partner iscritto al Registro Unico degli Intermediari (RUI).
          </p>
        </div>
      ) : (
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
      )}

      <BottomBar>
        <PrimaryButton onClick={confronta}>
          {giaAssicurato ? `Confronta le polizze ${NOME_RAMO[ramo]}` : "Confronta le polizze"}
        </PrimaryButton>
        <SecondaryButton onClick={() => router.push("/")}>Torna alla Home</SecondaryButton>
      </BottomBar>
    </div>
  );
}
