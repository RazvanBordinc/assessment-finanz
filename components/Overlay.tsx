"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noop = () => () => {};

// Porta il contenuto dentro la cornice del telefono (#overlay-root nel layout),
// sopra lo scroll della pagina: bottom sheet e toast restano fermi mentre scorri.
export function Overlay({ children }: { children: React.ReactNode }) {
  const root = useSyncExternalStore(
    noop,
    () => document.getElementById("overlay-root"),
    () => null,
  );
  return root ? createPortal(children, root) : null;
}
