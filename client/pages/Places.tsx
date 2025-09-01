import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Places() {
  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Places I Visit</h1>
        <Card className="p-4 text-sm text-muted-foreground">Add Home, Work, and frequent places to speed up trip logging.</Card>
        <div className="flex gap-2">
          <Button variant="secondary">Add Home</Button>
          <Button variant="secondary">Add Work</Button>
          <Button>Add New Place</Button>
        </div>
      </section>
    </Layout>
  );
}
