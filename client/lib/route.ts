import type { LatLng } from "./storage";

export type RouteResult = { distanceKm: number; durationMin: number; coords: [number, number][] };

export async function fetchRoute(start: LatLng, dest: LatLng): Promise<RouteResult | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;
    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;
    const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
    return { distanceKm, durationMin, coords };
  } catch {
    return null;
  }
}
