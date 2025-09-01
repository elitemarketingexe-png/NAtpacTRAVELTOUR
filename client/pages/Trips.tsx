import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { listTrips, tripsToCSV } from "@/lib/storage";

function fmt(n: number) { const d = new Date(n); return d.toLocaleString(); }

export default function Trips() {
  const trips = listTrips();
  const exportCSV = () => {
    const csv = tripsToCSV(trips);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'natpac-trips.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">My Trips</h1>
          <div className="flex items-center gap-2 text-sm">
            <button className="rounded-md border px-3 py-1 hover:bg-accent hover:text-accent-foreground" onClick={exportCSV}>Export CSV</button>
            <a className="rounded-md border px-3 py-1 hover:bg-accent hover:text-accent-foreground" href="/api/trips/csv">Admin CSV</a>
          </div>
        </div>
        {trips.length === 0 && <Card className="p-4 text-sm text-muted-foreground">No trips yet. Start one from Home.</Card>}
        {trips.map((t) => (
          <Card key={t.tripId} className="p-3 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">{t.purpose || "Trip"} • {t.mode}</div>
              <div className="text-xs text-muted-foreground">{fmt(t.startedAt)} → {fmt(t.endedAt)} • {t.path.length} pts</div>
              {!!t.destination?.name && <div className="text-xs">Dest: {t.destination.name}</div>}
              {t.distanceKm && <div className="text-xs">Distance ~ {t.distanceKm.toFixed(1)} km • Est ₹{t.costEstimate ?? '-'} • Cost ₹{t.costActual ?? '-'}</div>}
              {t.pois && <div className="text-xs text-muted-foreground">Nearby: {t.pois.busStops.slice(0,2).join(", ")} {t.pois.metro.slice(0,1).join(", ")} {t.pois.attractions.slice(0,2).join(", ")}</div>}
            </div>
            <div className="text-xs text-muted-foreground">{t.tripId}</div>
          </Card>
        ))}
      </section>
    </Layout>
  );
}
