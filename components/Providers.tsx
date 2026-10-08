"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { UTENTI, type Utente } from "@/lib/utenti";
import { track as trackRaw, type NomeEvento } from "@/lib/track";
import { LEZIONI } from "@/lib/percorso";
import { Overlay } from "@/components/Overlay";

// Avanzamento di un utente nel percorso. Resta nel browser (localStorage),
// così ricaricare la pagina non fa ripartire da zero.
export type Progresso = {
  lezioni: number; // lezioni completate, da 0 a LEZIONI.length
  quiz: boolean;
  kiwiExtra: number;
  partnerVisto?: boolean; // ha visto la schermata "Trova la tua polizza"
  promemoria?: Promemoria;
};

// Quante volte è comparso il promemoria e se l'utente l'ha chiuso.
export type Promemoria = { mostrato: number; chiuso: boolean };

const VUOTO: Progresso = { lezioni: 0, quiz: false, kiwiExtra: 0 };
const PROMEMORIA_VUOTO: Promemoria = { mostrato: 0, chiuso: false };
const STORAGE = "finanz-prototipo-v2";

type Ctx = {
  utente: Utente;
  setUtente: (id: string) => void;
  progresso: Progresso;
  kiwi: number;
  completaLezione: (indice: number) => void;
  completaQuiz: (kiwi: number) => void;
  impostaProgresso: (p: Progresso) => void;
  segnaPartnerVisto: () => void;
  aggiornaPromemoria: (f: (p: Promemoria) => Promemoria) => void;
  track: (event: NomeEvento, properties?: Record<string, string | number>) => void;
  toast: (testo: string) => void;
};

const UtenteContext = createContext<Ctx | null>(null);

type Salvato = { utenteId: string; progressi: Record<string, Progresso> };

function leggi(): Salvato | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as Salvato) : null;
  } catch {
    return null;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [utenteId, setUtenteId] = useState(UTENTI[0].id);
  const [progressi, setProgressi] = useState<Record<string, Progresso>>({});
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [caricato, setCaricato] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const s = leggi();
    // Lettura una tantum dal browser dopo il mount: il server non vede localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s && UTENTI.some((u) => u.id === s.utenteId)) setUtenteId(s.utenteId);
    if (s) setProgressi(s.progressi ?? {});
    setCaricato(true);
  }, []);

  // Salva solo dopo aver letto: altrimenti il primo render sovrascrive i dati con quelli vuoti.
  useEffect(() => {
    if (!caricato) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ utenteId, progressi } satisfies Salvato));
    } catch {}
  }, [caricato, utenteId, progressi]);

  const utente = UTENTI.find((u) => u.id === utenteId) ?? UTENTI[0];
  const progresso = progressi[utente.id] ?? VUOTO;
  const kiwi = utente.kiwi + progresso.kiwiExtra;

  const aggiorna = useCallback(
    (f: (p: Progresso) => Progresso) => setProgressi((all) => ({ ...all, [utenteId]: f(all[utenteId] ?? VUOTO) })),
    [utenteId],
  );

  const completaLezione = useCallback(
    (indice: number) =>
      aggiorna((p) =>
        indice < p.lezioni ? p : { ...p, lezioni: indice + 1, kiwiExtra: p.kiwiExtra + LEZIONI[indice].kiwi },
      ),
    [aggiorna],
  );

  const completaQuiz = useCallback(
    (k: number) => aggiorna((p) => (p.quiz ? p : { ...p, quiz: true, kiwiExtra: p.kiwiExtra + k })),
    [aggiorna],
  );

  const impostaProgresso = useCallback((p: Progresso) => aggiorna(() => p), [aggiorna]);

  const segnaPartnerVisto = useCallback(
    () => aggiorna((p) => (p.partnerVisto ? p : { ...p, partnerVisto: true })),
    [aggiorna],
  );

  const aggiornaPromemoria = useCallback(
    (f: (p: Promemoria) => Promemoria) => aggiorna((p) => ({ ...p, promemoria: f(p.promemoria ?? PROMEMORIA_VUOTO) })),
    [aggiorna],
  );

  const setUtente = useCallback((id: string) => {
    if (UTENTI.some((u) => u.id === id)) setUtenteId(id);
  }, []);

  // Ogni evento porta con sé le proprietà dell'utente, come nell'export.
  const track = useCallback(
    (event: NomeEvento, properties: Record<string, string | number> = {}) =>
      trackRaw(event, {
        distinct_id: utente.id,
        $os: utente.os,
        ramo: utente.ramo,
        onboarding_intent: utente.onboarding_intent,
        ...properties,
      }),
    [utente],
  );

  const toast = useCallback((testo: string) => {
    clearTimeout(timer.current);
    setMessaggio(testo);
    timer.current = setTimeout(() => setMessaggio(null), 2200);
  }, []);

  return (
    <UtenteContext.Provider
      value={{
        utente,
        setUtente,
        progresso,
        kiwi,
        completaLezione,
        completaQuiz,
        impostaProgresso,
        segnaPartnerVisto,
        aggiornaPromemoria,
        track,
        toast,
      }}
    >
      {children}
      {messaggio && (
        <Overlay>
          <div className="pointer-events-none absolute inset-x-0 bottom-28 z-50 flex justify-center px-4">
            <div className="animate-toast rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white">
              {messaggio}
            </div>
          </div>
        </Overlay>
      )}
    </UtenteContext.Provider>
  );
}

export function useUtente() {
  const ctx = useContext(UtenteContext);
  if (!ctx) throw new Error("useUtente va usato dentro <Providers>");
  return ctx;
}
