import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "PAIO TravelBiz",
  description: "India-focused travel discovery: routing, safety, translator, transport, hotels."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-border">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 text-sm">
            <Link className="font-extrabold text-lg tracking-wider" href="/">PAIO TravelBiz</Link>
            <div className="flex items-center gap-3 ml-auto">
              <Link href="/map">Map</Link>
              <Link href="/transport">Transport</Link>
              <Link href="/translate">Translate</Link>
              <Link href="/hotels">Hotels</Link>
              <Link href="/itinerary">Itinerary</Link>
              <Link href="/about">About</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-border mt-10">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-fgMuted">
            <p>© {new Date().getFullYear()} PAIO TravelBiz • Discovery-only. Safety overlays are advisory.</p>
            <p>
              <Link href="/terms">Terms</Link> • <Link href="/privacy">Privacy</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}