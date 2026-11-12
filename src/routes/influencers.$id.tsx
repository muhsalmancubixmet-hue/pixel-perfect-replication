import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compact, getInfluencer, money } from "@/data/mock";
import { adminApi } from "@/lib/admin-api";
import type { Influencer } from "@/data/types";

export const Route = createFileRoute("/influencers/$id")({
  loader: async ({ params }) => {
    try {
      const res = await adminApi.getInfluencerDetail(params.id);
      if (!res) throw notFound();

      const mappedSocials = Array.isArray(res.socials)
        ? res.socials.map((s: any) => ({
            platform: s.platform_name || s.platform_slug || s.platform?.name || "Instagram",
            username: s.username ? (s.username.startsWith("@") ? s.username : `@${s.username}`) : "@creator",
            followers: Number(s.followers_count || 0),
            engagement: Number(s.engagement_rate || 0),
            verified: Boolean(s.is_verified),
            lastSynced: s.last_synced_at ? new Date(s.last_synced_at).toLocaleDateString() : "Never",
          }))
        : [];

      const mappedPortfolio = Array.isArray(res.portfolio)
        ? res.portfolio.map((p: any) => ({
            id: String(p.id),
            title: p.title || "Portfolio Item",
            brand: p.brand_name || p.brand || "Independent",
            type: (p.media_type || p.format_tag || "image") as "image" | "video",
            date: p.deliverable_date || (p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"),
          }))
        : [];

      const mappedServices = Array.isArray(res.services)
        ? res.services.map((s: any) => ({
            id: String(s.id),
            name: s.name || s.service_type_name || "Custom Deliverable",
            price: Number(s.starting_price_cents ? s.starting_price_cents / 100 : s.price_cents ? s.price_cents / 100 : s.price || 0),
            turnaround: s.turnaround_days ? `${s.turnaround_days} days` : (s.deliverables_spec || "3-5 days"),
          }))
        : [];

      const mappedActivity = Array.isArray(res.activity)
        ? res.activity.map((a: any) => ({
            date: a.created_at ? new Date(a.created_at).toLocaleString() : "Recent",
            text: a.action ? `${a.action.replace(/_/g, " ")} (${a.actor_email || "System"})` : (a.text || "Event logged"),
          }))
        : [];

      const totalFollowers = mappedSocials.length > 0
        ? mappedSocials.reduce((acc: number, curr: { followers: number }) => acc + curr.followers, 0)
        : Number(res.views_count || 0);

      const mapped: Influencer = {
        id: String(res.id),
        name: res.display_name || res.name || res.handle || "Creator",
        handle: res.handle || "creator",
        avatar: res.photo_url || res.avatar || "",
        bio: res.bio || res.about || "",
        categories: Array.isArray(res.categories)
          ? res.categories.map((c: any) => (typeof c === "string" ? c : c.category?.name || c.name || "General"))
          : ["Creator"],
        languages: Array.isArray(res.languages)
          ? res.languages.map((l: any) => (typeof l === "string" ? l : l.language_name || l.language?.name || l.name || l.language_code || "English"))
          : ["English"],
        location: {
          city: res.primary_location_details?.name || res.primary_location?.name || res.location_text || res.primary_city || "Kochi",
          district: "",
          region: "",
          country: res.primary_location_details?.country_code || "India",
          countryCode: res.primary_location_details?.country_code || "IN",
          lat: res.primary_location_details?.latitude ? Number(res.primary_location_details.latitude) : 9.9312,
          lng: res.primary_location_details?.longitude ? Number(res.primary_location_details.longitude) : 76.2673,
          currency: res.currency || "INR",
          languages: ["English"],
        },
        serviceLocations: ["Worldwide"],
        travelAvailable: res.travel_available ?? true,
        remoteAvailable: res.remote_available ?? true,
        currency: res.currency || "INR",
        followers: totalFollowers,
        engagement: mappedSocials.length > 0 ? (mappedSocials.reduce((a: number, b: { engagement: number }) => a + b.engagement, 0) / mappedSocials.length) : 3.8,
        platforms: mappedSocials.length > 0 ? Array.from(new Set(mappedSocials.map((s: { platform: string }) => s.platform))) : ["Instagram"],
        socials: mappedSocials,
        portfolio: mappedPortfolio,
        services: mappedServices,
        verification: (res.verification_status ? res.verification_status.toLowerCase() : "unverified") as Influencer["verification"],
        status: (res.status ? res.status.toLowerCase() : "active") as Influencer["status"],
        websiteStatus: res.website?.is_published ? "published" : (res.website ? "draft" : "none"),
        websiteUrl: res.website?.subdomain ? `http://${res.website.subdomain}.localhost:8081` : (res.website?.custom_domain || undefined),
        websiteTemplate: res.website?.template || res.website?.theme || "Standard",
        websiteVisits: res.website?.visitors_count || res.website?.page_views || 0,
        websitePublished: res.website?.published_at ? new Date(res.website.published_at).toLocaleDateString() : undefined,
        subscription: "Influencer Free",
        joined: res.account?.created_at
          ? new Date(res.account.created_at).toLocaleDateString()
          : (res.created_at ? new Date(res.created_at).toLocaleDateString() : "Recent"),
        lastLogin: res.account?.last_login ? new Date(res.account.last_login).toLocaleDateString() : "Never",
        activity: mappedActivity,
      };
      return { influencer: mapped as Influencer };
    } catch (err) {
      console.error("Failed to load live influencer data:", err);
      const fallback = getInfluencer(params.id);
      if (!fallback) throw notFound();
      return { influencer: fallback as Influencer };
    }
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
  const router = useRouter();
  const { influencer } = Route.useLoaderData();
  const inf = influencer as Influencer;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleVerify = async () => {
    try {
      setIsUpdating(true);
      await adminApi.moderateInfluencer(inf.id, { verification_status: "VERIFIED" });
      toast.success(`Verification approved for ${inf.name}`);
      router.invalidate();
    } catch (err: any) {
      toast.error("Failed to verify creator", {
        description: err.response?.data?.detail || err.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSuspend = async () => {
    try {
      setIsUpdating(true);
      const newStatus = inf.status === "suspended" ? "ACTIVE" : "SUSPENDED";
      await adminApi.moderateInfluencer(inf.id, { status: newStatus });
      toast.success(`Creator status changed to ${newStatus}`);
      router.invalidate();
    } catch (err: any) {
      toast.error("Failed to update status", {
        description: err.response?.data?.detail || err.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreviewWebsite = () => {
    if (inf.websiteUrl) {
      window.open(inf.websiteUrl, "_blank");
    } else {
      toast.info("No website published for this creator yet");
    }
  };

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
            <p className="mt-2 max-w-2xl text-sm">{inf.bio || "No biography provided."}</p>
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
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating || inf.verification === "verified"}
              onClick={handleVerify}
            >
              {inf.verification === "verified" ? "Verified" : "Verify"}
            </Button>
            <Button
              variant={inf.status === "suspended" ? "default" : "destructive"}
              size="sm"
              disabled={isUpdating}
              onClick={handleSuspend}
            >
              {inf.status === "suspended" ? "Reactivate" : "Suspend"}
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
            <p className="num text-lg font-bold">{inf.engagement.toFixed(1)}%</p>
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
          <TabsTrigger value="social">Social accounts ({inf.socials.length})</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio ({inf.portfolio.length})</TabsTrigger>
          <TabsTrigger value="services">Services ({inf.services.length})</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="activity">Activity ({inf.activity.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-3">
          <div className="panel overflow-x-auto">
            {inf.socials.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No social media accounts linked yet.
              </div>
            ) : (
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
                  {inf.socials.map((s, idx) => (
                    <tr key={`${s.platform}-${idx}`} className="border-b border-border/70 last:border-0">
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
            )}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-3">
          {inf.portfolio.length === 0 ? (
            <div className="panel p-8 text-center text-sm text-muted-foreground">
              No portfolio projects submitted yet.
            </div>
          ) : (
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
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-3">
          {inf.services.length === 0 ? (
            <div className="panel p-8 text-center text-sm text-muted-foreground">
              No commercial packages or bookable services configured.
            </div>
          ) : (
            <div className="panel divide-y divide-border/70">
              {inf.services.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Turnaround {s.turnaround}</p>
                  </div>
                  <p className="num text-sm font-bold">{money(s.price, inf.currency)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="website" className="mt-3">
          <div className="panel p-4">
            {inf.websiteStatus === "none" ? (
              <p className="text-sm text-muted-foreground">This creator has not configured or launched a bio website yet.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <span className="num text-sm font-semibold">{inf.websiteUrl}</span>
                  <StatusBadge value={inf.websiteStatus} />
                  <Button variant="ghost" size="sm" className="ml-auto gap-1.5" onClick={handlePreviewWebsite}>
                    Preview <ExternalLink className="size-3.5" />
                  </Button>
                </div>
                <div className="mt-3">
                  <Field label="Template" value={inf.websiteTemplate} />
                  <Field label="Domain" value={inf.websiteUrl} />
                  <Field label="Visits (30 days)" value={compact(inf.websiteVisits ?? 0)} />
                  <Field label="Published" value={inf.websitePublished || "Active"} />
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
            <Field label="Location" value={[inf.location.city, inf.location.district, inf.location.region, inf.location.country].filter(Boolean).join(", ")} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-3">
          {inf.activity.length === 0 ? (
            <div className="panel p-8 text-center text-sm text-muted-foreground">
              No audit logs or moderation history on record.
            </div>
          ) : (
            <div className="panel divide-y divide-border/70">
              {inf.activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <p className="flex-1 text-sm">{a.text}</p>
                  <p className="num text-xs text-muted-foreground">{a.date}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
