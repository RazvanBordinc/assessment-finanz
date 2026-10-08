"use client";

import Link from "next/link";
import { useState } from "react";
import { useUtente } from "@/components/Providers";
import { Overlay } from "@/components/Overlay";

// ---------- Icone (tratto Lucide, come nell'app) ----------

const ICONE = {
  x: <path d="M18 6 6 18M6 6l12 12" />,
  flag: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </>
  ),
  share: (
    <>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="m16 6-4-4-4 4M12 2v13" />
    </>
  ),
  back: <path d="m12 19-7-7 7-7M19 12H5" />,
  home: (
    <>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  book: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  chevron: <path d="m6 9 6 6 6-6" />,
};

export function Icona({ nome, size = 24, stroke = 2 }: { nome: keyof typeof ICONE; size?: number; stroke?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONE[nome]}
    </svg>
  );
}

// ---------- Chip in alto: serie, vite, kiwi ----------

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-10 items-center gap-1 rounded-full border-[1.5px] border-ink/70 px-3 text-lg font-bold">
      {children}
    </span>
  );
}

export function ChipStato({ serie = true }: { serie?: boolean }) {
  const { kiwi, progresso } = useUtente();
  return (
    <div className="flex gap-2">
      {serie && <Chip>{progresso.lezioni > 0 ? 1 : 0} 🔥</Chip>}
      <Chip>∞ 💛</Chip>
      <Chip>{kiwi.toLocaleString("it-IT")} 🥝</Chip>
    </div>
  );
}

export function TastoTondo({
  onClick,
  label,
  children,
  className = "",
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid size-10 place-items-center rounded-full bg-soft text-ink transition active:scale-90 ${className}`}
    >
      {children}
    </button>
  );
}

// ---------- Bottoni ----------

export function PrimaryButton({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-14 w-full rounded-full bg-kiwi-400 text-lg font-semibold text-forest transition active:scale-[0.97] disabled:bg-kiwi-100 disabled:text-forest/40 disabled:active:scale-100 ${className}`}
    />
  );
}

