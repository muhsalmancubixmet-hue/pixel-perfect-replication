import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, SearchX, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide this column on smaller desktop widths */
  secondary?: boolean;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: string[];
  match: (row: T, value: string) => boolean;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  getId: (row: T) => string;
  search?: (row: T, term: string) => boolean;
  searchPlaceholder?: string;
  filters?: FilterDef<T>[];
  mobileCard: (row: T) => ReactNode;
  rowAction?: (row: T) => ReactNode;
  pageSize?: number;
  toolbarExtra?: ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  rows,
  columns,
  getId,
  search,
  searchPlaceholder = "Search…",
  filters = [],
  mobileCard,
  rowAction,
  pageSize = 10,
  toolbarExtra,
  onRowClick,
}: Props<T>) {
  const [term, setTerm] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const first = useRef(true);

  // Brief shimmer while search / filters change (simulates a server query).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 280);
    return () => clearTimeout(t);
  }, [term, values]);

  const clearAll = () => {
    setTerm("");
    setValues({});
    setPage(1);
  };

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (term && search && !search(row, term.toLowerCase())) return false;
      for (const f of filters) {
        const v = values[f.key];
        if (v && v !== "all" && !f.match(row, v)) return false;
      }
      return true;
    });
  }, [rows, term, values, filters, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);
  const activeFilters = Object.values(values).filter((v) => v && v !== "all").length;

  const filterControls = (
    <>
      {filters.map((f) => (
        <Select
          key={f.key}
          value={values[f.key] ?? "all"}
          onValueChange={(v) => {
            setValues((s) => ({ ...s, [f.key]: v }));
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-full text-xs sm:w-auto sm:min-w-[9.5rem]">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>
            {f.options.map((o) => (
              <SelectItem key={o} value={o} className="capitalize">
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </>
  );

  return (
    <div className="panel w-full overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center">
        {search && (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-9 pl-8 text-sm"
            />
          </div>
        )}

        <div className="hidden flex-wrap items-center gap-2 lg:flex">{filterControls}</div>

        <div className="flex items-center gap-2 lg:hidden">
          {filters.length > 0 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <Filter className="size-4" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="num ml-0.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {activeFilters}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3 p-4 pt-0">
                  {filterControls}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setValues({});
                      setPage(1);
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
          {toolbarExtra}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1 text-xs"
              onClick={() => {
                setValues({});
                setPage(1);
              }}
            >
              <X className="size-3.5" /> Clear
            </Button>
          )}
          {toolbarExtra}
        </div>
      </div>

      {/* Desktop table */}
      <div className="w-full overflow-x-auto hidden md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                    c.secondary && "hidden xl:table-cell",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
              {rowAction && <th className="sticky right-0 w-12 bg-muted px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
                <tr key={`sk-${i}`} className="border-b border-border/70">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn("px-3 py-3", c.secondary && "hidden xl:table-cell")}
                    >
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                  {rowAction && <td className="px-3 py-3" />}
                </tr>
              ))}
            {!loading &&
              slice.map((row) => (
                <tr
                  key={getId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "group border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2.5 align-middle",
                        c.secondary && "hidden xl:table-cell",
                        c.className,
                      )}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                  {rowAction && (
                    <td
                      className="sticky right-0 bg-card px-3 py-2.5 text-right group-hover:bg-muted"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {rowAction(row)}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && slice.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-5" />
            </span>
            <p className="text-sm font-semibold">No records match your filters</p>
            <p className="text-xs text-muted-foreground">
              Try a different search term or clear the filters.
            </p>
            {(term || activeFilters > 0) && (
              <Button variant="outline" size="sm" className="mt-1 h-10" onClick={clearAll}>
                <X className="size-4" /> Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 p-3 md:hidden">
        {loading &&
          Array.from({ length: 4 }, (_, i) => (
            <div
              key={`msk-${i}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          ))}
        {!loading &&
          slice.map((row) => (
            <div key={getId(row)} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn("min-w-0 flex-1", onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {mobileCard(row)}
                </div>
                {rowAction && <div className="shrink-0 [&_button]:size-10">{rowAction(row)}</div>}
              </div>
            </div>
          ))}
        {!loading && slice.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-5" />
            </span>
            <p className="text-sm font-semibold">No records match your filters</p>
            <p className="text-xs text-muted-foreground">
              Try a different search term or clear the filters.
            </p>
            {(term || activeFilters > 0) && (
              <Button variant="outline" size="sm" className="mt-1 h-10" onClick={clearAll}>
                <X className="size-4" /> Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
        <p className="num text-xs text-muted-foreground">
          {filtered.length === 0 ? 0 : (current - 1) * pageSize + 1}–
          {Math.min(current * pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="num px-2 text-xs text-muted-foreground">
            {current} / {pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end">{children}</div>;
}
