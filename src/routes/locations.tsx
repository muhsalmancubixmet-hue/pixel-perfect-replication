import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/PageHeader";
import { mockAction } from "@/components/admin/ActionMenu";
import { saved } from "@/components/admin/Dialogs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locations } from "@/data/mock";
import { LEVEL_LABEL, LOCATION_LEVELS, type LocationLevel } from "@/data/geo";
import { Switch } from "@/components/ui/switch";
import type { LocationNode } from "@/data/types";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Locations — Influencers.com SaaS Manager" },
      {
        name: "description",
        content:
          "Global location hierarchy — countries, regions, districts, cities and areas — powering creator discovery worldwide.",
      },
      { property: "og:title", content: "Locations — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Global location hierarchy powering creator discovery worldwide.",
      },
    ],
  }),
  component: LocationsPage,
});

function Node({ node, depth }: { node: LocationNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = Boolean(node.children?.length);
  const normalizedType = (node.type || "city").toLowerCase() as LocationLevel;
  const label = LEVEL_LABEL[normalizedType];
  const levelText = label ? label.split(" /")[0] : String(node.type || "Location");

  return (
    <div>
      <div
        className="flex items-center gap-2 border-b border-border/70 py-2 pr-3 transition-colors hover:bg-muted/40"
        style={{ paddingLeft: 12 + depth * 18 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-5 place-items-center"
            aria-label="Toggle"
          >
            <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="grid size-5 place-items-center">
            <MapPin className="size-3.5 text-muted-foreground" />
          </span>
        )}
        <span className="flex-1 truncate text-sm font-medium">{node.name}</span>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {levelText}
        </span>
        <Switch
          defaultChecked={node.status !== "inactive"}
          aria-label={`Toggle ${node.name}`}
          onCheckedChange={async (v) => {
            try {
              await adminApi.updateLocation(node.id, { is_active: v });
              toast.success(`Location ${node.name} ${v ? "activated" : "deactivated"}`);
            } catch (err: any) {
              toast.error("Failed to update location", {
                description: err.response?.data?.detail || err.message,
              });
            }
          }}
        />
        <span className="num w-20 text-right text-xs text-muted-foreground">
          {node.creators || 0} creators
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={mockAction("Edit location", node.name)}
        >
          Edit
        </Button>
      </div>
      {open &&
        node.children?.map((child) => <Node key={child.id} node={child} depth={depth + 1} />)}
    </div>
  );
}

function LocationsPage() {
  const [items, setItems] = useState<LocationNode[]>([]);
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<string>("city");
  const [parent, setParent] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const loadLocations = () => {
    adminApi
      .getLocations()
      .then((res: any) => {
        const raw = res?.results || (Array.isArray(res) ? res : []);
        if (raw.length === 0) {
          setItems(locations);
          return;
        }
        const mapNode = (r: any): LocationNode => {
          const item: LocationNode = {
            id: String(r.id),
            name: r.name,
            type: (r.type || "city").toLowerCase() as LocationNode["type"],
            creators: r.creators || 0,
            status: r.is_active === false ? "inactive" : "active",
          };
          if (Array.isArray(r.children) && r.children.length > 0) {
            item.children = r.children.map(mapNode);
          }
          return item;
        };

        const topLevel = raw.filter((r: any) => !r.parent);
        const childMap = new Map<string, any[]>();
        raw.forEach((r: any) => {
          if (r.parent) {
            const pId = String(r.parent);
            if (!childMap.has(pId)) childMap.set(pId, []);
            childMap.get(pId)!.push(r);
          }
        });

        const buildTree = (nodes: any[]): LocationNode[] =>
          nodes.map((n) => {
            const nId = String(n.id);
            const item = mapNode(n);
            if (childMap.has(nId)) {
              item.children = buildTree(childMap.get(nId)!);
            }
            return item;
          });

        const tree = topLevel.length > 0 ? buildTree(topLevel) : raw.map(mapNode);
        setItems(tree);
      })
      .catch((err) => {
        console.warn("Could not load live locations:", err);
        setItems(locations);
      });
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleAddLocation = async () => {
    if (!name.trim()) {
      saved("Validation", "Location name is required.");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createLocation({
        name: name.trim(),
        type: level,
        parent: parent.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });
      saved("Location added", name);
      setOpen(false);
      setName("");
      setParent("");
      setLatitude("");
      setLongitude("");
      loadLocations();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.name?.[0] ||
        "Failed to create location";
      saved("Failed to add location", msg);
    } finally {
      setSubmitting(false);
    }
  };

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
        {items.map((n) => (
          <Node key={n.id} node={n} depth={0} />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add location</DialogTitle>
            <DialogDescription>
              Locations are used for creator filters, requirements and campaign targeting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
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
              <Input
                id="parent"
                value={parent}
                onChange={(e) => setParent(e.target.value)}
                placeholder="e.g. United Arab Emirates or leave empty for a country"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="locname">Name</Label>
              <Input
                id="locname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Downtown, Shoreditch, Marina"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="25.2048"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="55.2708"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={submitting} onClick={handleAddLocation}>
              {submitting ? "Adding..." : "Add location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
