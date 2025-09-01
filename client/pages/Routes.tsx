import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { routes } from "@/lib/sampleData";

export default function Routes() {
  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Browse Routes</h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {routes.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="text-sm font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">
                {r.stops.length} stops • Base fare ₹{r.baseFare}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.stops.map((s) => (
                  <span
                    key={s.id}
                    className="rounded bg-secondary px-2 py-1 text-xs"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
