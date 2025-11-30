"use client";

import { useMemo, useState } from "react";

export const metadata = { title: "Hotels • PAIO TravelBiz" };

export default function HotelsPage() {
  const [destination, setDestination] = useState("Goa");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (destination) params.set("q", destination);
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (adults) params.set("adults", String(adults));
    if (rooms) params.set("rooms", String(rooms));
    return `https://www.google.com/travel/hotels?${params.toString()}`;
  }, [destination, checkIn, checkOut, adults, rooms]);

  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="text-xl font-bold mb-2">Hotel Deep-Link Builder</h1>
        <div className="grid md:grid-cols-2 gap-3">
          <label>Destination
            <input className="w-full mt-1" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City, area, landmark" />
          </label>
          <label>Check-in
            <input className="w-full mt-1" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </label>
          <label>Check-out
            <input className="w-full mt-1" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </label>
          <label>Adults
            <input className="w-full mt-1" type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
          </label>
          <label>Rooms
            <input className="w-full mt-1" type="number" min={1} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} />
          </label>
        </div>

        <div className="mt-4">
          <a className="underline" href={url} target="_blank" rel="noreferrer">Open Google Hotels</a>
        </div>
        <p className="text-xs text-fgMuted mt-2">We will add Agoda affiliate deep links later if/when CID is available.</p>
      </div>
    </div>
  );
}