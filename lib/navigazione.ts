"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Lezioni e quiz scorrono card per card dentro la stessa pagina. Ogni card è una voce
// della cronologia del browser: il tasto indietro del telefono (o del browser) torna
// alla card precedente, come ci si aspetta.
//
// In history.state teniamo quante card abbiamo aperto da quando siamo entrati
// e se ci siamo arrivati dalla mappa del percorso: "Esci" torna alla mappa
// riavvolgendo la cronologia, invece di accumulare voci.

type Stato = { profondita?: number; dallaMappa?: boolean };

const CHIAVE = "finanz-apri-dalla-mappa";

// Da chiamare sulla mappa prima di aprire una lezione.
export function segnaAperturaDallaMappa() {
  try {
    sessionStorage.setItem(CHIAVE, "1");
  } catch {}
}

function stato(): Stato {
  return (typeof window !== "undefined" && (window.history.state as Stato)) || {};
}

export function useSchede() {
  const params = useSearchParams();
  const router = useRouter();

  // Alla prima card: segna da dove arriviamo.
  useEffect(() => {
    if (stato().profondita !== undefined) return;
    let dallaMappa = false;
    try {
      dallaMappa = sessionStorage.getItem(CHIAVE) === "1";
      sessionStorage.removeItem(CHIAVE);
    } catch {}
    window.history.replaceState({ ...window.history.state, profondita: 0, dallaMappa }, "");
  }, []);

  // A ogni cambio di card (avanti o indietro) si riparte dall'alto.
  const chiave = params.toString();
  useEffect(() => {
    document.getElementById("scroller")?.scrollTo(0, 0);
  }, [chiave]);

  const vai = (query: Record<string, string | number>) => {
    const s = stato();
    const url = `${window.location.pathname}?${new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))}`;
    window.history.pushState({ profondita: (s.profondita ?? 0) + 1, dallaMappa: s.dallaMappa }, "", url);
  };

  const esci = () => {
    const s = stato();
    if (s.dallaMappa) window.history.go(-((s.profondita ?? 0) + 1));
    else router.replace("/percorso");
  };

  return { params, vai, esci };
}
