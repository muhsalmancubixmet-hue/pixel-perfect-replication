import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaignsForBusiness, getBusiness, money, payments, requirements } from "@/data/mock";
import { placeLabel } from "@/data/geo";
import { adminApi } from "@/lib/admin-api";
import type { Campaign, Payment, Requirement } from "@/data/types";

export const Route = createFileRoute("/businesses/$id")({
  loader: async ({ params }) => {
    try {
      const biz = await adminApi.getBusinessDetail(params.id);
      if (biz) {
        return {
          business: {
            id: biz.id,
            name: biz.name || biz.company_name,
            type: biz.type || biz.business_type || "Brand",
            email: biz.email || biz.contact_email || "",
            phone: biz.contact_phone || biz.phone || "",
            contactName: biz.contact_name || biz.contactName || "",
            about: biz.about || "No profile bio provided.",
            location: biz.location || { city: biz.hq_city || "Remote", country: "Global" },
            status: (biz.status || "active").toLowerCase(),
            verification: (biz.verification_status || biz.verification || "unverified").toLowerCase(),
            subscription: "Pro",
            joined: biz.joined || (biz.created_at ? new Date(biz.created_at).toLocaleDateString() : "Recent"),
            campaigns: biz.campaigns || 0,
            activity: [],
          },
        };
      }
    } catch (err) {
      console.error("Failed to load live business:", err);
    }
    const business = getBusiness(params.id);
    if (!business) throw notFound();
    return { business };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Business unavailable — SaaS Manager" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.business.name} — Business account`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.business.about },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.business.about },
      ],
    };
  },
  component: BusinessDetail,
});

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function BusinessDetail() {
  const { business: biz } = Route.useLoaderData();
  const [bizCampaigns, setBizCampaigns] = useState<Campaign[]>([]);
  const [bizRequirements, setBizRequirements] = useState<Requirement[]>([]);
  const [bizPayments, setBizPayments] = useState<Payment[]>([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      adminApi.getCampaigns({ business_id: biz.id }),
      adminApi.getRequirements({ business: biz.name }),
      adminApi.getPayments({ user: biz.name }),
    ]).then(([cRes, rRes, pRes]) => {
      if (!active) return;
      if (cRes.status === "fulfilled") {
        const val = cRes.value?.results || (Array.isArray(cRes.value) ? cRes.value : []);
        setBizCampaigns(val);
      }
      if (rRes.status === "fulfilled") {
        const val = rRes.value?.results || (Array.isArray(rRes.value) ? rRes.value : []);
        setBizRequirements(val);
      }
      if (pRes.status === "fulfilled") {
        const val = pRes.value?.results || (Array.isArray(pRes.value) ? pRes.value : []);
        setBizPayments(val);
      }
    });
    return () => { active = false; };
  }, [biz.id, biz.name]);

  const handleSuspend = async () => {
    try {
      await adminApi.moderateBusiness(biz.id, { status: "SUSPENDED" });
      saved("Account suspended", biz.name);
    } catch {
      saved("Account action simulated", biz.name);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit gap-1.5 px-2">
        <Link to="/businesses">
          <ArrowLeft className="size-4" /> Back to businesses
        </Link>
      </Button>

      <div className="panel p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <UserAvatar name={biz.name} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{biz.name}</h1>
              <StatusBadge value={biz.status} />
              <StatusBadge value={biz.verification} />
            </div>
            <p className="num text-sm text-muted-foreground">
              {biz.type} · {placeLabel(biz.location)}
            </p>
            <p className="mt-2 max-w-2xl text-sm">{biz.about}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => saved("Edit business", biz.name)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSuspend}>
              Suspend
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="panel p-4">
          <h3 className="mb-2 text-sm font-semibold">Contact</h3>
          <Field label="Contact person" value={biz.contactName} />
          <Field label="Email" value={biz.email} />
          <Field label="Phone" value={biz.phone} />
          <Field label="Category" value={biz.type} />
          <Field label="Joined" value={biz.joined} />
        </div>
        <div className="panel p-4">
          <h3 className="mb-2 text-sm font-semibold">Subscription</h3>
          <Field label="Plan" value={biz.subscription} />
          <Field label="Billing" value="Monthly · UPI autopay" />
          <Field label="Seats" value={biz.subscription === "Agency" ? "Unlimited" : biz.subscription === "Pro" ? "3" : "1"} />
          <Field label="Renews" value="05 Oct 2026" />
        </div>
        <div className="panel p-4">
          <h3 className="mb-2 text-sm font-semibold">Usage</h3>
          <Field label="Campaigns" value={bizCampaigns.length} />
          <Field label="Requirements" value={bizRequirements.length} />
          <Field label="Shortlists" value={bizCampaigns.length * 4 + 3} />
          <Field label="Payments" value={bizPayments.length} />
        </div>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-3">
          <div className="panel divide-y divide-border/70">
            {bizCampaigns.length === 0 && <p className="p-4 text-sm text-muted-foreground">No campaigns yet.</p>}
            {bizCampaigns.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="num text-xs text-muted-foreground">
                    {c.category} · {c.creators} creators · due {c.deadline}
                  </p>
                </div>
                <span className="num text-sm font-semibold">{money(c.budget, c.currency)}</span>
                <StatusBadge value={c.status} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="mt-3">
          <div className="panel divide-y divide-border/70">
            {bizRequirements.length === 0 && <p className="p-4 text-sm text-muted-foreground">No requirements posted.</p>}
            {bizRequirements.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="num text-xs text-muted-foreground">
                    {r.applications} applications · {r.creatorsNeeded} needed
                  </p>
                </div>
                <span className="num text-sm font-semibold">{money(r.budget, r.currency)}</span>
                <StatusBadge value={r.status} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-3">
          <div className="panel divide-y divide-border/70">
            {bizPayments.length === 0 && <p className="p-4 text-sm text-muted-foreground">No payments recorded.</p>}
            {bizPayments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="num truncate text-sm font-medium">{p.id}</p>
                  <p className="num text-xs text-muted-foreground">
                    {p.type} · {p.method} · {p.date}
                  </p>
                </div>
                <span className="num text-sm font-semibold">{money(p.amount, p.currency)}</span>
                <StatusBadge value={p.status} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-3">
          <div className="panel divide-y divide-border/70">
            {biz.activity.map((a, i) => (
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
