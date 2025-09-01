import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function Admin() {
  const [trips, setTrips] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/trips/json")
      .then((r) => r.json())
      .then(setTrips)
      .catch(() => setTrips([]));
  }, []);
  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-2 text-sm">
            <a
              className="rounded-md border px-3 py-1 hover:bg-accent hover:text-accent-foreground"
              href="/api/trips/csv"
            >
              Download CSV
            </a>
          </div>
        </div>
        <Card className="p-3 text-sm">Total trips: {trips.length}</Card>
        {trips.slice(0, 20).map((t) => (
          <Card key={t.tripId} className="p-3 text-sm">
            <div className="font-medium">
              {t.tripId} • {t.userId} • {t.mode} • {t.purpose}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(t.startedAt).toLocaleString()} →{" "}
              {new Date(t.endedAt).toLocaleString()} • {t.distanceKm ?? "-"} km
            </div>
            {!!t.destination?.name && (
              <div className="text-xs">Dest: {t.destination.name}</div>
            )}
          </Card>
        ))}
      </section>
    </Layout>
  );
}
