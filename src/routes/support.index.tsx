import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LifeBuoy, Timer, CheckCircle2, AlertTriangle, Download } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { tickets as initialTickets } from "@/data/mock";
import type { Ticket } from "@/data/types";

export const Route = createFileRoute("/support/")({
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
  const navigate = useNavigate();
  const [ticketsList] = useState<Ticket[]>(initialTickets);

  const open = ticketsList.filter((t) => t.status === "open").length;
  const progress = ticketsList.filter((t) => t.status === "in progress").length;
  const urgent = ticketsList.filter((t) => t.priority === "urgent").length;
  const resolved = ticketsList.filter((t) => t.status === "resolved" || t.status === "closed").length;

  const columns: Column<Ticket>[] = [
    {
      key: "id",
      header: "Ticket",
      cell: (r) => (
        <Link to="/support/$id" params={{ id: r.id }} className="num text-xs font-semibold hover:underline">
          {r.id}
        </Link>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      cell: (r) => (
        <Link
          to="/support/$id"
          params={{ id: r.id }}
          className="group/link block min-w-0"
        >
          <p className="truncate text-sm font-medium group-hover/link:underline">{r.subject}</p>
          <p className="truncate text-xs text-muted-foreground">{r.user}</p>
        </Link>
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
    { key: "assignee", label: "Assignee", options: [...new Set(ticketsList.map((t) => t.assignee))], match: (r, v) => r.assignee === v },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Support"
        description="Tickets raised by creators and businesses."
        actions={
          <Button variant="outline" size="sm" onClick={mockAction("Export started", "support-tickets.csv")}>
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open" value={String(open)} icon={LifeBuoy} delta={-6.1} />
        <StatCard label="In progress" value={String(progress)} icon={Timer} delta={3.3} />
        <StatCard label="Urgent" value={String(urgent)} icon={AlertTriangle} delta={-1.2} />
        <StatCard label="Resolved" value={String(resolved)} icon={CheckCircle2} delta={9.5} />
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          rows={ticketsList}
          columns={columns}
          filters={filters}
          getId={(r) => r.id}
          searchPlaceholder="Search ticket, subject or user…"
          search={(r, t) => r.id.toLowerCase().includes(t) || r.subject.toLowerCase().includes(t) || r.user.toLowerCase().includes(t)}
          onRowClick={(r) => navigate({ to: "/support/$id", params: { id: r.id } })}
          mobileCard={(r) => (
            <Link to="/support/$id" params={{ id: r.id }} className="block">
              <div className="flex items-center gap-2">
                <p className="num text-xs font-semibold">{r.id}</p>
                <StatusBadge value={r.priority} className="ml-auto" />
              </div>
              <p className="mt-1 truncate text-sm font-medium hover:underline">{r.subject}</p>
              <p className="truncate text-xs text-muted-foreground">{r.user}</p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge value={r.status} />
                <span className="ml-auto text-xs text-muted-foreground">{r.assignee}</span>
              </div>
            </Link>
          )}
          rowAction={(r) => (
            <ActionMenu
              items={[
                { label: "Open ticket", node: <Link to="/support/$id" params={{ id: r.id }}>Open ticket</Link> },
                { label: "Reassign", onSelect: mockAction("Ticket reassigned", r.id) },
                { label: "Mark resolved", onSelect: mockAction("Ticket resolved", r.id) },
                { label: "Close", onSelect: mockAction("Ticket closed", r.id), destructive: true, separatorBefore: true },
              ]}
            />
          )}
        />
      </div>
    </div>
  );
}
