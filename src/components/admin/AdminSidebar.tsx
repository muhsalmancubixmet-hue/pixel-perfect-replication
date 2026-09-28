import { Link, useRouterState } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  Building2,
  CreditCard,
  FileClock,
  Folder,
  Globe,
  Image,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MapPin,
  Megaphone,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Tags,
  TrendingUp,
  Users,
  Wallet,
  Globe2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const GROUPS: { label: string; items: { title: string; url: string; icon: typeof Users }[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { title: "Influencers", url: "/influencers", icon: Users },
      { title: "Creator Map", url: "/discovery", icon: Globe2 },
      { title: "Businesses", url: "/businesses", icon: Building2 },
      { title: "Verification", url: "/verification", icon: BadgeCheck },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { title: "Campaigns", url: "/campaigns", icon: Megaphone },
      { title: "Requirements", url: "/requirements", icon: ListChecks },
    ],
  },
  {
    label: "Presence",
    items: [
      { title: "Websites", url: "/websites", icon: Globe },
      { title: "Domains", url: "/domains", icon: Sparkles },
      { title: "Social Platforms", url: "/social-platforms", icon: Share2 },
      { title: "Media", url: "/media", icon: Image },
    ],
  },
  {
    label: "Taxonomy",
    items: [
      { title: "Categories", url: "/categories", icon: Tags },
      { title: "Locations", url: "/locations", icon: MapPin },
      { title: "Services", url: "/services", icon: Folder },
    ],
  },
  {
    label: "Revenue",
    items: [
      { title: "Reports", url: "/reports", icon: TrendingUp },
      { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
      { title: "Payments", url: "/payments", icon: Wallet },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Audit Logs", url: "/audit-logs", icon: FileClock },
      { title: "Roles", url: "/roles", icon: ShieldCheck },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden" onClick={() => setOpenMobile(false)}>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground">
            i.
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-sidebar-accent-foreground">Influencers.com</span>
              <span className="block truncate text-[11px] text-sidebar-foreground/70">SaaS Manager</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} size="sm">
                      <Link to={item.url} onClick={() => setOpenMobile(false)}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
