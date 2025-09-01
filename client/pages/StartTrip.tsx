import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bus, Car, Footprints, Train, Users, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
          <div className="flex items-center justify-between">
            <div className="text-sm">Companions</div>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 grid place-items-center rounded-md border" onClick={() => setCompanions((v) => Math.max(0, v - 1))}><Minus size={16}/></button>
              <Badge variant="secondary">{companions}</Badge>
              <button className="h-8 w-8 grid place-items-center rounded-md border" onClick={() => setCompanions((v) => v + 1)}><Plus size={16}/></button>
            </div>
          </div>
          <Button className="w-full" onClick={() => navigate(`/trip/active?mode=${mode}&purpose=${encodeURIComponent(purpose)}&companions=${companions}`)}>Start</Button>
        </Card>

        <Card className="p-4 text-xs text-muted-foreground">
          Location access is required. You can change permissions anytime in settings.
        </Card>
      </section>
    </Layout>
  );
}
