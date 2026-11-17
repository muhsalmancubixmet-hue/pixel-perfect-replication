import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Monitor } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { saved } from "@/components/admin/Dialogs";
import type { AuditLog } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Influencers.com SaaS Manager" },
      {
        name: "description",
        content: "A full trail of every administrative action taken on the platform.",
      },
      { property: "og:title", content: "Audit Logs — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "A full trail of every administrative action on the platform.",
      },
    ],
  }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const [logsList, setLogsList] = useState<AuditLog[]>([]);

  useEffect(() => {
    let active = true;
    adminApi
      .getAuditLogs()
      .then((res: any) => {
        if (!active) return;
        const list = res?.results || (Array.isArray(res) ? res : []);
        const mapped = list.map((l: any) => ({
          id: l.id,
          datetime: l.created_at ? new Date(l.created_at).toLocaleString() : "Recent",
          admin: l.admin_name || l.admin_email || "System Admin",
          action: l.action || "Action",
          entity: l.target_model || l.entity || "Entity",
          entityId: l.target_object_id || l.entityId || "N/A",
          ip: l.ip_address || l.ip || "127.0.0.1",
          device: l.user_agent ? l.user_agent.slice(0, 20) : "Browser",
          result: (l.status === "FAILED" ? "failed" : "success") as AuditLog["result"],
        }));
        setLogsList(mapped);
      })
      .catch((err) => {
        console.warn("Could not load live audit logs:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const columns: Column<AuditLog>[] = [
    {
      key: "datetime",
      header: "Date / time",
      cell: (r) => <span className="num text-xs font-medium">{r.datetime}</span>,
    },
    { key: "admin", header: "Admin", cell: (r) => <span className="num text-xs">{r.admin}</span> },
    {
      key: "action",
      header: "Action",
      cell: (r) => <span className="text-sm font-medium">{r.action}</span>,
    },
    { key: "entity", header: "Entity", cell: (r) => <span className="text-xs">{r.entity}</span> },
    {
      key: "entityId",
      header: "Entity ID",
      cell: (r) => <span className="num text-xs text-muted-foreground">{r.entityId}</span>,
    },
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
    {
      key: "result",
      header: "Result",
      cell: (r) => <StatusBadge value={r.result === "success" ? "approved" : "failed"} />,
    },
  ];

  const filters: FilterDef<AuditLog>[] = [
    {
      key: "admin",
      label: "Admin",
      options: [...new Set(logsList.map((l) => l.admin))],
      match: (r, v) => r.admin === v,
    },
    {
      key: "action",
      label: "Action",
      options: [...new Set(logsList.map((l) => l.action))],
      match: (r, v) => r.action === v,
    },
    {
      key: "entity",
      label: "Entity",
      options: [...new Set(logsList.map((l) => l.entity))],
      match: (r, v) => r.entity === v,
    },
    {
      key: "result",
      label: "Result",
      options: ["success", "failed"],
      match: (r, v) => r.result === v,
    },
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

  const handleExportCsv = () => {
    if (!logsList || logsList.length === 0) {
      saved("Export notice", "No audit logs available to export.");
      return;
    }
    const headers = [
      "Timestamp",
      "Admin",
      "Action",
      "Entity",
      "Entity ID",
      "IP Address",
      "Device / User-Agent",
      "Status",
    ];
    const rows = logsList.map((l) => [
      `"${String(l.datetime).replace(/"/g, '""')}"`,
      `"${String(l.admin).replace(/"/g, '""')}"`,
      `"${String(l.action).replace(/"/g, '""')}"`,
      `"${String(l.entity).replace(/"/g, '""')}"`,
      `"${String(l.entityId).replace(/"/g, '""')}"`,
      `"${String(l.ip).replace(/"/g, '""')}"`,
      `"${String(l.device).replace(/"/g, '""')}"`,
      `"${String(l.result).replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    saved("Export successful", "audit-logs.csv downloaded");
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Audit logs"
        description="Accountability trail for every administrative action."
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <div className="w-full overflow-x-auto">
        <DataTable
          rows={logsList}
          columns={columns}
          filters={filters}
          getId={(r) => r.id}
          pageSize={15}
          searchPlaceholder="Search action, admin or entity ID…"
          search={(r, t) =>
            r.action.toLowerCase().includes(t) ||
            r.admin.toLowerCase().includes(t) ||
            r.entityId.toLowerCase().includes(t)
          }
          mobileCard={(r) => (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{r.action}</p>
                <StatusBadge
                  value={r.result === "success" ? "approved" : "failed"}
                  className="ml-auto"
                />
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
    </div>
  );
}
