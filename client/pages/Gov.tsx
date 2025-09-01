import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

export default function Gov() {
  const [trips, setTrips] = useState<any[]>([]);
  useEffect(() => { fetch('/api/trips/json').then(r=>r.json()).then(setTrips).catch(()=>setTrips([])); }, []);
  const paths = trips.flatMap((t) => (t.path || []).map((p: any) => [p.lat, p.lng] as [number,number]));
  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">NATPAC — Location History</h1>
          <a className="rounded-md border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground" href="/api/trips/csv">Download CSV</a>
        </div>
        <Card className="p-3">
          <div className="h-[60vh] w-full overflow-hidden rounded-lg">
            <MapContainer center={{ lat: 23.2645, lng: 77.4205 } as any} zoom={12} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {paths.length > 1 && <Polyline positions={paths as any} pathOptions={{ color: '#0ea5e9', weight: 3, opacity: 0.8 }} />}
            </MapContainer>
          </div>
        </Card>
      </section>
    </Layout>
  );
}