export function SecondaryButton({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-14 w-full rounded-full border-[1.5px] border-forest bg-white text-lg font-semibold text-forest transition active:scale-[0.97] ${className}`}
    />
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto flex flex-col gap-3 border-t border-line bg-white px-4 pt-4 pb-6">
      {children}
    </div>
  );
}

export function BarraProgresso({ valore, className = "" }: { valore: number; className?: string }) {
  return (
    <div className={`h-3.5 overflow-hidden rounded-full bg-line ${className}`}>
      <div
        className="h-full rounded-full bg-forest transition-[width] duration-300"
        style={{ width: `${Math.max(0, Math.min(100, valore))}%` }}
      />
    </div>
  );
}

// ---------- Bottom sheet ----------

// Trascinare verso il basso chiude il foglio, come sul telefono.
function useTrascinaGiu(onClose: () => void) {
  const [dy, setDy] = useState(0);
  const [inizio, setInizio] = useState<number | null>(null);
  return {
    style: { transform: `translateY(${dy}px)`, transition: inizio === null ? "transform 200ms" : "none" },
    onTouchStart: (e: React.TouchEvent) => setInizio(e.touches[0].clientY),
    onTouchMove: (e: React.TouchEvent) => inizio !== null && setDy(Math.max(0, e.touches[0].clientY - inizio)),
    onTouchEnd: () => {
      setInizio(null);
      if (dy > 90) onClose();
      else setDy(0);
    },
  };
}
// Si chiude toccando fuori, con la X o trascinandolo verso il basso, come sul telefono.

export function Sheet({
  onClose,
  children,
  maniglia = true,
  icona,
}: {
  onClose: () => void;
  children: React.ReactNode;
  maniglia?: boolean;
  icona?: React.ReactNode;
}) {
  const trascina = useTrascinaGiu(onClose);

  return (
    <Overlay>
      <div className="absolute inset-0 z-40 flex flex-col justify-end">
        <div className="absolute inset-0 animate-fade bg-black/45" onClick={onClose} />
        <div
          className="relative animate-sheet"
          {...trascina}
        >
          {icona && <div className="absolute -top-24 left-1/2 z-10 -translate-x-1/2 animate-pop">{icona}</div>}
          <div className="mx-0 rounded-t-[32px] bg-white px-5 pt-3 pb-7">
            {maniglia && <div className="mx-auto mb-4 h-1.5 w-28 rounded-full bg-line" />}
            {children}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// Sheet a scheda, staccato dai bordi: risposte, uscita.
export function SheetScheda({
  onClose,
  icona,
  titolo,
  testo,
  children,
}: {
  onClose: () => void;
  icona: React.ReactNode;
  titolo: string;
  testo: string;
  children: React.ReactNode;
}) {
  const trascina = useTrascinaGiu(onClose);
  return (
    <Overlay>
      <div className="absolute inset-0 z-40 flex flex-col justify-end">
        <div className="absolute inset-0 animate-fade bg-black/45" onClick={onClose} />
        <div
          className="relative m-4 mb-3 animate-sheet"
          {...trascina}
        >
          <div className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 animate-pop">{icona}</div>
          <div className="rounded-[28px] bg-white px-5 pt-14 pb-5 text-center">
            <button
              onClick={onClose}
              aria-label="Chiudi"
              className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-soft"
            >
              <Icona nome="x" size={22} />
            </button>
            <p className="text-[32px] leading-tight font-bold tracking-tight">{titolo}</p>
            <p className="mt-3 mb-6 text-lg leading-snug">{testo}</p>
            <div className="flex flex-col gap-3">{children}</div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export function IconaEsito({ giusta }: { giusta: boolean }) {
  return (
    <div
      className={`grid size-32 place-items-center rounded-full ${giusta ? "bg-kiwi-100 text-kiwi-400" : "bg-error-soft text-error"}`}
    >
      <Icona nome={giusta ? "check" : "x"} size={120} stroke={4} />
    </div>
  );
}

// ---------- Chrome delle lezioni: X, segnala, condividi, vite e kiwi, avanzamento ----------

export function LessonChrome({ progress, onEsci }: { progress: number; onEsci: () => void }) {
  const { toast } = useUtente();
  const [segnala, setSegnala] = useState(false);
  const [commento, setCommento] = useState("");

  const condividi = async () => {
    const dati = { title: "Finanz", text: "Sto imparando le assicurazioni su Finanz 🥝", url: location.origin };
    try {
      if (navigator.share) await navigator.share(dati);
      else {
        await navigator.clipboard.writeText(dati.url);
        toast("Link copiato");
      }
    } catch {}
  };

  return (
    <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-1">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <TastoTondo label="Esci dalla lezione" onClick={onEsci}>
            <Icona nome="x" size={22} />
          </TastoTondo>
          <TastoTondo label="Segnala la pagina" onClick={() => setSegnala(true)}>
            <Icona nome="flag" size={20} />
          </TastoTondo>
          <TastoTondo label="Condividi" onClick={condividi}>
            <Icona nome="share" size={20} />
          </TastoTondo>
        </div>
        <ChipStato serie={false} />
      </div>
      <BarraProgresso valore={progress} className="mt-6" />

      {segnala && (
        <Sheet onClose={() => setSegnala(false)}>
          <p className="text-center text-[32px] font-bold tracking-tight">Segnala la pagina</p>
          <p className="mt-2 text-center text-lg leading-snug">
            Hai notato un bug, un concetto sbagliato o spiegato male oppure vuoi darci un consiglio su come migliorare la
            lezione? Scrivilo qui sotto!
          </p>
          <textarea
            value={commento}
            onChange={(e) => setCommento(e.target.value)}
            placeholder="Scrivi il tuo commento..."
            className="mt-5 h-36 w-full resize-none rounded-2xl border-[1.5px] border-ink/60 p-4 text-lg outline-none focus:border-forest"
          />
          <PrimaryButton
            className="mt-4"
            disabled={!commento.trim()}
            onClick={() => {
              setSegnala(false);
              setCommento("");
              toast("Grazie, abbiamo ricevuto la tua segnalazione 💚");
            }}
          >
            Invia
          </PrimaryButton>
        </Sheet>
      )}
    </div>
  );
}

// ---------- Barra di navigazione in basso (Home, Academy) ----------

export function BottomNav({ attiva }: { attiva: "home" | "academy" }) {
  const { toast } = useUtente();
  const voce = (nome: "home" | "academy", icona: "home" | "book", href: string) => (
    <Link
      href={href}
      aria-label={nome === "home" ? "Home" : "Academy"}
      className={`grid h-14 place-items-center rounded-full transition ${attiva === nome ? "w-28 bg-kiwi-400 text-forest" : "w-16 text-ink"}`}
    >
      <Icona nome={icona} size={26} />
    </Link>
  );
  const nonDisponibile = (icona: "cart", label: string) => (
    <button
      aria-label={label}
      onClick={() => toast("Questa sezione non è nel prototipo")}
      className="grid h-14 w-16 place-items-center rounded-full text-ink"
    >
      <Icona nome={icona} size={26} />
    </button>
  );
  return (
    <div className="sticky bottom-0 z-10 mt-auto px-4 pt-2 pb-5">
      <nav className="flex items-center justify-between rounded-full bg-white px-3 py-2 shadow-[0_4px_24px_rgba(14,15,12,0.12)]">
        {voce("home", "home", "/")}
        {voce("academy", "book", "/academy")}
        {nonDisponibile("cart", "Shop")}
      </nav>
    </div>
  );
}
