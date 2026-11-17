import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Globe, MousePointerClick, Layers } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { saved } from "@/components/admin/Dialogs";
import { compact } from "@/data/mock";
import type { Website } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/websites")({
  head: () => ({
    meta: [
      { title: "Creator Websites — Influencers.com SaaS Manager" },
      {
        name: "description",
        content:
          "Every creator website built on Influencers.com, with templates, domains and traffic.",
      },
      { property: "og:title", content: "Creator Websites — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Every creator website with templates, domains and traffic.",
      },
    ],
  }),
  component: WebsitesPage,
});

const STATUSES = ["draft", "published", "suspended", "domain pending", "domain connected"];

function WebsitesPage() {
  const [websitesList, setWebsitesList] = useState<Website[]>([]);

  useEffect(() => {
    let active = true;
    adminApi
      .getWebsites()
      .then((res: any) => {
        if (!active) return;
        const list = res?.results || (Array.isArray(res) ? res : []);
        const mapped = list.map((w: any) => ({
          id: w.id,
          creator: w.creator_name || w.creator || "Creator",
          creatorId: w.creator_id || w.creatorId || "",
          url: w.url || `https://${w.subdomain || "creator"}.influencers.com`,
          template: w.theme || w.template || "Standard",
          status: (w.status || "published").toLowerCase() as Website["status"],
          domain: w.custom_domain || w.domain || `${w.subdomain || "creator"}.influencers.com`,
          visitors: w.page_views || w.visitors || 0,
          created: w.created_at ? new Date(w.created_at).toLocaleDateString() : "Recent",
          updated: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : "Recent",
        }));
        setWebsitesList(mapped);
      })
      .catch((err) => {
        console.warn("Could not load live websites:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const published = websitesList.filter((w) => w.status === "published").length;
  const visitors = websitesList.reduce((a, w) => a + (w.visitors || 0), 0);
  const templates = [...new Set(websitesList.map((w) => w.template))];

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
    {
      key: "url",
      header: "Website URL",
      cell: (r) => <span className="num text-xs text-primary">{r.url}</span>,
    },
    {
      key: "template",
      header: "Template",
      cell: (r) => <span className="text-xs">{r.template}</span>,
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    {
      key: "domain",
      header: "Domain",
      secondary: true,
      cell: (r) => <span className="num text-xs text-muted-foreground">{r.domain}</span>,
    },
    {
      key: "visitors",
      header: "Visitors",
      cell: (r) => <span className="num text-sm font-semibold">{compact(r.visitors)}</span>,
    },
    {
      key: "created",
      header: "Created",
      secondary: true,
      cell: (r) => <span className="num text-xs text-muted-foreground">{r.created}</span>,
    },
    {
      key: "updated",
      header: "Updated",
      cell: (r) => <span className="num text-xs text-muted-foreground">{r.updated}</span>,
    },
  ];

  const filters: FilterDef<Website>[] = [
    { key: "status", label: "Status", options: STATUSES, match: (r, v) => r.status === v },
    { key: "template", label: "Template", options: templates, match: (r, v) => r.template === v },
    {
      key: "domainType",
      label: "Domain type",
      options: ["custom", "subdomain"],
      match: (r, v) =>
        v === "subdomain"
          ? r.domain.endsWith("influencers.com")
          : !r.domain.endsWith("influencers.com"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Websites"
        description="Creator websites hosted on the Influencers.com website builder."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Total websites"
          value={String(websitesList.length)}
          icon={Globe}
          delta={9.8}
        />
        <StatCard label="Published" value={String(published)} icon={Layers} delta={6.3} />
        <StatCard
          label="Visitors (30d)"
          value={compact(visitors)}
          icon={MousePointerClick}
          delta={18.2}
        />
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          rows={websitesList}
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
                <span className="num ml-auto text-xs font-semibold">
                  {compact(r.visitors)} visits
                </span>
              </div>
            </>
          )}
          rowAction={(r) => (
            <ActionMenu
              items={[
                { label: "Preview", onSelect: () => window.open(r.url, "_blank") },
                {
                  label: "Suspend",
                  destructive: true,
                  separatorBefore: true,
                  onSelect: async () => {
                    try {
                      await adminApi.moderateWebsite(r.id, { status: "SUSPENDED" });
                      setWebsitesList((all) =>
                        all.map((x) => (x.id === r.id ? { ...x, status: "suspended" } : x)),
                      );
                    } catch {}
                    saved("Website suspended", r.url);
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
