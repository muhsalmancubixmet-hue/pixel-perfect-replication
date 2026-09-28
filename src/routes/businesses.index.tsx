import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Download } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { COUNTRY_OPTIONS, CITY_OPTIONS, businesses } from "@/data/mock";
import type { Business } from "@/data/types";

export const Route = createFileRoute("/businesses/")({
  head: () => ({
    meta: [
      { title: "Business Management — Influencers.com SaaS Manager" },
      { name: "description", content: "Manage every business account, subscription and campaign owner on the platform." },
      { property: "og:title", content: "Business Management — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Manage business accounts, subscriptions and campaign owners." },
    ],
  }),
  component: BusinessesPage,
});

const TYPES = [...new Set(businesses.map((b) => b.type))].sort();

function BusinessesPage() {
  const columns: Column<Business>[] = [
    {
      key: "business",
      header: "Business",
      cell: (r) => (
        <Link to="/businesses/$id" params={{ id: r.id }} className="flex items-center gap-2.5">
          <UserAvatar name={r.name} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium hover:underline">{r.name}</span>
            <span className="num block truncate text-xs text-muted-foreground">{r.id}</span>
          </span>
        </Link>
      ),
    },
    { key: "type", header: "Type", cell: (r) => <span className="text-xs">{r.type}</span> },
    {
      key: "location",
      header: "Location",
      cell: (r) => (
        <span className="text-xs">
          {r.location.city}
          <span className="block text-muted-foreground">{r.location.country}</span>
        </span>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      secondary: true,
      cell: (r) => (
        <span className="text-xs">
          {r.contactName}
          <span className="num block text-muted-foreground">{r.email}</span>
        </span>
      ),
    },
    { key: "campaigns", header: "Campaigns", cell: (r) => <span className="num text-sm font-semibold">{r.campaigns}</span> },
    {
      key: "subscription",
      header: "Subscription",
      cell: (r) => (
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold">
          {r.subscription}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { key: "joined", header: "Joined", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.joined}</span> },
  ];

  // Subscription column needs the plan name, not a status tone.
  columns[5] = {
    key: "subscription",
    header: "Subscription",
    cell: (r) => (
      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold">{r.subscription}</span>
    ),
  };

  const filters: FilterDef<Business>[] = [
    { key: "type", label: "Business type", options: TYPES, match: (r, v) => r.type === v },
    { key: "country", label: "Country", options: COUNTRY_OPTIONS, match: (r, v) => r.location.country === v },
    { key: "city", label: "City", options: CITY_OPTIONS, match: (r, v) => r.location.city === v },
    { key: "subscription", label: "Subscription", options: ["Free", "Pro", "Agency"], match: (r, v) => r.subscription === v },
    { key: "status", label: "Status", options: ["active", "suspended", "pending"], match: (r, v) => r.status === v },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Businesses"
        description={`${businesses.length} brand accounts across all markets.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={mockAction("Export started", "businesses.csv")}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={mockAction("Add business", "opens business onboarding")}>
              <Building2 className="size-4" /> Add Business
            </Button>
          </>
        }
      />

      <DataTable
        rows={businesses}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search business, contact or city…"
        search={(r, t) =>
          r.name.toLowerCase().includes(t) || r.contactName.toLowerCase().includes(t) || r.location.city.toLowerCase().includes(t)
        }
        mobileCard={(r) => (
          <Link to="/businesses/$id" params={{ id: r.id }} className="block">
            <div className="flex items-center gap-2.5">
              <UserAvatar name={r.name} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.type} · {r.location.city}, {r.location.countryCode}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge value={r.status} />
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold">
                {r.subscription}
              </span>
              <span className="num ml-auto text-xs text-muted-foreground">{r.campaigns} campaigns</span>
            </div>
          </Link>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "View", node: <Link to="/businesses/$id" params={{ id: r.id }}>View</Link> },
              { label: "Edit", onSelect: mockAction("Edit business", r.name) },
              { label: "View Campaigns", node: <Link to="/campaigns">View Campaigns</Link> },
              { label: "Activate", onSelect: mockAction("Account activated", r.name) },
              { label: "Suspend", onSelect: mockAction("Account suspended", r.name), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />
    </div>
  );
}
