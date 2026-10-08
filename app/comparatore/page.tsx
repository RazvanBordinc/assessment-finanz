"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { NOME_RAMO, RAMI, type Ramo } from "@/lib/utenti";

// Sito del comparatore partner, simulato. Nella realtà non lo controlliamo noi:
// "Quote Requested" e "Policy Activated" ci arrivano come postback del partner.
//
// Le pagine A e B sono la proposta da fare al partner (rinegoziazione, sezione "Beyond the app"
// del PDF). Finanz sceglie solo quale pagina generica aprire, in base alla risposta di onboarding:
// A per chi non ha ancora una polizza (e per chi ha risposto "No"), B per chi ne ha già una o più.

const CAMPI: Record<Ramo, string[]> = {
  rc_auto: ["Targa", "Data di nascita del proprietario", "Classe di merito"],
  casa: ["CAP dell'abitazione", "Metri quadri", "Anno di costruzione"],
  salute: ["Data di nascita", "Professione", "Preferisci rimborso o rete convenzionata?"],
  vita: ["Data di nascita", "Fumatore?", "Capitale da assicurare (€)"],
  dentale: ["Data di nascita", "CAP", "Componenti del nucleo"],
};

// Cosa succede dopo il preventivo, prima che la polizza parta.
const DOPO: Partial<Record<Ramo, string>> = {
  vita: "Per attivare la polizza la compagnia ti chiederà un questionario sanitario e, sopra certi capitali, una visita medica.",
};

// Prezzi di esempio, inventati per la demo: il partner metterebbe i suoi.
const PREZZO_DA: Record<Ramo, number> = { rc_auto: 290, casa: 90, salute: 240, vita: 60, dentale: 120 };

const MESI = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

const PAGINE = {
  A: "Pagina A: per chi non ha ancora una polizza",
  B: "Pagina B: per chi ne ha già una o più",
};

const maiuscola = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Page() {
  return (
    <Suspense>
      <Comparatore />
    </Suspense>
  );
}

