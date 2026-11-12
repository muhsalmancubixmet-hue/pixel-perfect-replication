import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormDialog, saved, type FieldDef } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { money, services as seedServices, socialPlatforms } from "@/data/mock";
import type { ServiceType } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

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
  const [items, setItems] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = () => {
    adminApi.getServiceTypes()
      .then((res: any) => {
        const raw = res?.results || (Array.isArray(res) ? res : []);
        if (raw.length > 0) {
          const mapped: ServiceType[] = raw.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            platform: r.platform_name || "Any",
            avgPrice: Number(r.avg_price) || 0,
            creators: 0,
            status: r.is_active === false ? "inactive" : "active",
          }));
          setItems(mapped);
        } else {
          setItems(seedServices);
        }
      })
      .catch(() => {
        setItems(seedServices);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const toggle = async (id: string, currentStatus: string) => {
    const nextActive = currentStatus !== "active";
    try {
      await adminApi.updateServiceType(id, { is_active: nextActive });
      setItems((s) => s.map((x) => (x.id === id ? { ...x, status: nextActive ? "active" : "inactive" } : x)));
      saved(nextActive ? "Service enabled" : "Service disabled", id);
    } catch {
      setItems((s) => s.map((x) => (x.id === id ? { ...x, status: nextActive ? "active" : "inactive" } : x)));
    }
  };
  const [editing, setEditing] = useState<ServiceType | "new" | null>(null);
  const current = editing && editing !== "new" ? editing : null;
  const fields: FieldDef[] = [
    { name: "name", label: "Service name", required: true },
    { name: "platform", label: "Parent platform", type: "select", options: [...socialPlatforms.map((p) => p.name), "Any"], required: true },
    { name: "avgPrice", label: "Benchmark avg price", type: "number", required: true },
    { name: "deliverables", label: "Deliverables spec", type: "textarea", placeholder: "e.g. 1 × 30–60s vertical video, raw files, 2 revisions" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Services"
        description="Service types creators can offer to businesses."
        actions={
          <Button size="sm" onClick={() => setEditing("new")}>
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
                <p className="num text-lg font-bold">{money(s.avgPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase text-muted-foreground">Creators</p>
                <p className="num text-lg font-bold">{s.creators}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <Button variant="ghost" size="sm" className="h-9 px-3 text-xs" onClick={() => setEditing(s)}>
                Edit
              </Button>
              <Switch checked={s.status === "active"} onCheckedChange={() => toggle(s.id, s.status)} aria-label="Enabled" />
            </div>
          </div>
        ))}
      </div>

      <FormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={current ? `Edit ${current.name}` : "Add service"}
        fields={fields}
        initial={current ? { name: current.name, platform: current.platform, avgPrice: String(current.avgPrice), deliverables: "" } : {}}
        submitLabel={current ? "Save changes" : "Add service"}
        onSubmit={async (v) => {
          const patch = {
            name: String(v["name"]),
            platform: String(v["platform"]),
            avgPrice: Number(v["avgPrice"]) || 0,
            deliverables: String(v["deliverables"] || ""),
          };
          try {
            if (current) {
              await adminApi.updateServiceType(current.id, patch);
              saved("Service updated", patch.name);
            } else {
              await adminApi.createServiceType(patch);
              saved("Service added", patch.name);
            }
            loadServices();
            setEditing(null);
          } catch (err: any) {
            const msg = err?.response?.data?.detail || "Could not save service";
            saved("Save failed", msg);
          }
        }}
      />
    </div>
  );
}
