import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";

import { AuthLayout } from "@/components/admin/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/invite/accept")({
  validateSearch: (s) =>
    z
      .object({
        token: z.string().optional(),
        action: z.string().optional(),
      })
      .parse(s),
  head: () => ({
    meta: [
      { title: "Accept staff invite — SaaS Manager" },
      { name: "description", content: "Set your password to join the Influencers.com admin team." },
      { property: "og:title", content: "Accept staff invite — SaaS Manager" },
      {
        property: "og:description",
        content: "Set your password to join the Influencers.com admin team.",
      },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token, action } = Route.useSearch();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [revoked, setRevoked] = useState(false);

  const tooShort = pw.length > 0 && pw.length < 8;
  const mismatch = pw2.length > 0 && pw !== pw2;

  if (!token) {
    return (
      <AuthLayout
        title="Invite link missing"
        subtitle="This link has no invite token. Ask a Super Admin to resend your invite."
      >
        <Button
          variant="outline"
          className="h-10 w-full"
          onClick={() => void navigate({ to: "/login" })}
        >
          Go to sign in
        </Button>
      </AuthLayout>
    );
  }

  const handleRevoke = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await adminApi.revokeStaffInvite(token);
      setRevoked(true);
      toast.info("Invitation revoked successfully.");
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to revoke invitation";
      setErrorMsg(detail);
      toast.error("Revocation failed", { description: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (action === "revoke") {
    return (
      <AuthLayout
        title={revoked ? "Invitation Revoked" : "Revoke Invitation"}
        subtitle={
          revoked
            ? "This administrative invitation has been cancelled. No account will be created."
            : "Are you sure you want to decline and revoke this administrative team invitation?"
        }
      >
        {errorMsg && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {errorMsg}
          </div>
        )}
        {revoked ? (
          <Button
            variant="outline"
            className="h-10 w-full"
            onClick={() => void navigate({ to: "/login" })}
          >
            Return to Login
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              variant="destructive"
              className="h-10 w-full"
              disabled={isSubmitting}
              onClick={() => void handleRevoke()}
            >
              {isSubmitting ? "Revoking..." : "Confirm Revoke Invitation"}
            </Button>
            <Button
              variant="ghost"
              className="h-9 w-full text-xs text-muted-foreground"
              disabled={isSubmitting}
              onClick={() => void navigate({ to: "/login" })}
            >
              Cancel
            </Button>
          </div>
        )}
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8 || pw !== pw2) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const res = await adminApi.acceptStaffInvite({
        token,
        password: pw,
      });

      if (res.tokens?.access) {
        localStorage.setItem("access_token", res.tokens.access);
        localStorage.setItem("refresh_token", res.tokens.refresh);
        const session = {
          name: `${res.user.first_name || ""} ${res.user.last_name || ""}`.trim() || res.user.email,
          email: res.user.email,
          role: res.user.role_name || "Admin",
          mfa: true,
        };
        localStorage.setItem("ic_admin_session", JSON.stringify(session));
      }

      toast.success("Welcome to the Admin Team! Your account is active.");
      void navigate({ to: "/" });
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to accept invite";
      setErrorMsg(detail);
      toast.error("Invitation redemption failed", { description: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Join the admin team"
      subtitle="You've been invited as an administrative staff member. Choose a secure password to activate your account."
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {errorMsg}
          </div>
        )}
        <div className="grid gap-1.5">
          <Label htmlFor="pw">New password</Label>
          <Input
            id="pw"
            type="password"
            className="h-10"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={isSubmitting}
            placeholder="At least 8 characters"
          />
          {tooShort && <p className="text-xs text-destructive">Use at least 8 characters.</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pw2">Confirm password</Label>
          <Input
            id="pw2"
            type="password"
            className="h-10"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            disabled={isSubmitting}
            placeholder="Re-enter password"
          />
          {mismatch && <p className="text-xs text-destructive">Passwords don't match.</p>}
        </div>
        <Button
          type="submit"
          className="h-10"
          disabled={isSubmitting || pw.length < 8 || pw !== pw2}
        >
          {isSubmitting ? "Activating account..." : "Set password & continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}
