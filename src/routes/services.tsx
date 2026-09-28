import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { inr, services as seedServices } from "@/data/mock";
import type { ServiceType } from "@/data/types";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Creator Services — Influencers.com SaaS Manager" },
      { name: "description", content: "Manage the deliverables creators can sell: reels, posts, UGC, reviews and more." },
      { property: "og:title", content: "Creator Services — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Manage the deliverables creators can sell across the platform." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [items, setItems] = useState<ServiceType[]>(seedServices);

  const toggle = (id: string) =>
    setItems((s) => s.map((x) => (x.id === id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x)));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Services"
        description="Service types creators can offer to businesses."
        actions={
          <Button size="sm" onClick={mockAction("Add service", "opens service builder")}>
            <Plus className="size-4" /> Add service
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.platform}</p>
              </div>
              <StatusBadge value={s.status} />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">Avg price</p>
                <p className="num text-lg font-bold">{inr(s.avgPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase text-muted-foreground">Creators</p>
                <p className="num text-lg font-bold">{s.creators}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={mockAction("Edit service", s.name)}>
                Edit
              </Button>
              <Switch checked={s.status === "active"} onCheckedChange={() => toggle(s.id)} aria-label="Enabled" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
