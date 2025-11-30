// Netlify Function: ORS route proxy (server-side, keeps ORS key secret)
import type { Handler } from "@netlify/functions";

const ORS_URL = "https://api.openrouteservice.org/v2/directions";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "POST only" }) };
    }
    const body = JSON.parse(event.body || "{}");
    const { start, end, profile = "driving-car" } = body;
    if (!start || !end) return { statusCode: 400, body: JSON.stringify({ error: "Missing start/end" }) };

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "Missing ORS_API_KEY" }) };

    const res = await fetch(`${ORS_URL}/${profile}/geojson`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: apiKey
      },
      body: JSON.stringify({
        coordinates: [start, end]
      })
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
      body: text
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};