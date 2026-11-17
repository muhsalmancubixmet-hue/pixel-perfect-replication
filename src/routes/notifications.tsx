import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationItem } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Influencers.com SaaS Manager" },
      {
        name: "description",
        content: "Review platform notifications and send announcements to creators and businesses.",
      },
      { property: "og:title", content: "Notifications — Influencers.com SaaS Manager" },
      {
        property: "og:description",
        content: "Review platform notifications and send announcements.",
      },
    ],
  }),
  component: NotificationsPage,
});

const AUDIENCES = [
  "All influencers",
  "All businesses",
  "Pro influencers",
  "Premium influencers",
  "Business Pro",
  "Agency accounts",
];

function List({ items }: { items: NotificationItem[] }) {
  if (items.length === 0)
    return <p className="panel p-6 text-center text-sm text-muted-foreground">Nothing here yet.</p>;
  return (
    <div className="panel divide-y divide-border/70">
      {items.map((n) => (
        <div
          key={n.id}
          className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{n.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
          </div>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium">
            {n.audience}
          </span>
          <span className="num text-xs text-muted-foreground">{n.schedule}</span>
          <StatusBadge value={n.status} />
        </div>
      ))}
    </div>
  );
}

function NotificationsPage() {
  const [notifsList, setNotifsList] = useState<NotificationItem[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<string>(AUDIENCES[0]!);
  const [schedule, setSchedule] = useState("");

  const loadNotifications = () => {
    adminApi
      .getNotifications()
      .then((res: any) => {
        const list = res?.results || (Array.isArray(res) ? res : []);
        const mapped = list.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          audience: n.audience || "All users",
          schedule: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Now",
          status: (n.status || "sent").toLowerCase() as NotificationItem["status"],
          kind: (n.kind || "system").toLowerCase() as NotificationItem["kind"],
        }));
        setNotifsList(mapped);
      })
      .catch((err) => {
        console.warn("Could not load notifications:", err);
      });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      saved("Validation", "Both title and message are required.");
      return;
    }
    try {
      await adminApi.createNotification({
        title: title.trim(),
        message: message.trim(),
        audience,
        kind: "SYSTEM",
      });
      saved(schedule ? "Announcement scheduled" : "Announcement sent", `${title} → ${audience}`);
      setTitle("");
      setMessage("");
      setSchedule("");
      loadNotifications();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Could not dispatch announcement";
      saved("Dispatch failed", msg);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Notifications"
        description="Everything the platform has sent, plus new announcements."
      />

      <div className="grid gap-3 xl:grid-cols-[1fr_380px]">
        <Tabs defaultValue="all">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-3">
            <List items={notifsList} />
          </TabsContent>
          {(["system", "user", "campaign", "verification"] as const).map((k) => (
            <TabsContent key={k} value={k} className="mt-3">
              <List items={notifsList.filter((n) => n.kind === k)} />
            </TabsContent>
          ))}
        </Tabs>

        <div className="panel h-fit p-4">
          <h3 className="text-sm font-semibold">Send an announcement</h3>
          <p className="mb-3 text-xs text-muted-foreground">Delivered in-app and by email.</p>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ntitle">Title</Label>
              <Input
                id="ntitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Onam campaign season"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nmsg">Message</Label>
              <Textarea
                id="nmsg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What do you want them to know?"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nsched">Schedule (optional)</Label>
              <Input
                id="nsched"
                type="date"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
            <Button onClick={send} className="gap-1.5">
              <Send className="size-4" /> {schedule ? "Schedule announcement" : "Send now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
