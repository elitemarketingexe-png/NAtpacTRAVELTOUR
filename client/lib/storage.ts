export type LatLng = { lat: number; lng: number };
export type TripRecord = {
  tripId: string;
  userId: string;
  startedAt: number;
  endedAt: number;
  mode: string;
  purpose: string;
  companions: number;
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
