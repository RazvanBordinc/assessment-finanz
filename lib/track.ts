// Traccia gli eventi del percorso con gli stessi nomi dell'export Mixpanel.
// Nel prototipo gli eventi restano nel browser: li vedi nel pannello "Eventi"
// e nella console.

export type NomeEvento =
  | "Path Started"
  | "Lesson Completed"
  | "Quiz Completed"
  | "Path Completed"
  | "Partner Screen Viewed"
  | "Partner CTA Clicked"
  | "Quote Requested"
  | "Policy Activated"
  // Promemoria per chi completa il percorso ma non arriva alla schermata partner.
  | "Partner Reminder Shown"
  | "Partner Reminder Clicked"
  | "Partner Reminder Dismissed"
  // Schermata partner per chi ha già una polizza: quale ramo sceglie.
  | "Partner Line Selected"
  | "Partner Checklist Opened"
  // Sito del partner (proposta, pagine A/B): arriverebbero come postback.
  | "Partner Page Viewed"
  | "Renewal Reminder Requested";

export type Evento = {
  event: NomeEvento;
  time: string;
  properties: Record<string, string | number>;
};

const listeners = new Set<() => void>();
let eventi: Evento[] = [];

export function track(event: NomeEvento, properties: Record<string, string | number> = {}) {
  const e = { event, time: new Date().toISOString(), properties };
  eventi = [...eventi, e];
  console.log("[track]", event, properties);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getEventi() {
  return eventi;
}

export function resetEventi() {
  eventi = [];
  listeners.forEach((l) => l());
}
