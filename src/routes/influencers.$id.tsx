import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compact, getInfluencer, inr } from "@/data/mock";

export const Route = createFileRoute("/influencers/$id")({
  loader: ({ params }) => {
    const influencer = getInfluencer(params.id);
    if (!influencer) throw notFound();
    return { influencer };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Creator unavailable — SaaS Manager" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.influencer.name} — Creator profile`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.influencer.bio },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.influencer.bio },
      ],
    };
  },
  component: InfluencerDetail,
});

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function InfluencerDetail() {
  const { influencer: inf } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit gap-1.5 px-2">
        <Link to="/influencers">
          <ArrowLeft className="size-4" /> Back to influencers
        </Link>
      </Button>

      <div className="panel p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <UserAvatar src={inf.avatar} name={inf.name} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{inf.name}</h1>
              <StatusBadge value={inf.status} />
              <StatusBadge value={inf.verification} />
            </div>
            <p className="num text-sm text-muted-foreground">
              @{inf.handle} · {inf.id}
            </p>
            <p className="mt-2 max-w-2xl text-sm">{inf.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {inf.categories.map((c) => (
                <span key={c} className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  {c}
                </span>
              ))}
              {inf.languages.map((l) => (
                <span key={l} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={mockAction("Edit creator", inf.name)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={mockAction("Verification approved", inf.name)}>
              Verify
            </Button>
            <Button variant="destructive" size="sm" onClick={mockAction("Account suspended", inf.name)}>
              Suspend
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Followers</p>
            <p className="num text-lg font-bold">{compact(inf.followers)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Engagement</p>
            <p className="num text-lg font-bold">{inf.engagement}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Platforms</p>
            <p className="num text-lg font-bold">{inf.platforms.length}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Plan</p>
            <p className="text-lg font-bold">{inf.subscription}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="social">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="social">Social accounts</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-3">
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2.5">Platform</th>
                  <th className="px-3 py-2.5">Username</th>
                  <th className="px-3 py-2.5">Followers</th>
                  <th className="px-3 py-2.5">Engagement</th>
                  <th className="px-3 py-2.5">Verification</th>
                  <th className="px-3 py-2.5">Last synced</th>
                </tr>
              </thead>
              <tbody>
                {inf.socials.map((s) => (
                  <tr key={s.platform} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5 font-medium">{s.platform}</td>
                    <td className="num px-3 py-2.5 text-muted-foreground">{s.username}</td>
                    <td className="num px-3 py-2.5 font-semibold">{compact(s.followers)}</td>
                    <td className="num px-3 py-2.5">{s.engagement}%</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge value={s.verified ? "verified" : "unverified"} />
                    </td>
                    <td className="num px-3 py-2.5 text-muted-foreground">{s.lastSynced}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inf.portfolio.map((p) => (
              <div key={p.id} className="panel p-3">
                <div className="mb-2 grid h-28 place-items-center rounded-md bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  {p.type}
                </div>
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="num text-xs text-muted-foreground">
                  {p.brand} · {p.date}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-3">
          <div className="panel divide-y divide-border/70">
            {inf.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Turnaround {s.turnaround}</p>
                </div>
                <p className="num text-sm font-bold">{inr(s.price)}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="website" className="mt-3">
          <div className="panel p-4">
            {inf.websiteStatus === "none" ? (
              <p className="text-sm text-muted-foreground">This creator has not created a website yet.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <span className="num text-sm font-semibold">{inf.websiteUrl}</span>
                  <StatusBadge value={inf.websiteStatus} />
                  <Button variant="ghost" size="sm" className="ml-auto gap-1.5" onClick={mockAction("Preview website", inf.websiteUrl!)}>
                    Preview <ExternalLink className="size-3.5" />
                  </Button>
                </div>
                <div className="mt-3">
                  <Field label="Template" value={inf.websiteTemplate} />
                  <Field label="Domain" value={inf.websiteUrl} />
                  <Field label="Visits (30 days)" value={compact(inf.websiteVisits ?? 0)} />
                  <Field label="Published" value={inf.websitePublished} />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-3">
          <div className="panel p-4">
            <Field label="Status" value={<StatusBadge value={inf.status} />} />
            <Field label="Created" value={inf.joined} />
            <Field label="Last login" value={inf.lastLogin} />
            <Field label="Subscription" value={inf.subscription} />
            <Field label="Verification" value={<StatusBadge value={inf.verification} />} />
            <Field label="Location" value={`${inf.city}, ${inf.district}`} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-3">
          <div className="panel divide-y divide-border/70">
            {inf.activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="size-1.5 rounded-full bg-primary" />
                <p className="flex-1 text-sm">{a.text}</p>
                <p className="num text-xs text-muted-foreground">{a.date}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
