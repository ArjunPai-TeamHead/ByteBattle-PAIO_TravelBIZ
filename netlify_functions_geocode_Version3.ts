// Netlify Function: ORS geocoding autocomplete proxy to keep key server-side
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    const q = event.queryStringParameters?.q;
    if (!q) return { statusCode: 400, body: JSON.stringify({ error: "Missing q" }) };

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "Missing ORS_API_KEY" }) };

    const url = new URL("https://api.openrouteservice.org/geocode/autocomplete");
    url.searchParams.set("text", q);
    url.searchParams.set("boundary.country", "IN"); // India-only
    url.searchParams.set("size", "5");

    const res = await fetch(url.toString(), {
      headers: { authorization: apiKey }
    });

    const text = await res.text();
    return { statusCode: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" }, body: text };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};