import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Polyline, Marker, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SmartphoneCharging, X } from "lucide-react";

function useTripPath(active: boolean) {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [pos, setPos] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!active) return;
    const watch = navigator.geolocation?.watchPosition((p) => {
      const c: [number, number] = [p.coords.latitude, p.coords.longitude];
      setPos(c);
      setCoords((prev) => (prev.length && prev[prev.length - 1][0] === c[0] && prev[prev.length - 1][1] === c[1] ? prev : [...prev, c]));
    });
    return () => {
      if (watch && typeof watch === "number") navigator.geolocation.clearWatch(watch);
    };
  }, [active]);
  return { coords, pos };
}

export default function ActiveTrip() {
  const [paused, setPaused] = useState(false);
  const [batterySave, setBatterySave] = useState(true);
  const { coords, pos } = useTripPath(!paused);

  const center = pos ?? (coords[0] ?? [23.2645, 77.4205]);

  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Active Trip</h1>
        <Card className="p-3">
          <div className="h-[50vh] w-full overflow-hidden rounded-lg">
            <MapContainer center={center as any} zoom={15} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {coords.length > 1 && <Polyline positions={coords as any} pathOptions={{ color: "#0d9488", weight: 5 }} />}
              {pos && <CircleMarker center={pos as any} radius={6} pathOptions={{ color: "#1e3a8a", fillColor: "#1e3a8a", fillOpacity: 1 }} />}
            </MapContainer>
          </div>
        </Card>
        <Card className="p-3 grid grid-cols-3 gap-2 items-center">
          <Button variant="destructive" className="col-span-1" onClick={() => (window.location.href = "/trips") }>
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
        <Card className="p-3 text-sm text-muted-foreground">Current Location: {center[0].toFixed(4)}, {center[1].toFixed(4)}</Card>
      </section>
    </Layout>
  );
}
