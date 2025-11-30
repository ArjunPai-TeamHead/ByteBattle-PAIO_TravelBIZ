# PAIO TravelBiz (MVP)

India-focused tourist discovery web app:
- Map & directions (OpenRouteService) with traffic overlay (TomTom)
- Safety overlays (higher-caution regions + night/low-lit heuristic)
- Festival overlays (crowd impact windows)
- Transport discovery via BANG Bus (embedded)
- Translator: text (LibreTranslate), OCR (Tesseract.js), speech (Hindi/English via Web Speech API)
- Hotels: Google Hotels deep-link builder
- Fare estimator: Taxi ₹25/km, Auto ₹20/km, Bus Free

This repository is free/dev-tier friendly and deploys on Netlify.

---

## 1) Quick Start

- Prerequisites:
  - Node.js 18+
  - A Netlify account (free) and a GitHub repo

- Install deps locally:
  ```
  npm install
  npm run dev
  ```
  Open http://localhost:5173

---

## 2) Environment Variables

Copy `.env.example` to an `.env.local` (for local dev) and add the same vars in Netlify Site settings → Environment.

Client-safe (can be exposed):
- NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
- NEXT_PUBLIC_LIBRETRANSLATE_URL=https://libretranslate.com
- NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY_TEST=pk_test (not used in MVP geocoding)
- NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY_LIVE=pk_live (not used in MVP geocoding)

Server-only (DO NOT COMMIT REAL VALUES):
- ORS_API_KEY=your_openrouteservice_key
- TOMTOM_API_KEY=your_tomtom_key

Feature flags:
- ENABLE_SAFETY=true
- ENABLE_FESTIVALS=true
- ENABLE_SPEECH=true
- ENABLE_OCR=true

Rate limits (client messaging only in MVP):
- ROUTE_RATE_LIMIT_PER_HOUR=120
- TRANSLATE_RATE_LIMIT_PER_HOUR=60

---

## 3) Free Keys: How to get them

- MapTiler (map tiles): https://cloud.maptiler.com/ → API keys → create key → put value in NEXT_PUBLIC_MAPTILER_KEY.
- OpenRouteService (routing + geocoding): https://openrouteservice.org/dev/#/signup → get API key → ORS_API_KEY (server).
- TomTom (traffic tiles): https://developer.tomtom.com/ → create API key (Traffic) → TOMTOM_API_KEY (server).
- LibreTranslate (text translation): default https://libretranslate.com (no key). You can change URL if needed.
- Radar (publishable pk): optional in this MVP. We use ORS server-side for geocoding to avoid exposing secrets.

Security note:
- Never paste server secrets into client variables.
- Rotate any secrets you previously posted publicly, then add the rotated values in Netlify environment variables only.

---

## 4) Run locally

1) Install
```
npm install
```

2) Dev
```
npm run dev
```

3) Visit
- http://localhost:5173

---

## 5) Deploy to Netlify

A) Create a GitHub repository, push this code.

B) In Netlify:
- Add New Site → Import from Git → select your repo.
- Build command: `next build`
- Publish directory: `.next`
- Add environment variables (Site settings → Environment):
  - NEXT_PUBLIC_MAPTILER_KEY
  - NEXT_PUBLIC_LIBRETRANSLATE_URL (default https://libretranslate.com)
  - ORS_API_KEY
  - TOMTOM_API_KEY
  - ENABLE_SAFETY=true
  - ENABLE_FESTIVALS=true
  - ENABLE_SPEECH=true
  - ENABLE_OCR=true
  - ROUTE_RATE_LIMIT_PER_HOUR=120
  - TRANSLATE_RATE_LIMIT_PER_HOUR=60

C) Deploy.

Netlify automatically uses the Next.js plugin (`@netlify/plugin-nextjs`) per netlify.toml.

Optional:
- Add a custom domain: Site settings → Domain management → Add custom domain.
- HTTPS is automatic via Let’s Encrypt.

---

## 6) Features & Pages

- /map
  - Enter start/end
  - Click Pick Start/End to geocode (ORS via server proxy)
  - Choose mode (Car/Walking)
  - Get Directions (calls ORS via server proxy)
  - Toggle: Traffic overlay (TomTom), Safety overlay
  - Fare estimates shown based on km:
    - Taxi: ₹25/km, Auto: ₹20/km, Bus: Free

