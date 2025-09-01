import type { RequestHandler } from "express";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
];

// Simple in-memory cache to reduce load and improve UX
type CacheEntry = { data: any; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function keyFor(lat: number, lng: number, radius: number) {
  // Round to ~200m grid to coalesce nearby calls
  const rLat = Math.round(lat * 500) / 500;
  const rLng = Math.round(lng * 500) / 500;
  return `${rLat}:${rLng}:${radius}`;
}

async function fetchOverpass(q: string, timeoutMs = 20000): Promise<any> {
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), timeoutMs);
  let lastErr: unknown = null;
  for (const base of OVERPASS_ENDPOINTS) {
    try {
      const url = `${base}?data=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        signal: ac.signal,
        headers: {
          "Accept": "application/json",
          // Helpful but optional
          "User-Agent": "fusion-starter/pois (+https://builder.io)"
        },
      });
      if (!res.ok) {
        lastErr = new Error(`overpass status ${res.status}`);
        continue;
      }
      const json = await res.json();
      clearTimeout(to);
      return json;
    } catch (e) {
      lastErr = e;
      // Try next mirror
      continue;
    }
  }
  clearTimeout(to);
  throw lastErr ?? new Error("overpass fetch failed");
}

export const getPois: RequestHandler = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Math.min(Math.max(Number(req.query.radius ?? 1200), 200), 5000);
    if (!isFinite(lat) || !isFinite(lng)) return res.status(400).json({ error: "invalid lat/lng" });

    const k = keyFor(lat, lng, radius);
    const now = Date.now();
    const hit = cache.get(k);
    if (hit && hit.expiresAt > now) return res.json(hit.data);

    const q = `[
      out:json][timeout:25];
      (
        node[highway=bus_stop](around:${radius},${lat},${lng});
        node[railway=station](around:${radius},${lat},${lng});
        node[railway=subway_entrance](around:${radius},${lat},${lng});
        node[tourism=attraction](around:${radius},${lat},${lng});
      );
      out tags;`;

    const data = await fetchOverpass(q);

    const busStops: string[] = [];
    const metro: string[] = [];
    const attractions: string[] = [];
    for (const el of data.elements ?? []) {
      const tags = (el as any).tags ?? {};
      const name = tags.name || tags.ref || "Unnamed";
      if (tags.highway === "bus_stop") busStops.push(name);
      else if (tags.railway === "station" || tags.railway === "subway_entrance") metro.push(name);
      else if (tags.tourism === "attraction") attractions.push(name);
    }

    const payload = {
      busStops: busStops.slice(0, 6),
      metro: metro.slice(0, 4),
      attractions: attractions.slice(0, 6),
    };

    cache.set(k, { data: payload, expiresAt: now + 60_000 }); // 1 minute TTL
    res.json(payload);
  } catch (e) {
    res.status(200).json({ busStops: [], metro: [], attractions: [] });
  }
};
