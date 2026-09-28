import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { domains } from "@/data/mock";
import type { DomainRecord } from "@/data/types";

export const Route = createFileRoute("/domains")({
  head: () => ({
    meta: [
      { title: "Domain Management — Influencers.com SaaS Manager" },
      { name: "description", content: "Track custom domains, DNS verification and SSL for creator websites." },
      { property: "og:title", content: "Domain Management — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Track custom domains, DNS verification and SSL for creator websites." },
    ],
  }),
  component: DomainsPage,
});

function DomainsPage() {
  const [instructions, setInstructions] = useState<DomainRecord | null>(null);

  const columns: Column<DomainRecord>[] = [
    { key: "creator", header: "Creator", cell: (r) => <span className="text-sm font-medium">{r.creator}</span> },
    { key: "domain", header: "Domain", cell: (r) => <span className="num text-xs text-primary">{r.domain}</span> },
    { key: "type", header: "Type", cell: (r) => <span className="text-xs capitalize">{r.type}</span> },
    { key: "verification", header: "Verification", cell: (r) => <StatusBadge value={r.verification} /> },
    { key: "ssl", header: "SSL", cell: (r) => <StatusBadge value={r.ssl} /> },
    { key: "website", header: "Website", cell: (r) => <StatusBadge value={r.websiteStatus} /> },
    { key: "created", header: "Created", secondary: true, cell: (r) => <span className="num text-xs text-muted-foreground">{r.created}</span> },
  ];

  const filters: FilterDef<DomainRecord>[] = [
    { key: "verification", label: "Verification", options: ["verified", "pending", "failed"], match: (r, v) => r.verification === v },
    { key: "ssl", label: "SSL", options: ["active", "pending", "failed"], match: (r, v) => r.ssl === v },
    { key: "type", label: "Type", options: ["custom", "subdomain"], match: (r, v) => r.type === v },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Domains" description="Custom domains and subdomains connected to creator websites." />

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        DNS checks are simulated in this prototype. Actions show the flow admins will get once the backend is connected.
      </div>

      <DataTable
        rows={domains}
        columns={columns}
        filters={filters}
        getId={(r) => r.id}
        searchPlaceholder="Search domain or creator…"
        search={(r, t) => r.domain.toLowerCase().includes(t) || r.creator.toLowerCase().includes(t)}
        mobileCard={(r) => (
          <>
            <p className="num truncate text-sm font-semibold text-primary">{r.domain}</p>
            <p className="truncate text-xs text-muted-foreground">{r.creator}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge value={r.verification} />
              <StatusBadge value={r.ssl} />
              <span className="ml-auto text-xs capitalize text-muted-foreground">{r.type}</span>
            </div>
          </>
        )}
        rowAction={(r) => (
          <ActionMenu
            items={[
              { label: "Verify", onSelect: mockAction("Verification queued", r.domain) },
              { label: "Retry", onSelect: mockAction("Retrying DNS check", r.domain) },
              { label: "View instructions", onSelect: () => setInstructions(r) },
              { label: "Disconnect", onSelect: mockAction("Domain disconnected", r.domain), destructive: true, separatorBefore: true },
            ]}
          />
        )}
      />

      <Dialog open={Boolean(instructions)} onOpenChange={(o) => !o && setInstructions(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>DNS instructions</DialogTitle>
            <DialogDescription>
              Ask {instructions?.creator} to add these records at their registrar for {instructions?.domain}.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="num w-full min-w-[420px] text-xs">
              <thead className="bg-muted/60 text-left text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Host</th>
                  <th className="px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">A</td>
                  <td className="px-3 py-2">@</td>
                  <td className="px-3 py-2">76.76.21.21</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">CNAME</td>
                  <td className="px-3 py-2">www</td>
                  <td className="px-3 py-2">sites.influencers.com</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">TXT</td>
                  <td className="px-3 py-2">_influencers</td>
                  <td className="px-3 py-2">verify={instructions?.id.toLowerCase()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button onClick={mockAction("Instructions emailed", instructions?.creator ?? "")}>Email instructions</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
