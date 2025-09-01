export type PoiResult = { busStops: string[]; metro: string[]; attractions: string[] };

export async function fetchNearbyPois(lat: number, lng: number): Promise<PoiResult> {
  const radius = 1200; // meters
  const overpass = "https://overpass-api.de/api/interpreter";
  const q = `[
    out:json][timeout:15];
    (
      node[highway=bus_stop](around:${radius},${lat},${lng});
      node[railway=station](around:${radius},${lat},${lng});
      node[railway=subway_entrance](around:${radius},${lat},${lng});
      node[tourism=attraction](around:${radius},${lat},${lng});
    );
    out tags;`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${overpass}?data=${encodeURIComponent(q)}`, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error("overpass bad status");
    const data = await res.json();
    const busStops: string[] = [];
    const metro: string[] = [];
    const attractions: string[] = [];
    for (const el of data.elements ?? []) {
      const name = el.tags?.name || el.tags?.ref || "Unnamed";
      if (el.tags?.highway === "bus_stop") busStops.push(name);
      else if (el.tags?.railway === "station" || el.tags?.railway === "subway_entrance") metro.push(name);
      else if (el.tags?.tourism === "attraction") attractions.push(name);
    }
    return {
      busStops: busStops.slice(0, 6),
      metro: metro.slice(0, 4),
      attractions: attractions.slice(0, 6),
    };
  } catch {
    return { busStops: [], metro: [], attractions: [] };
  }
}
