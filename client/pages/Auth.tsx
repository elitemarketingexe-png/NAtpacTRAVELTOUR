import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  return (
    <Layout>
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <h1 className="text-lg font-semibold text-center">Welcome to CityTrack</h1>
        <Card className="p-4">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-3">
              <Button variant="secondary" className="w-full">Continue with Google</Button>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2"><Checkbox /> Remember me</label>
                <button className="text-primary hover:underline">Forgot password?</button>
              </div>
              <Button className="w-full" disabled={loading} onClick={() => setLoading(true)}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Login
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-3">
              <Button variant="secondary" className="w-full">Continue with Google</Button>
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input placeholder="Your name" />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" />
              </div>
              <Button className="w-full">Create account</Button>
            </TabsContent>
          </Tabs>
        </Card>
      </section>
    </Layout>
  );
}
