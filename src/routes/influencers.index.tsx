import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog, FormDrawer, ReasonDialog, saved, type FieldDef } from "@/components/admin/Dialogs";
import { CATEGORY_NAMES, COUNTRY_OPTIONS, CITY_OPTIONS, compact, influencers } from "@/data/mock";
import type { Influencer } from "@/data/types";

export const Route = createFileRoute("/influencers/")({
  head: () => ({
    meta: [
      { title: "Influencer Management — Influencers.com SaaS Manager" },
      { name: "description", content: "Search, filter, verify and moderate every creator on Influencers.com." },
      { property: "og:title", content: "Influencer Management — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Search, filter, verify and moderate every creator on the platform." },
    ],
  }),
  component: InfluencersPage,
});

const PLATFORMS = ["Instagram", "YouTube", "Facebook", "TikTok", "X", "LinkedIn", "Snapchat", "Threads", "Pinterest", "Twitch"];

function InfluencersPage() {
  const columns: Column<Influencer>[] = [
    {
      key: "profile",
      header: "Creator",
      cell: (r) => (
        <Link to="/influencers/$id" params={{ id: r.id }} className="flex items-center gap-2.5">
          <UserAvatar src={r.avatar} name={r.name} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium hover:underline">{r.name}</span>
            <span className="num block truncate text-xs text-muted-foreground">@{r.handle}</span>
          </span>
        </Link>
      ),
    },
    { key: "category", header: "Category", cell: (r) => <span className="text-xs">{r.categories.join(", ")}</span> },
    {
      key: "location",
      header: "Location",
      cell: (r) => (
        <span className="text-xs">
          {r.location.city}
          <span className="block text-muted-foreground">{r.location.country}</span>
        </span>
      ),
    },
    { key: "followers", header: "Followers", cell: (r) => <span className="num text-sm font-semibold">{compact(r.followers)}</span> },
    {
      key: "platforms",
      header: "Platforms",
      secondary: true,
      cell: (r) => (
        <span className="flex flex-wrap gap-1">
          {r.platforms.map((p) => (
            <span key={p} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              {p}
            </span>
          ))}
        </span>
      ),
    },
    { key: "verification", header: "Verification", cell: (r) => <StatusBadge value={r.verification} /> },
    {
      key: "website",
      header: "Website",
      secondary: true,
      cell: (r) => <StatusBadge value={r.websiteStatus === "none" ? "draft" : r.websiteStatus} />,
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { key: "joined", header: "Joined", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.joined}</span> },
  ];

  const filters: FilterDef<Influencer>[] = [
    { key: "category", label: "Category", options: CATEGORY_NAMES, match: (r, v) => r.categories.includes(v) },
    { key: "country", label: "Country", options: COUNTRY_OPTIONS, match: (r, v) => r.location.country === v },
    { key: "city", label: "City", options: CITY_OPTIONS, match: (r, v) => r.location.city === v },
    { key: "status", label: "Status", options: ["active", "suspended", "pending"], match: (r, v) => r.status === v },
    { key: "verification", label: "Verification", options: ["verified", "pending", "unverified"], match: (r, v) => r.verification === v },
    {
      key: "website",
      label: "Website status",
      options: ["published", "draft", "suspended", "none"],
      match: (r, v) => r.websiteStatus === v,
    },
    { key: "platform", label: "Social platform", options: PLATFORMS, match: (r, v) => r.platforms.includes(v) },
  ];

  const [rows, setRows] = useState<Influencer[]>(influencers);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Influencer | null>(null);
  const [verifying, setVerifying] = useState<Influencer | null>(null);
  const [toggling, setToggling] = useState<{ i: Influencer; to: Influencer["status"] } | null>(null);
  const update = (id: string, patch: Partial<Influencer>) => setRows((rs) => rs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addFields: FieldDef[] = [
    { name: "name", label: "Full name", required: true },
    { name: "handle", label: "Handle", placeholder: "@creator", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "category", label: "Primary category", type: "select", options: CATEGORY_NAMES, required: true },
    { name: "tier", label: "Starting tier", type: "select", options: ["Free", "Pro", "Premium"] },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Influencers"
        description={`${influencers.length} creator accounts in this sample set.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={mockAction("Export started", "influencers.csv")}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setAdding(true)}>
              <UserPlus className="size-4" /> Add Influencer
            </Button>
          </>
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search by name, handle or city…"
        search={(r, t) =>
          r.name.toLowerCase().includes(t) || r.handle.includes(t) || r.location.city.toLowerCase().includes(t)
        }
        mobileCard={(r) => (
          <Link to="/influencers/$id" params={{ id: r.id }} className="block">
            <div className="flex items-center gap-2.5">
              <UserAvatar src={r.avatar} name={r.name} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.categories[0]} · {r.location.city}, {r.location.countryCode}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge value={r.status} />
              <StatusBadge value={r.verification} />
              <span className="num ml-auto text-xs font-semibold">{compact(r.followers)} followers</span>
            </div>
          </Link>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "View", node: <Link to="/influencers/$id" params={{ id: r.id }}>View</Link> },
              { label: "Edit", onSelect: () => setEditing(r) },
              { label: "Verify", onSelect: () => setVerifying(r) },
              { label: "Activate", onSelect: () => setToggling({ i: r, to: "active" }) },
              { label: "View Website", onSelect: mockAction("Opening website", r.websiteUrl ?? "no website") },
              { label: "View Public Profile", onSelect: mockAction("Opening public profile", r.name) },
              { label: "Suspend", onSelect: () => setToggling({ i: r, to: "suspended" }), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />

      <FormDialog
        open={adding}
        onOpenChange={setAdding}
        title="Add influencer"
        description="Manually onboard a creator. They receive an email to finish setting up their profile."
        fields={addFields}
        initial={{ tier: "Free" }}
        submitLabel="Create creator"
        onSubmit={(v) => saved("Creator created", `${String(v.name)} (${String(v.handle)}) was invited.`)}
      />
      <FormDrawer
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Edit ${editing?.name ?? "creator"}`}
        fields={addFields.filter((f) => f.name !== "email")}
        initial={editing ? { name: editing.name, handle: editing.handle, category: editing.categories[0] ?? "", tier: editing.subscription.replace(/^Influencer /, "") } : {}}
        onSubmit={(v) => {
          if (!editing) return;
          update(editing.id, { name: String(v.name), handle: String(v.handle) });
          saved("Creator updated", String(v.name));
        }}
      />
      <VerifyDialog
        creator={verifying}
        onClose={() => setVerifying(null)}
        onDecide={(c, d) => {
          update(c.id, { verification: d === "approve" ? "verified" : d === "reject" ? "unverified" : "pending" });
          saved(d === "approve" ? "Creator verified" : d === "reject" ? "Verification rejected" : "More information requested", c.name);
        }}
      />
      <ReasonDialog
        open={Boolean(toggling)}
        onOpenChange={(o) => !o && setToggling(null)}
        title={toggling?.to === "suspended" ? `Suspend ${toggling.i.name}?` : `Activate ${toggling?.i.name ?? ""}?`}
        confirmLabel={toggling?.to === "suspended" ? "Suspend account" : "Activate account"}
        destructive={toggling?.to === "suspended"}
        onConfirm={() => {
          if (!toggling) return;
          update(toggling.i.id, { status: toggling.to });
          saved(toggling.to === "suspended" ? "Account suspended" : "Account activated", toggling.i.name);
        }}
      />
    </div>
  );
}

type Decision = "approve" | "reject" | "info";

function VerifyDialog({ creator, onClose, onDecide }: { creator: Influencer | null; onClose: () => void; onDecide: (c: Influencer, d: Decision) => void }) {
  const [note, setNote] = useState("");
  useEffect(() => setNote(""), [creator]);
  const decide = (d: Decision) => {
    if (creator) onDecide(creator, d);
    onClose();
  };
  return (
    <Dialog open={Boolean(creator)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verification review</DialogTitle>
          <DialogDescription>Decide on the verification badge for this creator.</DialogDescription>
        </DialogHeader>
        {creator && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <UserAvatar src={creator.avatar} name={creator.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{creator.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {creator.handle} · {compact(creator.followers)} followers · {creator.platforms.length} platforms
                </p>
              </div>
              <StatusBadge value={creator.verification} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vnote">Note to creator (optional)</Label>
              <Textarea id="vnote" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Please upload a government ID that matches your profile name." />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-10" onClick={() => decide("info")}>Request info</Button>
          <Button variant="destructive" className="h-10" onClick={() => decide("reject")}>Reject</Button>
          <Button className="h-10" onClick={() => decide("approve")}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
