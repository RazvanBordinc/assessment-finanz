// Utenti finti per provare il percorso. I valori di onboarding_intent e ramo
// sono gli stessi dell'export Mixpanel.

export type Intento =
  | "Sì, ne ho già una o più"
  | "No, ma sto pensando di farne una"
  | "No";

export type Ramo = "rc_auto" | "casa" | "salute" | "vita" | "dentale";

export type Utente = {
  id: string;
  nome: string;
  eta: number;
  os: "iOS" | "Android";
  onboarding_intent: Intento;
  ramo: Ramo;
  kiwi: number;
};

export const UTENTI: Utente[] = [
  { id: "u1", nome: "Giulia", eta: 27, os: "iOS", onboarding_intent: "Sì, ne ho già una o più", ramo: "rc_auto", kiwi: 800 },
  { id: "u2", nome: "Marco", eta: 34, os: "Android", onboarding_intent: "No, ma sto pensando di farne una", ramo: "casa", kiwi: 1240 },
  { id: "u3", nome: "Sara", eta: 41, os: "iOS", onboarding_intent: "Sì, ne ho già una o più", ramo: "salute", kiwi: 560 },
  { id: "u4", nome: "Luca", eta: 23, os: "Android", onboarding_intent: "No", ramo: "rc_auto", kiwi: 90 },
  { id: "u5", nome: "Elena", eta: 38, os: "iOS", onboarding_intent: "No, ma sto pensando di farne una", ramo: "vita", kiwi: 2100 },
  { id: "u6", nome: "Paolo", eta: 52, os: "Android", onboarding_intent: "Sì, ne ho già una o più", ramo: "casa", kiwi: 430 },
];

export const RAMI: Ramo[] = ["rc_auto", "casa", "salute", "vita", "dentale"];

export const NOME_RAMO: Record<Ramo, string> = {
  rc_auto: "RC auto",
  casa: "casa",
  salute: "salute",
  vita: "vita",
  dentale: "cure dentali",
};
