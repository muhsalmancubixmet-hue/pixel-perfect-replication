import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Settings2 } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { saved } from "@/components/admin/Dialogs";
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
import { compact } from "@/data/mock";
import type { PlatformRequest, SocialPlatform } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

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
  const [platformsList, setPlatformsList] = useState<SocialPlatform[]>([]);
  const [requestsList, setRequestsList] = useState<PlatformRequest[]>([]);
  const [configure, setConfigure] = useState<SocialPlatform | null>(null);
  const [approve, setApprove] = useState<PlatformRequest | null>(null);

  // Add platform state
  const [addPlatformOpen, setAddPlatformOpen] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformColor, setNewPlatformColor] = useState("#4F46E5");
  const [newPlatformOAuth, setNewPlatformOAuth] = useState(false);
  const [newPlatformApi, setNewPlatformApi] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const loadData = () => {
    Promise.allSettled([
      adminApi.getSocialPlatforms(),
      adminApi.getPlatformRequests(),
    ]).then(([pRes, rRes]) => {
      if (pRes.status === "fulfilled") {
        const val = pRes.value?.results || (Array.isArray(pRes.value) ? pRes.value : []);
        const mapped = val.map((p: any) => ({
          id: p.id || p.code || p.name.toLowerCase(),
          name: p.name,
          color: p.color || "#4F46E5",
          status: (p.status || "active").toLowerCase() as SocialPlatform["status"],
          oauth: Boolean(p.oauth_enabled ?? p.oauth ?? true),
          api: Boolean(p.api_enabled ?? p.api ?? true),
          activeCreators: p.active_creators_count || p.activeCreators || 0,
          created: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent",
        }));
        setPlatformsList(mapped);
      }
      if (rRes.status === "fulfilled") {
        const val = rRes.value?.results || (Array.isArray(rRes.value) ? rRes.value : []);
        const mappedReq = val.map((r: any) => ({
          id: r.id,
          platform: r.platform_name || r.platform,
          requestedBy: r.requester_name || r.requestedBy || "Creator",
          votes: r.votes_count || r.votes || 1,
          status: (r.status || "pending").toLowerCase() as PlatformRequest["status"],
          requestedAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent",
        }));
        setRequestsList(mappedReq);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

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
          <Button size="sm" onClick={() => setAddPlatformOpen(true)}>
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
              {requestsList.filter((r) => r.status === "pending").length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-3">
          <div className="w-full overflow-x-auto">
            <DataTable
              rows={platformsList}
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
                    { label: "Configure", onSelect: () => setConfigure(r) },
                    {
                      label: r.status === "active" ? "Disable" : "Enable",
                      onSelect: async () => {
                        const newStatus = r.status === "active" ? "inactive" : "active";
                        try {
                          await adminApi.updateSocialPlatform(r.id, { is_active: newStatus === "active" });
                        } catch {}
                        setPlatformsList((all) => all.map((p) => p.id === r.id ? { ...p, status: newStatus } : p));
                        saved(newStatus === "active" ? "Platform enabled" : "Platform disabled", r.name);
                      },
                    },
                  ]}
                />
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-3">
          <p className="mb-3 text-sm text-muted-foreground">
            Creators can request networks we don't support yet. Approving one creates a new platform without touching the
            creator architecture.
          </p>
          <div className="w-full overflow-x-auto">
            <DataTable
              rows={requestsList}
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
                    { label: "Approve", onSelect: () => setApprove(r) },
                    {
                      label: "Reject",
                      destructive: true,
                      separatorBefore: true,
                      onSelect: async () => {
                        try {
                          await adminApi.reviewPlatformRequest(r.id, { status: "REJECTED" });
                          setRequestsList((all) => all.map((x) => x.id === r.id ? { ...x, status: "rejected" } : x));
                        } catch {}
                        saved("Request rejected", r.platform);
                      },
                    },
                  ]}
                />
              )}
            />
          </div>
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
              <Switch defaultChecked={configure?.oauth ?? false} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">Sync follower metrics via API</span>
              <Switch defaultChecked={configure?.api ?? false} />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                saved("Platform configuration saved", configure?.name ?? "");
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
              onClick={async () => {
                if (approve) {
                  try {
                    await adminApi.reviewPlatformRequest(approve.id, { status: "APPROVED" });
                    await adminApi.createSocialPlatform({
                      name: approve.platform,
                      color_code: "#6366f1",
                    });
                    saved("Platform approved and created", approve.platform);
                    setApprove(null);
                    loadData();
                  } catch (err: any) {
                    const msg = err?.response?.data?.detail || "Could not approve request";
                    saved("Failed to approve", msg);
                  }
                }
              }}
            >
              Approve and create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Social Platform Dialog */}
      <Dialog open={addPlatformOpen} onOpenChange={setAddPlatformOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Social Platform</DialogTitle>
            <DialogDescription>
              Register a new platform that creators and brands can connect to their accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="new-pname">Platform Name</Label>
              <Input
                id="new-pname"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                placeholder="e.g. Threads, Bluesky, Snapchat"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-pcolor">Brand Hex Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newPlatformColor}
                  onChange={(e) => setNewPlatformColor(e.target.value)}
                  className="size-9 cursor-pointer rounded border border-border p-0.5 bg-transparent"
                />
                <Input
                  id="new-pcolor"
                  value={newPlatformColor}
                  onChange={(e) => setNewPlatformColor(e.target.value)}
                  placeholder="#4F46E5"
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">OAuth Integration</p>
                <p className="text-xs text-muted-foreground">Support automated OAuth token connection</p>
              </div>
              <Switch checked={newPlatformOAuth} onCheckedChange={setNewPlatformOAuth} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Metrics API Sync</p>
                <p className="text-xs text-muted-foreground">Sync live follower counts and engagement</p>
              </div>
              <Switch checked={newPlatformApi} onCheckedChange={setNewPlatformApi} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={addLoading}
              onClick={async () => {
                if (!newPlatformName.trim()) {
                  saved("Validation", "Platform name is required.");
                  return;
                }
                setAddLoading(true);
                try {
                  await adminApi.createSocialPlatform({
                    name: newPlatformName.trim(),
                    color_code: newPlatformColor || "#4F46E5",
                    supports_oauth: newPlatformOAuth,
                    supports_api: newPlatformApi,
                  });
                  saved("Platform created", newPlatformName);
                  setAddPlatformOpen(false);
                  setNewPlatformName("");
                  setNewPlatformColor("#4F46E5");
                  setNewPlatformOAuth(false);
                  setNewPlatformApi(false);
                  loadData();
                } catch (err: any) {
                  const msg = err?.response?.data?.detail || err?.response?.data?.name?.[0] || "Failed to create platform";
                  saved("Create failed", msg);
                } finally {
                  setAddLoading(false);
                }
              }}
            >
              {addLoading ? "Creating..." : "Create platform"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
