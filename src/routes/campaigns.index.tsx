import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, Megaphone, Users, Wallet } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { CATEGORY_NAMES, businesses, campaigns as initialCampaigns, money } from "@/data/mock";
import type { Campaign } from "@/data/types";
import { adminApi } from "@/lib/admin-api";
import { exportToCsv } from "@/lib/csv-export";

export const Route = createFileRoute("/campaigns/")({
  head: () => ({
    meta: [
      { title: "Campaign Management — Influencers.com SaaS Manager" },
      {
        name: "description",
        content: "Monitor every brand campaign across the Influencers.com marketplace.",
      },
      { property: "og:title", content: "Campaign Management — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Monitor every brand campaign across the marketplace.",
      },
    ],
  }),
  component: CampaignsPage,
});

const STATUSES: Campaign["status"][] = [
  "draft",
  "published",
  "applications",
  "shortlisted",
  "active",
  "content submitted",
  "completed",
  "cancelled",
];

function CampaignsPage() {
  const navigate = useNavigate();
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);

  useEffect(() => {
    let active = true;
    adminApi
      .getCampaigns()
      .then((res: any) => {
        if (!active) return;
        const list = res?.results || (Array.isArray(res) ? res : []);
        setCampaignsList(list);
      })
      .catch((err) => {
        console.warn("Could not load live campaigns:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalBudget = campaignsList.reduce((a, c) => a + (c.budget || 0), 0);
  const active = campaignsList.filter((c) => c.status === "active").length;
  const completed = campaignsList.filter((c) => c.status === "completed").length;
  const creators = campaignsList.reduce((a, c) => a + c.creators, 0);

  const columns: Column<Campaign>[] = [
    {
      key: "campaign",
      header: "Campaign",
      cell: (r) => (
        <Link to="/campaigns/$id" params={{ id: r.id }} className="group/link block min-w-0">
          <p className="truncate text-sm font-medium group-hover/link:underline">{r.title}</p>
          <p className="num truncate text-xs text-muted-foreground">
            {r.id} · {r.location}
          </p>
        </Link>
      ),
    },
    {
      key: "business",
      header: "Business",
      cell: (r) => <span className="text-xs">{r.business}</span>,
    },
    {
      key: "category",
      header: "Category",
      cell: (r) => <span className="text-xs">{r.category}</span>,
    },
    {
      key: "budget",
      header: "Budget",
      cell: (r) => <span className="num text-sm font-semibold">{money(r.budget, r.currency)}</span>,
    },
    {
      key: "creators",
      header: "Creators",
      cell: (r) => (
        <span className="num text-xs">
          {r.creators} <span className="text-muted-foreground">· {r.applications} apps</span>
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    {
      key: "created",
      header: "Created",
      secondary: true,
      cell: (r) => <span className="num text-xs text-muted-foreground">{r.created}</span>,
    },
    {
      key: "deadline",
      header: "Deadline",
      cell: (r) => <span className="num text-xs text-muted-foreground">{r.deadline}</span>,
    },
  ];

  const filters: FilterDef<Campaign>[] = [
    { key: "status", label: "Status", options: STATUSES, match: (r, v) => r.status === v },
    {
      key: "category",
      label: "Category",
      options: CATEGORY_NAMES,
      match: (r, v) => r.category === v,
    },
    {
      key: "business",
      label: "Business",
      options: businesses.map((b) => b.name),
      match: (r, v) => r.business === v,
    },
    {
      key: "budget",
      label: "Budget",
      options: ["Under 50K", "50K – 200K", "Above 200K"],
      match: (r, v) =>
        v === "Under 50K"
          ? r.budget < 50000
          : v === "50K – 200K"
            ? r.budget >= 50000 && r.budget <= 200000
            : r.budget > 200000,
    },
    {
      key: "date",
      label: "Date",
      options: ["Last 30 days", "Last 90 days", "Older"],
      match: (r, v) => {
        const days = (Date.now() - new Date(r.created).getTime()) / 86400000;
        return v === "Last 30 days" ? days <= 30 : v === "Last 90 days" ? days <= 90 : days > 90;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Campaigns"
        description="Every campaign created by businesses on the platform."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCsv(
                "campaigns.csv",
                [
                  { header: "ID", accessor: (c) => c.id },
                  { header: "Title", accessor: (c) => c.title },
                  { header: "Business", accessor: (c) => c.business },
                  { header: "Category", accessor: (c) => c.category },
                  { header: "Budget", accessor: (c) => c.budget },
                  { header: "Currency", accessor: (c) => c.currency },
                  { header: "Status", accessor: (c) => c.status },
                  { header: "Creators", accessor: (c) => c.creators },
                  { header: "Applications", accessor: (c) => c.applications },
                  { header: "Created", accessor: (c) => c.created },
                  { header: "Deadline", accessor: (c) => c.deadline },
                ],
                campaignsList,
              )
            }
          >
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total campaigns"
          value={String(campaignsList.length)}
          icon={Megaphone}
          delta={9.4}
        />
        <StatCard label="Active now" value={String(active)} icon={Megaphone} delta={5.2} />
        <StatCard label="Completed" value={String(completed)} icon={CheckCircle2} delta={13.8} />
        <StatCard
          label="Committed budget"
          value={money(totalBudget)}
          icon={Wallet}
          delta={7.1}
          hint={`${creators} creator slots`}
        />
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          rows={campaignsList}
          columns={columns}
          filters={filters}
          getId={(r) => r.id}
          searchPlaceholder="Search campaign or business…"
          search={(r, t) =>
            r.title.toLowerCase().includes(t) || r.business.toLowerCase().includes(t)
          }
          onRowClick={(r) => navigate({ to: "/campaigns/$id", params: { id: r.id } })}
          mobileCard={(r) => (
            <Link to="/campaigns/$id" params={{ id: r.id }} className="block">
              <p className="truncate text-sm font-semibold hover:underline">{r.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r.business} · {r.category}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusBadge value={r.status} />
                <span className="num text-xs font-semibold">{money(r.budget, r.currency)}</span>
                <span className="num ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" /> {r.creators}
                </span>
              </div>
            </Link>
          )}
          rowAction={(r) => (
            <ActionMenu
              items={[
                {
                  label: "View campaign",
                  node: (
                    <Link to="/campaigns/$id" params={{ id: r.id }}>
                      View campaign
                    </Link>
                  ),
                },
                {
                  label: "Feature campaign",
                  onSelect: async () => {
                    try {
                      await adminApi.moderateCampaign(r.id, { is_featured: true });
                      setCampaignsList((all) =>
                        all.map((c) => (c.id === r.id ? { ...c, isFeatured: true } : c)),
                      );
                    } catch {}
                  },
                },
                {
                  label: "Cancel campaign",
                  destructive: true,
                  separatorBefore: true,
                  onSelect: async () => {
                    try {
                      await adminApi.moderateCampaign(r.id, { status: "CANCELLED" });
                      setCampaignsList((all) =>
                        all.map((c) => (c.id === r.id ? { ...c, status: "cancelled" } : c)),
                      );
                    } catch {}
                  },
                },
              ]}
            />
          )}
        />
      </div>
    </div>
  );
}
