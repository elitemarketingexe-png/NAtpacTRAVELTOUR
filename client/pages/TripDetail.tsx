import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { listTrips } from "@/lib/storage";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchRoute } from "@/lib/route";

export default function TripDetail() {
  const { id } = useParams();
  const trips = listTrips();
  const trip = trips.find((t) => t.tripId === id);
  const [suggest, setSuggest] = useState<{ coords: [number, number][], steps?: string[] } | null>(null);

  useEffect(() => {
    (async () => {
      if (!trip) return;
      const destName = trip.destination?.name?.toLowerCase() || "";
      const visitedBefore = trips.some((t) => t.tripId !== trip.tripId && (t.destination?.name || "").toLowerCase() === destName && t.endedAt < trip.endedAt);
      if (!visitedBefore && trip.start && trip.destination?.position) {
        const r = await fetchRoute(trip.start, trip.destination.position, { steps: true, profile: 'foot' });
        if (r) setSuggest({ coords: r.coords as any, steps: r.steps });
      }
    })();
  }, [id]);

  if (!trip) return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-6"><Card className="p-4">Trip not found.</Card></section>
    </Layout>
  );

  const pathCoords = (trip.path || []).map((p) => [p.lat, p.lng]) as [number, number][];
  const center = pathCoords[0] || [trip.start.lat, trip.start.lng] as [number, number];

  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Trip {trip.tripId}</h1>
        <Card className="p-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div><div className="text-xs text-muted-foreground">Purpose</div><div className="font-medium">{trip.purpose}</div></div>
            <div><div className="text-xs text-muted-foreground">Mode</div><div className="font-medium">{trip.mode}</div></div>
            <div><div className="text-xs text-muted-foreground">When</div><div className="font-medium">{new Date(trip.startedAt).toLocaleString()} → {new Date(trip.endedAt).toLocaleString()}</div></div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="h-[60vh] w-full overflow-hidden rounded-lg">
            <MapContainer center={center as any} zoom={14} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {pathCoords.length > 1 && (<Polyline positions={pathCoords as any} pathOptions={{ color: '#0ea5e9', weight: 5 }} />)}
              {suggest?.coords && (<Polyline positions={suggest.coords as any} pathOptions={{ color: '#93c5fd', weight: 4, dashArray: '6 6' }} />)}
              <Marker position={[trip.start.lat, trip.start.lng] as any} icon={L.divIcon({ className: 'pulse-marker-start' })} />
              {trip.destination?.position && <Marker position={[trip.destination.position.lat, trip.destination.position.lng] as any} icon={L.divIcon({ className: 'pin-dest' })} />}
            </MapContainer>
          </div>
        </Card>
        {suggest?.steps && (
          <Card className="p-3 text-sm">
            <div className="font-medium mb-2">Suggested directions (first visit)</div>
            <ol className="list-decimal pl-5 space-y-1">
              {suggest.steps.map((s, i) => (<li key={i}>{s}</li>))}
            </ol>
          </Card>
        )}
      </section>
    </Layout>
  );
}
