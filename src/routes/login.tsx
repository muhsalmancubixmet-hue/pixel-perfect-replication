import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Zap } from "lucide-react";

import { AuthLayout } from "@/components/admin/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_SESSION, setSession } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Staff sign in — Influencers.com SaaS Manager" },
      { name: "description", content: "Secure sign-in for Influencers.com administration staff." },
      { property: "og:title", content: "Staff sign in — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Secure sign-in for Influencers.com administration staff." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const demo = () => {
    setSession(DEMO_SESSION);
    void navigate({ to: "/" });
  };

  return (
    <AuthLayout title="Sign in to the admin console" subtitle="Use your corporate @influencers.com account.">
      <Button onClick={demo} className="h-auto min-h-12 w-full whitespace-normal py-3 text-sm font-bold shadow-md">
        <Zap className="size-4 shrink-0" /> One-Click Demo Access (Enter as Super Admin - Mohammed Fadhil)
      </Button>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or sign in with email <span className="h-px flex-1 bg-border" />
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void navigate({ to: "/mfa/verify" });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="email">Corporate email</Label>
          <Input id="email" type="email" className="h-10" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@influencers.com" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" className="h-10" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="outline" className="h-10">
          Continue
        </Button>
      </form>

      <div className="mt-5 flex gap-2 rounded-lg border border-info/25 bg-info/10 p-3 text-xs text-info">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Restricted system. All sign-ins require two-factor authentication and are recorded in the audit log. Got an invite?{" "}
          <Link to="/invite/accept" search={{ token: "demo" }} className="font-semibold underline">
            Accept it here
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}
