import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Notifications() {
  const [arrival, setArrival] = useState(true);
  const [disruptions, setDisruptions] = useState(true);
  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <Card className="divide-y">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-semibold">Arrival reminders</div>
              <div className="text-xs text-muted-foreground">Notify 3–5 minutes before your bus arrives</div>
            </div>
            <Switch checked={arrival} onCheckedChange={setArrival} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-semibold">Delays & disruptions</div>
              <div className="text-xs text-muted-foreground">Get alerts for unusual delays or route changes</div>
            </div>
            <Switch checked={disruptions} onCheckedChange={setDisruptions} />
          </div>
        </Card>
        <Card className="p-4 text-sm text-muted-foreground">Recent alerts will appear here.</Card>
      </section>
    </Layout>
  );
}
