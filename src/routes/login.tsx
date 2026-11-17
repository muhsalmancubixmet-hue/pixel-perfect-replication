import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff } from "lucide-react";

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
      {
        property: "og:description",
        content: "Secure sign-in for Influencers.com administration staff.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await authService.Login({ email, password });

      window.location.href = "/";
    } catch (error: any) {
      console.error("login failed:", error);
      setErrorMessage(
        error.response?.data?.detail ||
          error.message ||
          "Invalid email or password. Please check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to the admin console"
      subtitle="Use your corporate @influencers.com account."
    >
      {errorMessage && (
        <div className="mb-4 text-xs text-destructive bg-destructive/10 p-2.5 rounded-md">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="grid w-full min-w-0 box-border gap-1.5">
          <Label htmlFor="email">Corporate email</Label>
          <Input
            id="email"
            type="email"
            className="h-10 w-full min-w-0 box-border"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@influencers.com"
          />
        </div>
        <div className="grid w-full min-w-0 box-border gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="h-10 w-full min-w-0 box-border pr-10"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 w-full min-w-0 box-border font-bold"
        >
          {loading ? "Signing in..." : "Continue"}
        </Button>
      </form>

      <div className="mt-5 flex w-full min-w-0 box-border gap-2 rounded-lg border border-info/25 bg-info/10 p-3 text-xs text-info whitespace-normal break-words">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        <p className="min-w-0 flex-1 whitespace-normal break-words">
          Restricted system. All sign-ins require two-factor authentication and are recorded in the
          audit log. Got an invite?{" "}
          <Link to="/invite/accept" search={{ token: "demo" }} className="font-semibold underline">
            Accept it here
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}
