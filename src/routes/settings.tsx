import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  KeyRound,
  Link2,
  Mail,
  Palette,
  Settings2,
  Share2,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

import { CURRENCIES } from "@/data/geo";
import { PageHeader } from "@/components/admin/PageHeader";
import { saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — Influencers.com SaaS Manager" },
      {
        name: "description",
        content:
          "Configure branding, email, marketplace, websites, domains and security for the platform.",
      },
      { property: "og:title", content: "Platform Settings — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Configure branding, email, marketplace, websites, domains and security.",
      },
    ],
  }),
  component: SettingsPage,
});

type Field =
  | { kind: "text"; label: string; value: string }
  | { kind: "textarea"; label: string; value: string }
  | { kind: "select"; label: string; value: string; options: string[] }
  | { kind: "toggle"; label: string; hint: string; value: boolean };

const SECTIONS: { id: string; label: string; icon: typeof Settings2; fields: Field[] }[] = [
  {
    id: "general",
    label: "General",
    icon: Settings2,
    fields: [
      { kind: "text", label: "Platform name", value: "Influencers.com" },
      { kind: "text", label: "Support email", value: "support@influencers.com" },
      {
        kind: "select",
        label: "Default timezone",
        value: "Asia/Kolkata",
        options: ["Asia/Kolkata", "UTC", "Asia/Dubai"],
      },
      {
        kind: "select",
        label: "Default currency",
        value: "INR (base currency)",
        options: ["INR (base currency)", "USD ($)", "AED (د.إ)"],
      },
      {
        kind: "toggle",
        label: "Maintenance mode",
        hint: "Show a maintenance page on public sites",
        value: false,
      },
    ],
  },
  {
    id: "branding",
    label: "Branding",
    icon: Palette,
    fields: [
      { kind: "text", label: "Logo URL", value: "https://cdn.influencers.com/logo.svg" },
      { kind: "text", label: "Primary accent", value: "#1f9e96" },
      {
        kind: "textarea",
        label: "Meta description",
        value:
          "Discover influencers anywhere in the world. Find the right creators for your brand.",
      },
      {
        kind: "toggle",
        label: "Show platform badge on creator websites",
        hint: "'Powered by Influencers.com' footer",
        value: true,
      },
    ],
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    fields: [
      { kind: "text", label: "From name", value: "Influencers.com" },
      { kind: "text", label: "From address", value: "no-reply@influencers.com" },
      {
        kind: "select",
        label: "Provider",
        value: "Amazon SES",
        options: ["Amazon SES", "SendGrid", "Postmark"],
      },
      {
        kind: "toggle",
        label: "Send weekly digest",
        hint: "Creator and business summary every Monday",
        value: true,
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    fields: [
      {
        kind: "toggle",
        label: "In-app notifications",
        hint: "Bell menu inside creator and business apps",
        value: true,
      },
      {
        kind: "toggle",
        label: "Email notifications",
        hint: "Mirror important alerts by email",
        value: true,
      },
      {
        kind: "toggle",
        label: "Push notifications",
        hint: "Mobile push for campaign invites",
        value: false,
      },
      {
        kind: "select",
        label: "Quiet hours",
        value: "22:00 – 07:00 IST",
        options: ["Off", "22:00 – 07:00 IST", "23:00 – 06:00 IST"],
      },
    ],
  },
  {
    id: "authentication",
    label: "Authentication",
    icon: KeyRound,
    fields: [
      {
        kind: "toggle",
        label: "Email + password sign-in",
        hint: "Standard credentials login",
        value: true,
      },
      { kind: "toggle", label: "Google sign-in", hint: "OAuth with a Google account", value: true },
      {
        kind: "toggle",
        label: "Phone OTP",
        hint: "SMS one-time password for creators",
        value: true,
      },
      {
        kind: "select",
        label: "Session length",
        value: "30 days",
        options: ["7 days", "30 days", "90 days"],
      },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Store,
    fields: [
      {
        kind: "toggle",
        label: "Public requirement board",
        hint: "Anyone can browse open business requirements",
        value: true,
      },
      {
        kind: "select",
        label: "Applications per creator per day",
        value: "15",
        options: ["5", "10", "15", "Unlimited"],
      },
      {
        kind: "toggle",
        label: "Auto-close requirements after deadline",
        hint: "Stop new applications past the deadline",
        value: true,
      },
      { kind: "text", label: "Platform commission (%)", value: "8" },
    ],
  },
  {
    id: "influencer",
    label: "Influencer settings",
    icon: Users,
    fields: [
      {
        kind: "toggle",
        label: "Require verification before applying",
        hint: "Only verified creators can apply to campaigns",
        value: true,
      },
      { kind: "text", label: "Minimum followers to join", value: "1000" },
      {
        kind: "select",
        label: "Portfolio items on Free plan",
        value: "3",
        options: ["1", "3", "5"],
      },
      {
        kind: "toggle",
        label: "Allow creators to set their own service prices",
        hint: "Otherwise prices come from the rate card",
        value: true,
      },
    ],
  },
  {
    id: "business",
    label: "Business settings",
    icon: Building2,
    fields: [
      {
        kind: "toggle",
        label: "Require tax ID (GST, VAT, EIN…)",
        hint: "Collected per country tax rules",
        value: true,
      },
      {
        kind: "select",
        label: "Active campaigns on Free plan",
        value: "1",
        options: ["1", "3", "5"],
      },
      { kind: "select", label: "Shortlist size limit", value: "25", options: ["10", "25", "50"] },
      {
        kind: "toggle",
        label: "Manual approval for new businesses",
        hint: "Review each signup before it goes live",
        value: false,
      },
    ],
  },
  {
    id: "website",
    label: "Website settings",
    icon: Globe,
    fields: [
      {
        kind: "select",
        label: "Default template",
        value: "Aurora",
        options: ["Aurora", "Coastal", "Monsoon", "Studio", "Minimal"],
      },
      { kind: "text", label: "Subdomain suffix", value: ".influencers.site" },
      {
        kind: "toggle",
        label: "Allow custom CSS",
        hint: "Pro and Premium creators only",
        value: false,
      },
      {
        kind: "toggle",
        label: "Index creator websites on search engines",
        hint: "Adds sitemap and robots rules",
        value: true,
      },
    ],
  },
  {
    id: "domain",
    label: "Domain settings",
    icon: Link2,
    fields: [
      { kind: "text", label: "Root A record IP", value: "76.76.21.21" },
      { kind: "text", label: "CNAME target", value: "sites.influencers.com" },
      {
        kind: "toggle",
        label: "Auto-issue SSL certificates",
        hint: "Provision a certificate once DNS verifies",
        value: true,
      },
      {
        kind: "select",
        label: "Verification retry window",
        value: "72 hours",
        options: ["24 hours", "48 hours", "72 hours"],
      },
    ],
  },
  {
    id: "social",
    label: "Social platforms",
    icon: Share2,
    fields: [
      {
        kind: "toggle",
        label: "Allow creators to request new platforms",
        hint: "Requests land in the Social Platform Requests queue",
        value: true,
      },
      {
        kind: "select",
        label: "Follower refresh frequency",
        value: "Every 24 hours",
        options: ["Every 6 hours", "Every 24 hours", "Weekly"],
      },
      {
        kind: "select",
        label: "Max connected accounts per creator",
        value: "6",
        options: ["3", "6", "10"],
      },
      {
        kind: "toggle",
        label: "Require OAuth for verification",
        hint: "Manual URL submissions need admin review",
        value: true,
      },
    ],
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: CreditCard,
    fields: [
      {
        kind: "select",
        label: "Billing cycle",
        value: "Monthly",
        options: ["Monthly", "Quarterly", "Annual"],
      },
      { kind: "text", label: "Free trial length (days)", value: "14" },
      {
        kind: "toggle",
        label: "Prorate plan upgrades",
        hint: "Charge only the difference mid-cycle",
        value: true,
      },
      {
        kind: "select",
        label: "Grace period on failed payment",
        value: "7 days",
        options: ["3 days", "7 days", "14 days"],
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    fields: [
      {
        kind: "toggle",
        label: "Two-factor for admin accounts",
        hint: "Required for Super Admin and Finance",
        value: true,
      },
      {
        kind: "toggle",
        label: "IP allowlist for admin panel",
        hint: "Restrict access to office networks",
        value: false,
      },
      {
        kind: "select",
        label: "Audit log retention",
        value: "24 months",
        options: ["6 months", "12 months", "24 months"],
      },
      { kind: "text", label: "Admin session timeout (minutes)", value: "45" },
    ],
  },
];

function FieldRow({ field }: { field: Field }) {
  if (field.kind === "toggle") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">{field.label}</p>
          <p className="text-xs text-muted-foreground">{field.hint}</p>
        </div>
        <Switch defaultChecked={field.value} />
      </div>
    );
  }
  return (
    <div className="grid gap-1.5">
      <Label>{field.label}</Label>
      {field.kind === "text" && <Input defaultValue={field.value} />}
      {field.kind === "textarea" && <Textarea rows={3} defaultValue={field.value} />}
      {field.kind === "select" && (
        <Select defaultValue={field.value}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function SettingsPage() {
  const [active, setActive] = useState(SECTIONS[0]!.id);
  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0]!;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Platform settings"
        description="Configuration for every surface of the Influencers.com ecosystem."
      />

      <div className="grid gap-3 lg:grid-cols-[236px_1fr]">
        <nav className="panel flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                s.id === active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <s.icon className="size-4 shrink-0" />
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="panel p-4">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <section.icon className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">{section.label}</h3>
          </div>
          <div className="flex max-w-xl flex-col gap-3">
            {section.fields.map((f) => (
              <FieldRow key={f.label} field={f} />
            ))}
          </div>
          <div className="mt-5 flex gap-2 border-t border-border pt-4">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await adminApi.updateSetting(section.id, { is_active: true });
                } catch {}
                saved("Settings saved", section.label);
              }}
            >
              Save changes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => saved("Changes discarded", section.label)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
