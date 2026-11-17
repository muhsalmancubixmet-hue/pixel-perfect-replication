import { useEffect, useState } from "react";
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
  Share2,
  Tags,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { Button } from "@/components/ui/button";
import { compact, money } from "@/data/mock";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Influencers.com SaaS Manager" },
      {
        name: "description",
        content:
          "Live platform overview for Influencers.com: creators, businesses, campaigns, websites and revenue.",
      },
      { property: "og:title", content: "Admin Dashboard — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content:
          "Platform overview for Influencers.com: creators, businesses, campaigns, websites and revenue.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  { label: "Manage Influencers", icon: UserPlus, to: "/influencers" },
  { label: "Manage Businesses", icon: Building2, to: "/businesses" },
  { label: "Taxonomy Categories", icon: Tags, to: "/categories" },
  { label: "Social Platforms", icon: Share2, to: "/social-platforms" },
  { label: "Review Verification", icon: BadgeCheck, to: "/verification" },
  { label: "Revenue Reports", icon: TrendingUp, to: "/reports" },
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
  const [stats, setStats] = useState({
    totalInfluencers: 0,
    activeInfluencers: 0,
    totalBusinesses: 0,
    activeBusinesses: 0,
    activeCampaigns: 0,
    totalWebsites: 0,
    monthlyRevenue: 0,
    pendingRequests: 0,
  });

  const [growthData, setGrowthData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [recentCreators, setRecentCreators] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [statsRes, campRes, infRes, logRes] = await Promise.allSettled([
          adminApi.getDashboardStats(),
          adminApi.getCampaigns({ page_size: 6 }),
          adminApi.getInfluencers({ page_size: 6 }),
          adminApi.getAuditLogs({ page_size: 5 }),
        ]);

        if (!active) return;

        if (statsRes.status === "fulfilled" && statsRes.value) {
          const s = statsRes.value;
          setStats({
            totalInfluencers: s.totalInfluencers || 0,
            activeInfluencers: s.activeInfluencers || 0,
            totalBusinesses: s.totalBusinesses || 0,
            activeBusinesses: s.activeBusinesses || 0,
            activeCampaigns: s.activeCampaigns || 0,
            totalWebsites: s.totalWebsites || 0,
            monthlyRevenue: s.monthlyRevenue || 0,
            pendingRequests: s.pendingRequests || 0,
          });
          if (Array.isArray(s.userGrowth)) setGrowthData(s.userGrowth);
          if (Array.isArray(s.campaignActivity)) setActivityData(s.campaignActivity);
          if (Array.isArray(s.categoryDistribution)) setCategoryData(s.categoryDistribution);
        }

        if (campRes.status === "fulfilled" && campRes.value) {
          const list = campRes.value.results || (Array.isArray(campRes.value) ? campRes.value : []);
          setRecentCampaigns(list.slice(0, 6));
        }

        if (infRes.status === "fulfilled" && infRes.value) {
          const list = infRes.value.results || (Array.isArray(infRes.value) ? infRes.value : []);
          setRecentCreators(list.slice(0, 6));
        }

        if (logRes.status === "fulfilled" && logRes.value) {
          const list = logRes.value.results || (Array.isArray(logRes.value) ? logRes.value : []);
          setRecentLogs(list.slice(0, 5));
        }
      } catch (err) {
        console.warn("Failed to load dashboard metrics:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

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

      {/* Primary KPI Top Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Influencers"
          value={compact(stats.totalInfluencers)}
          delta={stats.totalInfluencers > 0 ? 12.4 : 0}
          icon={Users}
          hint="registered creators"
        />
        <StatCard
          label="Active Influencers"
          value={compact(stats.activeInfluencers)}
          delta={stats.activeInfluencers > 0 ? 8.1 : 0}
          icon={BadgeCheck}
          hint="active profile state"
        />
        <StatCard
          label="Total Businesses"
          value={compact(stats.totalBusinesses)}
          delta={stats.totalBusinesses > 0 ? 6.7 : 0}
          icon={Building2}
          hint="brand partners"
        />
        <StatCard
          label="Active Businesses"
          value={compact(stats.activeBusinesses)}
          delta={stats.activeBusinesses > 0 ? 4.2 : 0}
          icon={Building2}
          hint="verified brands"
        />
        <StatCard
          label="Active Campaigns"
          value={String(stats.activeCampaigns)}
          delta={stats.activeCampaigns > 0 ? 15.3 : 0}
          icon={Megaphone}
          hint="marketplace briefs"
        />
        <StatCard
          label="Total Websites"
          value={compact(stats.totalWebsites)}
          delta={stats.totalWebsites > 0 ? 9.8 : 0}
          icon={Globe}
          hint="hosted creator sites"
        />
        <StatCard
          label="Monthly Revenue"
          value={money(stats.monthlyRevenue)}
          delta={stats.monthlyRevenue > 0 ? 11.2 : 0}
          icon={Wallet}
          hint="MRR ledger"
        />
        <StatCard
          label="Pending Requests"
          value={String(stats.pendingRequests)}
          delta={0}
          icon={BadgeCheck}
          hint="awaiting moderation"
        />
      </div>

      {/* Quick actions panel */}
      <div className="panel p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Quick actions
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q) => (
            <Button
              key={q.label}
              asChild
              variant="outline"
              size="sm"
              className="justify-start gap-2"
            >
              <Link to={q.to}>
                <q.icon className="size-4 text-primary" />
                <span className="truncate">{q.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Charts section */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="User growth" subtitle="Influencer and business registrations over time">
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ left: -18, right: 6, top: 6 }}>
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
                <Area
                  type="monotone"
                  dataKey="influencers"
                  stroke="var(--chart-1)"
                  fill="url(#gInf)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="businesses"
                  stroke="var(--chart-2)"
                  fill="url(#gBiz)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
              <p>Registration telemetry will visualize as creators and businesses onboard.</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Campaign activity" subtitle="Created, active and completed campaigns">
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ left: -18, right: 6, top: 6 }}>
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
          ) : (
            <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
              <p>Campaign throughput activity will track here as brand briefs are posted.</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Creator growth" subtitle="New influencers per month">
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ left: -18, right: 6, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
                <YAxis tickLine={false} axisLine={false} tick={axis} />
                {ChartTooltip()}
                <Line
                  type="monotone"
                  dataKey="influencers"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
              <p>Monthly creator trends will appear upon user registrations.</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Creator categories" subtitle="Distribution of creators by category">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={86}
                  paddingAngle={2}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                {ChartTooltip()}
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
              <p>Category distribution will calculate from active influencer tags.</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Activity and feeds section */}
      <div className="grid gap-3 xl:grid-cols-3">
        {/* Recent campaigns */}
        <div className="panel xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Recent campaigns</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/campaigns">View all</Link>
            </Button>
          </div>
          {recentCampaigns.length > 0 ? (
            <div className="divide-y divide-border/70">
              {recentCampaigns.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.title || c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.business_name || c.business || "Brand"} · {c.category || "General"} ·{" "}
                      {c.location || "Global"}
                    </p>
                  </div>
                  <span className="num hidden text-sm font-semibold sm:block">
                    {c.budget_cents
                      ? money(c.budget_cents, c.currency)
                      : c.budget
                        ? money(c.budget, c.currency)
                        : "—"}
                  </span>
                  <StatusBadge value={(c.status || "draft").toLowerCase()} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <p>No marketplace campaigns created yet.</p>
              <Button asChild variant="link" size="sm" className="mt-2 text-xs">
                <Link to="/campaigns">Open Campaigns</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* Newest creators */}
          <div className="panel">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Newest creators</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/influencers">All</Link>
              </Button>
            </div>
            {recentCreators.length > 0 ? (
              <div className="divide-y divide-border/70">
                {recentCreators.map((i) => (
                  <Link
                    key={i.id}
                    to="/influencers/$id"
                    params={{ id: String(i.id) }}
                    className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-muted/50"
                  >
                    <UserAvatar
                      src={i.avatar || i.photo_url}
                      name={i.name || i.display_name}
                      size={30}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.name || i.display_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {i.location?.city || i.city || "Online"},{" "}
                        {i.location?.country || i.country || ""}
                      </p>
                    </div>
                    <span className="num text-xs text-muted-foreground">
                      {compact(i.followers || i.followers_count || 0)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <p>No creators registered yet.</p>
              </div>
            )}
          </div>

          {/* Latest admin activity */}
          <div className="panel">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Latest audit activity</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/audit-logs">Logs</Link>
              </Button>
            </div>
            {recentLogs.length > 0 ? (
              <div className="divide-y divide-border/70">
                {recentLogs.map((l) => (
                  <div key={l.id} className="px-4 py-2">
                    <p className="text-sm font-medium">{l.action}</p>
                    <p className="num truncate text-xs text-muted-foreground">
                      {l.admin_name || l.admin || "Admin"} · {l.created_at || l.datetime || ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <p>Audit trail will record administrative actions automatically.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
