import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-7xl">🥝</span>
      <p className="text-2xl font-bold">Questa pagina non esiste</p>
      <Link href="/" className="flex h-14 w-full items-center justify-center rounded-full bg-kiwi-400 text-lg font-semibold text-forest">
        Torna alla Home
      </Link>
    </div>
  );
}
