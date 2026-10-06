"use client";

import { useState } from "react";
import type { Blocco, Card } from "@/lib/percorso";
import { BottomBar, Icona, IconaEsito, PrimaryButton, SheetScheda } from "@/components/ui";

// Le card di una lezione, con lo stesso aspetto dell'app.
// onAvanti viene chiamato quando l'utente può passare alla card successiva;
// per le domande riceve se la prima risposta data era giusta.

export function Scheda({ card, onAvanti }: { card: Card; onAvanti: (primaGiusta?: boolean) => void }) {
  if (card.tipo === "teoria") return <SchedaTeoria card={card} onAvanti={() => onAvanti()} />;
  if (card.tipo === "sondaggio") return <SchedaSondaggio card={card} onAvanti={() => onAvanti()} />;
  if (card.tipo === "simulatore") return <SchedaSimulatore card={card} onAvanti={() => onAvanti()} />;
  if (card.tipo === "vero_falso")
    return (
      <SchedaDomanda
        emoji={card.emoji}
        testo={card.testo}
        risposte={["Vero", "Falso"]}
        corretta={card.vero ? 0 : 1}
        veroFalso
        onAvanti={onAvanti}
      />
    );
  return (
    <SchedaDomanda emoji={card.emoji} testo={card.testo} risposte={card.risposte} corretta={card.corretta} onAvanti={onAvanti} />
  );
}

const STILE_BOX = {
  azzurro: "bg-box-azzurro",
  rosa: "bg-box-rosa",
  giallo: "bg-box-giallo",
};

function VoceBlocco({ b }: { b: Blocco }) {
  if (b.stile === "definizione")
    return (
      <div className="rounded-2xl bg-box-viola px-6 py-4 text-lg leading-relaxed">
        <p className="font-semibold">{b.termine}</p>
        <p className="italic">{b.testo}</p>
      </div>
    );
  if (b.stile === "testo") return <p className="text-lg leading-relaxed">{b.testo}</p>;
  return <p className={`rounded-2xl px-6 py-4 text-lg leading-relaxed ${STILE_BOX[b.stile]}`}>{b.testo}</p>;
}

function SchedaTeoria({ card, onAvanti }: { card: Extract<Card, { tipo: "teoria" }>; onAvanti: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-4 px-4 pt-6 pb-8">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">
          <span className="mr-1">{card.emoji}</span>
          {card.titolo}
        </h1>
        <p className="text-lg leading-snug font-semibold">{card.lead}</p>
        {card.blocchi.map((b, i) => (
          <VoceBlocco key={i} b={b} />
        ))}
      </div>
      <BottomBar>
        <PrimaryButton onClick={onAvanti}>Continua</PrimaryButton>
      </BottomBar>
    </>
  );
}

function Riquadro({ badge, children }: { badge: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-4 mt-4 mb-6 flex flex-1 flex-col items-center gap-5 rounded-[24px] border-[1.5px] border-line px-4 pt-5 pb-6">
      {badge}
      {children}
    </div>
  );
}

function BadgeProva() {
  return (
    <span className="rounded-full bg-badge-prova px-5 py-2 text-base font-bold tracking-tight uppercase">
      🎩 Mettiti alla prova!
    </span>
  );
}

