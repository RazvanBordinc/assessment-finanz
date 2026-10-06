"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { NOME_RAMO, type Ramo } from "@/lib/utenti";

// Sito del comparatore partner, simulato. Nella realtà non lo controlliamo noi:
// "Quote Requested" e "Policy Activated" ci arrivano come postback del partner.

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

export default function Comparatore() {
  const { utente, track } = useUtente();
  const [inviato, setInviato] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-[#f6f7f9] font-[system-ui,sans-serif]">
      <div className="flex items-center justify-between bg-[#2b2f36] px-4 py-2 text-xs text-white/80">
        <button onClick={() => router.back()} className="font-semibold text-white underline">
          ‹ Torna su Finanz
        </button>
        <span>Sito del partner simulato</span>
      </div>
      <header className="border-b border-[#dfe2e6] bg-white px-4 py-4">
        <p className="text-xl font-bold text-[#2b2f36]">ComparaPolizze</p>
        <p className="text-xs text-[#6b7280]">Intermediario iscritto al RUI (simulato)</p>
      </header>

      {inviato ? (
        <div className="flex flex-col gap-4 px-4 py-10 text-center">
          <p className="text-2xl font-bold text-[#2b2f36]">Richiesta inviata</p>
          <p className="text-[#4b5563]">Riceverai i preventivi via email entro 24 ore.</p>
          {DOPO[utente.ramo] && <p className="text-sm text-[#4b5563]">{DOPO[utente.ramo]}</p>}
          <Link href="/" className="mt-4 font-semibold text-green-600 underline">
            Torna su Finanz
          </Link>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4 px-4 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            track("Quote Requested", { source: "partner_postback" });
            setInviato(true);
          }}
        >
          <h1 className="text-2xl font-bold text-[#2b2f36]">Nuovo preventivo {NOME_RAMO[utente.ramo]}</h1>
          {[...CAMPI[utente.ramo], "Massimale", "Franchigia", "Email"].map((campo) => (
            <label key={campo} className="flex flex-col gap-1 text-sm font-medium text-[#374151]">
              {campo}
              <input required className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5" />
            </label>
          ))}
          <button className="mt-2 h-12 rounded-md bg-[#2b2f36] font-semibold text-white">Richiedi il preventivo</button>
        </form>
      )}
    </div>
  );
}
