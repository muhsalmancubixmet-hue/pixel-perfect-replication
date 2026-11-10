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
import { globalSearch } from "@/data/mock";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
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

  const results = useMemo(() => globalSearch(term), [term]);
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
        <CommandInput placeholder="Search influencers, businesses, campaigns…" value={term} onValueChange={setTerm} />
        <CommandList>
          <CommandEmpty>{term ? "No matches found." : "Start typing to search the platform."}</CommandEmpty>
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
