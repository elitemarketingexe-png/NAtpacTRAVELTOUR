import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SmartphoneCharging, X, CheckCircle2 } from "lucide-react";
import L from "leaflet";
import { saveTrip, type TripRecord } from "@/lib/storage";
import { fetchNearbyPois } from "@/lib/poi";

function useTripPath(active: boolean, onPos?: (p: [number, number]) => void) {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [pos, setPos] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!active) return;
    const watch = navigator.geolocation?.watchPosition((p) => {
      const c: [number, number] = [p.coords.latitude, p.coords.longitude];
      setPos(c);
      onPos?.(c);
      setCoords((prev) => (prev.length && prev[prev.length - 1][0] === c[0] && prev[prev.length - 1][1] === c[1] ? prev : [...prev, c]));
    }, undefined, { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 });
    return () => {
      if (watch && typeof watch === "number") navigator.geolocation.clearWatch(watch);
    };
  }, [active, onPos]);
  return { coords, pos };
}

function useQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get("mode") ?? "bus",
    purpose: params.get("purpose") ?? "",
    companions: Number(params.get("companions") ?? "0"),
    start: params.get("slat") && params.get("slng") ? [Number(params.get("slat")), Number(params.get("slng"))] as [number, number] : undefined,
    dest: params.get("dlat") && params.get("dlng") ? [Number(params.get("dlat")), Number(params.get("dlng"))] as [number, number] : undefined,
    dname: params.get("dname") ?? undefined,
    est: params.get("est") ? Number(params.get("est")) : undefined,
    dist: params.get("dist") ? Number(params.get("dist")) : undefined,
    cost: params.get("cost") ? Number(params.get("cost")) : undefined,
  } as const;
}

export default function ActiveTrip() {
  const q = useQuery();
  const [paused, setPaused] = useState(false);
  const [batterySave, setBatterySave] = useState(true);
  const mapRef = useRef<any>(null);
  const startedAt = useRef<number>(Date.now());

  const { coords, pos } = useTripPath(!paused, (p) => {
    if (mapRef.current) mapRef.current.flyTo(p as any, 18, { duration: 0.5 });
  });

  const center = pos ?? (q.start ?? [23.2645, 77.4205]);

  const completeTrip = async () => {
    const end = pos ?? coords[coords.length - 1];
    if (!end) return;
    const path = coords.map(([lat, lng]) => ({ lat, lng }));
    const pickEvery = 6;
    const stops = coords.filter((_, i) => i % pickEvery === 0).map(([lat, lng]) => ({ lat, lng }));
    const pois = await fetchNearbyPois(end[0], end[1]);
    const record = saveTrip({
      startedAt: startedAt.current,
      endedAt: Date.now(),
      mode: q.mode,
      purpose: q.purpose,
      companions: q.companions,
      start: q.start ? { lat: q.start[0], lng: q.start[1] } : { lat: center[0], lng: center[1] },
      destination: q.dest ? { name: q.dname, position: { lat: q.dest[0], lng: q.dest[1] } } : { position: { lat: end[0], lng: end[1] } },
      path,
      stops,
      pois,
      distanceKm: q.dist,
      costEstimate: q.est,
      costActual: q.cost,
    } as any);
    try {
      await fetch('/api/trips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
    } catch {}
    window.location.href = "/trips";
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Active Trip</h1>
        <Card className="p-3">
          <div className="h-[55vh] w-full overflow-hidden rounded-lg">
            <MapContainer center={center as any} zoom={16} className="h-full w-full" whenCreated={(m) => (mapRef.current = m)}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {coords.length > 1 && <Polyline positions={coords as any} pathOptions={{ color: "#0d9488", weight: 6, opacity: 0.85 }} />}
              {pos && <Marker position={pos as any} icon={L.divIcon({ className: 'pulse-marker' })} />}
              {q.dest && <Marker position={q.dest as any} icon={L.divIcon({ className: 'pulse-marker' })} />}
            </MapContainer>
          </div>
        </Card>
        <Card className="p-3 grid grid-cols-4 gap-2 items-center">
          <Button variant="destructive" className="col-span-2" onClick={() => (window.location.href = "/trips") }>
            <X className="mr-2 h-4 w-4"/> Emergency Stop
          </Button>
          <Button variant="secondary" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="mr-2 h-4 w-4"/> : <Pause className="mr-2 h-4 w-4"/>}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button variant={batterySave ? "default" : "secondary"} onClick={() => setBatterySave((v) => !v)}>
            <SmartphoneCharging className="mr-2 h-4 w-4"/> Optimize Battery
          </Button>
        </Card>
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-3 text-sm text-muted-foreground">Current Location: {center[0].toFixed(4)}, {center[1].toFixed(4)}</Card>
          <Button onClick={completeTrip} className="h-auto py-3">
            <CheckCircle2 className="mr-2 h-4 w-4"/> Trip Completed
          </Button>
        </div>
      </section>
    </Layout>
  );
}
