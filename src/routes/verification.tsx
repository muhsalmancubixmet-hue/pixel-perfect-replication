import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, EmptyState } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifications as seed } from "@/data/mock";
import type { VerificationItem } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Verification Center — Influencers.com SaaS Manager" },
      {
        name: "description",
        content: "Review creator, social account and business verification requests in one queue.",
      },
      { property: "og:title", content: "Verification Center — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Review creator, social and business verification requests.",
      },
    ],
  }),
  component: VerificationPage,
});

function Queue({
  items,
  onDecide,
}: {
  items: VerificationItem[];
  onDecide: (id: string, status: VerificationItem["status"], label: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="panel">
        <EmptyState
          title="Queue is clear"
          description="Nothing waiting for review in this category."
        />
      </div>
    );
  }
  return (
    <div className="panel divide-y divide-border/70">
      {items.map((v) => (
        <div key={v.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <UserAvatar name={v.user} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{v.user}</p>
            <p className="truncate text-xs text-muted-foreground">{v.detail}</p>
            <p className="num mt-0.5 text-[11px] text-muted-foreground">Submitted {v.submitted}</p>
          </div>
          <StatusBadge value={v.status} />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={v.status === "approved"}
              onClick={() => onDecide(v.id, "approved", "Verification approved")}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={v.status === "info requested"}
              onClick={() => onDecide(v.id, "info requested", "More information requested")}
            >
              Request info
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={v.status === "rejected"}
              onClick={() => onDecide(v.id, "rejected", "Verification rejected")}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function VerificationPage() {
  const [items, setItems] = useState<VerificationItem[]>(seed);

  const loadQueue = async () => {
    try {
      const res = await adminApi.getVerificationQueue();
      if (Array.isArray(res) && res.length > 0) {
        setItems(res as VerificationItem[]);
      }
    } catch (err) {
      console.warn("Could not load live verification queue, showing initial queue:", err);
    }
  };

  useEffect(() => {
    void loadQueue();
  }, []);

  const decide = async (id: string, status: VerificationItem["status"], label: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      if (item.kind === "creator") {
        await adminApi.moderateInfluencer(id, {
          verification_status:
            status === "approved" ? "VERIFIED" : status === "rejected" ? "REJECTED" : "PENDING",
        });
      } else if (item.kind === "business") {
        await adminApi.moderateBusiness(id, {
          verification_status:
            status === "approved" ? "VERIFIED" : status === "rejected" ? "REJECTED" : "PENDING",
        });
      } else if (item.kind === "social") {
        await adminApi.reviewPlatformRequest(id, {
          status:
            status === "approved" ? "APPROVED" : status === "rejected" ? "REJECTED" : "PENDING",
        });
      }

      setItems((s) => s.map((i) => (i.id === id ? { ...i, status } : i)));
      toast.success(`${label}: ${item.user}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Action failed";
      toast.error(`Failed to update ${item.user}`, { description: msg });
    }
  };

  const byKind = (kind: VerificationItem["kind"]) => items.filter((i) => i.kind === kind);
  const pending = (kind: VerificationItem["kind"]) =>
    byKind(kind).filter((i) => i.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Verification centre"
        description={`${items.filter((i) => i.status === "pending").length} items awaiting a decision.`}
      />

      <Tabs defaultValue="creator">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="creator">Creators ({pending("creator")})</TabsTrigger>
          <TabsTrigger value="social">Social accounts ({pending("social")})</TabsTrigger>
          <TabsTrigger value="business">Businesses ({pending("business")})</TabsTrigger>
        </TabsList>
        <TabsContent value="creator" className="mt-3">
          <Queue items={byKind("creator")} onDecide={decide} />
        </TabsContent>
        <TabsContent value="social" className="mt-3">
          <Queue items={byKind("social")} onDecide={decide} />
        </TabsContent>
        <TabsContent value="business" className="mt-3">
          <Queue items={byKind("business")} onDecide={decide} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
