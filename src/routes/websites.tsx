import { createFileRoute } from "@tanstack/react-router";
import { Globe, MousePointerClick, Layers } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { compact, websites } from "@/data/mock";
import type { Website } from "@/data/types";

export const Route = createFileRoute("/websites")({
  head: () => ({
    meta: [
      { title: "Creator Websites — Influencers.com SaaS Manager" },
      { name: "description", content: "Every creator website built on Influencers.com, with templates, domains and traffic." },
      { property: "og:title", content: "Creator Websites — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Every creator website with templates, domains and traffic." },
    ],
  }),
  component: WebsitesPage,
});

const TEMPLATES = [...new Set(websites.map((w) => w.template))];
const STATUSES = ["draft", "published", "suspended", "domain pending", "domain connected"];

function WebsitesPage() {
  const published = websites.filter((w) => w.status === "published").length;
  const visitors = websites.reduce((a, w) => a + w.visitors, 0);

  const columns: Column<Website>[] = [
    {
      key: "creator",
      header: "Creator",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.creator}</p>
          <p className="num truncate text-xs text-muted-foreground">{r.creatorId}</p>
        </div>
      ),
    },
    { key: "url", header: "Website URL", cell: (r) => <span className="num text-xs text-primary">{r.url}</span> },
    { key: "template", header: "Template", cell: (r) => <span className="text-xs">{r.template}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { key: "domain", header: "Domain", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.domain}</span> },
    { key: "visitors", header: "Visitors", cell: (r) => <span className="num text-sm font-semibold">{compact(r.visitors)}</span> },
    { key: "created", header: "Created", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.created}</span> },
    { key: "updated", header: "Updated", cell: (r) => <span className="num text-xs text-muted-foreground">{r.updated}</span> },
  ];

  const filters: FilterDef<Website>[] = [
    { key: "status", label: "Status", options: STATUSES, match: (r, v) => r.status === v },
    { key: "template", label: "Template", options: TEMPLATES, match: (r, v) => r.template === v },
    {
      key: "domainType",
      label: "Domain type",
      options: ["custom", "subdomain"],
      match: (r, v) => (v === "subdomain" ? r.domain.endsWith("influencers.com") : !r.domain.endsWith("influencers.com")),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Websites" description="Creator websites hosted on the Influencers.com website builder." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total websites" value={String(websites.length)} icon={Globe} delta={9.8} />
        <StatCard label="Published" value={String(published)} icon={Layers} delta={6.3} />
        <StatCard label="Visitors (30d)" value={compact(visitors)} icon={MousePointerClick} delta={18.2} />
      </div>

      <DataTable
        rows={websites}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search creator or URL…"
        search={(r, t) => r.creator.toLowerCase().includes(t) || r.url.toLowerCase().includes(t)}
        mobileCard={(r) => (
          <>
            <p className="truncate text-sm font-semibold">{r.creator}</p>
            <p className="num truncate text-xs text-primary">{r.url}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge value={r.status} />
              <span className="text-xs text-muted-foreground">{r.template}</span>
              <span className="num ml-auto text-xs font-semibold">{compact(r.visitors)} visits</span>
            </div>
          </>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "Preview", onSelect: mockAction("Preview website", r.url) },
              { label: "Edit", onSelect: mockAction("Opening editor", r.url) },
              { label: "View analytics", onSelect: mockAction("Website analytics", r.url) },
              { label: "Suspend", onSelect: mockAction("Website suspended", r.url), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />
    </div>
  );
}
