import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile() {
  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Your Profile</h1>
        <Card className="p-4 space-y-2">
          <div className="text-sm font-semibold">AI VLOGS</div>
          <div className="text-xs text-muted-foreground">admin</div>
          <div className="pt-2 flex gap-2">
            <Button size="sm" variant="secondary">Edit profile</Button>
            <Button size="sm">Upgrade</Button>
          </div>
        </Card>
        <Card className="p-4 text-sm text-muted-foreground">
          Favorites, history, saved alerts, and tickets will appear here.
        </Card>
      </section>
    </Layout>
  );
}
