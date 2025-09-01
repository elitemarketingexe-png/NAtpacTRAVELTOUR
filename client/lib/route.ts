import type { LatLng } from "./storage";

export type RouteResult = {
  distanceKm: number;
  durationMin: number;
  coords: [number, number][];
  steps?: string[];
};

export async function fetchRoute(
  start: LatLng,
  dest: LatLng,
  opts?: { steps?: boolean; profile?: "foot" | "driving" | "cycling" },
): Promise<RouteResult | null> {
  try {
    const profile = opts?.profile ?? "foot";
    const wantSteps = !!opts?.steps;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson${wantSteps ? "&steps=true" : ""}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;
    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;
    const coords = route.geometry.coordinates.map((c: [number, number]) => [
      c[1],
      c[0],
    ]);
    let steps: string[] | undefined;
    if (wantSteps && route.legs?.[0]?.steps) {
      steps = route.legs[0].steps.map((s: any) => {
        const t = s.maneuver?.type ?? "Continue";
        const mod = s.maneuver?.modifier ? ` ${s.maneuver.modifier}` : "";
        const name = s.name ? ` onto ${s.name}` : "";
        return `${t}${mod}${name}`;
      });
    }
    return { distanceKm, durationMin, coords, steps };
  } catch {
    return null;
  }
}
