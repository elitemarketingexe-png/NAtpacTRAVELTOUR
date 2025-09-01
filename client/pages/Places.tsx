import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  distanceKm,
  listPlaces,
  savePlace,
  deletePlace,
  upsertHome,
  upsertWork,
  type Place,
} from "@/lib/storage";
import { fetchRoute } from "@/lib/route";

export default function Places() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>(listPlaces());
  const [selected, setSelected] = useState<Place | null>(null);
  const [route, setRoute] = useState<{
    coords: [number, number][];
    distanceKm: number;
    durationMin: number;
  } | null>(null);
  const [newName, setNewName] = useState("");
  const mapRef = useRef<any>(null);

  // Watch current position and smoothly follow
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((p) =>
      setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
    );
    const watch = navigator.geolocation?.watchPosition(
      (p) => {
        const s = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(s);
        if (mapRef.current)
          mapRef.current.flyTo(
            [s.lat, s.lng],
            Math.max(15, mapRef.current.getZoom?.() || 15),
            { duration: 0.5 },
          );
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    );
    return () => {
      if (watch && typeof watch === "number")
        navigator.geolocation.clearWatch(watch);
    };
  }, []);

  // Recompute route when pos or selected change
  useEffect(() => {
    (async () => {
      if (!pos || !selected) {
        setRoute(null);
        return;
      }
      const r = await fetchRoute(pos, selected.position);
      setRoute(r as any);
    })();
  }, [pos?.lat, pos?.lng, selected?.id]);

  const center = pos ?? { lat: 23.2645, lng: 77.4205 };

  const sortedPlaces = useMemo(() => {
    if (!pos) return places;
    return [...places].sort(
      (a, b) => distanceKm(pos, a.position) - distanceKm(pos, b.position),
    );
  }, [places, pos]);

  function refresh() {
    setPlaces(listPlaces());
  }

  const addCustomPlace = () => {
    if (!pos) return;
    const name = newName.trim();
    if (!name) return;
    savePlace({ name, type: "other", position: pos });
    setNewName("");
    refresh();
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Places I Visit</h1>

        <Card className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          <div className="col-span-1 sm:col-span-2 order-2 sm:order-1">
            <div className="h-[55vh] w-full overflow-hidden rounded-lg">
              <MapContainer
                center={center as any}
                zoom={15}
                className="h-full w-full"
                whenCreated={(m) => (mapRef.current = m)}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pos && (
                  <Marker
                    position={pos as any}
                    icon={L.divIcon({ className: "pulse-marker" })}
                  />
                )}
                {selected && (
                  <Marker
                    position={
                      [selected.position.lat, selected.position.lng] as any
                    }
                    icon={L.divIcon({ className: "pin-dest" })}
                  />
                )}
                {route?.coords && (
                  <Polyline
                    positions={route.coords as any}
                    pathOptions={{ color: "#10b981", weight: 5, opacity: 0.9 }}
                  />
                )}
              </MapContainer>
            </div>
            {selected && route && (
              <div className="mt-2 text-xs text-muted-foreground">
                Navigating to {selected.name} • {route.distanceKm.toFixed(1)} km
                • {Math.round(route.durationMin)} min
              </div>
            )}
          </div>

          <div className="space-y-2 order-1 sm:order-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!pos) return;
                  upsertHome(pos);
                  refresh();
                }}
              >
                Add Home
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!pos) return;
                  upsertWork(pos);
                  refresh();
                }}
              >
                Add Work
              </Button>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  placeholder="New place name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9"
                />
                <Button onClick={addCustomPlace}>Add</Button>
              </div>
            </div>

            <Card className="p-2 max-h-[55vh] overflow-auto">
              <div className="text-xs text-muted-foreground mb-2">
                Saved places
              </div>
              <div className="space-y-1">
                {sortedPlaces.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border px-2 py-1.5 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {p.name}{" "}
                        {p.type !== "other" && (
                          <span className="text-[10px] text-muted-foreground uppercase">
                            ({p.type})
                          </span>
                        )}
                      </div>
                      {pos && (
                        <div className="text-xs text-muted-foreground">
                          {distanceKm(pos, p.position).toFixed(2)} km away
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={
                          selected?.id === p.id ? "default" : "secondary"
                        }
                        onClick={() => setSelected(p)}
                      >
                        {selected?.id === p.id ? "Navigating" : "Navigate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deletePlace(p.id);
                          refresh();
                          if (selected?.id === p.id) setSelected(null);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {!sortedPlaces.length && (
                  <div className="rounded-md border px-2 py-1.5 text-xs text-muted-foreground">
                    No places saved yet. Use Add above to save your current
                    spot.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Card>
      </section>
    </Layout>
  );
}
