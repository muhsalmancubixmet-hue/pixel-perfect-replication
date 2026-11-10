import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Zap } from "lucide-react";

import { AuthLayout } from "@/components/admin/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth-service";


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
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await authService.Login({ email, password });

      window.location.href = '/'
    } catch(error:any) {
      console.error('login failed:', error);
      setErrorMessage(
        error.response?.data?.detail || 'invalid email or password. please check credentials.'
      );
    }finally{
      setLoading(false);
    }
  };


  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage('');
  
  
  try {
    await authService.Login ({
      email: 'salman@gmail.com',
      password: 'salman'
    });

    navigate({ to: '/'});
    } catch (error: any) {
      setErrorMessage('Demo login failed. django!!')
    }finally{
      setLoading(false);
    }
  
  
  }


  /*const demo = () => {
    setSession(DEMO_SESSION);
    void navigate({ to: "/" });
  };*/

  return (
    <AuthLayout title="Sign in to the admin console" subtitle="Use your corporate @influencers.com account.">
      <Button
        onClick={handleDemoLogin} disabled={loading}
        className="h-auto min-h-12 w-full min-w-0 box-border whitespace-normal py-3 px-3 text-xs sm:text-sm font-bold shadow-md text-center leading-snug"
      >
        <Zap className="mr-1.5 inline size-4 shrink-0" /> One-Click Demo Access (Enter as Super Admin - Mohammed Fadhil)
      </Button>

      <div className="my-5 flex w-full min-w-0 box-border items-center gap-3 text-[11px] uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or sign in with email <span className="h-px flex-1 bg-border" />
      </div>
      {errorMessage && <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md">{errorMessage}</div>}
      <form onSubmit={handleLogin}>
        <div className="grid w-full min-w-0 box-border gap-1.5">
          <Label htmlFor="email">Corporate email</Label>
          <Input
            id="email"
            type="email"
            className="h-10 w-full min-w-0 box-border"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@influencers.com"
          />
        </div>
        <div className="grid w-full min-w-0 box-border gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className="h-10 w-full min-w-0 box-border"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" disabled={loading} className="h-10 w-full min-w-0 box-border">
          {loading ? "Signing in..." : "Continue"}
        </Button>
      </form>

      <div className="mt-5 flex w-full min-w-0 box-border gap-2 rounded-lg border border-info/25 bg-info/10 p-3 text-xs text-info whitespace-normal break-words">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        <p className="min-w-0 flex-1 whitespace-normal break-words">
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
