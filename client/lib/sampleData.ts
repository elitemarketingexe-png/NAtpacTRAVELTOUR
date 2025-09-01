export type LatLng = { lat: number; lng: number };
export type Stop = { id: string; name: string; position: LatLng };
export type BusRoute = {
  id: string;
  name: string;
  color: string; // tailwind color or hex
  polyline: LatLng[];
  stops: Stop[];
  baseFare: number;
};

// Sample data for a fictional small city center
export const routes: BusRoute[] = [
  {
    id: "R1",
    name: "Blue Line",
    color: "#2563eb",
    baseFare: 12,
    polyline: [
      { lat: 23.2599, lng: 77.4126 },
      { lat: 23.2608, lng: 77.4162 },
      { lat: 23.2622, lng: 77.4201 },
      { lat: 23.2641, lng: 77.4233 },
      { lat: 23.2662, lng: 77.4265 },
      { lat: 23.268, lng: 77.4301 },
      { lat: 23.269, lng: 77.4342 }
    ],
    stops: [
      { id: "S1", name: "Central Square", position: { lat: 23.2599, lng: 77.4126 } },
      { id: "S2", name: "City Mall", position: { lat: 23.2622, lng: 77.4201 } },
      { id: "S3", name: "Lake View", position: { lat: 23.2662, lng: 77.4265 } },
      { id: "S4", name: "Tech Park", position: { lat: 23.269, lng: 77.4342 } }
    ]
  },
  {
    id: "R2",
    name: "Teal Loop",
    color: "#14b8a6",
    baseFare: 10,
    polyline: [
      { lat: 23.2675, lng: 77.405 },
      { lat: 23.2657, lng: 77.4094 },
      { lat: 23.2649, lng: 77.414 },
      { lat: 23.2652, lng: 77.4189 },
      { lat: 23.266, lng: 77.4228 },
      { lat: 23.2673, lng: 77.4269 },
      { lat: 23.2691, lng: 77.4307 }
    ],
    stops: [
      { id: "S5", name: "Old Town", position: { lat: 23.2675, lng: 77.405 } },
      { id: "S6", name: "Museum", position: { lat: 23.2649, lng: 77.414 } },
      { id: "S7", name: "Stadium", position: { lat: 23.266, lng: 77.4228 } },
      { id: "S8", name: "University", position: { lat: 23.2691, lng: 77.4307 } }
    ]
  }
];

export const allStops: Stop[] = routes.flatMap((r) => r.stops);
