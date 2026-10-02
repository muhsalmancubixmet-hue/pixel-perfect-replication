import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, plans as seedPlans } from "@/data/mock";
import type { Plan } from "@/data/types";
import { CreditCard, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions — Influencers.com SaaS Manager" },
      { name: "description", content: "Create and tune the influencer and business subscription plans." },
      { property: "og:title", content: "Subscriptions — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Create and tune influencer and business subscription plans." },
    ],
  }),
  component: SubscriptionsPage,
});

function PlanGrid({
  items,
  onToggle,
  onEdit,
}: {
  items: Plan[];
  onToggle: (id: string) => void;
  onEdit: (p: Plan) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {items.map((p) => (
        <div key={p.id} className="panel flex flex-col p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="num mt-0.5 text-2xl font-bold">
                {p.price === 0 ? "Free" : money(p.price)}
                {p.price > 0 && <span className="text-sm font-medium text-muted-foreground">/mo</span>}
              </p>
            </div>
            <StatusBadge value={p.status} />
          </div>

          <ul className="mt-3 flex flex-1 flex-col gap-1.5">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs">
                <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Active users</p>
              <p className="num text-sm font-bold">{p.activeUsers.toLocaleString("en-IN")}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase text-muted-foreground">Monthly revenue</p>
              <p className="num text-sm font-bold">{money(p.monthlyRevenue)}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
              Edit plan
            </Button>
            <Switch checked={p.status === "active"} onCheckedChange={() => onToggle(p.id)} aria-label="Plan enabled" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>(seedPlans);
  const [editing, setEditing] = useState<Plan | null>(null);

  const toggle = (id: string) =>
    setPlans((s) => s.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p)));

  const mrr = plans.reduce((a, p) => a + p.monthlyRevenue, 0);
  const paidUsers = plans.filter((p) => p.price > 0).reduce((a, p) => a + p.activeUsers, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Subscriptions"
        description="Plans, limits and revenue for creators and businesses."
        actions={
          <Button size="sm" onClick={mockAction("Add plan", "opens plan builder")}>
            <Plus className="size-4" /> Add plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={money(mrr)} icon={Wallet} delta={11.2} />
        <StatCard label="Paid accounts" value={paidUsers.toLocaleString("en-IN")} icon={Users} delta={8.6} />
        <StatCard label="Plans live" value={String(plans.filter((p) => p.status === "active").length)} icon={CreditCard} />
        <StatCard label="ARPU" value={money(Math.round(mrr / Math.max(1, paidUsers)))} icon={Wallet} delta={2.4} />
      </div>

      <Tabs defaultValue="Influencer">
        <TabsList>
          <TabsTrigger value="Influencer">Influencer plans</TabsTrigger>
          <TabsTrigger value="Business">Business plans</TabsTrigger>
        </TabsList>
        <TabsContent value="Influencer" className="mt-3">
          <PlanGrid items={plans.filter((p) => p.audience === "Influencer")} onToggle={toggle} onEdit={setEditing} />
        </TabsContent>
        <TabsContent value="Business" className="mt-3">
          <PlanGrid items={plans.filter((p) => p.audience === "Business")} onToggle={toggle} onEdit={setEditing} />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editing?.audience} · {editing?.name}
            </DialogTitle>
            <DialogDescription>Change pricing and feature limits for this plan.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="price">Monthly price (base currency)</Label>
              <Input id="price" type="number" defaultValue={editing?.price} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="limit-campaigns">Campaign / portfolio limit</Label>
              <Input id="limit-campaigns" type="number" defaultValue={editing?.audience === "Business" ? 10 : 50} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="limit-socials">Connected social accounts</Label>
              <Input id="limit-socials" type="number" defaultValue={5} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">Custom domain included</span>
              <Switch defaultChecked={editing?.price !== 0} />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                mockAction("Plan updated", `${editing?.audience} ${editing?.name}`)();
                setEditing(null);
              }}
            >
              Save plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
