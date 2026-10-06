"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { BarraProgresso, ChipStato, Icona, TastoTondo } from "@/components/ui";
import { LEZIONI, PERCORSO } from "@/lib/percorso";
import { segnaAperturaDallaMappa } from "@/lib/navigazione";

// Path Started parte una volta per utente e per sessione, all'apertura del percorso.
const avviati = new Set<string>();

// Misure della mappa a zig-zag, come nell'app.
// Larghezze in percentuale, così la mappa sta anche sugli schermi più stretti.
const H = 150;
const PASSO = H + 18;

type Nodo = { emoji: string; titolo: string; href: string };

const NODI: Nodo[] = [
  ...LEZIONI.map((l, i) => ({ emoji: l.emoji, titolo: l.titolo, href: `/percorso/lezione?n=${i + 1}&c=0` })),
  { emoji: "🏆", titolo: "Quiz finale", href: "/percorso/lezione?n=quiz&c=0" },
];

export default function MappaPercorso() {
  const { utente, progresso, track, toast } = useUtente();
  const router = useRouter();

  useEffect(() => {
    if (avviati.has(utente.id)) return;
    avviati.add(utente.id);
    track("Path Started");
  }, [utente.id, track]);

  const fatte = progresso.lezioni + (progresso.quiz ? 1 : 0);
  const finito = progresso.quiz;

  const indietro = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const apri = (i: number) => {
    if (i > fatte) return toast("Completa prima le tappe precedenti 🔒");
    segnaAperturaDallaMappa();
    router.push(NODI[i].href);
  };

  const condividi = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Finanz", text: "Ho completato il percorso Assicurati su Finanz 🥝" });
      else toast("Condivisione non disponibile su questo browser");
    } catch {}
  };

  const yFine = NODI.length * PASSO;

  return (
    <div className="flex flex-1 flex-col pb-10">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3">
        <TastoTondo label="Indietro" onClick={indietro}>
          <Icona nome="back" size={22} />
        </TastoTondo>
        <ChipStato />
      </div>

      <div className="px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PERCORSO.cover} alt="" className="aspect-[3/2] w-full rounded-3xl object-cover" />
        <p className="mt-5 flex items-center gap-2 text-sm tracking-wide text-muted uppercase">
          <span className="grid size-8 place-items-center rounded-full bg-soft">⭐</span>
          {PERCORSO.livello}
        </p>
        <h1 className="mt-3 text-[34px] leading-tight font-bold tracking-tight">{PERCORSO.titolo}</h1>
        <BarraProgresso valore={(fatte / NODI.length) * 100} className="mt-4" />
        <span className="mt-4 inline-block rounded-full bg-soft px-3 py-1 text-sm">
          📖 {LEZIONI.length} lezioni + quiz
        </span>

        <div className="mt-10 flex items-center gap-3 rounded-2xl bg-soft px-3 py-3 font-semibold tracking-wide text-forest uppercase">
          <span className="grid size-12 place-items-center rounded-full bg-line text-2xl">🤓</span>
          Livello 1
        </div>

        <div className="relative mt-6 w-full" style={{ height: yFine + 330 }}>
          {NODI.map((_, i) => {
            const sinistra = i % 2 === 0;
            const y = i * PASSO;
            const scuro = i < fatte;
            const stileLinea = `${scuro ? "border-forest" : "border-[#b5b5b5]"} border-dashed`;
            return (
              <div
                key={`linea-${i}`}
                className={`absolute ${stileLinea} ${sinistra ? "rounded-tr-2xl border-t-2 border-r-2" : "rounded-tl-2xl border-t-2 border-l-2"}`}
                style={{
                  top: y + H / 2,
                  left: sinistra ? "48%" : "24%",
                  width: "28%",
                  height: PASSO - H / 2 + (i === NODI.length - 1 ? 30 : 0),
                }}
              />
            );
          })}

          {NODI.map((nodo, i) => {
            const sinistra = i % 2 === 0;
            const stato = i < fatte ? "fatto" : i === fatte ? "attuale" : "bloccato";
            return (
              <div key={nodo.titolo} className="absolute" style={{ top: i * PASSO, left: sinistra ? 0 : "52%", width: "48%" }}>
                <button
                  onClick={() => apri(i)}
                  className={`flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-[1.5px] px-3 text-center transition active:scale-[0.97] ${
                    stato === "attuale" ? "border-green-600 bg-soft" : "border-[#e9e9e9] bg-white"
                  } ${stato === "bloccato" ? "text-ink/30" : "text-ink"}`}
                  style={{ height: H }}
                >
                  <span className={`grid size-16 place-items-center rounded-full text-3xl ${stato === "bloccato" ? "bg-soft opacity-40" : "bg-line"}`}>
                    {nodo.emoji}
                  </span>
                  <span className="text-lg leading-tight font-semibold">{nodo.titolo}</span>
                </button>
                {stato === "attuale" && (
                  <button
                    onClick={() => apri(i)}
                    className="relative mt-3 w-full rounded-lg bg-green-600 py-2.5 text-base font-semibold tracking-wide text-white uppercase"
                  >
                    <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-green-600" />
                    {fatte === 0 ? "Inizia da qui" : "Riprendi da qui"}
                  </button>
                )}
              </div>
            );
          })}

          <div
            className={`absolute inset-x-0 flex flex-col items-center gap-3 overflow-hidden rounded-3xl px-5 pt-6 pb-5 text-center ${
              finito ? "bg-forest text-white" : "bg-[#b9c3b6] text-white/80"
            }`}
            style={{ top: yFine + 30 }}
          >
            <span className={`text-[84px] leading-none ${finito ? "" : "opacity-50 grayscale"}`}>🏆</span>
            <p className={`font-display text-5xl leading-[0.95] font-bold uppercase ${finito ? "text-kiwi-400" : "text-kiwi-100"}`}>
              Traguardo
              <br />
              raggiunto
            </p>
            <p className="text-sm">Ottimo lavoro! Condividi il tuo successo con gli amici.</p>
            <button
              disabled={!finito}
              onClick={condividi}
              className="mt-1 h-14 w-full rounded-full bg-kiwi-400 text-lg font-semibold text-forest disabled:bg-kiwi-100/70 disabled:text-forest/40"
            >
              Condividi con gli amici
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
