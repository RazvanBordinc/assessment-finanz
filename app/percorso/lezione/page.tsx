import { Suspense } from "react";
import { Sessione } from "./Sessione";

// /percorso/lezione?n=1..4&c=0..   una lezione, card per card
// /percorso/lezione?n=quiz&c=0..4  il quiz finale
export default function Page() {
  return (
    <Suspense>
      <Sessione />
    </Suspense>
  );
}
