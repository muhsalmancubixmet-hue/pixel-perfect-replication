import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AuthLayout } from "@/components/admin/AuthLayout";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { getSession, setSession } from "@/lib/auth";

export const Route = createFileRoute("/mfa/verify")({
  head: () => ({
    meta: [
      { title: "Two-factor verification — SaaS Manager" },
      { name: "description", content: "Enter the 6-digit code from your authenticator app." },
      { property: "og:title", content: "Two-factor verification — SaaS Manager" },
      { property: "og:description", content: "Enter the 6-digit code from your authenticator app." },
    ],
  }),
  component: MfaPage,
});

function MfaPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(30);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s <= 1 ? 30 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <AuthLayout title="Two-factor verification" subtitle="Enter the 6-digit code from your authenticator app. Any code works in this demo.">
      <div className="flex flex-col items-center gap-4">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="size-11 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p className="num text-xs text-muted-foreground">New code in {left}s</p>
        <Button
          className="h-10 w-full"
          disabled={code.length < 6}
          onClick={() => {
            const currentSession = getSession();
            if (!currentSession) {
              void navigate({ to: "/login" });
              return;
            }
            currentSession.mfa = true;
            setSession(currentSession);
            void navigate({ to: "/" });
          }}
        >
          Verify &amp; continue
        </Button>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
