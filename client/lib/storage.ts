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

const LS_KEYS = {
  userId: "natpac_user_id_seq",
  tripSeq: "natpac_trip_seq",
  trips: "natpac_trips",
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
