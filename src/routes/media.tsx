import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, FileVideo, HardDrive, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column, type FilterDef } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog, saved } from "@/components/admin/Dialogs";
import { media } from "@/data/mock";
import type { MediaItem } from "@/data/types";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media Library — Influencers.com SaaS Manager" },
      { name: "description", content: "Central overview of portfolio images, videos, avatars and website media." },
      { property: "og:title", content: "Media Library — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Central overview of portfolio images, videos and website media." },
    ],
  }),
  component: MediaPage,
});

const mb = (kb: number) => `${(kb / 1024).toFixed(1)} MB`;

const cdnUrl = (m: MediaItem) => `https://cdn.influencers.com/media/${m.id.toLowerCase()}/${m.name}`;

function MediaPage() {
  const [rows, setRows] = useState<MediaItem[]>(media);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState<MediaItem | null>(null);
  const copy = async (m: MediaItem) => {
    try {
      await navigator.clipboard.writeText(cdnUrl(m));
      toast.success("CDN URL copied", { description: cdnUrl(m) });
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };
  const totalKb = media.reduce((a, m) => a + m.size, 0);
  const images = media.filter((m) => m.type === "image").length;
  const videos = media.filter((m) => m.type === "video").length;
  const quotaPct = Math.min(100, Math.round((totalKb / 1024 / 5120) * 100));

  const columns: Column<MediaItem>[] = [
    {
      key: "file",
      header: "File",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
            {r.type === "video" ? <FileVideo className="size-4" /> : <ImageIcon className="size-4" />}
          </span>
          <span className="num truncate text-xs">{r.name}</span>
        </div>
      ),
    },
    { key: "type", header: "Type", cell: (r) => <span className="text-xs capitalize">{r.type}</span> },
    { key: "creator", header: "Creator", cell: (r) => <span className="text-xs">{r.creator}</span> },
    { key: "size", header: "Size", cell: (r) => <span className="num text-xs font-semibold">{mb(r.size)}</span> },
    { key: "uploaded", header: "Uploaded", cell: (r) => <span className="num text-xs text-muted-foreground">{r.uploaded}</span> },
  ];

  const filters: FilterDef<MediaItem>[] = [
    { key: "type", label: "File type", options: ["image", "video", "avatar", "website"], match: (r, v) => r.type === v },
    {
      key: "creator",
      label: "Creator",
      options: [...new Set(media.map((m) => m.creator))].sort(),
      match: (r, v) => r.creator === v,
    },
    {
      key: "uploaded",
      label: "Upload date",
      options: ["Last 30 days", "Last 90 days", "Older"],
      match: (r, v) => {
        const days = (Date.now() - new Date(r.uploaded).getTime()) / 86400000;
        return v === "Last 30 days" ? days <= 30 : v === "Last 90 days" ? days <= 90 : days > 90;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Media" description="Portfolio, profile and website media across all creator accounts." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Files" value={String(media.length)} icon={ImageIcon} delta={7.6} />
        <StatCard label="Images" value={String(images)} icon={ImageIcon} delta={5.1} />
        <StatCard label="Videos" value={String(videos)} icon={FileVideo} delta={12.9} />
        <StatCard label="Storage used" value={`${(totalKb / 1024 / 1024).toFixed(2)} GB`} icon={HardDrive} hint="of 5 TB plan" />
      </div>

      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium">Storage usage</span>
          <span className="num text-muted-foreground">{quotaPct}% of allocated quota</span>
        </div>
        <Progress value={quotaPct} />
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          rows={rows}
          onRowClick={setPreview}
          columns={columns}
          filters={filters}
          getId={(r) => r.id}
          searchPlaceholder="Search file or creator…"
          search={(r, t) => r.name.toLowerCase().includes(t) || r.creator.toLowerCase().includes(t)}
          mobileCard={(r) => (
            <>
              <p className="num truncate text-sm font-semibold">{r.name}</p>
              <p className="truncate text-xs text-muted-foreground">{r.creator}</p>
              <p className="num mt-1 text-xs text-muted-foreground">
                {r.type} · {mb(r.size)} · {r.uploaded}
              </p>
            </>
          )}
          rowAction={(r) => (
            <ActionMenu
              items={[
                { label: "Preview", onSelect: () => setPreview(r) },
                { label: "Copy CDN URL", onSelect: () => void copy(r) },
                { label: "Delete", onSelect: () => setDeleting(r), destructive: true, separatorBefore: true },
              ]}
            />
          )}
        />
      </div>

      <Dialog open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="num truncate pr-6">{preview?.name}</DialogTitle>
            <DialogDescription>Uploaded by {preview?.creator}</DialogDescription>
          </DialogHeader>
          {preview && (
            <>
              <div className="grid aspect-video place-items-center rounded-lg border border-border bg-muted text-muted-foreground">
                {preview.type === "video" ? <FileVideo className="size-12" /> : <ImageIcon className="size-12" />}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                {[
                  ["Type", preview.type],
                  ["Size", mb(preview.size)],
                  ["Uploaded", preview.uploaded],
                  ["File ID", preview.id],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="num font-medium capitalize">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="num truncate rounded-md bg-muted px-3 py-2 text-xs">{cdnUrl(preview)}</p>
            </>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-10 text-destructive" onClick={() => preview && setDeleting(preview)}>
              <Trash2 className="size-4" /> Delete
            </Button>
            <Button className="h-10" onClick={() => preview && void copy(preview)}>
              <Copy className="size-4" /> Copy CDN URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this file?"
        description={`${deleting?.name ?? ""} will be removed from the creator's library and website. This can't be undone.`}
        confirmLabel="Delete file"
        onConfirm={() => {
          if (!deleting) return;
          setRows((rs) => rs.filter((m) => m.id !== deleting.id));
          setPreview(null);
          saved("File deleted", deleting.name);
        }}
      />
    </div>
  );
}
