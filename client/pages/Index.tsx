import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, MapPin, PlayCircle, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="relative mx-auto w-full max-w-6xl px-4 pt-4">
        <div className="rounded-2xl bg-primary text-primary-foreground p-4 pb-24">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Welcome back</div>
              <h1 className="text-2xl font-bold">NATPAC</h1>
            </div>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10">
              <Bell size={18} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20"><User size={16} /></div>
            <div className="flex-1 rounded-lg bg-primary-foreground/15 px-3 py-2 text-sm">Alex Chen</div>
          </div>
          <div className="mt-3">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/trip/start")}>
              <PlayCircle className="mr-2 h-4 w-4"/> Start New Trip
            </Button>
          </div>
        </div>

        <div className="-mt-16 space-y-4">
          <Card className="p-3">
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Today's Trips</div>
                <div className="text-lg font-semibold">1</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Weekly</div>
                <div className="text-lg font-semibold">7</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Data Complete</div>
                <div className="text-lg font-semibold text-green-500">92%</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">My Plans</div>
                <div className="text-xs text-muted-foreground">View and manage trips</div>
              </div>
              <Button size="sm" variant="secondary" asChild><Link to="/trips">Open</Link></Button>
            </Card>
            <Card className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Places I Visit</div>
                <div className="text-xs text-muted-foreground">Home, Work, etc.</div>
              </div>
              <Button size="sm" variant="secondary" asChild><Link to="/places">Open</Link></Button>
            </Card>
            <Card className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Data Sync</div>
                <div className="text-xs text-muted-foreground">Last synced 5 min ago</div>
              </div>
              <Button size="sm">Sync</Button>
            </Card>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold">My Travel Hub</h2>
            <Card className="p-3 text-sm">Social sharing & collaboration</Card>
            <Card className="p-3 text-sm">Recent: Office → Market • 12.4 km • Bus</Card>
          </div>
        </div>

        <div className="py-6" />
      </section>
    </Layout>
  );
}
