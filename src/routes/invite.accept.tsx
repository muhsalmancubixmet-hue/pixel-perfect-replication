import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AuthLayout } from "@/components/admin/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/invite/accept")({
  validateSearch: (s) => z.object({ token: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Accept staff invite — SaaS Manager" },
      { name: "description", content: "Set your password to join the Influencers.com admin team." },
      { property: "og:title", content: "Accept staff invite — SaaS Manager" },
      { property: "og:description", content: "Set your password to join the Influencers.com admin team." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const tooShort = pw.length > 0 && pw.length < 10;
  const mismatch = pw2.length > 0 && pw !== pw2;

  if (!token) {
    return (
      <AuthLayout title="Invite link missing" subtitle="This link has no invite token. Ask a Super Admin to resend your invite.">
        <Button variant="outline" className="h-10 w-full" onClick={() => void navigate({ to: "/login" })}>
          Go to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Join the admin team" subtitle="You've been invited as Support staff. Choose a strong password to activate your account.">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void navigate({ to: "/mfa/verify" });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" className="h-10" value={pw} onChange={(e) => setPw(e.target.value)} />
          {tooShort && <p className="text-xs text-destructive">Use at least 10 characters.</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pw2">Confirm password</Label>
          <Input id="pw2" type="password" className="h-10" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          {mismatch && <p className="text-xs text-destructive">Passwords don't match.</p>}
        </div>
        <Button type="submit" className="h-10" disabled={pw.length < 10 || pw !== pw2}>
          Set password &amp; continue
        </Button>
      </form>
    </AuthLayout>
  );
}