function Comparatore() {
  const { utente, track } = useUtente();
  const router = useRouter();
  const params = useSearchParams();
  const pagina = params.get("pagina") === "B" ? "B" : "A";
  const dalPercorso = RAMI.find((r) => r === params.get("ramo")) ?? utente.ramo;

  const [passo, setPasso] = useState<"scelta" | "modulo" | "inviato">("scelta");
  const [scelto, setScelto] = useState<Ramo | null>(null);
  const ramo = scelto ?? dalPercorso;
  // Solo pagina B: quando scade la polizza che l'utente ha già, per il promemoria.
  const [mese, setMese] = useState("");
  const [promemoria, setPromemoria] = useState(false);

  const tracciato = useRef(false);
  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    track("Partner Page Viewed", { pagina, ramo_scelto: dalPercorso, source: "partner_postback" });
  }, [track, pagina, dalPercorso]);

  const ordine = [dalPercorso, ...RAMI.filter((r) => r !== dalPercorso)];

  return (
    <div className="flex flex-1 flex-col bg-[#f6f7f9] font-[system-ui,sans-serif]">
      <div className="flex items-center justify-between bg-[#2b2f36] px-4 py-2 text-xs text-white/80">
        <button onClick={() => router.back()} className="font-semibold text-white underline">
          ‹ Torna su Finanz
        </button>
        <span>Sito del partner simulato</span>
      </div>
      <div className="bg-[#fde68a] px-4 py-2 text-xs leading-snug text-[#3f3a1a]">
        <span className="font-bold">Proposta per il partner · </span>
        {PAGINE[pagina]}
      </div>
      <header className="border-b border-[#dfe2e6] bg-white px-4 py-4">
        <p className="text-xl font-bold text-[#2b2f36]">ComparaPolizze</p>
        <p className="text-xs text-[#6b7280]">Intermediario iscritto al RUI (simulato)</p>
      </header>

      {passo === "inviato" && (
        <div className="flex flex-col gap-4 px-4 py-10 text-center">
          <p className="text-2xl font-bold text-[#2b2f36]">Richiesta inviata</p>
          <p className="text-[#4b5563]">Riceverai i preventivi via email entro 24 ore.</p>
          {DOPO[ramo] && <p className="text-sm text-[#4b5563]">{DOPO[ramo]}</p>}
          <Link href="/" className="mt-4 font-semibold text-green-600 underline">
            Torna su Finanz
          </Link>
        </div>
      )}

      {passo === "modulo" && (
        <form
          className="flex flex-col gap-4 px-4 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            track("Quote Requested", { source: "partner_postback", pagina, ramo_scelto: ramo });
            setPasso("inviato");
          }}
        >
          <button
            type="button"
            onClick={() => setPasso("scelta")}
            className="self-start text-sm font-semibold text-[#2b2f36] underline"
          >
            ‹ Cambia polizza
          </button>
          <h1 className="text-2xl font-bold text-[#2b2f36]">Nuovo preventivo {NOME_RAMO[ramo]}</h1>
          {[...CAMPI[ramo], "Massimale", "Franchigia", "Email"].map((campo) => (
            <label key={campo} className="flex flex-col gap-1 text-sm font-medium text-[#374151]">
              {campo}
              <input required className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5" />
            </label>
          ))}
          <button className="mt-2 h-12 rounded-md bg-[#2b2f36] font-semibold text-white">Richiedi il preventivo</button>
        </form>
      )}

      {passo === "scelta" && pagina === "A" && (
        <div className="flex flex-col gap-3 px-4 py-6">
          <h1 className="text-2xl font-bold text-[#2b2f36]">Confronta le offerte di tante compagnie</h1>
          <p className="text-sm text-[#4b5563]">Scegli il tipo di polizza:</p>
          {ordine.map((r) => (
            <button
              key={r}
              onClick={() => {
                setScelto(r);
                setPasso("modulo");
              }}
              className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3.5 text-left ${
                r === dalPercorso ? "border-black bg-black text-white" : "border-[#d1d5db] bg-white text-[#2b2f36]"
              }`}
            >
              <span className="font-semibold">{maiuscola(NOME_RAMO[r])}</span>
              <span className={`shrink-0 text-sm font-semibold ${r === dalPercorso ? "text-white" : "text-green-600"}`}>
                da € {PREZZO_DA[r]}/anno ›
              </span>
            </button>
          ))}
          <p className="text-xs text-[#6b7280]">Prezzi di esempio, simulati per la demo.</p>
        </div>
      )}

      {passo === "scelta" && pagina === "B" && (
        <div className="flex flex-col gap-4 px-4 py-6">
          <h1 className="text-2xl font-bold text-[#2b2f36]">Hai già una polizza? Confrontala con le offerte di oggi</h1>
          <p className="text-sm text-[#4b5563]">Scegli quale polizza confrontare:</p>
          <div className="flex flex-col gap-3">
            {ordine.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setScelto(r);
                  setPasso("modulo");
                }}
                className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3.5 text-left ${
                  r === dalPercorso ? "border-black bg-black text-white" : "border-[#d1d5db] bg-white text-[#2b2f36]"
                }`}
              >
                <span className="font-semibold">{maiuscola(NOME_RAMO[r])}</span>
                <span className="shrink-0 text-lg font-semibold">›</span>
              </button>
            ))}
          </div>

          <form
            className="flex flex-col gap-3 rounded-md border border-[#dfe2e6] bg-white p-4"
            onSubmit={(e) => {
              e.preventDefault();
              track("Renewal Reminder Requested", { source: "partner_postback", ramo_scelto: ramo, mese_scadenza: mese });
              setPromemoria(true);
            }}
          >
            <p className="font-bold text-[#2b2f36]">Non è ancora il momento?</p>
            {promemoria ? (
              <p className="text-sm text-[#374151]">
                Fatto: ti scriveremo un mese prima della scadenza ({mese}), così confronti quando serve.
              </p>
            ) : (
              <>
                <p className="text-sm text-[#4b5563]">
                  Ti scriviamo un mese prima che scada la tua polizza {NOME_RAMO[ramo]}, così confronti quando serve.
                </p>
                <label className="flex flex-col gap-1 text-sm font-medium text-[#374151]">
                  Quando scade
                  <select
                    required
                    value={mese}
                    onChange={(e) => setMese(e.target.value)}
                    className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5"
                  >
                    <option value="">Scegli il mese</option>
                    {MESI.map((m) => (
                      <option key={m} value={m}>
                        {maiuscola(m)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-[#374151]">
                  Email
                  <input required type="email" className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5" />
                </label>
                <button className="h-12 rounded-md border border-[#2b2f36] font-semibold text-[#2b2f36]">
                  Ricordamelo
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
