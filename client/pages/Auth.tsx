import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { loginWithCredentials, getRole } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    setLoading(true);
    setError("");
    const role = loginWithCredentials(username.trim(), password.trim());
    setLoading(false);
    if (!role) {
      setError("Invalid credentials. Try user/123, admin/123, gov/123.");
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <Layout>
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <h1 className="text-lg font-semibold text-center">Sign in to NATPAC</h1>
        <Card className="p-4">
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Username</Label>
              <Input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="user | admin | gov" />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="123" />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button className="w-full" disabled={loading} onClick={submit}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Sign in
            </Button>
            <div className="text-xs text-muted-foreground">
              Roles: user (app only), admin (all data), gov (NATPAC access).
            </div>
          </div>
        </Card>
      </section>
    </Layout>
  );
}
