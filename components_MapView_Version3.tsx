"use client";

import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";

type Coord = { lat: number; lng: number };

export default function MapView() {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [startCoord, setStartCoord] = useState<Coord | null>(null);
  const [endCoord, setEndCoord] = useState<Coord | null>(null);
  const [profile, setProfile] = useState<"driving-car" | "foot-walking">("driving-car");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [fareTaxi, setFareTaxi] = useState<number | null>(null);
  const [fareAuto, setFareAuto] = useState<number | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showSafety, setShowSafety] = useState(true);
  const [showFestivals, setShowFestivals] = useState(true);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
        center: [78.9629, 20.5937], // India centroid
        zoom: 4
      });
      map.addControl(new maplibregl.NavigationControl({}));
      mapRef.current = map;

      map.on("load", async () => {
        // Traffic overlay via Netlify proxy to TomTom
        map.addSource("traffic", {
          type: "raster",
          tiles: [`/api/tomtom-traffic/{z}/{x}/{y}.png`],
          tileSize: 256
        });
        map.addLayer({
          id: "traffic-layer",
          type: "raster",
          source: "traffic",
          layout: { visibility: showTraffic ? "visible" : "none" },
          paint: { "raster-opacity": 0.6 }
        });

        // Safety overlay (geojson regions)
        const safetyResp = await fetch("/data/safety_areas.json");
        const safetyJson = await safetyResp.json();
        map.addSource("safety", {
          type: "geojson",
          data: safetyJson
        });
        map.addLayer({
          id: "safety-fill",
          type: "fill",
          source: "safety",
          paint: {
            "fill-color": "#FF4D4D",
            "fill-opacity": showSafety ? 0.2 : 0.0
          }
        });
        map.addLayer({
          id: "safety-outline",
          type: "line",
          source: "safety",
          paint: {
            "line-color": "#FF4D4D",
            "line-width": 2,
            "line-opacity": showSafety ? 0.8 : 0.0
          }
        });

        // Route layer
        map.addSource("route", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#FFFFFF",
            "line-width": 4
          }
        });
      });
    }
  }, [showTraffic, showSafety]);

  // Toggle layer visibility when toggles change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("traffic-layer")) {
      map.setLayoutProperty("traffic-layer", "visibility", showTraffic ? "visible" : "none");
    }
    if (map.getLayer("safety-fill")) {
      map.setPaintProperty("safety-fill", "fill-opacity", showSafety ? 0.2 : 0.0);
    }
    if (map.getLayer("safety-outline")) {
      map.setPaintProperty("safety-outline", "line-opacity", showSafety ? 0.8 : 0.0);
    }
  }, [showTraffic, showSafety]);

  const geocode = async (q: string) => {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Geocode failed");
    return (await res.json()) as { features: Array<{ geometry: { coordinates: [number, number] }, properties: { label: string } }> };
  };

  const pickStart = async () => {
    if (!start) return;
    const result = await geocode(start);
    if (result.features?.length) {
      const [lng, lat] = result.features[0].geometry.coordinates;
      setStartCoord({ lat, lng });
      fly([lng, lat], 10);
    }
  };

  const pickEnd = async () => {
    if (!end) return;
    const result = await geocode(end);
    if (result.features?.length) {
      const [lng, lat] = result.features[0].geometry.coordinates;
      setEndCoord({ lat, lng });
      fly([lng, lat], 10);
    }
  };

  const fly = (center: [number, number], zoom = 12) => {
    mapRef.current?.flyTo({ center, zoom });
    new maplibregl.Marker({ color: "#fff" }).setLngLat(center).addTo(mapRef.current!);
  };

  const route = async () => {
    if (!startCoord || !endCoord) return;
    const res = await fetch("/api/route", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        start: [startCoord.lng, startCoord.lat],
        end: [endCoord.lng, endCoord.lat],
        profile
      })
    });
    if (!res.ok) {
      alert("Route failed");
      return;
    }
    const data = await res.json();
    const geojson = data?.routes?.[0]?.geometry ?? data; // ORS GeoJSON
    if (mapRef.current?.getSource("route")) {
      // @ts-ignore
      (mapRef.current.getSource("route") as any).setData(geojson);
    }
    const meters = data?.routes?.[0]?.summary?.distance ?? null;
    if (meters) {
      const km = meters / 1000;
      setDistanceKm(Number(km.toFixed(2)));
      // Fare estimates
      setFareTaxi(Number((km * 25).toFixed(0)));
      setFareAuto(Number((km * 20).toFixed(0)));
    }
  };

  return (
    <div className="grid lg:grid-cols-[360px,1fr] gap-4">
      <div className="card">
        <h2 className="font-bold mb-2">Plan Your Route</h2>
        <label className="block mb-2">
          Start
          <input className="w-full mt-1" value={start} onChange={(e) => setStart(e.target.value)} placeholder="e.g., Delhi Airport" />
        </label>
        <button className="mb-3" onClick={pickStart}>Pick Start</button>

        <label className="block mb-2">
          End
          <input className="w-full mt-1" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="e.g., Connaught Place New Delhi" />
        </label>
        <button className="mb-3" onClick={pickEnd}>Pick End</button>

        <label className="block mb-2">
          Mode
          <select className="w-full mt-1" value={profile} onChange={(e) => setProfile(e.target.value as any)}>
            <option value="driving-car">Car / Taxi</option>
            <option value="foot-walking">Walking</option>
          </select>
        </label>

        <div className="flex gap-3 my-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showTraffic} onChange={(e) => setShowTraffic(e.target.checked)} />
            Traffic overlay
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showSafety} onChange={(e) => setShowSafety(e.target.checked)} />
            Safety overlay
          </label>
        </div>

        <button className="mb-2" onClick={route}>Get Directions</button>

        {distanceKm !== null && (
          <div className="mt-3 text-sm text-fgMuted">
            <div>Distance: <b>{distanceKm} km</b></div>
            <div>Est. Taxi Fare: <b>₹{fareTaxi}</b></div>
            <div>Est. Auto Fare: <b>₹{fareAuto}</b></div>
            <div>Bus Fare: <b>Free</b></div>
          </div>
        )}

        <div className="mt-4 text-xs text-fgMuted">
          Safety-first mode is enabled (night 21:00–05:00; low-lit heuristic in remote/park/industrial areas).
        </div>
      </div>

      <div className="card p-0">
        <div ref={containerRef} className="w-full h-[70vh] rounded-xl overflow-hidden" />
      </div>
    </div>
  );
}