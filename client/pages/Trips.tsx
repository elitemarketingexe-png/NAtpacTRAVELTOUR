import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listTrips, tripsToCSV, type TripRecord } from "@/lib/storage";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Download, Filter, Search, ArrowUpDown, MapPin, Route as RouteIcon } from "lucide-react";
import { TripCard } from "@/components/TripCard";

function statFmt(n: number) { return n.toLocaleString(); }

export default function Trips() {
  const allTrips = listTrips();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<string>("all");
  const [sort, setSort] = useState<"newest"|"oldest"|"distance">("newest");

  const trips = useMemo(() => {
    let arr = [...allTrips];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter(t => (t.purpose || "").toLowerCase().includes(s) || (t.destination?.name || "").toLowerCase().includes(s) || t.tripId.toLowerCase().includes(s));
    }
    if (mode !== "all") arr = arr.filter(t => t.mode === mode);
    if (sort === "newest") arr.sort((a,b) => b.startedAt - a.startedAt);
    if (sort === "oldest") arr.sort((a,b) => a.startedAt - b.startedAt);
    if (sort === "distance") arr.sort((a,b) => (b.distanceKm || 0) - (a.distanceKm || 0));
    return arr;
  }, [allTrips, q, mode, sort]);

  const totals = useMemo(() => {
    const totalTrips = allTrips.length;
    const totalKm = allTrips.reduce((s,t)=> s + (t.distanceKm || 0), 0);
    const totalMin = allTrips.reduce((s,t)=> s + Math.max(1, Math.round((t.endedAt - t.startedAt)/60000)), 0);
    return { totalTrips, totalKm, totalMin };
  }, [allTrips]);

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
      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4" data-loc="client/pages/Trips.tsx:21:7">
        <MotionConfig transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-lg font-semibold">My Trips</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search purpose, destination, or ID" className="pl-7 h-8 w-56" />
              </div>
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground"><Filter size={14}/> Filter</span>
                <select value={mode} onChange={e=>setMode(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
                  <option value="all">All modes</option>
                  <option value="walk">Walk</option>
                  <option value="car">Car</option>
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
                <select value={sort} onChange={e=>setSort(e.target.value as any)} className="h-8 rounded-md border bg-background px-2 text-xs">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
              <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1 hover:bg-accent hover:text-accent-foreground" onClick={exportCSV}>
                <Download size={14}/> Export CSV
              </button>
              <a className="inline-flex items-center gap-1 rounded-md border px-3 py-1 hover:bg-accent hover:text-accent-foreground" href="/api/trips/csv">
                <ArrowUpDown size={14}/> Admin CSV
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Card className="p-3 text-sm">
              <div className="text-xs text-muted-foreground">Total trips</div>
              <motion.div key={totals.totalTrips} initial={{ scale: .9, opacity: .6 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-semibold">
                {statFmt(totals.totalTrips)}
              </motion.div>
            </Card>
            <Card className="p-3 text-sm">
              <div className="text-xs text-muted-foreground">Total distance</div>
              <motion.div key={Math.round(totals.totalKm)} initial={{ scale: .9, opacity: .6 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-semibold">
                {statFmt(Math.round(totals.totalKm))} km
              </motion.div>
            </Card>
            <Card className="p-3 text-sm">
              <div className="text-xs text-muted-foreground">Total time</div>
              <motion.div key={Math.round(totals.totalMin)} initial={{ scale: .9, opacity: .6 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-semibold">
                {statFmt(Math.round(totals.totalMin))} min
              </motion.div>
            </Card>
          </motion.div>

          {trips.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 text-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">No trips yet</div>
                  <div className="text-xs text-muted-foreground">Start one from Home and it will appear here.</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin size={16}/> <a className="rounded-md border px-3 py-1 hover:bg-accent hover:text-accent-foreground" href="/">Start</a>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {trips.map((t, idx) => (
                  <TripCard key={t.tripId} trip={t as TripRecord} index={idx} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </MotionConfig>
      </section>
    </Layout>
  );
}
