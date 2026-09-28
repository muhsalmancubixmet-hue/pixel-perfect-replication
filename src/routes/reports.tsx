import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, Repeat, Wallet, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { money, plans, revenueByAccountType, revenueByPlan, revenueTrend } from "@/data/mock";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Revenue Analytics — Influencers.com SaaS Manager" },
      { name: "description", content: "Recurring revenue, plan mix, refunds and net revenue for Influencers.com." },
      { property: "og:title", content: "Revenue Analytics — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Recurring revenue, plan mix, refunds and net revenue." },
    ],
  }),
  component: ReportsPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const axis = { stroke: "var(--muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
};

function ReportsPage() {
  const latest = revenueTrend[revenueTrend.length - 1]!;
  const mrr = plans.reduce((a, p) => a + p.monthlyRevenue, 0);
  const net = latest.subscription + latest.services - latest.refunds;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Revenue analytics" description="How the platform earns, month by month." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="MRR" value={money(mrr)} icon={Repeat} delta={11.2} />
        <StatCard label="Subscription revenue" value={money(latest.subscription)} icon={Wallet} delta={9.4} />
        <StatCard label="Campaign & services" value={money(latest.services)} icon={TrendingUp} delta={14.6} />
        <StatCard label="Refunds" value={money(latest.refunds)} icon={ArrowDownRight} delta={-2.1} />
        <StatCard label="Net revenue" value={money(net)} icon={Wallet} delta={12.8} />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <ChartCard title="Revenue over time" subtitle="Subscription vs services vs refunds (base currency)" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend} margin={{ left: -4, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} tickLine={false} axisLine={false} tick={axis} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="subscription" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="services" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="refunds" stroke="var(--destructive)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by plan" subtitle="Monthly revenue per paid plan">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByPlan} layout="vertical" margin={{ left: 42, right: 12, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} tickLine={false} axisLine={false} tick={axis} />
              <YAxis type="category" dataKey="name" width={90} tickLine={false} axisLine={false} tick={axis} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {revenueByPlan.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by account type" subtitle="Creators vs businesses">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={revenueByAccountType} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3}>
                {revenueByAccountType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2.5">Plan</th>
              <th className="px-3 py-2.5">Audience</th>
              <th className="px-3 py-2.5">Price</th>
              <th className="px-3 py-2.5">Active users</th>
              <th className="px-3 py-2.5">Monthly revenue</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-b border-border/70 last:border-0">
                <td className="px-3 py-2.5 font-medium">{p.name}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.audience}</td>
                <td className="num px-3 py-2.5">{p.price === 0 ? "Free" : `${money(p.price)}/mo`}</td>
                <td className="num px-3 py-2.5">{p.activeUsers.toLocaleString("en-IN")}</td>
                <td className="num px-3 py-2.5 font-semibold">{money(p.monthlyRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
