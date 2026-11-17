import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Download } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { ActionMenu, mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import {
  FormDialog,
  FormDrawer,
  ReasonDialog,
  saved,
  type FieldDef,
} from "@/components/admin/Dialogs";
import { COUNTRY_OPTIONS, CITY_OPTIONS, businesses } from "@/data/mock";
import type { Business } from "@/data/types";
import { adminApi } from "@/lib/admin-api";
import { exportToCsv } from "@/lib/csv-export";

export const Route = createFileRoute("/businesses/")({
  head: () => ({
    meta: [
      { title: "Business Management — Influencers.com SaaS Manager" },
      {
        name: "description",
        content: "Manage every business account, subscription and campaign owner on the platform.",
      },
      { property: "og:title", content: "Business Management — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Manage business accounts, subscriptions and campaign owners.",
      },
    ],
  }),
  component: BusinessesPage,
});

const TYPES = [...new Set(businesses.map((b) => b.type))].sort();

function BusinessesPage() {
  const [rows, setRows] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminApi
      .getBusinesses()
      .then((res: any) => {
        if (!active) return;
        const list = res.results || (Array.isArray(res) ? res : []);
        const mapped = list.map((b: any) => ({
          id: String(b.id),
          name: b.company_name || b.name || "Brand",
          legalName: b.legal_name || b.name || "",
          type: b.business_type || "Brand",
          location: {
            city: b.city || b.location?.city || "Kochi",
            country: b.country || b.location?.country || "India",
          },
          contactName: b.contact_name || b.name || "Manager",
          email: b.email || b.user?.email || "",
          phone: b.phone || "",
          campaigns: b.campaigns_count || 0,
          subscription: b.subscription_plan || "Brand Free",
          status: (b.status || "active").toLowerCase(),
          joined: b.created_at ? new Date(b.created_at).toLocaleDateString() : "",
        }));
        setRows(mapped);
      })
      .catch((err) => {
        console.warn("Could not load live businesses:", err);
        setRows([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [toggling, setToggling] = useState<{ b: Business; to: Business["status"] } | null>(null);
  const fields: FieldDef[] = [
    { name: "name", label: "Company name", required: true },
    { name: "type", label: "Business type", type: "select", options: TYPES, required: true },
    { name: "hq", label: "HQ location", placeholder: "City, Country", required: true },
    { name: "email", label: "Contact email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "plan", label: "Initial plan", type: "select", options: ["Free", "Pro", "Agency"] },
  ];
  const columns: Column<Business>[] = [
    {
      key: "business",
      header: "Business",
      cell: (r) => (
        <Link to="/businesses/$id" params={{ id: r.id }} className="flex items-center gap-2.5">
          <UserAvatar name={r.name} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium hover:underline">{r.name}</span>
            <span className="num block truncate text-xs text-muted-foreground">{r.id}</span>
          </span>
        </Link>
      ),
    },
    { key: "type", header: "Type", cell: (r) => <span className="text-xs">{r.type}</span> },
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
    {
      key: "contact",
      header: "Contact",
      secondary: true,
      cell: (r) => (
        <span className="text-xs">
          {r.contactName}
          <span className="num block text-muted-foreground">{r.email}</span>
        </span>
      ),
    },
    {
      key: "campaigns",
      header: "Campaigns",
      cell: (r) => <span className="num text-sm font-semibold">{r.campaigns}</span>,
    },
    {
      key: "subscription",
      header: "Subscription",
      cell: (r) => (
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold">
          {r.subscription}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    {
      key: "joined",
      header: "Joined",
      secondary: true,
      cell: (r) => <span className="num text-xs text-muted-foreground">{r.joined}</span>,
    },
  ];

  // Subscription column needs the plan name, not a status tone.
  columns[5] = {
    key: "subscription",
    header: "Subscription",
    cell: (r) => (
      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold">
        {r.subscription}
      </span>
    ),
  };

  const filters: FilterDef<Business>[] = [
    { key: "type", label: "Business type", options: TYPES, match: (r, v) => r.type === v },
    {
      key: "country",
      label: "Country",
      options: COUNTRY_OPTIONS,
      match: (r, v) => r.location.country === v,
    },
    { key: "city", label: "City", options: CITY_OPTIONS, match: (r, v) => r.location.city === v },
    {
      key: "subscription",
      label: "Subscription",
      options: ["Free", "Pro", "Agency"],
      match: (r, v) => r.subscription === v,
    },
    {
      key: "status",
      label: "Status",
      options: ["active", "suspended", "pending"],
      match: (r, v) => r.status === v,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Businesses"
        description={`${rows.length} brand accounts across all markets.`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv(
                  "businesses.csv",
                  [
                    { header: "ID", accessor: (b) => b.id },
                    { header: "Name", accessor: (b) => b.name },
                    { header: "Type", accessor: (b) => b.type },
                    { header: "Email", accessor: (b) => b.email },
                    { header: "Phone", accessor: (b) => b.phone },
                    { header: "Status", accessor: (b) => b.status },
                    { header: "Verification", accessor: (b) => b.verification },
                    { header: "Subscription", accessor: (b) => b.subscription },
                    { header: "City", accessor: (b) => b.location?.city || "" },
                    { header: "Country", accessor: (b) => b.location?.country || "" },
                  ],
                  rows,
                )
              }
            >
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setAdding(true)}>
              <Building2 className="size-4" /> Add Business
            </Button>
          </>
        }
      />

      <div className="w-full overflow-x-auto">
        <DataTable
          rows={rows}
          columns={columns}
          filters={filters}
          getId={(r) => r.id}
          searchPlaceholder="Search business, contact or city…"
          search={(r, t) =>
            r.name.toLowerCase().includes(t) ||
            r.contactName.toLowerCase().includes(t) ||
            (r.location?.city || "").toLowerCase().includes(t)
          }
          mobileCard={(r) => (
            <Link to="/businesses/$id" params={{ id: r.id }} className="block">
              <div className="flex items-center gap-2.5">
                <UserAvatar name={r.name} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.type} · {r.location?.city || "Remote"},{" "}
                    {r.location?.countryCode || r.location?.country || "Global"}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusBadge value={r.status} />
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold">
                  {r.subscription}
                </span>
                <span className="num ml-auto text-xs text-muted-foreground">
                  {r.campaigns} campaigns
                </span>
              </div>
            </Link>
          )}
          rowAction={(r) => (
            <ActionMenu
              items={[
                {
                  label: "View",
                  node: (
                    <Link to="/businesses/$id" params={{ id: r.id }}>
                      View
                    </Link>
                  ),
                },
                { label: "Edit", onSelect: () => setEditing(r) },
                { label: "View Campaigns", node: <Link to="/campaigns">View Campaigns</Link> },
                { label: "Activate", onSelect: () => setToggling({ b: r, to: "active" }) },
                {
                  label: "Suspend",
                  onSelect: () => setToggling({ b: r, to: "suspended" }),
                  destructive: true,
                  separatorBefore: true,
                },
              ]}
            />
          )}
        />
      </div>

      <FormDialog
        open={adding}
        onOpenChange={setAdding}
        title="Add business"
        description="Manually onboard a brand account. An invite email is sent to the contact."
        fields={fields}
        initial={{ plan: "Free" }}
        submitLabel="Create business"
        onSubmit={(v) =>
          saved("Business created", `${String(v["name"])} was invited to the Business App.`)
        }
      />
      <FormDrawer
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Edit ${editing?.name ?? "business"}`}
        fields={fields}
        initial={
          editing
            ? {
                name: editing.name,
                type: editing.type,
                hq: `${editing.location.city}, ${editing.location.country}`,
                email: editing.email,
                phone: editing.phone,
                plan: editing.subscription.replace(/^Business /, ""),
              }
            : {}
        }
        onSubmit={async (v) => {
          if (!editing) return;
          try {
            await adminApi.moderateBusiness(editing.id, {
              status: editing.status === "suspended" ? "SUSPENDED" : "ACTIVE",
              verification_status: editing.verification === "verified" ? "VERIFIED" : "PENDING",
            });
          } catch (err) {
            console.warn("Failed to update business on backend:", err);
          }
          setRows((rs) =>
            rs.map((b) =>
              b.id === editing.id
                ? {
                    ...b,
                    name: String(v["name"]),
                    type: String(v["type"]),
                    email: String(v["email"]),
                    phone: String(v["phone"]),
                  }
                : b,
            ),
          );
          saved("Business updated", String(v["name"]));
        }}
      />
      <ReasonDialog
        open={Boolean(toggling)}
        onOpenChange={(o) => !o && setToggling(null)}
        title={
          toggling?.to === "suspended"
            ? `Suspend ${toggling.b.name}?`
            : `Activate ${toggling?.b.name ?? ""}?`
        }
        description={
          toggling?.to === "suspended"
            ? "The business loses access to campaigns and messaging until reactivated."
            : "The business regains full access."
        }
        confirmLabel={toggling?.to === "suspended" ? "Suspend account" : "Activate account"}
        destructive={toggling?.to === "suspended"}
        onConfirm={async () => {
          if (!toggling) return;
          const nextStatus = toggling.to === "suspended" ? "SUSPENDED" : "ACTIVE";
          try {
            await adminApi.moderateBusiness(toggling.b.id, {
              status: nextStatus,
            });
          } catch (err) {
            console.warn("Failed to toggle business status on backend:", err);
          }
          setRows((rs) =>
            rs.map((b) => (b.id === toggling.b.id ? { ...b, status: toggling.to } : b)),
          );
          saved(
            toggling.to === "suspended" ? "Account suspended" : "Account activated",
            toggling.b.name,
          );
        }}
      />
    </div>
  );
}
