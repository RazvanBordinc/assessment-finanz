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
  | "Policy Activated";

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
