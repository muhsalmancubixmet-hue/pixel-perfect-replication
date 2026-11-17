import { useEffect, useState } from "react";
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
import { money } from "@/data/mock";
import type { Plan } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Revenue Analytics — Influencers.com SaaS Manager" },
      {
        name: "description",
        content: "Recurring revenue, plan mix, refunds and net revenue for Influencers.com.",
      },
      { property: "og:title", content: "Revenue Analytics — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Recurring revenue, plan mix, refunds and net revenue.",
      },
    ],
  }),
  component: ReportsPage,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const axis = { stroke: "var(--muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
};

function ReportsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [byPlan, setByPlan] = useState<any[]>([]);
  const [byAccountType, setByAccountType] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<Plan[]>([]);
  const [metrics, setMetrics] = useState({
    mrr: 0,
    latestSubscription: 0,
    latestServices: 0,
    latestRefunds: 0,
    net: 0,
  });

  useEffect(() => {
    let active = true;
    Promise.allSettled([adminApi.getBillingReports(), adminApi.getBillingPlans()]).then(
      ([rRes, pRes]) => {
        if (!active) return;
        if (rRes.status === "fulfilled" && rRes.value) {
          const d = rRes.value;
          const trendData = d.revenue_trends || [];
          setTrends(trendData);
          setByPlan(d.revenue_by_plan || []);
          setByAccountType(d.revenue_by_account_type || []);
          const latest =
            trendData.length > 0
              ? trendData[trendData.length - 1]
              : { subscription: 0, services: 0, refunds: 0 };
          const mrr = d.mrr || latest.subscription || 0;
          const net = (latest.subscription || 0) + (latest.services || 0) - (latest.refunds || 0);
          setMetrics({
            mrr,
            latestSubscription: latest.subscription || 0,
            latestServices: latest.services || 0,
            latestRefunds: latest.refunds || 0,
            net,
          });
        }
        if (pRes.status === "fulfilled" && pRes.value) {
          const list = pRes.value.results || (Array.isArray(pRes.value) ? pRes.value : []);
          setPlansList(
            list.map((p: any) => ({
              id: p.id,
              name: p.name,
              audience: p.account_type || p.audience || "General",
              price: (p.price_cents || 0) / 100,
              activeUsers: p.active_subscriptions_count || p.activeUsers || 0,
              monthlyRevenue: ((p.price_cents || 0) * (p.active_subscriptions_count || 0)) / 100,
            })),
          );
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Revenue analytics" description="How the platform earns, month by month." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="MRR" value={money(metrics.mrr)} icon={Repeat} delta={11.2} />
        <StatCard
          label="Subscription revenue"
          value={money(metrics.latestSubscription)}
          icon={Wallet}
          delta={9.4}
        />
        <StatCard
          label="Campaign & services"
          value={money(metrics.latestServices)}
          icon={TrendingUp}
          delta={14.6}
        />
        <StatCard
          label="Refunds"
          value={money(metrics.latestRefunds)}
          icon={ArrowDownRight}
          delta={-2.1}
        />
        <StatCard label="Net revenue" value={money(metrics.net)} icon={Wallet} delta={12.8} />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <ChartCard
          title="Revenue over time"
          subtitle="Subscription vs services vs refunds (base currency)"
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ left: -4, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
              <YAxis
                tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
                tickLine={false}
                axisLine={false}
                tick={axis}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="subscription"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="services"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="refunds"
                stroke="var(--destructive)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by plan" subtitle="Monthly revenue per paid plan">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPlan} layout="vertical" margin={{ left: 42, right: 12, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
                tickLine={false}
                axisLine={false}
                tick={axis}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tickLine={false}
                axisLine={false}
                tick={axis}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {byPlan.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by account type" subtitle="Creators vs businesses">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byAccountType}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={88}
                paddingAngle={3}
              >
                {byAccountType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
            {plansList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-xs text-muted-foreground">
                  No active plans recorded.
                </td>
              </tr>
            ) : (
              plansList.map((p) => (
                <tr key={p.id} className="border-b border-border/70 last:border-0">
                  <td className="px-3 py-2.5 font-medium">{p.name}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.audience}</td>
                  <td className="num px-3 py-2.5">
                    {p.price === 0 ? "Free" : `${money(p.price)}/mo`}
                  </td>
                  <td className="num px-3 py-2.5">{p.activeUsers.toLocaleString("en-IN")}</td>
                  <td className="num px-3 py-2.5 font-semibold">{money(p.monthlyRevenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
