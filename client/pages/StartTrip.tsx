import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bus, Car, Footprints, Train, Minus, Plus, Crosshair, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { listTrips } from "@/lib/storage";
import { fetchRoute } from "@/lib/route";

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
  const [route, setRoute] = useState<{coords:[number,number][], distanceKm:number, durationMin:number} | null>(null);
  const [estCost, setEstCost] = useState<number | null>(null);
  const [userCost, setUserCost] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(() => localStorage.getItem('natpac_consent_v1') === '1');
  const [companionNames, setCompanionNames] = useState<{ name: string; age?: string }[]>([]);
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

  // Compute route and focus map when both points are set
  useEffect(() => {
    (async () => {
      if (start && dest) {
        const r = await fetchRoute(start, dest);
        setRoute(r);
        if (r && (window as any)._leaflet_map) {
          const bounds = L.latLngBounds(r.coords.map((c) => L.latLng(c[0], c[1])));
          (window as any)._leaflet_map.fitBounds(bounds, { padding: [24,24] });
          const rate = 6;
          setEstCost(Math.round(r.distanceKm * rate));
        }
      } else {
        setRoute(null);
        setEstCost(null);
      }
    })();
  }, [start, dest]);

  // Fly to destination when chosen
  useEffect(() => {
    if (dest && (window as any)._leaflet_map) {
      (window as any)._leaflet_map.flyTo([dest.lat, dest.lng], 16, { duration: 0.4 });
    }
  }, [dest]);

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
                {results.map((r, idx) => (
                  <button key={`${r.place_id ?? idx}-${r.lat}-${r.lon}`} className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => { const d={ lat: parseFloat(r.lat), lng: parseFloat(r.lon) }; setDest(d); setDestText(r.display_name); setResults([]); if ((window as any)._leaflet_map) (window as any)._leaflet_map.flyTo([d.lat, d.lng], 16, { duration: 0.4 }); }}>
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
              <MapContainer center={start ?? { lat: 23.2645, lng: 77.4205 }} zoom={start ? 16 : 13} className="h-full w-full" whenCreated={(m) => { (window as any)._leaflet_map = m; m.on('click', (e: any) => setDest({ lat: e.latlng.lat, lng: e.latlng.lng })); }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {route?.coords && <Polyline positions={route.coords as any} pathOptions={{ color: '#7dd3fc', weight: 4, opacity: 0.9 }} />}
                {start && <Marker position={start as any} icon={L.divIcon({ className: 'pulse-marker-start' })} />}
                {dest && <Marker position={dest as any} icon={L.divIcon({ className: 'pin-dest' })} />}
              </MapContainer>
            </div>
            <div className="flex items-center justify-between p-2 text-xs">
              <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1" onClick={() => navigator.geolocation?.getCurrentPosition((p) => setStart({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {}, { enableHighAccuracy: true })}>
                <Crosshair size={14}/> Use current location
              </button>
              <div className="text-muted-foreground">Tap map to set destination</div>
            </div>
          </div>
          {route && (
            <div className="rounded-md border p-2 text-xs flex items-center justify-between">
              <div>
                <div>Suggested path ~ {route.distanceKm?.toFixed(1)} km • {Math.round(route.durationMin ?? 0)} min</div>
                {estCost !== null && <div className="text-muted-foreground">Estimated cost ₹{estCost}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Your cost</Label>
                <Input className="h-8 w-24" value={userCost} onChange={(e) => setUserCost(e.target.value)} placeholder="₹" />
              </div>
            </div>
          )}
          {alternative && (
            <div className="rounded-md border p-2 text-xs">We found an earlier trip to this destination. You can compare after recording to get an alternative suggestion.</div>
          )}
          <Button className="w-full" onClick={() => { const params = new URLSearchParams({ mode, purpose, companions: String(companions) }); if (start) { params.set('slat', String(start.lat)); params.set('slng', String(start.lng)); } if (dest) { params.set('dlat', String(dest.lat)); params.set('dlng', String(dest.lng)); params.set('dname', destText); } if (route) { params.set('est', String(estCost ?? '')); params.set('dist', String(route.distanceKm)); } if (userCost) params.set('cost', userCost); navigate(`/trip/active?${params.toString()}`); }}>Start</Button>
        </Card>

        <Card className="p-4 text-xs text-muted-foreground">
          Location access is required. You can change permissions anytime in settings.
        </Card>
      </section>
    </Layout>
  );
}
