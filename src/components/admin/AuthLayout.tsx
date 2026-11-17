import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

/** Centered card used by staff sign-in, MFA and invite screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 sm:py-10 overflow-x-hidden box-border">
      <div className="w-full max-w-sm mx-auto box-border min-w-0">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold truncate">Influencers.com</p>
            <p className="text-[11px] text-muted-foreground truncate">SaaS Manager · Staff only</p>
          </div>
        </div>
        <div className="panel p-4 sm:p-6 w-full box-border min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight break-words">{title}</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground break-words">{subtitle}</p>
          <div className="mt-5 w-full min-w-0 box-border">{children}</div>
        </div>
      </div>
    </div>
  );
}
