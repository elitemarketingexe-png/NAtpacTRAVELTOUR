import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";

export default function Trips() {
  const sample = [
    { id: 1, date: "2025-09-01", from: "Home", to: "NATPAC Office", mode: "Bus", duration: "32m" },
    { id: 2, date: "2025-08-31", from: "Market", to: "Home", mode: "Walk", duration: "12m" }
  ];
  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">My Trips</h1>
        {sample.map((t) => (
          <Card key={t.id} className="p-3 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">{t.from} → {t.to}</div>
              <div className="text-xs text-muted-foreground">{t.date} • {t.mode} • {t.duration}</div>
            </div>
            <a className="text-primary hover:underline" href="#">View</a>
          </Card>
        ))}
      </section>
    </Layout>
  );
}
