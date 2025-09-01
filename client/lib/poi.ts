export type PoiResult = { busStops: string[]; metro: string[]; attractions: string[] };

export async function fetchNearbyPois(lat: number, lng: number): Promise<PoiResult> {
  const radius = 1200; // meters
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    const url = `/api/pois?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${radius}`;
    const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
    clearTimeout(t);
    if (!res.ok) throw new Error("pois bad status");
    const data = await res.json();
    const busStops = Array.isArray(data.busStops) ? data.busStops : [];
    const metro = Array.isArray(data.metro) ? data.metro : [];
    const attractions = Array.isArray(data.attractions) ? data.attractions : [];
    return { busStops, metro, attractions };
  } catch {
    return { busStops: [], metro: [], attractions: [] };
  }
}
