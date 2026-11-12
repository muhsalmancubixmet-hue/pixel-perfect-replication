import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { BadgeCheck, Columns2, List, Map as MapIcon, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { LocationSearch, type PickedLocation } from "@/components/admin/LocationSearch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CATEGORY_NAMES, COUNTRY_OPTIONS, LANGUAGE_OPTIONS, compact } from "@/data/mock";
import { distanceKm, placeLabel } from "@/data/geo";
import { cn } from "@/lib/utils";
import type { Influencer, SocialPlatform } from "@/data/types";
import { adminApi } from "@/lib/admin-api";

const WorldMap = lazy(() => import("@/components/admin/WorldMap").then((m) => ({ default: m.WorldMap })));

export const Route = createFileRoute("/discovery")({
  head: () => ({
    meta: [
      { title: "Creator Map — Influencers.com SaaS Manager" },
      { name: "description", content: "Discover influencers anywhere in the world with a global map, radius search and filters." },
      { property: "og:title", content: "Creator Map — Influencers.com SaaS Manager" },
      { property: "og:description", content: "Discover influencers anywhere in the world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
      { rel: "stylesheet", href: "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" },
      { rel: "stylesheet", href: "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" },
    ],
  }),
  component: DiscoveryPage,
});

const ANY = "__any";
const RADII = ["10", "25", "50", "100", "250", "500"];
const FOLLOWERS = [
  { v: "0", l: "Any" },
  { v: "10000", l: "10K+" },
  { v: "50000", l: "50K+" },
  { v: "100000", l: "100K+" },
  { v: "500000", l: "500K+" },
];

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.v} value={o.v}>
              {o.l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const anyOf = (label: string, list: string[]) => [{ v: ANY, l: `Any ${label}` }, ...list.map((x) => ({ v: x, l: x }))];

function DiscoveryPage() {
  const [influencersList, setInfluencersList] = useState<Influencer[]>([]);
  const [platformsList, setPlatformsList] = useState<SocialPlatform[]>([]);
  const [loc, setLoc] = useState<PickedLocation | null>(null);
  const [radius, setRadius] = useState("50");
  const [country, setCountry] = useState(ANY);
  const [category, setCategory] = useState(ANY);
  const [language, setLanguage] = useState(ANY);
  const [platform, setPlatform] = useState(ANY);
  const [followers, setFollowers] = useState("0");
  const [verified, setVerified] = useState(ANY);
  const [view, setView] = useState<"split" | "map" | "list">("split");
  const [mobileMap, setMobileMap] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      adminApi.getInfluencers(),
      adminApi.getSocialPlatforms(),
    ]).then(([iRes, pRes]) => {
      if (!active) return;
      if (iRes.status === "fulfilled") {
        const raw = iRes.value?.results || (Array.isArray(iRes.value) ? iRes.value : []);
        const list = raw.map((item: any) => ({
          ...item,
          id: String(item.id),
          name: item.name || item.display_name || item.handle || "Creator",
          avatar: item.avatar || item.photo_url || "",
          categories: Array.isArray(item.categories) && item.categories.length > 0 ? item.categories : ["General"],
          location: {
            city: item.location?.city || item.primary_city || "Mumbai",
            country: item.location?.country || "India",
            countryCode: item.location?.countryCode || "IN",
            lat: typeof item.location?.lat === "number" ? item.location.lat : 19.0760,
            lng: typeof item.location?.lng === "number" ? item.location.lng : 72.8777,
            currency: item.location?.currency || "INR",
            languages: item.location?.languages || ["English"],
            district: item.location?.district || "",
            region: item.location?.region || "",
          },
          serviceLocations: Array.isArray(item.serviceLocations) && item.serviceLocations.length > 0 ? item.serviceLocations : ["Worldwide"],
          languages: Array.isArray(item.languages) && item.languages.length > 0 ? item.languages : ["English"],
          platforms: Array.isArray(item.platforms) && item.platforms.length > 0 ? item.platforms : ["Instagram"],
          followers: item.followers || 0,
          engagement: typeof item.engagement === "number" ? item.engagement : 3.5,
          verification: (item.verification || "unverified").toLowerCase(),
        }));
        setInfluencersList(list);
      }
      if (pRes.status === "fulfilled") {
        const list = pRes.value?.results || (Array.isArray(pRes.value) ? pRes.value : []);
        setPlatformsList(list);
      }
    });
    return () => { active = false; };
  }, []);

  const results = useMemo(
    () =>
      influencersList.filter(
        (i) =>
          (!loc || (i.location && typeof i.location.lat === "number" && typeof i.location.lng === "number" && distanceKm(loc, i.location) <= Number(radius))) &&
          (country === ANY || i.location?.country === country) &&
          (category === ANY || (i.categories || []).includes(category)) &&
          (language === ANY || (i.languages || []).includes(language)) &&
          (platform === ANY || (i.platforms || []).includes(platform)) &&
          (i.followers || 0) >= Number(followers) &&
          (verified === ANY || i.verification === verified),
      ),
    [influencersList, loc, radius, country, category, language, platform, followers, verified],
  );

  const markers = useMemo(
    () =>
      results
        .filter((i) => i.location && typeof i.location.lat === "number" && typeof i.location.lng === "number" && !isNaN(i.location.lat) && !isNaN(i.location.lng))
        .map((i) => ({
          id: i.id,
          lat: i.location.lat,
          lng: i.location.lng,
          title: i.name,
          subtitle: `${(i.categories && i.categories[0]) || "Creator"} · ${i.location?.city ? placeLabel(i.location) : "Global"} · ${compact(i.followers || 0)}`,
        })),
    [results],
  );
  const center = useMemo(() => (loc ? { ...loc, radiusKm: Number(radius) } : null), [loc, radius]);

  const filters = (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Location</Label>
        <LocationSearch value={loc} onChange={setLoc} />
      </div>
      <FilterSelect label="Radius" value={radius} onChange={setRadius} options={RADII.map((r) => ({ v: r, l: `${r} km` }))} />
      <FilterSelect label="Country" value={country} onChange={setCountry} options={anyOf("country", COUNTRY_OPTIONS)} />
      <FilterSelect label="Category" value={category} onChange={setCategory} options={anyOf("category", CATEGORY_NAMES)} />
      <FilterSelect label="Language" value={language} onChange={setLanguage} options={anyOf("language", LANGUAGE_OPTIONS)} />
      <FilterSelect
        label="Social platform"
        value={platform}
        onChange={setPlatform}
        options={anyOf("platform", platformsList.filter((p: any) => p.status === "active").map((p: any) => p.name))}
      />
      <FilterSelect label="Followers" value={followers} onChange={setFollowers} options={FOLLOWERS} />
      <FilterSelect
        label="Verification"
        value={verified}
        onChange={setVerified}
        options={[
          { v: ANY, l: "Any status" },
          { v: "verified", l: "Verified" },
          { v: "pending", l: "Pending" },
          { v: "unverified", l: "Unverified" },
        ]}
      />
    </div>
  );

  const map = (
    <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
      <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
        <WorldMap markers={markers} center={center} onSelect={setSelected} className="h-full w-full" />
      </Suspense>
    </ClientOnly>
  );

  const list = (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
      {results.map((i) => (
        <Link
          key={i.id}
          to="/influencers/$id"
          params={{ id: i.id }}
          className={cn(
            "panel flex items-center gap-3 p-3 transition-colors hover:border-primary/50",
            selected === i.id && "border-primary ring-1 ring-primary",
          )}
        >
          <UserAvatar name={i.name} src={i.avatar} size={40} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-sm font-semibold">
              {i.name}
              {i.verification === "verified" && <BadgeCheck className="size-3.5 text-primary" />}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {(Array.isArray(i.categories) ? i.categories : ["General"]).join(", ")} · {i.location?.city ? placeLabel(i.location) : "Global"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Available: {(Array.isArray(i.serviceLocations) ? i.serviceLocations : ["Worldwide"]).join(" · ")}
            </p>
          </div>
          <div className="text-right">
            <p className="num text-sm font-bold">{compact(i.followers || 0)}</p>
            <p className="num text-[11px] text-muted-foreground">{i.engagement ?? 3.5}% eng.</p>
          </div>
        </Link>
      ))}
      {results.length === 0 && (
        <div className="panel p-8 text-center text-sm text-muted-foreground">
          No creators match. Try a larger radius or another location.
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Creator Map"
        description="Discover influencers anywhere in the world. Demo data spans several markets, including Kerala."
        actions={
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as typeof view)}
            className="hidden rounded-md border border-border md:flex"
          >
            <ToggleGroupItem value="list" aria-label="List view"><List className="size-4" /></ToggleGroupItem>
            <ToggleGroupItem value="split" aria-label="Split view"><Columns2 className="size-4" /></ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map view"><MapIcon className="size-4" /></ToggleGroupItem>
          </ToggleGroup>
        }
      />

      {/* Mobile controls */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex-1"><LocationSearch value={loc} onChange={setLoc} /></div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Filters"><SlidersHorizontal className="size-4" /></Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="p-4">{filters}</div>
          </SheetContent>
        </Sheet>
        <Button variant="outline" size="icon" aria-label="Toggle map" onClick={() => setMobileMap((m) => !m)}>
          {mobileMap ? <List className="size-4" /> : <MapIcon className="size-4" />}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="num font-semibold text-foreground">{results.length}</span> creators
        {loc ? ` within ${radius} km of ${loc.label.split(",")[0]}` : " worldwide"}
      </p>

      {/* Mobile body */}
      <div className="md:hidden">
        {mobileMap ? <div className="h-[65vh] overflow-hidden rounded-lg border border-border">{map}</div> : list}
      </div>

      {/* Desktop body */}
      <div className="hidden gap-4 md:grid md:grid-cols-[240px_1fr]">
        <aside className="panel h-fit p-4">{filters}</aside>
        <div className={cn("grid gap-4", view === "split" && "xl:grid-cols-[1fr_380px]")}>
          {view !== "list" && (
            <div className={cn("overflow-hidden rounded-lg border border-border", view === "map" ? "h-[680px]" : "h-[560px]")}>
              {map}
            </div>
          )}
          {view !== "map" && <div className={cn(view === "split" && "xl:max-h-[560px] xl:overflow-y-auto")}>{list}</div>}
        </div>
      </div>
    </div>
  );
}
