// Netlify Function: Proxy TomTom Traffic tiles to avoid exposing key client-side
import type { Handler } from "@netlify/functions";

// Example TomTom traffic tile endpoint format (raster flow map v4):
// https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=YOUR_KEY
const BASE = "https://api.tomtom.com/traffic/map/4/tile/flow/relative";

export const handler: Handler = async (event) => {
  try {
    const path = event.path || "";
    // Expecting /api/tomtom-traffic/{z}/{x}/{y}.png
    const match = path.match(/tomtom-traffic\/(\d+)\/(\d+)\/(\d+)\.png$/);
    if (!match) {
      return { statusCode: 400, body: "Bad tile path" };
    }
    const [_, z, x, y] = match;

    const key = process.env.TOMTOM_API_KEY;
    if (!key) return { statusCode: 500, body: "Missing TOMTOM_API_KEY" };

    const url = `${BASE}/${z}/${x}/${y}.png?key=${encodeURIComponent(key)}`;

    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());

    return {
      statusCode: res.status,
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=120"
      },
      body: buf.toString("base64"),
      isBase64Encoded: true
    };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};