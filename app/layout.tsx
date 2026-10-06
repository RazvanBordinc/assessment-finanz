import type { Metadata, Viewport } from "next";
import { Inter, Noto_Color_Emoji, Passion_One } from "next/font/google";
import { Providers } from "@/components/Providers";
import { EventLog } from "@/components/EventLog";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const passion = Passion_One({ variable: "--font-passion", weight: ["400", "700"], subsets: ["latin"] });
// Stesse emoji su ogni sistema operativo, come nell'app.
const emoji = Noto_Color_Emoji({ variable: "--font-emoji", weight: "400", subsets: ["emoji"] });

export const metadata: Metadata = {
  title: "Finanz · Percorso Assicurazioni",
  description: "Prototipo del percorso Academy sulle assicurazioni, per il Business Case Finanz",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${inter.variable} ${passion.variable} ${emoji.variable} antialiased`}>
      <body>
        <Providers>
          <div className="flex items-start justify-center gap-6 sm:py-4">
            {/* La cornice del telefono: la pagina scorre dentro #scroller, i bottom sheet vivono in #overlay-root. */}
            <main className="relative flex h-dvh w-full max-w-[375px] flex-col overflow-hidden bg-white sm:h-[min(780px,calc(100dvh-2rem))] sm:rounded-[32px] sm:shadow-xl">
              <div id="scroller" className="flex flex-1 flex-col overflow-y-auto overscroll-contain">
                {children}
              </div>
              <div id="overlay-root" />
            </main>
            <EventLog />
          </div>
        </Providers>
      </body>
    </html>
  );
}
