import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { allStops, type Stop } from "@/lib/sampleData";
import { Button } from "@/components/ui/button";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3,
    toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function AR() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number>(0);

  useEffect(() => {
    const watch = navigator.geolocation?.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true },
    );
    const onOrient = (e: any) => {
      const h = (e.alpha ?? 0) as number;
      setHeading(h);
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      if (watch && typeof watch === "number")
        navigator.geolocation.clearWatch(watch);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  const nearest = useMemo(() => {
    if (!pos) return null as { stop: Stop; dist: number } | null;
    const best = allStops
      .map((s) => ({
        stop: s,
        dist: haversine(pos.lat, pos.lng, s.position.lat, s.position.lng),
      }))
      .sort((a, b) => a.dist - b.dist)[0];
    return best;
  }, [pos]);

  return (
    <Layout>
      <section className="mx-auto w-full max-w-md px-4 py-6 space-y-4 text-center">
        <h1 className="text-lg font-semibold">AR Bus Stop Finder</h1>
        <Card className="p-4 space-y-3">
          <div className="mx-auto h-48 w-48 rounded-full border-4 border-primary/30 grid place-items-center relative overflow-hidden">
            <div className="absolute inset-0 grid place-items-center">
              <div
                className="h-1/2 w-1 rounded-b-full bg-primary"
                style={{
                  transform: `rotate(${heading}deg)`,
                  transformOrigin: "bottom center",
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Point your phone towards the arrow
            </div>
          </div>
          {nearest ? (
            <div className="text-sm">
              Nearest stop:{" "}
              <span className="font-semibold">{nearest.stop.name}</span> •{" "}
              {(nearest.dist / 1000).toFixed(2)} km
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Enable location to find the nearest stop
            </div>
          )}
          <Button
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(
                () => {},
                () => {},
                { enableHighAccuracy: true },
              )
            }
          >
            Refresh location
          </Button>
        </Card>
      </section>
    </Layout>
  );
}
