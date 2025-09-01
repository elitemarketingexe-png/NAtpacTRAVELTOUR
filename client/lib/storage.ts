export type LatLng = { lat: number; lng: number };
export type Companion = { name?: string; age?: number | null };
export type TripRecord = {
  tripId: string;
  userId: string;
  startedAt: number;
  endedAt: number;
  mode: string;
  purpose: string;
  companions: number;
  companionsDetails?: Companion[];
  start: LatLng;
  destination?: { name?: string; position?: LatLng };
  path: LatLng[];
  stops: LatLng[];
  pois: { busStops: string[]; metro: string[]; attractions: string[] };
  distanceKm?: number | null;
  costEstimate?: number | null;
  costActual?: number | null;
};

export type Place = {
  id: string;
  name: string;
  type: "home" | "work" | "other";
  position: LatLng;
  createdAt: number;
};

const LS_KEYS = {
  userId: "natpac_user_id_seq",
  tripSeq: "natpac_trip_seq",
  trips: "natpac_trips",
  places: "natpac_places_v1",
} as const;

export function getOrCreateUserId(): string {
  let id = localStorage.getItem(LS_KEYS.userId);
  if (!id) {
    const seq = Math.floor(Date.now() / 1000).toString(36);
    id = `U-${seq}`;
    localStorage.setItem(LS_KEYS.userId, id);
  }
  return id;
}

function nextTripId(): string {
  const cur = Number(localStorage.getItem(LS_KEYS.tripSeq) || "0") + 1;
  localStorage.setItem(LS_KEYS.tripSeq, String(cur));
  return `T-${cur.toString().padStart(6, "0")}`;
}

export function listTrips(): TripRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.trips);
    return raw ? (JSON.parse(raw) as TripRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveTrip(partial: Omit<TripRecord, "tripId" | "userId">): TripRecord {
  const trips = listTrips();
  const record: TripRecord = {
    ...partial,
    tripId: nextTripId(),
    userId: getOrCreateUserId(),
  };
  trips.unshift(record);
  localStorage.setItem(LS_KEYS.trips, JSON.stringify(trips));
  return record;
}

export function tripsToCSV(trips: TripRecord[]): string {
  const headers = [
    "tripId","userId","startedAt","endedAt","mode","purpose","companions","companionsDetails","startLat","startLng","destName","destLat","destLng","distanceKm","costEstimate","costActual","pathPoints","busStops","metro","attractions"
  ];
  const rows = trips.map(t => [
    t.tripId,
    t.userId,
    new Date(t.startedAt).toISOString(),
    new Date(t.endedAt).toISOString(),
    t.mode,
    t.purpose,
    t.companions,
    t.companionsDetails ? JSON.stringify(t.companionsDetails) : "",
    t.start.lat,
    t.start.lng,
    t.destination?.name ?? "",
    t.destination?.position?.lat ?? "",
    t.destination?.position?.lng ?? "",
    t.distanceKm ?? "",
    t.costEstimate ?? "",
    t.costActual ?? "",
    t.path.length,
    (t.pois?.busStops || []).join(";"),
    (t.pois?.metro || []).join(";"),
    (t.pois?.attractions || []).join(";"),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.map(v => String(v).replaceAll('"', '""')).join(","))].join("\n");
  return csv;
}

export type LatLng = { lat: number; lng: number };

export function listPlaces(): Place[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.places);
    return raw ? (JSON.parse(raw) as Place[]) : [];
  } catch {
    return [];
  }
}

function persistPlaces(arr: Place[]) {
  localStorage.setItem(LS_KEYS.places, JSON.stringify(arr));
}

export function savePlace(p: Omit<Place, "id" | "createdAt"> & Partial<Pick<Place, "id">>): Place {
  const all = listPlaces();
  const id = p.id || `P-${Math.random().toString(36).slice(2, 10)}`;
  const existing = all.findIndex((x) => x.id === id);
  const rec: Place = { id, name: p.name, type: p.type, position: p.position, createdAt: Date.now() };
  if (existing >= 0) all[existing] = rec; else all.unshift(rec);
  persistPlaces(all);
  return rec;
}

export function deletePlace(id: string) {
  const next = listPlaces().filter((p) => p.id !== id);
  persistPlaces(next);
}

export function upsertHome(position: LatLng): Place {
  const all = listPlaces().filter(p => p.type !== "home");
  const rec: Place = { id: "HOME", name: "Home", type: "home", position, createdAt: Date.now() };
  all.unshift(rec);
  persistPlaces(all);
  return rec;
}

export function upsertWork(position: LatLng): Place {
  const all = listPlaces().filter(p => p.type !== "work");
  const rec: Place = { id: "WORK", name: "Work", type: "work", position, createdAt: Date.now() };
  all.unshift(rec);
  persistPlaces(all);
  return rec;
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  return R * c;
}
