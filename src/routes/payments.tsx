import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, CheckCircle2, Clock, Download } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { inr, payments } from "@/data/mock";
import type { Payment } from "@/data/types";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Influencers.com SaaS Manager" },
      { name: "description", content: "Every transaction on the platform: subscriptions, campaigns, services and refunds." },
      { property: "og:title", content: "Payments — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Every transaction: subscriptions, campaigns, services and refunds." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const refunded = payments.filter((p) => p.status === "refunded");

  const columns: Column<Payment>[] = [
    { key: "id", header: "Transaction", cell: (r) => <span className="num text-xs font-semibold">{r.id}</span> },
    { key: "user", header: "User / business", cell: (r) => <span className="text-sm">{r.user}</span> },
    { key: "type", header: "Type", cell: (r) => <span className="text-xs">{r.type}</span> },
    { key: "amount", header: "Amount", cell: (r) => <span className="num text-sm font-semibold">{inr(r.amount)}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { key: "method", header: "Method", secondary: true, cell: (r) => <span className="text-xs">{r.method}</span> },
    { key: "date", header: "Date", cell: (r) => <span className="num text-xs text-muted-foreground">{r.date}</span> },
  ];

  const filters: FilterDef<Payment>[] = [
    { key: "status", label: "Status", options: ["paid", "pending", "failed", "refunded"], match: (r, v) => r.status === v },
    { key: "type", label: "Type", options: ["Subscription", "Campaign", "Service", "Domain"], match: (r, v) => r.type === v },
    { key: "method", label: "Method", options: ["UPI", "Card", "Netbanking", "Wallet"], match: (r, v) => r.method === v },
    {
      key: "date",
      label: "Date",
      options: ["Last 30 days", "Last 90 days", "Older"],
      match: (r, v) => {
        const days = (Date.now() - new Date(r.date).getTime()) / 86400000;
        return v === "Last 30 days" ? days <= 30 : v === "Last 90 days" ? days <= 90 : days > 90;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Payments"
        description="All money movement across subscriptions, campaigns and services."
        actions={
          <Button variant="outline" size="sm" onClick={mockAction("Export started", "payments.csv")}>
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Collected" value={inr(paid.reduce((a, p) => a + p.amount, 0))} icon={CheckCircle2} delta={10.3} />
        <StatCard label="Pending" value={inr(pending.reduce((a, p) => a + p.amount, 0))} icon={Clock} delta={-4.2} />
        <StatCard label="Refunded" value={inr(refunded.reduce((a, p) => a + p.amount, 0))} icon={ArrowDownRight} delta={1.8} />
        <StatCard label="Transactions" value={String(payments.length)} icon={CheckCircle2} delta={6.9} />
      </div>

      <DataTable
        rows={payments}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search transaction or user…"
        search={(r, t) => r.id.toLowerCase().includes(t) || r.user.toLowerCase().includes(t)}
        mobileCard={(r) => (
          <>
            <div className="flex items-center gap-2">
              <p className="num text-sm font-semibold">{r.id}</p>
              <StatusBadge value={r.status} className="ml-auto" />
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{r.user}</p>
            <p className="num mt-1 text-sm font-bold">
              {inr(r.amount)} <span className="text-xs font-normal text-muted-foreground">· {r.type} · {r.method}</span>
            </p>
          </>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "View receipt", onSelect: mockAction("Receipt", r.id) },
              { label: "Send invoice", onSelect: mockAction("Invoice sent", r.user) },
              { label: "Refund", onSelect: mockAction("Refund initiated", r.id), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />
    </div>
  );
}
