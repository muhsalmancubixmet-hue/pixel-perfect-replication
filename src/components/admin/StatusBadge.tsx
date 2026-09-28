import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/18 text-warning-foreground border-warning/35",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  info: "bg-info/10 text-info border-info/25",
  neutral: "bg-muted text-muted-foreground border-border",
  accent: "bg-accent text-accent-foreground border-primary/20",
};

const MAP: Record<string, keyof typeof TONES> = {
  active: "success",
  published: "success",
  verified: "success",
  approved: "success",
  paid: "success",
  resolved: "success",
  completed: "success",
  "domain connected": "success",
  featured: "accent",
  pending: "warning",
  "domain pending": "warning",
  waiting: "warning",
  applications: "warning",
  "info requested": "warning",
  scheduled: "warning",
  open: "info",
  "in progress": "info",
  shortlisted: "info",
  "content submitted": "info",
  sent: "info",
  suspended: "danger",
  failed: "danger",
  rejected: "danger",
  cancelled: "danger",
  urgent: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
  draft: "neutral",
  inactive: "neutral",
  unverified: "neutral",
  hidden: "neutral",
  closed: "neutral",
  refunded: "neutral",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = MAP[value.toLowerCase()] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize leading-5",
        TONES[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {value}
    </span>
  );
}
