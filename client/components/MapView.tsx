import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { routes, allStops, type Stop } from "@/lib/sampleData";
import {
  initBusesForRoutes,
  positionAlongPolyline,
  tickBus,
  etaToStop,
  type BusLive,
} from "@/lib/busSim";

const cityCenter = { lat: 23.2645, lng: 77.4205 };

function FitToContent() {
  const map = useMap();
  useEffect(() => {
    map.setView(cityCenter, 14);
  }, [map]);
  return null;
}

type Props = {
  focusedStop?: Stop | null;
};

function useSimulatedBuses() {
  const [buses, setBuses] = useState<BusLive[]>(() =>
    initBusesForRoutes(routes),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setBuses((prev) =>
        prev.map((b) => {
          const next = tickBus({ ...b }, 1000);
          const route = routes.find((r) => r.id === b.routeId)!;
          next.position = positionAlongPolyline(route.polyline, next.progress);
          // random crowd fluctuations
          if (Math.random() < 0.1) {
            next.crowdLevel = Math.min(
              3,
              Math.max(
                0,
                (next.crowdLevel + (Math.random() > 0.5 ? 1 : -1)) as any,
              ),
            );
          }
          return next;
        }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return buses;
}

function crowdColor(level: 0 | 1 | 2 | 3): string {
  switch (level) {
    case 0:
      return "#22c55e"; // green
    case 1:
      return "#84cc16";
    case 2:
      return "#f59e0b";
    case 3:
      return "#ef4444";
  }
}

export default memo(function MapView({ focusedStop }: Props) {
  const buses = useSimulatedBuses();
  const [selectedBus, setSelectedBus] = useState<BusLive | null>(null);

  const stopEtas = useMemo(() => {
    if (!focusedStop) return null;
    return buses
      .map((b) => ({
        bus: b,
        eta: etaToStop(b, routes.find((r) => r.id === b.routeId)!, focusedStop),
      }))
      .sort((a, b) => a.eta - b.eta)
      .slice(0, 3);
  }, [buses, focusedStop]);

  return (
    <div className="relative h-[calc(100dvh-9rem)] w-full rounded-xl overflow-hidden">
      <MapContainer center={cityCenter} zoom={14} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToContent />
        {routes.map((r) => (
          <Polyline
            key={r.id}
            positions={r.polyline as any}
            pathOptions={{ color: r.color, weight: 5, opacity: 0.7 }}
          />
        ))}
        {buses.map((b) => (
          <CircleMarker
            key={b.id}
            center={b.position as any}
            radius={8}
            pathOptions={{
              color: "#000",
              weight: 1,
              fillColor: crowdColor(b.crowdLevel),
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => setSelectedBus(b) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{b.id}</div>
                <div>Route: {b.routeId}</div>
                <div>
                  Crowd: {["Low", "Moderate", "Busy", "Packed"][b.crowdLevel]}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {allStops.map((s) => (
          <CircleMarker
            key={s.id}
            center={s.position as any}
            radius={5}
            pathOptions={{
              color: "#2563eb",
              weight: 1,
              fillColor: "#fff",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{s.name}</div>
                <div className="text-muted-foreground">Stop ID: {s.id}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {focusedStop && stopEtas && (
        <div className="pointer-events-auto absolute left-2 right-2 bottom-2 md:left-4 md:right-auto md:bottom-4 md:w-80">
          <div className="rounded-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg border">
            <div className="p-3">
              <div className="text-sm font-semibold">
                Arrivals at {focusedStop.name}
              </div>
              <div className="mt-2 space-y-2">
                {stopEtas.map(({ bus, eta }) => (
                  <div
                    key={bus.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: crowdColor(bus.crowdLevel) }}
                      />
                      <div className="text-sm">
                        <div className="font-medium">{bus.routeId}</div>
                        <div className="text-xs text-muted-foreground">
                          {bus.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {Math.round(eta / 60)} min
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(eta % 60).toString().padStart(2, "0")}s
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
