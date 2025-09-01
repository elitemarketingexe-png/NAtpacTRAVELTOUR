import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import MapView from "@/components/MapView";
import { allStops, routes, type Stop } from "@/lib/sampleData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Heart, Leaf, LocateFixed, LogIn, Route, Telescope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export default function Index() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [focusedStop, setFocusedStop] = useState<Stop | null>(allStops[0]);
  const online = useOnlineStatus();
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    const s = source.trim().toLowerCase();
    const d = destination.trim().toLowerCase();
    const stopMatch = (q: string) =>
      allStops.filter((st) => st.name.toLowerCase().includes(q)).slice(0, 5);
    return {
      source: s.length ? stopMatch(s) : [],
      destination: d.length ? stopMatch(d) : []
    };
  }, [source, destination]);

  const planned = useMemo(() => {
    if (!source || !destination) return [] as { routeId: string; timeMin: number; fare: number; crowd: string }[];
    // naive: suggest any route that contains both stops in order
    const src = allStops.find((st) => st.name.toLowerCase() === source.toLowerCase());
    const dst = allStops.find((st) => st.name.toLowerCase() === destination.toLowerCase());
    if (!src || !dst) return [];
    const options = routes
      .map((r) => {
        const i = r.stops.findIndex((s) => s.id === src.id);
        const j = r.stops.findIndex((s) => s.id === dst.id);
        if (i === -1 || j === -1 || i === j) return null;
        const hops = Math.abs(j - i);
        const timeMin = 5 + hops * 4 + Math.round(Math.random() * 4);
        const fare = r.baseFare + (hops - 1) * 3;
        const crowd = ["Low", "Moderate", "Busy", "Packed"][Math.floor(Math.random() * 4)];
        return { routeId: r.id, timeMin, fare, crowd };
      })
      .filter(Boolean) as { routeId: string; timeMin: number; fare: number; crowd: string }[];
    return options.sort((a, b) => a.timeMin - b.timeMin);
  }, [source, destination]);

  const ecoStats = useMemo(() => {
    const trips = 12; // example recent trips
    const kmSaved = trips * 4.2;
    const co2Saved = kmSaved * 0.192; // kg CO2 per km for car approx
    return { trips, kmSaved: Math.round(kmSaved), co2Saved: Math.round(co2Saved) };
  }, []);

  return (
    <Layout>
      {!online && (
        <div className="bg-amber-50 text-amber-900 border-b border-amber-200 px-4 py-2 text-sm">
          Offline mode: showing cached routes and last known positions.
        </div>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">CityTrack</h1>
            <p className="text-sm text-muted-foreground">Real-time buses • Smart routes • Fewer surprises</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/auth"><LogIn className="mr-1 h-4 w-4" /> Login</Link>
            </Button>
            <Button size="sm" variant="default" onClick={() => navigate("/ar")}>AR Finder</Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="relative">
            <Input
              placeholder="From: Choose source stop"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              onFocus={() => suggestions.source.length && setFocusedStop(suggestions.source[0])}
            />
            {!!suggestions.source.length && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-background shadow">
                {suggestions.source.map((s) => (
                  <button
                    key={s.id}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setSource(s.name);
                      setFocusedStop(s);
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              placeholder="To: Choose destination stop"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => suggestions.destination.length && setFocusedStop(suggestions.destination[0])}
            />
            {!!suggestions.destination.length && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-background shadow">
                {suggestions.destination.map((s) => (
                  <button
                    key={s.id}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setDestination(s.name);
                      setFocusedStop(s);
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4">
        <MapView focusedStop={focusedStop} />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Suggested routes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/routes"><Route className="mr-1 h-4 w-4"/> Explore</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(planned.length ? planned : [
            { routeId: routes[0].id, timeMin: 18, fare: routes[0].baseFare + 6, crowd: "Moderate" },
            { routeId: routes[1].id, timeMin: 22, fare: routes[1].baseFare + 9, crowd: "Low" }
          ]).map((opt) => (
            <Card key={opt.routeId} className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{opt.routeId}</div>
                <Badge variant="secondary">{opt.crowd}</Badge>
              </div>
              <div className="mt-2 grid grid-cols-3 text-sm">
                <div><span className="text-muted-foreground">ETA</span><div className="font-semibold">{opt.timeMin} min</div></div>
                <div><span className="text-muted-foreground">Fare</span><div className="font-semibold">₹{opt.fare}</div></div>
                <div className="text-right"><Button size="sm">Reserve seat</Button></div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="p-3 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-emerald-500"/>
            <div>
              <div className="text-sm font-semibold">Eco impact</div>
              <div className="text-xs text-muted-foreground">{ecoStats.kmSaved} km saved • {ecoStats.co2Saved} kg CO₂</div>
            </div>
          </Card>
          <Card className="p-3 flex items-center gap-3">
            <Heart className="h-5 w-5 text-rose-500"/>
            <div>
              <div className="text-sm font-semibold">Favorites</div>
              <div className="text-xs text-muted-foreground">Save stops and routes for quick access</div>
            </div>
          </Card>
          <Card className="p-3 flex items-center gap-3">
            <Bell className="h-5 w-5 text-amber-500"/>
            <div>
              <div className="text-sm font-semibold">Smart alerts</div>
              <div className="text-xs text-muted-foreground">Get notified before your bus arrives</div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="assistant" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="assistant">Journey Assistant</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          <TabsContent value="assistant">
            <Card className="p-3 text-sm">
              Using your recent trips and live data, we recommend Blue Line at 5:52 PM. Less crowded than usual due to drizzle. Consider e-rickshaw for last 1.2 km.
            </Card>
          </TabsContent>
          <TabsContent value="community">
            <Card className="p-3 text-sm">
              Stadium stop crowded now due to match. Try University stop instead. Share tips and updates to earn points!
            </Card>
          </TabsContent>
        </Tabs>

        <div className="pb-6" />
      </section>
    </Layout>
  );
}
