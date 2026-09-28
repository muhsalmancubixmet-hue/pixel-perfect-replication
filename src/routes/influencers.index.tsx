import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { CATEGORY_NAMES, COUNTRY_OPTIONS, CITY_OPTIONS, compact, influencers } from "@/data/mock";
import type { Influencer } from "@/data/types";

export const Route = createFileRoute("/influencers/")({
  head: () => ({
    meta: [
      { title: "Influencer Management — Influencers.com SaaS Manager" },
      { name: "description", content: "Search, filter, verify and moderate every creator on Influencers.com." },
      { property: "og:title", content: "Influencer Management — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Search, filter, verify and moderate every creator on the platform." },
    ],
  }),
  component: InfluencersPage,
});

const PLATFORMS = ["Instagram", "YouTube", "Facebook", "TikTok", "X", "LinkedIn", "Snapchat", "Threads", "Pinterest", "Twitch"];

function InfluencersPage() {
  const columns: Column<Influencer>[] = [
    {
      key: "profile",
      header: "Creator",
      cell: (r) => (
        <Link to="/influencers/$id" params={{ id: r.id }} className="flex items-center gap-2.5">
          <UserAvatar src={r.avatar} name={r.name} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium hover:underline">{r.name}</span>
            <span className="num block truncate text-xs text-muted-foreground">@{r.handle}</span>
          </span>
        </Link>
      ),
    },
    { key: "category", header: "Category", cell: (r) => <span className="text-xs">{r.categories.join(", ")}</span> },
    {
      key: "location",
      header: "Location",
      cell: (r) => (
        <span className="text-xs">
          {r.city}
          <span className="block text-muted-foreground">{r.location.country}</span>
        </span>
      ),
    },
    { key: "followers", header: "Followers", cell: (r) => <span className="num text-sm font-semibold">{compact(r.followers)}</span> },
    {
      key: "platforms",
      header: "Platforms",
      secondary: true,
      cell: (r) => (
        <span className="flex flex-wrap gap-1">
          {r.platforms.map((p) => (
            <span key={p} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              {p}
            </span>
          ))}
        </span>
      ),
    },
    { key: "verification", header: "Verification", cell: (r) => <StatusBadge value={r.verification} /> },
    {
      key: "website",
      header: "Website",
      secondary: true,
      cell: (r) => <StatusBadge value={r.websiteStatus === "none" ? "draft" : r.websiteStatus} />,
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { key: "joined", header: "Joined", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.joined}</span> },
  ];

  const filters: FilterDef<Influencer>[] = [
    { key: "category", label: "Category", options: CATEGORY_NAMES, match: (r, v) => r.categories.includes(v) },
    { key: "country", label: "Country", options: COUNTRY_OPTIONS, match: (r, v) => r.location.country === v },
    { key: "city", label: "City", options: CITY_OPTIONS, match: (r, v) => r.location.city === v },
    { key: "status", label: "Status", options: ["active", "suspended", "pending"], match: (r, v) => r.status === v },
    { key: "verification", label: "Verification", options: ["verified", "pending", "unverified"], match: (r, v) => r.verification === v },
    {
      key: "website",
      label: "Website status",
      options: ["published", "draft", "suspended", "none"],
      match: (r, v) => r.websiteStatus === v,
    },
    { key: "platform", label: "Social platform", options: PLATFORMS, match: (r, v) => r.platforms.includes(v) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Influencers"
        description={`${influencers.length} creator accounts in this sample set.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={mockAction("Export started", "influencers.csv")}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={mockAction("Add influencer", "opens creator onboarding")}>
              <UserPlus className="size-4" /> Add Influencer
            </Button>
          </>
        }
      />

      <DataTable
        rows={influencers}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search by name, handle or city…"
        search={(r, t) =>
          r.name.toLowerCase().includes(t) || r.handle.includes(t) || r.city.toLowerCase().includes(t)
        }
        mobileCard={(r) => (
          <Link to="/influencers/$id" params={{ id: r.id }} className="block">
            <div className="flex items-center gap-2.5">
              <UserAvatar src={r.avatar} name={r.name} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.categories[0]} · {r.location.city}, {r.location.countryCode}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge value={r.status} />
              <StatusBadge value={r.verification} />
              <span className="num ml-auto text-xs font-semibold">{compact(r.followers)} followers</span>
            </div>
          </Link>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "View", node: <Link to="/influencers/$id" params={{ id: r.id }}>View</Link> },
              { label: "Edit", onSelect: mockAction("Edit creator", r.name) },
              { label: "Verify", onSelect: mockAction("Verification approved", r.name) },
              { label: "Activate", onSelect: mockAction("Account activated", r.name) },
              { label: "View Website", onSelect: mockAction("Opening website", r.websiteUrl ?? "no website") },
              { label: "View Public Profile", onSelect: mockAction("Opening public profile", r.name) },
              { label: "Suspend", onSelect: mockAction("Account suspended", r.name), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />
    </div>
  );
}
