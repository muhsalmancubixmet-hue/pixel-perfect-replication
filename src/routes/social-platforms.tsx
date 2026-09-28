import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Settings2 } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compact, platformRequests, socialPlatforms } from "@/data/mock";
import type { PlatformRequest, SocialPlatform } from "@/data/types";

export const Route = createFileRoute("/social-platforms")({
  head: () => ({
    meta: [
      { title: "Social Platforms — Influencers.com SaaS Manager" },
      {
        name: "description",
        content: "Enable, configure and expand the social networks creators can connect to Influencers.com.",
      },
      { property: "og:title", content: "Social Platforms — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Enable, configure and expand supported social networks." },
    ],
  }),
  component: SocialPlatformsPage,
});

function SocialPlatformsPage() {
  const [configure, setConfigure] = useState<SocialPlatform | null>(null);
  const [approve, setApprove] = useState<PlatformRequest | null>(null);

  const platformColumns: Column<SocialPlatform>[] = [
    {
      key: "name",
      header: "Platform",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span
            className="grid size-8 place-items-center rounded-lg text-[11px] font-bold text-white"
            style={{ background: r.color }}
          >
            {r.name.slice(0, 2)}
          </span>
          <div>
            <p className="text-sm font-medium">{r.name}</p>
            <p className="num text-xs text-muted-foreground">{r.id}</p>
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    {
      key: "oauth",
      header: "OAuth",
      cell: (r) => <StatusBadge value={r.oauth ? "active" : "inactive"} />,
    },
    { key: "api", header: "API", cell: (r) => <StatusBadge value={r.api ? "active" : "inactive"} /> },
    { key: "creators", header: "Active creators", cell: (r) => <span className="num text-sm font-semibold">{compact(r.activeCreators)}</span> },
    { key: "created", header: "Created", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.created}</span> },
  ];

  const requestColumns: Column<PlatformRequest>[] = [
    { key: "platform", header: "Requested platform", cell: (r) => <span className="text-sm font-medium">{r.platform}</span> },
    { key: "by", header: "Requested by", cell: (r) => <span className="text-xs">{r.requestedBy}</span> },
    { key: "url", header: "Profile URL", cell: (r) => <span className="num text-xs text-primary">{r.profileUrl}</span> },
    { key: "date", header: "Request date", cell: (r) => <span className="num text-xs text-muted-foreground">{r.date}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
  ];

  const requestFilters: FilterDef<PlatformRequest>[] = [
    { key: "status", label: "Status", options: ["pending", "approved", "rejected"], match: (r, v) => r.status === v },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Social platforms"
        description="Centralised control of every network creators can connect."
        actions={
          <Button size="sm" onClick={mockAction("Add platform", "opens platform builder")}>
            <Plus className="size-4" /> Add Social Platform
          </Button>
        }
      />

      <Tabs defaultValue="platforms">
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            <span className="num ml-1.5 rounded-full bg-warning/25 px-1.5 text-[10px] font-bold text-warning-foreground">
              {platformRequests.filter((r) => r.status === "pending").length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-3">
          <DataTable
            rows={socialPlatforms}
            columns={platformColumns}
            getId={(r) => r.id}
            pageSize={10}
            searchPlaceholder="Search platform…"
            search={(r, t) => r.name.toLowerCase().includes(t)}
            filters={[
              { key: "status", label: "Status", options: ["active", "inactive"], match: (r, v) => r.status === v },
              { key: "oauth", label: "OAuth", options: ["supported", "not supported"], match: (r, v) => (v === "supported" ? r.oauth : !r.oauth) },
            ]}
            mobileCard={(r) => (
              <>
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid size-8 place-items-center rounded-lg text-[11px] font-bold text-white"
                    style={{ background: r.color }}
                  >
                    {r.name.slice(0, 2)}
                  </span>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <StatusBadge value={r.status} className="ml-auto" />
                </div>
                <p className="num mt-2 text-xs text-muted-foreground">
                  {compact(r.activeCreators)} creators · OAuth {r.oauth ? "yes" : "no"} · API {r.api ? "yes" : "no"}
                </p>
              </>
            )}
            rowAction={(r) => (
              <ActionMenu
                items={[
                  { label: "Edit", onSelect: mockAction("Edit platform", r.name) },
                  { label: "Configure", onSelect: () => setConfigure(r) },
                  { label: r.status === "active" ? "Disable" : "Enable", onSelect: mockAction(r.status === "active" ? "Platform disabled" : "Platform enabled", r.name) },
                ]}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-3">
          <p className="mb-3 text-sm text-muted-foreground">
            Creators can request networks we don't support yet. Approving one creates a new platform without touching the
            creator architecture.
          </p>
          <DataTable
            rows={platformRequests}
            columns={requestColumns}
            filters={requestFilters}
            getId={(r) => r.id}
            searchPlaceholder="Search request…"
            search={(r, t) => r.platform.toLowerCase().includes(t) || r.requestedBy.toLowerCase().includes(t)}
            mobileCard={(r) => (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{r.platform}</p>
                  <StatusBadge value={r.status} className="ml-auto" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.requestedBy}</p>
                <p className="num truncate text-xs text-primary">{r.profileUrl}</p>
              </>
            )}
            rowAction={(r) => (
              <ActionMenu
                items={[
                  { label: "View Request", onSelect: mockAction("Request details", `${r.platform} · ${r.requestedBy}`) },
                  { label: "Approve", onSelect: () => setApprove(r) },
                  { label: "Reject", onSelect: mockAction("Request rejected", r.platform), destructive: true, separatorBefore: true },
                ]}
              />
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Configure platform */}
      <Dialog open={Boolean(configure)} onOpenChange={(o) => !o && setConfigure(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="size-4" /> Configure {configure?.name}
            </DialogTitle>
            <DialogDescription>Connection settings used by the creator and business apps.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="client">OAuth client ID</Label>
              <Input id="client" defaultValue={`inf-${configure?.name.toLowerCase()}-prod`} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="redirect">Redirect URL</Label>
              <Input id="redirect" defaultValue={`https://influencers.com/oauth/${configure?.name.toLowerCase()}`} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">Enable OAuth login</span>
              <Switch defaultChecked={configure?.oauth} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">Sync follower metrics via API</span>
              <Switch defaultChecked={configure?.api} />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                mockAction("Platform configuration saved", configure?.name ?? "")();
                setConfigure(null);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve request → create platform */}
      <Dialog open={Boolean(approve)} onOpenChange={(o) => !o && setApprove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve &amp; create {approve?.platform}</DialogTitle>
            <DialogDescription>
              Requested by {approve?.requestedBy}. Creating the platform makes it available to every creator immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="pname">Platform name</Label>
              <Input id="pname" defaultValue={approve?.platform} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pbase">Profile base URL</Label>
              <Input id="pbase" defaultValue={`https://${approve?.platform.toLowerCase()}.com/`} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">OAuth available</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">Metrics API available</span>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                mockAction("Platform approved and created", approve?.platform ?? "")();
                setApprove(null);
              }}
            >
              Approve and create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
