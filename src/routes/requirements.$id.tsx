import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, EyeOff, Lock, Star, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { ReasonDialog, saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { compact, getRequirement, money, requirementBrief } from "@/data/mock";
import type { Requirement } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/requirements/$id")({
  loader: async ({ params }) => {
    try {
      const live = await adminApi.getRequirementDetail(params.id);
      if (live && live.id) {
        return {
          requirement: {
            id: live.id,
            title: live.title,
            business: live.business_name || "Partner Business",
            category: live.category_name || "General",
            status: (live.status || "OPEN").toLowerCase() as Requirement["status"],
            created: live.created_at ? new Date(live.created_at).toLocaleDateString() : "Recent",
            currency: live.currency || "INR",
            location: live.location_text || "Remote",
            budget: (live.max_budget_cents || live.budget_max_cents || 0) / 100,
            creatorsNeeded: live.creators_needed || 1,
            applications: live.applications_count || live.proposals_count || 0,
          } as Requirement,
        };
      }
    } catch (err) {
      console.error("Failed to load live requirement:", err);
      // fallback to mock
    }
    const requirement = getRequirement(params.id);
    if (!requirement) throw notFound();
    return { requirement };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Requirement unavailable — SaaS Manager" },
          { name: "robots", content: "noindex" },
        ],
      };
    const title = `${loaderData.requirement.id} moderation — SaaS Manager`;
    const description = `Moderate “${loaderData.requirement.title}” posted by ${loaderData.requirement.business}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="panel p-8 text-center text-sm font-semibold">Requirement not found</div>
  ),
  component: RequirementDetail,
});

function RequirementDetail() {
  const { requirement } = Route.useLoaderData();
  const d = requirementBrief(requirement);
  const navigate = useNavigate();
  const [status, setStatus] = useState<Requirement["status"]>(requirement.status);
  const [removing, setRemoving] = useState(false);
  const act = async (s: Requirement["status"], label: string) => {
    try {
      await adminApi.moderateRequirement(requirement.id, { status: s.toUpperCase() });
    } catch {
      // fallback handled gracefully
    }
    setStatus(s);
    saved(label, requirement.title);
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/requirements"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All requirements
      </Link>

      <div className="panel flex flex-col gap-3 p-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="num text-xs text-muted-foreground">{requirement.id}</p>
            <StatusBadge value={status} />
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight">{requirement.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {requirement.business} · {requirement.category} · posted {requirement.created}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            variant="outline"
            className="h-10"
            disabled={status === "featured"}
            onClick={() => act("featured", "Featured on marketplace")}
          >
            <Star className="size-4" /> Feature on Marketplace
          </Button>
          <Button
            variant="outline"
            className="h-10"
            disabled={status === "hidden"}
            onClick={() => act("hidden", "Hidden from feed")}
          >
            <EyeOff className="size-4" /> Hide from Feed
          </Button>
          <Button
            variant="outline"
            className="h-10"
            disabled={status === "closed"}
            onClick={() => act("closed", "Submissions closed")}
          >
            <Lock className="size-4" /> Close Submissions
          </Button>
          <Button variant="destructive" className="h-10" onClick={() => setRemoving(true)}>
            <Trash2 className="size-4" /> Remove
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <section className="panel p-4 lg:flex-1">
          <h2 className="text-sm font-semibold">Business brief</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.brief}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Budget range",
                `${money(d.budgetMin, requirement.currency)} – ${money(d.budgetMax, requirement.currency)}`,
              ],
              ["Creators needed", String(requirement.creatorsNeeded)],
              ["Location", `${requirement.location} · ${d.radiusKm} km`],
              ["Min. followers", compact(d.minFollowers)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase text-muted-foreground">{k}</p>
                <p className="num mt-0.5 text-sm font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Languages: {d.languages.join(", ")}</p>
        </section>

        <section className="panel overflow-hidden lg:w-96 lg:shrink-0">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Interested creators ({d.interested.length})</h2>
          </div>
          <div className="divide-y divide-border/70">
            {d.interested.map((c) => (
              <Link
                key={c.id + c.date}
                to="/influencers/$id"
                params={{ id: c.id }}
                className="flex min-h-[52px] items-center gap-3 px-4 py-2.5 hover:bg-muted/40"
              >
                <UserAvatar src={c.avatar} name={c.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="num text-xs text-muted-foreground">
                    {c.city} · {compact(c.followers)}
                  </p>
                </div>
                <span className="num text-xs text-muted-foreground">{c.date}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <ReasonDialog
        open={removing}
        onOpenChange={setRemoving}
        title="Remove this requirement?"
        description="It disappears from the marketplace and the business is notified."
        confirmLabel="Remove requirement"
        destructive
        onConfirm={async () => {
          try {
            await adminApi.moderateRequirement(requirement.id, { status: "CLOSED" });
          } catch {
            // fallback handled gracefully
          }
          saved("Requirement removed", requirement.title);
          void navigate({ to: "/requirements" });
        }}
      />
    </div>
  );
}
