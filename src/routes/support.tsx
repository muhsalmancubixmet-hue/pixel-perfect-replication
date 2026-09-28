import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Timer, CheckCircle2, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { tickets } from "@/data/mock";
import type { Ticket } from "@/data/types";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support Tickets — Influencers.com SaaS Manager" },
      { name: "description", content: "Triage and resolve support tickets from creators and businesses." },
      { property: "og:title", content: "Support Tickets — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Triage and resolve support tickets from creators and businesses." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const open = tickets.filter((t) => t.status === "open").length;
  const progress = tickets.filter((t) => t.status === "in progress").length;
  const urgent = tickets.filter((t) => t.priority === "urgent").length;
  const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  const columns: Column<Ticket>[] = [
    { key: "id", header: "Ticket", cell: (r) => <span className="num text-xs font-semibold">{r.id}</span> },
    {
      key: "subject",
      header: "Subject",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.subject}</p>
          <p className="truncate text-xs text-muted-foreground">{r.user}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (r) => <span className="text-xs">{r.category}</span> },
    { key: "priority", header: "Priority", cell: (r) => <StatusBadge value={r.priority} /> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { key: "created", header: "Created", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.created}</span> },
    { key: "assignee", header: "Assigned", cell: (r) => <span className="text-xs">{r.assignee}</span> },
  ];

  const filters: FilterDef<Ticket>[] = [
    { key: "status", label: "Status", options: ["open", "in progress", "waiting", "resolved", "closed"], match: (r, v) => r.status === v },
    { key: "priority", label: "Priority", options: ["low", "medium", "high", "urgent"], match: (r, v) => r.priority === v },
    {
      key: "category",
      label: "Category",
      options: ["Account", "Billing", "Website", "Domain", "Campaign", "Verification"],
      match: (r, v) => r.category === v,
    },
    { key: "assignee", label: "Assignee", options: [...new Set(tickets.map((t) => t.assignee))], match: (r, v) => r.assignee === v },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Support" description="Tickets raised by creators and businesses." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open" value={String(open)} icon={LifeBuoy} delta={-6.1} />
        <StatCard label="In progress" value={String(progress)} icon={Timer} delta={3.3} />
        <StatCard label="Urgent" value={String(urgent)} icon={AlertTriangle} delta={-1.2} />
        <StatCard label="Resolved" value={String(resolved)} icon={CheckCircle2} delta={9.5} />
      </div>

      <DataTable
        rows={tickets}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search ticket, subject or user…"
        search={(r, t) => r.id.toLowerCase().includes(t) || r.subject.toLowerCase().includes(t) || r.user.toLowerCase().includes(t)}
        mobileCard={(r) => (
          <>
            <div className="flex items-center gap-2">
              <p className="num text-xs font-semibold">{r.id}</p>
              <StatusBadge value={r.priority} className="ml-auto" />
            </div>
            <p className="mt-1 truncate text-sm font-medium">{r.subject}</p>
            <p className="truncate text-xs text-muted-foreground">{r.user}</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge value={r.status} />
              <span className="ml-auto text-xs text-muted-foreground">{r.assignee}</span>
            </div>
          </>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "Open ticket", onSelect: mockAction("Opening ticket", r.id) },
              { label: "Reassign", onSelect: mockAction("Ticket reassigned", r.id) },
              { label: "Mark resolved", onSelect: mockAction("Ticket resolved", r.id) },
              { label: "Close", onSelect: mockAction("Ticket closed", r.id), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />
    </div>
  );
}
