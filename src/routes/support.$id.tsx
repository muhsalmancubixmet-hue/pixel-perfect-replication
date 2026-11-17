import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Lock, Paperclip, Send } from "lucide-react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { saved } from "@/components/admin/Dialogs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STAFF_NAMES, businesses, getTicket, ticketThread } from "@/data/mock";
import type { Ticket, TicketMessage } from "@/data/types";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/admin-api";

const STATUSES: Ticket["status"][] = ["open", "in progress", "waiting", "resolved", "closed"];

export const Route = createFileRoute("/support/$id")({
  loader: async ({ params }) => {
    try {
      const data = await adminApi.getSupportTicketDetail(params.id);
      if (data && data.id) {
        let rawMsgs: any[] = [];
        try {
          rawMsgs = await adminApi.getSupportTicketMessages(params.id);
        } catch {
          // ignore
        }
        const ticket: Ticket = {
          id: data.id,
          user: data.user_name || data.user_email || "Platform User",
          subject: data.subject || "Support Inquiry",
          category: data.category || "General",
          priority: (data.priority ? data.priority.toLowerCase() : "medium") as Ticket["priority"],
          status: (data.status
            ? data.status.toLowerCase().replace("_", " ")
            : "open") as Ticket["status"],
          created: data.created_at ? new Date(data.created_at).toLocaleDateString() : "Recent",
          assignee: data.assignee_name || "Mohammed Fadhil",
        };
        const messages: TicketMessage[] = (Array.isArray(rawMsgs) ? rawMsgs : [])
          .filter((m: any) => !m.is_internal_note)
          .map((m: any) => ({
            id: m.id,
            from:
              m.author_name?.includes("Admin") || m.author_name?.includes("Fadhil")
                ? "staff"
                : "user",
            author: m.author_name || "Support",
            body: m.body,
            time: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now",
          }));
        const notes = (Array.isArray(rawMsgs) ? rawMsgs : [])
          .filter((m: any) => m.is_internal_note)
          .map((m: any) => ({
            author: m.author_name || "Staff",
            body: m.body,
            time: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now",
          }));
        return { ticket, initialMessages: messages, initialNotes: notes };
      }
    } catch (err) {
      console.error("Failed to load live support ticket:", err);
      // fallback to mock
    }
    const ticket = getTicket(params.id);
    if (!ticket) throw notFound();
    return { ticket, initialMessages: [], initialNotes: [] };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Ticket unavailable — SaaS Manager" },
          { name: "robots", content: "noindex" },
        ],
      };
    const title = `${loaderData.ticket.id} · ${loaderData.ticket.subject}`;
    const description = `Support conversation with ${loaderData.ticket.user}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="panel p-8 text-center text-sm font-semibold">Ticket not found</div>
  ),
  component: TicketConsole,
});

function TicketConsole() {
  const { ticket, initialMessages, initialNotes } = Route.useLoaderData();
  const thread = ticketThread(ticket);
  const isBusiness = businesses.some((b) => b.name === ticket.user);
  const [status, setStatus] = useState(ticket.status);
  const [assignee, setAssignee] = useState(ticket.assignee);
  const [messages, setMessages] = useState<TicketMessage[]>(
    initialMessages && initialMessages.length > 0 ? initialMessages : thread.messages,
  );
  const [notes, setNotes] = useState(
    initialNotes && initialNotes.length > 0 ? initialNotes : thread.notes,
  );
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");

  const send = async () => {
    if (!reply.trim()) return;
    try {
      await adminApi.sendSupportTicketMessage(ticket.id, { body: reply, is_internal_note: false });
    } catch {
      // handled
    }
    setMessages((m) => [
      ...m,
      {
        id: `m${m.length + 1}`,
        from: "staff",
        author: "Mohammed Fadhil",
        body: reply,
        time: "Just now",
      },
    ]);
    setReply("");
    saved("Reply sent", ticket.user);
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/support"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All tickets
      </Link>

      <div className="panel flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="num text-xs text-muted-foreground">{ticket.id}</span>
            <StatusBadge value={ticket.priority} />
            <span className="text-xs text-muted-foreground">{ticket.category}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
          <UserAvatar name={ticket.user} size={34} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{ticket.user}</p>
            <p className="text-xs text-muted-foreground">
              {isBusiness ? "Business account" : "Creator account"}
            </p>
          </div>
        </div>
        <Select
          value={status}
          onValueChange={async (v) => {
            const newStatus = v as Ticket["status"];
            try {
              await adminApi.updateSupportTicket(ticket.id, {
                status: newStatus.toUpperCase().replace(" ", "_"),
              });
            } catch {
              // fallback
            }
            setStatus(newStatus);
            saved("Status updated", v);
          }}
        >
          <SelectTrigger className="h-10 w-full capitalize lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <section className="panel flex min-w-0 flex-1 flex-col">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Conversation</h2>
          </div>
          <div className="flex flex-col gap-3 p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex gap-2.5", m.from === "staff" && "flex-row-reverse")}
              >
                <UserAvatar name={m.author} size={30} />
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg border px-3 py-2",
                    m.from === "staff"
                      ? "border-primary/20 bg-accent"
                      : "border-border bg-muted/50",
                  )}
                >
                  <p className="text-xs font-semibold">
                    {m.author}{" "}
                    <span className="num font-normal text-muted-foreground">· {m.time}</span>
                  </p>
                  <p className="mt-1 text-sm">{m.body}</p>
                  {m.attachment && (
                    <button
                      type="button"
                      onClick={() => saved("Attachment preview", m.attachment?.name)}
                      className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs"
                    >
                      <Paperclip className="size-3.5" /> {m.attachment.name} · {m.attachment.size}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto border-t border-border p-3">
            <Textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Reply to ${ticket.user}…`}
            />
            <div className="mt-2 flex justify-between gap-2">
              <Button
                variant="ghost"
                className="h-10"
                onClick={() => saved("Attachment added", "screenshot.png")}
              >
                <Paperclip className="size-4" /> Attach
              </Button>
              <Button className="h-10" disabled={!reply.trim()} onClick={send}>
                <Send className="size-4" /> Send reply
              </Button>
            </div>
          </div>
        </section>

        <aside className="panel lg:w-80 lg:shrink-0">
          <Tabs defaultValue="details" className="p-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Internal notes</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-3 flex flex-col gap-3 text-sm">
              {[
                ["Ticket ID", ticket.id],
                ["Created", ticket.created],
                ["Category", ticket.category],
                ["Priority", ticket.priority],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/70 pb-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="num font-medium capitalize">{v}</span>
                </div>
              ))}
              <div className="grid gap-1.5">
                <span className="text-xs text-muted-foreground">Assigned staff</span>
                <Select
                  value={assignee}
                  onValueChange={(v) => {
                    setAssignee(v);
                    saved("Ticket reassigned", v);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_NAMES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-3 flex flex-col gap-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" /> Only staff can see these notes.
              </p>
              {notes.map((n, i) => (
                <div
                  key={i}
                  className="rounded-md border border-warning/35 bg-warning/10 p-2.5 text-sm"
                >
                  <p className="text-xs font-semibold">
                    {n.author}{" "}
                    <span className="num font-normal text-muted-foreground">· {n.time}</span>
                  </p>
                  <p className="mt-0.5">{n.body}</p>
                </div>
              ))}
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a private note…"
              />
              <Button
                variant="outline"
                className="h-10"
                disabled={!note.trim()}
                onClick={async () => {
                  try {
                    await adminApi.sendSupportTicketMessage(ticket.id, {
                      body: note,
                      is_internal_note: true,
                    });
                  } catch {
                    // fallback
                  }
                  setNotes((ns) => [
                    ...ns,
                    { author: "Mohammed Fadhil", body: note, time: "Just now" },
                  ]);
                  setNote("");
                }}
              >
                Add note
              </Button>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
