import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { adminApi } from "@/lib/admin-api";

interface SearchResultItem {
  id: string;
  label: string;
  sub: string;
  group: string;
  to: string;
  params?: Record<string, string>;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }

    let active = true;
    const timeout = setTimeout(() => {
      Promise.allSettled([
        adminApi.getInfluencers({ search: query }),
        adminApi.getBusinesses({ search: query }),
        adminApi.getCampaigns({ search: query }),
      ]).then(([infRes, bizRes, campRes]) => {
        if (!active) return;
        const items: SearchResultItem[] = [];

        if (infRes.status === "fulfilled" && infRes.value) {
          const list = infRes.value.results || (Array.isArray(infRes.value) ? infRes.value : []);
          list.slice(0, 4).forEach((i: any) => {
            items.push({
              id: i.id,
              label: i.name || i.handle || "Influencer",
              sub: `${i.handle || ""} · ${i.category || "Creator"}`,
              group: "Influencers",
              to: "/influencers/$id",
              params: { id: i.id },
            });
          });
        }

        if (bizRes.status === "fulfilled" && bizRes.value) {
          const list = bizRes.value.results || (Array.isArray(bizRes.value) ? bizRes.value : []);
          list.slice(0, 4).forEach((b: any) => {
            items.push({
              id: b.id,
              label: b.name || b.company_name || "Business",
              sub: `${b.type || "Brand"} · ${b.hq_city || "Global"}`,
              group: "Businesses",
              to: "/businesses/$id",
              params: { id: b.id },
            });
          });
        }

        if (campRes.status === "fulfilled" && campRes.value) {
          const list = campRes.value.results || (Array.isArray(campRes.value) ? campRes.value : []);
          list.slice(0, 4).forEach((c: any) => {
            items.push({
              id: c.id,
              label: c.title || "Campaign",
              sub: `${c.business || "Brand"} · ${c.category || ""}`,
              group: "Campaigns",
              to: "/campaigns/$id",
              params: { id: c.id },
            });
          });
        }

        setResults(items);
      });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [term]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof results>();
    results.forEach((r) => map.set(r.group, [...(map.get(r.group) ?? []), r]));
    return [...map.entries()];
  }, [results]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search platform"
        className="flex size-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-muted/60 text-sm text-muted-foreground transition-colors hover:bg-muted sm:size-10 md:h-9 md:w-80 md:shrink md:justify-start md:px-3"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden flex-1 text-left md:inline">Search platform…</span>
        <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium md:inline">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search influencers, businesses, campaigns…"
          value={term}
          onValueChange={setTerm}
        />
        <CommandList>
          <CommandEmpty>
            {term ? "No matches found." : "Start typing to search the platform."}
          </CommandEmpty>
          {groups.map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`${r.label} ${r.sub} ${r.id}`}
                  onSelect={() => {
                    setOpen(false);
                    setTerm("");
                    navigate({ to: r.to, params: r.params as never });
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
