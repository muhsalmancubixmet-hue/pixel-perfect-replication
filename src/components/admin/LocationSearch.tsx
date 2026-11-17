import { useEffect, useState } from "react";
import { MapPin, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { DEMO_PLACES } from "@/data/geo";

export interface PickedLocation {
  label: string;
  lat: number;
  lng: number;
}

/**
 * Global location search — countries, regions, cities, areas and postcodes.
 * Uses OpenStreetMap Nominatim geocoding; demo places are suggested instantly.
 */
export function LocationSearch({
  value,
  onChange,
}: {
  value: PickedLocation | null;
  onChange: (v: PickedLocation | null) => void;
}) {
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<PickedLocation[]>([]);
  const [open, setOpen] = useState(false);

  const local: PickedLocation[] = q.trim()
    ? DEMO_PLACES.filter((p) =>
        `${p.city} ${p.region} ${p.country}`.toLowerCase().includes(q.trim().toLowerCase()),
      )
        .slice(0, 5)
        .map((p) => ({ label: `${p.city}, ${p.country}`, lat: p.lat, lng: p.lng }))
    : [];

  useEffect(() => {
    if (q.trim().length < 3) {
      setRemote([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q.trim())}`,
        { signal: ctrl.signal, headers: { Accept: "application/json" } },
      )
        .then((r) => r.json())
        .then((rows: { display_name: string; lat: string; lon: string }[]) =>
          setRemote(
            rows.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) })),
          ),
        )
        .catch(() => {});
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const results = [
    ...local,
    ...remote.filter((r) => !local.some((l) => r.label.startsWith(l.label.split(",")[0]!))),
  ];

  if (value) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
        <MapPin className="size-4 shrink-0 text-primary" />
        <span className="flex-1 truncate">{value.label}</span>
        <button aria-label="Clear location" onClick={() => onChange(null)}>
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search any city, country or postcode…"
        className="pl-9"
      />
      {open && results.length > 0 && (
        <div className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {results.slice(0, 8).map((r) => (
            <button
              key={`${r.label}-${r.lat}`}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(r);
                setQ("");
                setOpen(false);
              }}
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
