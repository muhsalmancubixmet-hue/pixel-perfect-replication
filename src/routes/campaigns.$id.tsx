import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Lock, Target, Users } from "lucide-react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { campaignBids, campaignBrief, compact, getCampaign, money } from "@/data/mock";
import type { Campaign, CampaignBid } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

const STATUSES: Campaign["status"][] = ["draft", "published", "applications", "shortlisted", "active", "content submitted", "completed", "cancelled"];

export const Route = createFileRoute("/campaigns/$id")({
  loader: async ({ params }) => {
    try {
      const live = await adminApi.getCampaignDetail(params.id);
      if (live) {
        return { campaign: live as Campaign };
      }
    } catch (err) {
      console.error("Failed to load live campaign:", err);
    }
    const campaign = getCampaign(params.id);
    if (!campaign) throw notFound();
    return { campaign };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Campaign unavailable — SaaS Manager" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.campaign.title} — Campaign detail`;
    const description = `Brief, escrow and creator bids for ${loaderData.campaign.title} by ${loaderData.campaign.business}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: CampaignNotFound,
  component: CampaignDetail,
});

function CampaignNotFound() {
  return (
    <div className="panel p-8 text-center">
      <p className="text-sm font-semibold">Campaign not found</p>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link to="/campaigns">Back to campaigns</Link>
      </Button>
    </div>
  );
}

function CampaignDetail() {
  const { campaign } = Route.useLoaderData();
  const brief = campaignBrief(campaign);
  const [status, setStatus] = useState<Campaign["status"]>(campaign.status);
  const [bids, setBids] = useState<CampaignBid[]>(() => campaignBids(campaign));
  const setBid = (b: CampaignBid, s: CampaignBid["status"]) => {
    setBids((all) => all.map((x) => (x.id === b.id ? { ...x, status: s } : x)));
    saved(`Bid ${s}`, `${b.name} · ${money(b.fee, b.currency)}`);
  };

  const actions = (b: CampaignBid) => (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Button size="sm" variant="outline" className="h-9" disabled={b.status === "shortlisted" || b.status === "accepted"} onClick={() => setBid(b, "shortlisted")}>
        Shortlist
      </Button>
      <Button size="sm" className="h-9" disabled={b.status === "accepted"} onClick={() => setBid(b, "accepted")}>
        Accept bid
      </Button>
      <Button size="sm" variant="ghost" className="h-9 text-destructive" disabled={b.status === "rejected"} onClick={() => setBid(b, "rejected")}>
        Reject
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Link to="/campaigns" className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All campaigns
      </Link>

      <div className="panel flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="num text-xs text-muted-foreground">{campaign.id}</p>
          <h1 className="text-xl font-bold tracking-tight">{campaign.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Link to="/businesses/$id" params={{ id: campaign.businessId }} className="font-medium text-primary hover:underline">
              {campaign.business}
            </Link>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-semibold">{campaign.category}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-accent px-2 py-0.5 font-semibold capitalize text-accent-foreground">
              <Lock className="size-3" /> {brief.escrow} · {money(campaign.budget, campaign.currency)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <Select
            value={status}
            onValueChange={async (v) => {
              setStatus(v as Campaign["status"]);
              try {
                await adminApi.moderateCampaign(campaign.id, { status: v.toUpperCase() });
              } catch (err) {
      console.error("Failed to load live campaign:", err);
    }
              saved("Campaign status changed", v);
            }}
          >
            <SelectTrigger className="h-10 w-48 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <section className="panel p-4 lg:w-80 lg:shrink-0">
          <h2 className="text-sm font-semibold">Campaign brief</h2>
          <dl className="mt-3 flex flex-col gap-3 text-sm">
            <div className="flex gap-2">
              <Target className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Objective</dt>
                <dd className="font-medium">{brief.objective}</dd>
              </div>
            </div>
            <div className="flex gap-2">
              <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Target audience</dt>
                <dd className="font-medium">{brief.audience}</dd>
              </div>
            </div>
            <div className="flex gap-2">
              <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Deadline</dt>
                <dd className="num font-medium">{campaign.deadline}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Deliverables</dt>
              <dd>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {brief.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </section>

        <section id="bids" className="panel min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Creator applications &amp; bids</h2>
            <span className="num text-xs text-muted-foreground">
              {bids.filter((b) => b.status === "accepted").length} accepted · {bids.length} total
            </span>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  {["Influencer", "Category", "Followers", "Proposed fee", "Pitch", "Match", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                  <th className="sticky right-0 bg-muted px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {bids.map((b) => (
                  <tr key={b.id} className="group border-b border-border/70 last:border-0 hover:bg-muted/40">
                    <td className="px-3 py-2.5">
                      <Link to="/influencers/$id" params={{ id: b.influencerId }} className="flex items-center gap-2">
                        <UserAvatar src={b.avatar} name={b.name} size={30} />
                        <span className="truncate font-medium">{b.name}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{b.category}</td>
                    <td className="num px-3 py-2.5 text-xs">{compact(b.followers)}</td>
                    <td className="num px-3 py-2.5 font-semibold">{money(b.fee, b.currency)}</td>
                    <td className="max-w-[16rem] px-3 py-2.5 text-xs text-muted-foreground">
                      <p className="line-clamp-2">{b.pitch}</p>
                    </td>
                    <td className="num px-3 py-2.5 text-xs font-semibold">{b.match}%</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge value={b.status} />
                    </td>
                    <td className="sticky right-0 bg-card px-3 py-2.5 group-hover:bg-muted">{actions(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 p-3 md:hidden">
            {bids.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar src={b.avatar} name={b.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.name}</p>
                    <p className="num text-xs text-muted-foreground">
                      {b.category} · {compact(b.followers)} · {b.match}% match
                    </p>
                  </div>
                  <StatusBadge value={b.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{b.pitch}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="num text-sm font-bold">{money(b.fee, b.currency)}</span>
                  {actions(b)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
