import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

/** Centered card used by staff sign-in, MFA and invite screens. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">Influencers.com</p>
            <p className="text-[11px] text-muted-foreground">SaaS Manager · Staff only</p>
          </div>
        </div>
        <div className="panel p-6">
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
