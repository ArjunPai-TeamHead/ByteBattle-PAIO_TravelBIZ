import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-6">
      <div className="card">
        <h1 className="text-2xl font-extrabold mb-2">Welcome to PAIO TravelBiz</h1>
        <p className="text-fgMuted">
          India-focused tourist discovery: directions with traffic hints, safety & festival overlays, multilingual translator, transport discovery (BANG Bus), and hotel deep links.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h2 className="font-bold mb-2">Map & Directions</h2>
          <p className="text-fgMuted mb-3">Get routes, traffic overlay, fare estimate, and safety/festival hints.</p>
          <Link href="/map"><button>Open Map</button></Link>
        </div>
        <div className="card">
          <h2 className="font-bold mb-2">Transport (BANG Bus)</h2>
          <p className="text-fgMuted mb-3">Discover buses & taxis via BANG Bus module.</p>
          <Link href="/transport"><button>Open Transport</button></Link>
        </div>
        <div className="card">
          <h2 className="font-bold mb-2">Translator</h2>
          <p className="text-fgMuted mb-3">Text translate, OCR for signs/menus, and speech (Hindi/English).</p>
          <Link href="/translate"><button>Open Translator</button></Link>
        </div>
        <div className="card">
          <h2 className="font-bold mb-2">Hotels</h2>
          <p className="text-fgMuted mb-3">Build Google Hotels deep links for your stay.</p>
          <Link href="/hotels"><button>Find Hotels</button></Link>
        </div>
        <div className="card">
          <h2 className="font-bold mb-2">Itinerary</h2>
          <p className="text-fgMuted mb-3">Create a simple day plan by category and time budget.</p>
          <Link href="/itinerary"><button>Plan a Day</button></Link>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold mb-2">Safety & Festivals</h2>
        <p className="text-fgMuted">
          Safety overlays include higher-caution regions, night hours (21:00–05:00), and a “low-lit” heuristic. Festivals overlay displays crowd impact windows to help plan around major events.
        </p>
      </div>
    </div>
  );
}