import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { TripRecord } from "@/lib/storage";
import { cn } from "@/lib/utils";

function ModeBadge({ mode }: { mode: string }) {
  const color =
    mode === "walk" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" :
    mode === "car" ? "bg-red-500/15 text-red-600 dark:text-red-300" :
    mode === "bus" ? "bg-sky-500/15 text-sky-600 dark:text-sky-300" :
    mode === "train" ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300" :
    "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", color)}>{mode}</span>;
}

function fmt(n: number) { const d = new Date(n); return d.toLocaleString(); }

export function TripCard({ trip, index }: { trip: TripRecord; index: number }) {
  const distance = trip.distanceKm ? `${trip.distanceKm.toFixed(1)} km` : null;
  const durationMin = Math.max(1, Math.round((trip.endedAt - trip.startedAt) / 60000));
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/trip/${trip.tripId}`} className="block">
        <Card className="relative overflow-hidden p-3 text-sm group">
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background:
            "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(56,189,248,0.08), transparent 40%)" }} />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold truncate">{trip.purpose || "Trip"}</div>
                <ModeBadge mode={trip.mode} />
              </div>
              <div className="text-xs text-muted-foreground truncate">{fmt(trip.startedAt)} → {fmt(trip.endedAt)} • {trip.path.length} pts • {durationMin} min{distance ? ` • ${distance}` : ""}</div>
              {!!trip.destination?.name && <div className="text-xs truncate">Dest: {trip.destination.name}</div>}
              {trip.pois && (
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  {trip.pois.busStops.slice(0,2).map((n, i) => (<span key={`b-${i}`} className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300">{n}</span>))}
                  {trip.pois.metro.slice(0,1).map((n, i) => (<span key={`m-${i}`} className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300">{n}</span>))}
                  {trip.pois.attractions.slice(0,2).map((n, i) => (<span key={`a-${i}`} className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300">{n}</span>))}
                </div>
              )}
            </div>
            <div className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{trip.tripId}</div>
          </div>
        </Card>
      </Link>
    </motion.article>
  );
}

export function attachMouseXYGlow(el: HTMLElement | null) {
  if (!el) return;
  el.addEventListener("pointermove", (e) => {
    const rect = el.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${mx}%`);
    el.style.setProperty("--my", `${my}%`);
  });
}