- /transport
  - Embeds BANG Bus UI from `/apps/bang-bus/index.html`
  - To integrate:
    1) Build BANG Bus (see its repo docs).
    2) Copy the built static files into `public/apps/bang-bus/`.
    3) Ensure `public/apps/bang-bus/index.html` exists.
    4) Reload `/transport` page to see it inside the iframe.

- /translate
  - Text translation: uses `NEXT_PUBLIC_LIBRETRANSLATE_URL` (default: https://libretranslate.com)
  - OCR: capture/upload image, run Tesseract (eng+hin by default)
  - Speech (Hindi/English): Web Speech API; some browsers may not support this (Chrome/Edge recommended)

- /hotels
  - Google Hotels deep-link builder (destination, dates, adults, rooms)
  - Opens a new tab with your query
  - Later, we can add Agoda deep links when you have a CID

- /itinerary
  - Select categories and time budget
  - Basic heuristic to pick top 3–6 POIs (uses `public/data/attractions.sample.json`)
  - Replace with your city dataset later

- Safety & Festivals
  - Safety overlay draws regions from `public/data/safety_areas.json` (advisory only)
  - Festival info from `public/data/festivals.json` (date windows can be filled later)
  - Low-lit heuristic placeholder via `public/data/poi_density_rules.json`

---

## 7) Data you can customize later

- `public/data/safety_areas.json`:
  - FeatureCollection; properties include risk types, notes, sources, and rules (night hours, low-lit multiplier).
  - You can add geometry (polygons) later; currently polygon arrays are empty so we draw region outlines when available.

- `public/data/festivals.json`:
  - Includes typical rules and “impact”. Fill `dates_2025` with ISO date ranges for accurate overlays.

- `public/data/attractions.sample.json`:
  - Replace with your POI CSV converted to JSON (fields: id, name, category, city, state, lat, lng, popularity).

---

## 8) Notes & Limitations (MVP)

- ORS/TomTom usage: free tiers have rate limits. In heavy use, you may see throttling.
- Translation via public LibreTranslate is rate-limited and may not cover every Indian language well. We’ll later integrate self-hosted IndicTrans2 for stronger Indian language coverage if desired.
- OCR accuracy depends on image quality; we enabled English + Hindi by default. More traineddata languages can be added to Tesseract if needed.
- Safety/Festivals overlays are advisory; sources are cited in README data files; verify before critical decisions.
- Radar publishable keys are included as placeholders but not used in MVP geocoding (we use ORS geocoding through server proxy). We can switch to Radar if you provide a server-side secret later.

---

## 9) Troubleshooting

- Map shows blank:
  - Check NEXT_PUBLIC_MAPTILER_KEY is set and valid.
- Directions failing:
  - Ensure ORS_API_KEY is set in Netlify env; redeploy.
- Traffic overlay missing:
  - Ensure TOMTOM_API_KEY is set in Netlify env; redeploy.
- BANG Bus not loading:
  - Confirm `public/apps/bang-bus/index.html` exists (after you copy its build).
  - Check console for CORS/frame-ancestor issues if embedding a remote URL.
- Translation errors:
  - LibreTranslate public instance may be rate-limited; try again later or host your own instance.

---

## 10) Security

- Never expose ORS/TomTom keys in client-side code.
- Rotate any keys you’ve previously posted publicly and update Netlify env variables.
- This repo only references server keys in Netlify Functions.

---

## 11) Roadmap

- Multi-modal transit extensions (metro/train) when data is available
- Self-hosted translation models (IndicTrans2)
- Richer attractions database per city and category
- Safety polygons per district/city zone (actual shapes)
- Cached route responses (server store) to reduce API cost
- Agoda deep links with CID when provided

---

## 12) License & Attribution

- Base map tiles/data © OpenStreetMap contributors (via MapTiler)
- Routing © OpenRouteService
- Traffic © TomTom
- OCR © Tesseract.js
- Translation via LibreTranslate (public instance)
- BANG Bus © respective authors (embedded)
