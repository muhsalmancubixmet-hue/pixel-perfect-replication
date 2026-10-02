import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { FormDialog, saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { adminStaff, permissionMatrix, roles } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — Influencers.com SaaS Manager" },
      { name: "description", content: "Admin roles and the permission matrix that governs staff access." },
      { property: "og:title", content: "Roles & Permissions — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Admin roles and the permission matrix governing staff access." },
    ],
  }),
  component: RolesPage,
});

const TONE: Record<string, string> = {
  Full: "bg-success/12 text-success",
  Manage: "bg-info/10 text-info",
  Moderate: "bg-accent text-accent-foreground",
  Limited: "bg-warning/18 text-warning-foreground",
  View: "bg-muted text-muted-foreground",
  None: "bg-destructive/8 text-destructive",
};

type Staff = (typeof adminStaff)[number] & { active: boolean };

function RolesPage() {
  const [staff, setStaff] = useState<Staff[]>(adminStaff.map((s) => ({ ...s, active: true })));
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Roles & permissions"
        description="Who can do what inside the SaaS Manager."
        actions={
          <Button size="sm" onClick={() => setInviting(true)}>
            <UserPlus className="size-4" /> Invite admin
          </Button>
        }
      />

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="sticky left-0 bg-muted/50 px-3 py-2.5">Permission</th>
              {roles.map((r) => (
                <th key={r} className="px-3 py-2.5 text-center">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map((row) => (
              <tr key={row.area} className="border-b border-border/70 last:border-0">
                <td className="sticky left-0 bg-card px-3 py-2.5 text-sm font-medium">{row.area}</td>
                {roles.map((r) => (
                  <td key={r} className="px-3 py-2.5 text-center">
                    <span
                      className={cn(
                        "inline-block min-w-16 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        TONE[row.levels[r] ?? "None"] ?? TONE["None"],
                      )}
                    >
                      {row.levels[r]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Admin team</h3>
        </div>
        <div className="divide-y divide-border/70">
          {staff.map((s) => (
            <div key={s.email} className="flex items-center gap-3 px-4 py-2.5">
              <UserAvatar name={s.name} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="num truncate text-xs text-muted-foreground">{s.email}</p>
              </div>
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold">{s.role}</span>
              {!s.active && <span className="text-[11px] font-semibold text-destructive">Inactive</span>}
              <span className="hidden text-xs text-muted-foreground sm:block">{s.lastActive}</span>
              <Button variant="ghost" size="sm" className="h-9 px-3 text-xs" onClick={() => setEditing(s)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      </div>

      <FormDialog
        open={inviting}
        onOpenChange={setInviting}
        title="Invite admin staff"
        description="They receive an email link to set a password and enrol in two-factor authentication."
        fields={[
          { name: "name", label: "Staff full name", required: true },
          { name: "email", label: "Corporate email", type: "email", placeholder: "name@influencers.com", required: true },
          { name: "role", label: "Role template", type: "select", options: roles, required: true },
        ]}
        initial={{ role: "Support" }}
        submitLabel="Send invite"
        onSubmit={(v) => {
          setStaff((s) => [...s, { name: String(v.name), email: String(v.email), role: String(v.role), lastActive: "Invited", active: true }]);
          saved("Invite sent", String(v.email));
        }}
      />
      <FormDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Edit ${editing?.name ?? "admin"}`}
        fields={[
          { name: "role", label: "Assigned role", type: "select", options: roles, required: true },
          { name: "active", label: "Account active", type: "switch" },
        ]}
        initial={editing ? { role: editing.role, active: editing.active } : {}}
        onSubmit={(v) => {
          if (!editing) return;
          setStaff((s) => s.map((x) => (x.email === editing.email ? { ...x, role: String(v.role), active: Boolean(v.active) } : x)));
          saved("Admin updated", editing.name);
        }}
      />
    </div>
  );
}
