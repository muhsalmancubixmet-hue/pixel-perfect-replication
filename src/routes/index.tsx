import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
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
import {
  BadgeCheck,
  Building2,
  Globe,
  Megaphone,
  Plus,
  Share2,
  Tags,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  auditLogs,
  campaignActivity,
  campaigns,
  categoryDistribution,
  compact,
  dashboardStats,
  influencers,
  money,
  revenueTrend,
  userGrowth,
} from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Influencers.com SaaS Manager" },
      {
        name: "description",
        content:
          "Platform overview for Influencers.com: creators, businesses, campaigns, websites and revenue at a glance.",
      },
      { property: "og:title", content: "Admin Dashboard — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Platform overview for Influencers.com: creators, businesses, campaigns, websites and revenue.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  { label: "Add Influencer", icon: UserPlus, to: "/influencers" },
  { label: "Add Business", icon: Building2, to: "/businesses" },
  { label: "Add Category", icon: Tags, to: "/categories" },
  { label: "Add Social Platform", icon: Share2, to: "/social-platforms" },
  { label: "Review Requests", icon: BadgeCheck, to: "/verification" },
  { label: "View Reports", icon: TrendingUp, to: "/reports" },
] as const;

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
];

const axis = { stroke: "var(--muted-foreground)", fontSize: 11 };

function ChartTooltip() {
  return (
    <Tooltip
      contentStyle={{
        background: "var(--popover)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        fontSize: 12,
        boxShadow: "var(--shadow-pop)",
      }}
      labelStyle={{ fontWeight: 600 }}
    />
  );
}

function Dashboard() {
  const recentCampaigns = campaigns.slice(0, 6);
  const newCreators = influencers.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Platform overview"
        description="Everything happening across Influencers.com right now."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/reports">
              <TrendingUp className="size-4" /> Revenue analytics
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Influencers" value={compact(dashboardStats.totalInfluencers)} delta={12.4} icon={Users} hint="vs last month" />
        <StatCard label="Active Influencers" value={compact(dashboardStats.activeInfluencers)} delta={8.1} icon={BadgeCheck} hint="last 30 days" />
        <StatCard label="Total Businesses" value={compact(dashboardStats.totalBusinesses)} delta={6.7} icon={Building2} hint="vs last month" />
        <StatCard label="Active Businesses" value={compact(dashboardStats.activeBusinesses)} delta={4.2} icon={Building2} hint="last 30 days" />
        <StatCard label="Active Campaigns" value={String(dashboardStats.activeCampaigns)} delta={15.3} icon={Megaphone} hint="live now" />
        <StatCard label="Total Websites" value={compact(dashboardStats.totalWebsites)} delta={9.8} icon={Globe} hint="creator sites" />
        <StatCard label="Monthly Revenue" value={money(dashboardStats.monthlyRevenue)} delta={11.2} icon={Wallet} hint="MRR" />
        <StatCard label="Pending Requests" value={String(dashboardStats.pendingRequests)} delta={-3.4} icon={BadgeCheck} hint="awaiting review" />
      </div>

      {/* Quick actions */}
      <div className="panel p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q) => (
            <Button key={q.label} asChild variant="outline" size="sm" className="justify-start gap-2">
              <Link to={q.to}>
                <q.icon className="size-4 text-primary" />
                <span className="truncate">{q.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="User growth" subtitle="Influencer and business registrations over time">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowth} margin={{ left: -18, right: 6, top: 6 }}>
              <defs>
                <linearGradient id="gInf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gBiz" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickLine={false} axisLine={false} tick={axis} />
              {ChartTooltip()}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="influencers" stroke="var(--chart-1)" fill="url(#gInf)" strokeWidth={2} />
              <Area type="monotone" dataKey="businesses" stroke="var(--chart-2)" fill="url(#gBiz)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Campaign activity" subtitle="Created, active and completed campaigns">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignActivity} margin={{ left: -18, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickLine={false} axisLine={false} tick={axis} />
              {ChartTooltip()}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="created" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="active" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" fill="var(--chart-4)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Creator growth" subtitle="New influencers per month">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth} margin={{ left: -18, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickLine={false} axisLine={false} tick={axis} />
              {ChartTooltip()}
              <Line type="monotone" dataKey="influencers" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Business growth" subtitle="New business accounts per month">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth} margin={{ left: -18, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickLine={false} axisLine={false} tick={axis} />
              {ChartTooltip()}
              <Line type="monotone" dataKey="businesses" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform revenue" subtitle="Subscription and service revenue (base currency)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ left: -6, right: 6, top: 6 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} tickLine={false} axisLine={false} tick={axis} />
              {ChartTooltip()}
              <Area type="monotone" dataKey="subscription" stroke="var(--chart-4)" fill="url(#gRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="services" stroke="var(--chart-3)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Creator categories" subtitle="Distribution of creators by category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={2}>
                {categoryDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              {ChartTooltip()}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="panel xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Recent campaigns</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/campaigns">View all</Link>
            </Button>
          </div>
          <div className="divide-y divide-border/70">
            {recentCampaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.business} · {c.category} · {c.location}
                  </p>
                </div>
                <span className="num hidden text-sm font-semibold sm:block">{money(c.budget, c.currency)}</span>
                <StatusBadge value={c.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Newest creators</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/influencers">All</Link>
              </Button>
            </div>
            <div className="divide-y divide-border/70">
              {newCreators.map((i) => (
                <Link
                  key={i.id}
                  to="/influencers/$id"
                  params={{ id: i.id }}
                  className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-muted/50"
                >
                  <UserAvatar src={i.avatar} name={i.name} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{i.location.city}, {i.location.country}</p>
                  </div>
                  <span className="num text-xs text-muted-foreground">{compact(i.followers)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Latest admin activity</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/audit-logs">Logs</Link>
              </Button>
            </div>
            <div className="divide-y divide-border/70">
              {auditLogs.slice(0, 5).map((l) => (
                <div key={l.id} className="px-4 py-2">
                  <p className="text-sm font-medium">{l.action}</p>
                  <p className="num truncate text-xs text-muted-foreground">
                    {l.admin} · {l.datetime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Plus className="size-3.5" />
        Prototype build — all data shown is fictional demo data (Kerala is one sample market among several worldwide); no live backend is connected yet.
      </div>
    </div>
  );
}
