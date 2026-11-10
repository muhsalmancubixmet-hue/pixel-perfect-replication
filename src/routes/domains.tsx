import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Info, Loader2, TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog, saved } from "@/components/admin/Dialogs";
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
  const [diagnosing, setDiagnosing] = useState<DomainRecord | null>(null);
  const [disconnecting, setDisconnecting] = useState<DomainRecord | null>(null);

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

      <div className="w-full overflow-x-auto">
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
                { label: "Verify", onSelect: () => setDiagnosing(r) },
                { label: "Retry", onSelect: () => setDiagnosing(r) },
                { label: "View instructions", onSelect: () => setInstructions(r) },
                { label: "Disconnect", onSelect: () => setDisconnecting(r), destructive: true, separatorBefore: true },
              ]}
            />
          )}
        />
      </div>

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

      <DnsDiagnostics domain={diagnosing} onClose={() => setDiagnosing(null)} />
      <ConfirmDialog
        open={Boolean(disconnecting)}
        onOpenChange={(o) => !o && setDisconnecting(null)}
        title={`Disconnect ${disconnecting?.domain ?? ""}?`}
        description="The creator's website falls back to its influencers.com subdomain."
        confirmLabel="Disconnect"
        onConfirm={() => saved("Domain disconnected", disconnecting?.domain)}
      />
    </div>
  );
}

function DnsDiagnostics({ domain, onClose }: { domain: DomainRecord | null; onClose: () => void }) {
  const [checking, setChecking] = useState(true);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!domain) return;
    setChecking(true);
    const t = setTimeout(() => setChecking(false), 1200);
    return () => clearTimeout(t);
  }, [domain, run]);
  // Simulated: failed domains fail the apex check; pending ones fail CNAME.
  const records = domain
    ? [
        { type: "A", host: "@", expected: "76.76.21.21", ok: domain.verification !== "failed", found: domain.verification === "failed" ? "185.199.108.153" : "76.76.21.21" },
        { type: "CNAME", host: "www", expected: "sites.influencers.com", ok: domain.verification === "verified", found: domain.verification === "verified" ? "sites.influencers.com" : "— no record" },
        { type: "TXT", host: "_influencers", expected: `verify=${domain.id.toLowerCase()}`, ok: domain.verification === "verified", found: domain.verification === "verified" ? `verify=${domain.id.toLowerCase()}` : "— no record" },
      ]
    : [];
  const allOk = records.every((r) => r.ok);
  return (
    <Dialog open={Boolean(domain)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>DNS diagnostics</DialogTitle>
          <DialogDescription>Live lookup for {domain?.domain} (simulated).</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {records.map((r) => (
            <div key={r.type} className="flex items-start gap-3 rounded-lg border border-border p-3">
              {checking ? (
                <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-muted-foreground" />
              ) : r.ok ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              ) : (
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
              )}
              <div className="num min-w-0 flex-1 text-xs">
                <p className="text-sm font-semibold">
                  {r.type} <span className="font-normal text-muted-foreground">{r.host}</span>
                </p>
                <p className="truncate text-muted-foreground">Expected: {r.expected}</p>
                {!checking && <p className={r.ok ? "truncate text-success" : "truncate text-destructive"}>Found: {r.found}</p>}
              </div>
            </div>
          ))}
        </div>
        {!checking && (
          <p className={allOk ? "text-sm font-medium text-success" : "text-sm font-medium text-destructive"}>
            {allOk ? "All records resolve correctly. SSL will be issued automatically." : "Some records are missing or wrong. Share the DNS instructions with the creator."}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-10" onClick={onClose}>Close</Button>
          <Button className="h-10" disabled={checking} onClick={() => setRun((n) => n + 1)}>Re-run check</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
