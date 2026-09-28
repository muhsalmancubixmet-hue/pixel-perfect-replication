import { Link } from "@tanstack/react-router";
import { Bell, ChevronDown, Plus, Share2, Tags, TrendingUp, UserPlus, Building2, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { notifications } from "@/data/mock";

const QUICK_ACTIONS = [
  { label: "Add Influencer", icon: UserPlus, to: "/influencers" },
  { label: "Add Business", icon: Building2, to: "/businesses" },
  { label: "Add Category", icon: Tags, to: "/categories" },
  { label: "Add Social Platform", icon: Share2, to: "/social-platforms" },
  { label: "Review Requests", icon: BadgeCheck, to: "/verification" },
  { label: "View Reports", icon: TrendingUp, to: "/reports" },
] as const;

export function AdminHeader() {
  const unread = notifications.filter((n) => n.status !== "draft").length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/90 px-3 backdrop-blur-sm sm:px-4">
      <SidebarTrigger className="shrink-0" />

      <div className="flex-1 md:flex-none">
        <GlobalSearch />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="hidden gap-1.5 sm:flex">
              <Plus className="size-4" /> Quick actions
              <ChevronDown className="size-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {QUICK_ACTIONS.map((a) => (
              <DropdownMenuItem key={a.label} asChild>
                <Link to={a.to}>
                  <a.icon className="size-4" /> {a.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-4.5" />
              <span className="num absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {unread}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="border-b border-border/70 px-3 py-2.5 last:border-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                  <p className="num mt-1 text-[11px] text-muted-foreground">
                    {n.audience} · {n.schedule}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/notifications">Open notification centre</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted">
              <UserAvatar name="Mohammed Fadhil" size={28} />
              <span className="hidden text-left leading-tight lg:block">
                <span className="block text-xs font-semibold">Mohammed Fadhil</span>
                <span className="block text-[11px] text-muted-foreground">Super Admin</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>fadhil@influencers.com</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Platform settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/roles">Roles &amp; permissions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/audit-logs">Audit logs</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => toast.info("Sign out is not wired up in this prototype.")}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
