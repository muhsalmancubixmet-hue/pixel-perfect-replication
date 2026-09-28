import { createFileRoute } from "@tanstack/react-router";
import { Download, Monitor } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { auditLogs } from "@/data/mock";
import type { AuditLog } from "@/data/types";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Influencers.com SaaS Manager" },
      { name: "description", content: "A full trail of every administrative action taken on the platform." },
      { property: "og:title", content: "Audit Logs — Influencers.com SaaS Manager" },
      { property: "og:description", content: "A full trail of every administrative action on the platform." },
    ],
  }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const columns: Column<AuditLog>[] = [
    { key: "datetime", header: "Date / time", cell: (r) => <span className="num text-xs font-medium">{r.datetime}</span> },
    { key: "admin", header: "Admin", cell: (r) => <span className="num text-xs">{r.admin}</span> },
    { key: "action", header: "Action", cell: (r) => <span className="text-sm font-medium">{r.action}</span> },
    { key: "entity", header: "Entity", cell: (r) => <span className="text-xs">{r.entity}</span> },
    { key: "entityId", header: "Entity ID", cell: (r) => <span className="num text-xs text-muted-foreground">{r.entityId}</span> },
    {
      key: "device",
      header: "IP / device",
      secondary: true,
      cell: (r) => (
        <span className="num inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Monitor className="size-3.5" />
          {r.ip} · {r.device}
        </span>
      ),
    },
    { key: "result", header: "Result", cell: (r) => <StatusBadge value={r.result === "success" ? "approved" : "failed"} /> },
  ];

  const filters: FilterDef<AuditLog>[] = [
    { key: "admin", label: "Admin", options: [...new Set(auditLogs.map((l) => l.admin))], match: (r, v) => r.admin === v },
    { key: "action", label: "Action", options: [...new Set(auditLogs.map((l) => l.action))], match: (r, v) => r.action === v },
    { key: "entity", label: "Entity", options: [...new Set(auditLogs.map((l) => l.entity))], match: (r, v) => r.entity === v },
    { key: "result", label: "Result", options: ["success", "failed"], match: (r, v) => r.result === v },
    {
      key: "date",
      label: "Date",
      options: ["Last 7 days", "Last 30 days"],
      match: (r, v) => {
        const days = (Date.now() - new Date(r.datetime.slice(0, 10)).getTime()) / 86400000;
        return v === "Last 7 days" ? days <= 7 : days <= 30;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Audit logs"
        description="Accountability trail for every administrative action."
        actions={
          <Button variant="outline" size="sm" onClick={mockAction("Export started", "audit-logs.csv")}>
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <DataTable
        rows={auditLogs}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        pageSize={15}
        searchPlaceholder="Search action, admin or entity ID…"
        search={(r, t) =>
          r.action.toLowerCase().includes(t) || r.admin.toLowerCase().includes(t) || r.entityId.toLowerCase().includes(t)
        }
        mobileCard={(r) => (
          <>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{r.action}</p>
              <StatusBadge value={r.result === "success" ? "approved" : "failed"} className="ml-auto" />
            </div>
            <p className="num mt-1 text-xs text-muted-foreground">
              {r.entity} · {r.entityId}
            </p>
            <p className="num text-xs text-muted-foreground">
              {r.admin} · {r.datetime}
            </p>
            <p className="num text-[11px] text-muted-foreground">
              {r.ip} · {r.device}
            </p>
          </>
        )}
      />
    </div>
  );
}
