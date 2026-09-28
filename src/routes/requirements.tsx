import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { CATEGORY_NAMES, COUNTRY_OPTIONS, businesses, money, requirements } from "@/data/mock";
import type { Requirement } from "@/data/types";

export const Route = createFileRoute("/requirements")({
  head: () => ({
    meta: [
      { title: "Requirements — Influencers.com SaaS Manager" },
      { name: "description", content: "Moderate creator requirements posted by businesses worldwide." },
      { property: "og:title", content: "Requirements — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Moderate creator requirements posted by businesses worldwide." },
    ],
  }),
  component: RequirementsPage,
});

function RequirementsPage() {
  const columns: Column<Requirement>[] = [
    {
      key: "requirement",
      header: "Requirement",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.title}</p>
          <p className="num truncate text-xs text-muted-foreground">{r.id}</p>
        </div>
      ),
    },
    { key: "business", header: "Business", cell: (r) => <span className="text-xs">{r.business}</span> },
    { key: "category", header: "Category", cell: (r) => <span className="text-xs">{r.category}</span> },
    { key: "location", header: "Location", cell: (r) => <span className="text-xs">{r.location}</span> },
    { key: "budget", header: "Budget", cell: (r) => <span className="num text-sm font-semibold">{money(r.budget, r.currency)}</span> },
    { key: "needed", header: "Creators", cell: (r) => <span className="num text-xs">{r.creatorsNeeded}</span> },
    { key: "apps", header: "Applications", cell: (r) => <span className="num text-xs font-semibold">{r.applications}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { key: "created", header: "Created", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.created}</span> },
  ];

  const filters: FilterDef<Requirement>[] = [
    { key: "status", label: "Status", options: ["open", "featured", "hidden", "closed"], match: (r, v) => r.status === v },
    { key: "category", label: "Category", options: CATEGORY_NAMES, match: (r, v) => r.category === v },
    { key: "location", label: "Country", options: COUNTRY_OPTIONS, match: (r, v) => r.location.endsWith(v) },
    { key: "business", label: "Business", options: businesses.map((b) => b.name), match: (r, v) => r.business === v },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Requirements" description="Business-created influencer requirements awaiting moderation." />

      <DataTable
        rows={requirements}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search requirement or business…"
        search={(r, t) => r.title.toLowerCase().includes(t) || r.business.toLowerCase().includes(t)}
        mobileCard={(r) => (
          <>
            <p className="truncate text-sm font-semibold">{r.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {r.business} · {r.location}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge value={r.status} />
              <span className="num text-xs font-semibold">{money(r.budget, r.currency)}</span>
              <span className="num ml-auto text-xs text-muted-foreground">{r.applications} applications</span>
            </div>
          </>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "View", onSelect: mockAction("Opening requirement", r.title) },
              { label: "Feature", onSelect: mockAction("Requirement featured", r.title) },
              { label: "Hide", onSelect: mockAction("Requirement hidden", r.title) },
              { label: "Close", onSelect: mockAction("Requirement closed", r.title) },
              { label: "Remove", onSelect: mockAction("Requirement removed", r.title), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />
    </div>
  );
}
