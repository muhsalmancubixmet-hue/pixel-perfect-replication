import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categories as seedCategories } from "@/data/mock";
import type { Category } from "@/data/types";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Influencers.com SaaS Manager" },
      { name: "description", content: "Manage the creator categories that power discovery across the platform." },
      { property: "og:title", content: "Categories — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Manage the creator categories that power discovery." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [items, setItems] = useState<Category[]>(seedCategories);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((c, i) => ({ ...c, order: i + 1 })));
  };

  const toggle = (id: string) =>
    setItems((s) => s.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c)));

  const save = () => {
    const value = name.trim();
    if (!value) return;
    if (editing) {
      setItems((s) => s.map((c) => (c.id === editing.id ? { ...c, name: value } : c)));
    } else {
      setItems((s) => [
        ...s,
        {
          id: `CAT-${8100 + s.length}`,
          name: value,
          slug: value.toLowerCase().replace(/\s+/g, "-"),
          creators: 0,
          order: s.length + 1,
          status: "active",
        },
      ]);
    }
    mockAction(editing ? "Category updated" : "Category added", value)();
    setOpen(false);
    setEditing(null);
    setName("");
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Categories"
        description="Reorder, rename and disable creator categories."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setName("");
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Add Category
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c, i) => (
          <div key={c.id} className="panel flex items-center gap-3 p-3">
            <span className="num grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
              {c.order}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{c.name}</p>
              <p className="num text-xs text-muted-foreground">{c.creators} creators</p>
            </div>
            <StatusBadge value={c.status} />
            <div className="flex flex-col">
              <Button variant="ghost" size="icon" className="size-6" onClick={() => move(i, -1)} aria-label="Move up">
                <ArrowUp className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => move(i, 1)} aria-label="Move down">
                <ArrowDown className="size-3.5" />
              </Button>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Switch checked={c.status === "active"} onCheckedChange={() => toggle(c.id)} aria-label="Enabled" />
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => {
                  setEditing(c);
                  setName(c.name);
                  setOpen(true);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
            <DialogDescription>Categories drive creator discovery, filters and campaign matching.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="catname">Category name</Label>
            <Input id="catname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Street Food" />
          </div>
          <DialogFooter>
            <Button onClick={save}>{editing ? "Save changes" : "Add category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
