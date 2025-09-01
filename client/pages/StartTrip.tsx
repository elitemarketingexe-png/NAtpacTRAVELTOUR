import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bus, Car, Footprints, Train, Minus, Plus, Crosshair, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { listTrips } from "@/lib/storage";

const modes = [
  { key: "walk", label: "Walk", icon: Footprints },
  { key: "car", label: "Car", icon: Car },
  { key: "bus", label: "Bus", icon: Bus },
  { key: "train", label: "Train", icon: Train }
] as const;

type ModeKey = typeof modes[number]["key"];

export default function StartTrip() {
  const [purpose, setPurpose] = useState("Work");
  const [companions, setCompanions] = useState(0);
  const [mode, setMode] = useState<ModeKey>("bus");
  const [start, setStart] = useState<{lat:number;lng:number} | null>(null);
  const [destText, setDestText] = useState("");
  const [dest, setDest] = useState<{lat:number;lng:number} | null>(null);
  const [results, setResults] = useState<{place_id?: number | string; display_name:string; lat:string; lon:string}[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const id = navigator.geolocation?.getCurrentPosition((p) => setStart({ lat: p.coords.latitude, lng: p.coords.longitude }));
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!destText.trim()) { setResults([]); return; }
      const q = encodeURIComponent(destText.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5`);
      const data = await res.json();
      setResults(data);
    }, 350);
    return () => clearTimeout(handler);
  }, [destText]);

  const alternative = useMemo(() => {
    const trips = listTrips();
    if (!destText) return null;
    return trips.find(t => (t.destination?.name || "").toLowerCase().includes(destText.toLowerCase())) || null;
  }, [destText]);

  const startTrip = () => {
    const params = new URLSearchParams({
      mode,
      purpose,
      companions: String(companions),
    });
    if (start) { params.set("slat", String(start.lat)); params.set("slng", String(start.lng)); }
    if (dest) { params.set("dlat", String(dest.lat)); params.set("dlng", String(dest.lng)); params.set("dname", destText); }
    navigate(`/trip/active?${params.toString()}`);
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-md px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Start New Trip</h1>

        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {modes.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex flex-col items-center rounded-md border px-3 py-2 text-xs ${mode === m.key ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
              >
                <m.icon size={16} />
                <span className="mt-1">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label>Trip purpose</Label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Work, Shopping" />
          </div>
          <div className="grid gap-2">
            <Label>Destination</Label>
            <Input value={destText} onChange={(e) => setDestText(e.target.value)} placeholder="Search place or tap on map" />
            {!!results.length && (
              <div className="rounded-md border bg-background shadow divide-y">
                {results.map((r) => (
                  <button key={r.display_name} className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => { setDest({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) }); setResults([]); }}>
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">Companions</div>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 grid place-items-center rounded-md border" onClick={() => setCompanions((v) => Math.max(0, v - 1))}><Minus size={16}/></button>
              <Badge variant="secondary">{companions}</Badge>
              <button className="h-8 w-8 grid place-items-center rounded-md border" onClick={() => setCompanions((v) => v + 1)}><Plus size={16}/></button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden">
            <div className="h-56 w-full">
              <MapContainer center={start ?? { lat: 23.2645, lng: 77.4205 }} zoom={start ? 16 : 13} className="h-full w-full" whenCreated={(m) => m.on('click', (e: any) => setDest({ lat: e.latlng.lat, lng: e.latlng.lng }))}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {start && <Marker position={start as any} icon={L.divIcon({ className: 'pulse-marker' })} />}
                {dest && <Marker position={dest as any} icon={L.divIcon({ className: 'pulse-marker' })} />}
              </MapContainer>
            </div>
            <div className="flex items-center justify-between p-2 text-xs">
              <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1" onClick={() => navigator.geolocation?.getCurrentPosition((p) => setStart({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {}, { enableHighAccuracy: true })}>
                <Crosshair size={14}/> Use current location
              </button>
              <div className="text-muted-foreground">Tap map to set destination</div>
            </div>
          </div>
          {alternative && (
            <div className="rounded-md border p-2 text-xs">We found an earlier trip to this destination. You can compare after recording to get an alternative suggestion.</div>
          )}
          <Button className="w-full" onClick={startTrip}>Start</Button>
        </Card>

        <Card className="p-4 text-xs text-muted-foreground">
          Location access is required. You can change permissions anytime in settings.
        </Card>
      </section>
    </Layout>
  );
}