export function SchedaDomanda({
  emoji,
  testo,
  risposte,
  corretta,
  veroFalso = false,
  badge = <BadgeProva />,
  onAvanti,
}: {
  emoji: string;
  badge?: React.ReactNode;
  testo: string;
  risposte: string[];
  corretta: number;
  veroFalso?: boolean;
  onAvanti: (primaGiusta: boolean) => void;
}) {
  const [scelta, setScelta] = useState<number | null>(null);
  const [scartate, setScartate] = useState<number[]>([]);
  const [esito, setEsito] = useState<"giusta" | "sbagliata" | null>(null);

  const verifica = () => {
    if (scelta === null) return;
    setEsito(scelta === corretta ? "giusta" : "sbagliata");
  };

  const chiudiErrore = () => {
    if (scelta !== null) setScartate((s) => [...s, scelta]);
    setScelta(null);
    setEsito(null);
  };

  const opzione = (r: string, i: number) => {
    const scartata = scartate.includes(i);
    const selezionata = scelta === i;
    return (
      <button
        key={r}
        disabled={scartata}
        onClick={() => setScelta(i)}
        className={`rounded-2xl border-[1.5px] px-4 py-4 text-lg leading-snug transition active:scale-[0.98] ${
          selezionata ? "border-forest bg-soft" : "border-line bg-white"
        } ${scartata ? "text-ink/30" : "text-ink/80"} ${veroFalso ? "flex flex-1 items-center gap-3" : "w-full text-center"}`}
      >
        {veroFalso && (
          <span className={`grid size-12 shrink-0 place-items-center rounded-full ${scartata ? "bg-soft/60" : "bg-soft"} text-ink/60`}>
            <Icona nome={i === 0 ? "check" : "x"} size={26} stroke={3} />
          </span>
        )}
        <span className={veroFalso ? "flex-1 text-center" : ""}>{r}</span>
      </button>
    );
  };

  return (
    <>
      <Riquadro badge={badge}>
        <span className="text-[88px] leading-none">{emoji}</span>
        <p className="text-center text-lg leading-snug font-semibold text-ink/80">{testo}</p>
        <div className={`flex w-full gap-3 ${veroFalso ? "flex-row" : "flex-col"}`}>{risposte.map(opzione)}</div>
      </Riquadro>
      <BottomBar>
        <PrimaryButton disabled={scelta === null} onClick={verifica}>
          Continua
        </PrimaryButton>
      </BottomBar>

      {esito === "giusta" && (
        <SheetScheda
          onClose={() => setEsito(null)}
          icona={<IconaEsito giusta />}
          titolo="Risposta corretta"
          testo="Complimenti, risposta esatta! Continua così!"
        >
          <PrimaryButton onClick={() => onAvanti(scartate.length === 0)}>Continua</PrimaryButton>
        </SheetScheda>
      )}
      {esito === "sbagliata" && (
        <SheetScheda
          onClose={chiudiErrore}
          icona={<IconaEsito giusta={false} />}
          titolo="Risposta errata"
          testo="Ops, la tua risposta non è quella giusta. Riprova!"
        >
          <button
            onClick={chiudiErrore}
            className="h-14 w-full rounded-full bg-error text-lg font-semibold text-white transition active:scale-[0.97]"
          >
            Chiudi
          </button>
        </SheetScheda>
      )}
    </>
  );
}

function SchedaSondaggio({ card, onAvanti }: { card: Extract<Card, { tipo: "sondaggio" }>; onAvanti: () => void }) {
  const [scelta, setScelta] = useState<number | null>(null);
  return (
    <>
      <Riquadro
        badge={
          <span className="rounded-full bg-badge-sondaggio px-5 py-2 text-base font-bold tracking-tight uppercase">
            💚 Piccolo sondaggio
          </span>
        }
      >
        <span className="text-[88px] leading-none">🐷</span>
        <p className="text-center text-lg leading-snug font-semibold text-ink/80">{card.testo}</p>
        <div className="flex w-full flex-col gap-3">
          {card.risposte.map((r, i) => (
            <button
              key={r}
              onClick={() => setScelta(i)}
              className={`w-full rounded-2xl border-[1.5px] px-4 py-4 text-center text-lg text-ink/80 transition active:scale-[0.98] ${
                scelta === i ? "border-forest bg-soft" : "border-line"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </Riquadro>
      <BottomBar>
        <PrimaryButton disabled={scelta === null} onClick={onAvanti}>
          Conferma risposta
        </PrimaryButton>
      </BottomBar>
    </>
  );
}

const euro = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}€`;

// Si va avanti solo dopo aver mosso il cursore almeno una volta.
function SchedaSimulatore({ card, onAvanti }: { card: Extract<Card, { tipo: "simulatore" }>; onAvanti: () => void }) {
  const [danno, setDanno] = useState(1000);
  const [mosso, setMosso] = useState(false);
  const tu = Math.min(danno, card.franchigia) + Math.max(0, danno - card.massimale);
  const compagnia = danno - tu;

  return (
    <>
      <Riquadro
        badge={
          <span className="rounded-full bg-badge-prova px-5 py-2 text-base font-bold tracking-tight uppercase">🕹️ Prova tu</span>
        }
      >
        <span className="text-[88px] leading-none">{card.emoji}</span>
        <p className="text-center text-lg leading-snug font-semibold text-ink/80">{card.testo}</p>
        <div className="flex w-full flex-col gap-2">
          <p className="text-center text-sm text-muted">
            Danno: <b className="text-2xl text-ink">{euro(danno)}</b>
          </p>
          <input
            type="range"
            min={0}
            max={card.dannoMax}
            step={250}
            value={danno}
            aria-label="Danno"
            onChange={(e) => {
              setDanno(Number(e.target.value));
              setMosso(true);
            }}
            className="w-full accent-forest"
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-box-rosa px-3 py-3">
            <p className="text-sm text-muted">Paghi tu</p>
            <p className="text-xl font-bold">{euro(tu)}</p>
          </div>
          <div className="rounded-2xl bg-box-azzurro px-3 py-3">
            <p className="text-sm text-muted">Paga la compagnia</p>
            <p className="text-xl font-bold">{euro(compagnia)}</p>
          </div>
        </div>
      </Riquadro>
      <BottomBar>
        <PrimaryButton disabled={!mosso} onClick={onAvanti}>
          Continua
        </PrimaryButton>
      </BottomBar>
    </>
  );
}
