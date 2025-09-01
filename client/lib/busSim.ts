import type { BusRoute, LatLng, Stop } from "./sampleData";

export type BusLive = {
  id: string;
  routeId: string;
  position: LatLng;
  speedKmh: number;
  crowdLevel: 0 | 1 | 2 | 3; // 0=empty, 3=packed
  lastUpdated: number;
  direction: 1 | -1;
  progress: number; // 0..1 along the polyline
};

export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371e3;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h)); // meters
}

export function polylineLength(poly: LatLng[]): number {
  let sum = 0;
  for (let i = 1; i < poly.length; i++) sum += haversine(poly[i - 1], poly[i]);
  return sum; // meters
}

export function positionAlongPolyline(poly: LatLng[], progress: number): LatLng {
  const total = polylineLength(poly);
  let target = total * progress;
  for (let i = 1; i < poly.length; i++) {
    const seg = haversine(poly[i - 1], poly[i]);
    if (target <= seg) {
      const t = seg === 0 ? 0 : target / seg;
      return interpolate(poly[i - 1], poly[i], t);
    } else {
      target -= seg;
    }
  }
  return poly[poly.length - 1];
}

export function etaToStop(bus: BusLive, route: BusRoute, stop: Stop): number {
  // crude: distance from current position to stop projection / speed
  const pos = bus.position;
  const distance = haversine(pos, stop.position); // meters
  const speedMs = (bus.speedKmh * 1000) / 3600;
  return Math.max(30, Math.round(distance / speedMs)); // seconds (min 30s)
}

export function tickBus(bus: BusLive, dtMs: number): BusLive {
  const meters = (bus.speedKmh * 1000 * dtMs) / 3600_000; // meters moved
  // Assume average route length ~ few km; convert meters to progress delta using 5km = 1.0
  const delta = meters / 5000;
  let progress = bus.progress + delta * bus.direction;
  if (progress > 1) {
    progress = 1 - (progress - 1);
    bus.direction = -1;
  } else if (progress < 0) {
    progress = -progress;
    bus.direction = 1;
  }
  return { ...bus, progress, lastUpdated: Date.now() };
}

export function initBusesForRoutes(routes: BusRoute[]): BusLive[] {
  const now = Date.now();
  return routes.flatMap((r, idx) => {
    const busesOnRoute = 2;
    return Array.from({ length: busesOnRoute }, (_, i) => {
      const progress = ((i + 1) / (busesOnRoute + 1)) * (idx % 2 === 0 ? 1 : 0.6);
      return {
        id: `${r.id}-B${i + 1}`,
        routeId: r.id,
        position: r.polyline[0],
        speedKmh: 18 + Math.random() * 12,
        crowdLevel: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
        lastUpdated: now,
        direction: Math.random() > 0.5 ? 1 : -1,
        progress
      } satisfies BusLive;
    });
  });
}
