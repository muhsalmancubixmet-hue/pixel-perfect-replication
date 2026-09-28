import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, MapPin, Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { mockAction } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locations } from "@/data/mock";
import { LEVEL_LABEL, LOCATION_LEVELS } from "@/data/geo";
import { Switch } from "@/components/ui/switch";
import type { LocationNode } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Locations — Influencers.com SaaS Manager" },
      { name: "description", content: "Global location hierarchy — countries, regions, districts, cities and areas — powering creator discovery worldwide." },
      { property: "og:title", content: "Locations — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Global location hierarchy powering creator discovery worldwide." },
    ],
  }),
  component: LocationsPage,
});

function Node({ node, depth }: { node: LocationNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = Boolean(node.children?.length);

  return (
    <div>
      <div
        className="flex items-center gap-2 border-b border-border/70 py-2 pr-3 transition-colors hover:bg-muted/40"
        style={{ paddingLeft: 12 + depth * 18 }}
      >
        {hasChildren ? (
          <button onClick={() => setOpen((o) => !o)} className="grid size-5 place-items-center" aria-label="Toggle">
            <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="grid size-5 place-items-center">
            <MapPin className="size-3.5 text-muted-foreground" />
          </span>
        )}
        <span className="flex-1 truncate text-sm font-medium">{node.name}</span>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {LEVEL_LABEL[node.type].split(" /")[0]}
        </span>
        <Switch
          defaultChecked={node.status !== "inactive"}
          aria-label={`Toggle ${node.name}`}
          onCheckedChange={(v) => mockAction(v ? "Location activated" : "Location deactivated", node.name)()}
        />
        <span className="num w-20 text-right text-xs text-muted-foreground">{node.creators} creators</span>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={mockAction("Edit location", node.name)}>
          Edit
        </Button>
      </div>
      {open && node.children?.map((child) => <Node key={child.id} node={child} depth={depth + 1} />)}
    </div>
  );
}

function LocationsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Locations"
        description="Country → region / state / province → district / county → city → area. Levels adapt per country; not every country uses every level."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Add location
          </Button>
        }
      />

      <div className="panel overflow-hidden">
        {locations.map((n) => (
          <Node key={n.id} node={n} depth={0} />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add location</DialogTitle>
            <DialogDescription>Locations are used for creator filters, requirements and campaign targeting.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label>Level</Label>
              <Select defaultValue="city">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LEVEL_LABEL[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="parent">Parent</Label>
              <Input id="parent" placeholder="e.g. United Arab Emirates › Dubai (leave empty for a country)" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="locname">Name</Label>
              <Input id="locname" placeholder="e.g. Downtown, Shoreditch, Marina" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" placeholder="25.2048" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" placeholder="55.2708" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                mockAction("Location added", "new location")();
                setOpen(false);
              }}
            >
              Add location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
