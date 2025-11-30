"use client";

import { useEffect, useMemo, useState } from "react";
import sampleAttractions from "../../public/data/attractions.sample.json";

export const metadata = { title: "Itinerary • PAIO TravelBiz" };

type Attraction = {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  popularity: "low" | "medium" | "high";
};

const CATEGORIES = ["temples", "beaches", "heritage", "nature", "markets", "hill_stations", "national_parks", "museums"] as const;

export default function ItineraryPage() {
  const [selectedCats, setSelectedCats] = useState<string[]>(["temples", "heritage"]);
  const [timeBudgetHrs, setTimeBudgetHrs] = useState<number>(8);
  const [city, setCity] = useState<string>("Delhi");

  const filtered = useMemo(() => {
    const pool = (sampleAttractions as Attraction[]).filter(a => a.city.toLowerCase().includes(city.toLowerCase()));
    const selected = pool.filter(a => selectedCats.includes(a.category));
    // naive sort by popularity and then name
    return selected.sort((a, b) => (a.popularity === "high" ? -1 : 1)).slice(0, 6);
  }, [selectedCats, city]);

  useEffect(() => {
    // TODO: apply safety/festival multipliers based on date
  }, [filtered]);

  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="text-xl font-bold mb-2">1‑Day Itinerary (Heuristic)</h1>
        <div className="grid md:grid-cols-3 gap-3">
          <label>City
            <input className="w-full mt-1" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Delhi" />
          </label>
          <label>Time Budget (hours)
            <input className="w-full mt-1" type="number" min={2} max={12} value={timeBudgetHrs} onChange={(e) => setTimeBudgetHrs(Number(e.target.value))} />
          </label>
          <div>
            <div className="mb-1">Categories</div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCats([...selectedCats, cat]);
                      else setSelectedCats(selectedCats.filter(c => c !== cat));
                    }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold mb-2">Suggested Stops (max 6)</h2>
        {filtered.length === 0 ? (
          <p className="text-fgMuted">Add attractions data for your city to improve results.</p>
        ) : (
          <ol className="list-decimal pl-6">
            {filtered.map(a => (
              <li key={a.id} className="mb-2">
                <b>{a.name}</b> — {a.category} in {a.city}, {a.state}
                <div className="text-xs text-fgMuted">Popularity: {a.popularity}</div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}