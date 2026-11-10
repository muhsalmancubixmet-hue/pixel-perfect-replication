import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, CheckCircle2, Clock, Download } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { money } from "@/data/mock";
import type { Payment } from "@/data/types";
import { adminApi } from "@/lib/admin-api";
import { exportToCsv } from "@/lib/csv-export";

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
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);

  useEffect(() => {
    let active = true;
    adminApi.getPayments()
      .then((res: any) => {
        if (!active) return;
        const list = res?.results || (Array.isArray(res) ? res : []);
        const mapped = list.map((p: any) => ({
          id: p.id,
          user: p.customer_name || p.user || "User",
          type: p.transaction_type || p.type || "Subscription",
          amount: (p.amount_cents || 0) / 100,
          currency: p.currency || "INR",
          status: (p.status || "paid").toLowerCase() as Payment["status"],
          method: p.payment_method || p.method || "UPI",
          date: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent",
        }));
        setPaymentsList(mapped);
      })
      .catch((err) => {
        console.warn("Could not load live payments:", err);
      });
    return () => { active = false; };
  }, []);

  const paid = paymentsList.filter((p) => p.status === "paid");
  const pending = paymentsList.filter((p) => p.status === "pending");
  const refunded = paymentsList.filter((p) => p.status === "refunded");

  const columns: Column<Payment>[] = [
    { key: "id", header: "Transaction", cell: (r) => <span className="num text-xs font-semibold">{r.id}</span> },
    { key: "user", header: "User / business", cell: (r) => <span className="text-sm">{r.user}</span> },
    { key: "type", header: "Type", cell: (r) => <span className="text-xs">{r.type}</span> },
    { key: "amount", header: "Amount", cell: (r) => <span className="num text-sm font-semibold">{money(r.amount, r.currency)}</span> },
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
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCsv(
                "payments.csv",
                [
                  { header: "ID", accessor: (p) => p.id },
                  { header: "User", accessor: (p) => p.user },
                  { header: "Amount", accessor: (p) => p.amount },
                  { header: "Currency", accessor: (p) => p.currency },
                  { header: "Status", accessor: (p) => p.status },
                  { header: "Method", accessor: (p) => p.method },
                  { header: "Date", accessor: (p) => p.date },
                ],
                paymentsList
              )
            }
          >
            <Download className="size-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected" value={money(paid.reduce((a, p) => a + p.amount, 0))} icon={CheckCircle2} delta={10.3} />
        <StatCard label="Pending" value={money(pending.reduce((a, p) => a + p.amount, 0))} icon={Clock} delta={-4.2} />
        <StatCard label="Refunded" value={money(refunded.reduce((a, p) => a + p.amount, 0))} icon={ArrowDownRight} delta={1.8} />
        <StatCard label="Transactions" value={String(paymentsList.length)} icon={CheckCircle2} delta={6.9} />
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          rows={paymentsList}
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
                {money(r.amount, r.currency)} <span className="text-xs font-normal text-muted-foreground">· {r.type} · {r.method}</span>
              </p>
            </>
          )}
          rowAction={(r) => (
            <ActionMenu
              items={[
                { label: "View receipt", onSelect: () => saved("Receipt opened", r.id) },
                {
                  label: "Refund",
                  destructive: true,
                  separatorBefore: true,
                  onSelect: async () => {
                    try {
                      await adminApi.refundPayment(r.id, {
                        refund_amount_cents: Math.round(r.amount * 100),
                        reason: "Admin initiated refund",
                      });
                      setPaymentsList((all) => all.map((p) => p.id === r.id ? { ...p, status: "refunded" } : p));
                    } catch {}
                    saved("Refund initiated", r.id);
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
