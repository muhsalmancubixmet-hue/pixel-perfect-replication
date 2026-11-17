import { useEffect, useRef } from "react";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  image?: string;
}

interface WorldMapProps {
  markers: MapMarker[];
  /** Optional search centre + radius (km) drawn as a circle. */
  center?: { lat: number; lng: number; radiusKm?: number } | null;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Reusable global map (Leaflet + OpenStreetMap, clustered markers).
 * Leaflet is imported dynamically after mount so it never runs during SSR.
 */
export function WorldMap({ markers, center, onSelect, className }: WorldMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const circleRef = useRef<import("leaflet").Circle | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      (window as unknown as { L: typeof L }).L = L;
      await import("leaflet.markercluster");
      if (cancelled || !el.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(el.current, { worldCopyJump: true, minZoom: 2 }).setView([20, 20], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = (
        L as unknown as { markerClusterGroup: () => import("leaflet").LayerGroup }
      )
        .markerClusterGroup()
        .addTo(map);
      draw();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    const icon = L.divIcon({
      className: "",
      html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:var(--primary);border:2px solid var(--background);box-shadow:0 1px 4px rgb(0 0 0 / .35)"></span>',
      iconSize: [14, 14],
    });
    markers.forEach((m) => {
      if (typeof m.lat !== "number" || typeof m.lng !== "number" || isNaN(m.lat) || isNaN(m.lng))
        return;
      const mk = L.marker([m.lat, m.lng], { icon, title: m.title });
      const div = document.createElement("div");
      div.style.minWidth = "140px";
      const strong = document.createElement("strong");
      strong.textContent = m.title;
      div.appendChild(strong);
      if (m.subtitle) {
        const sub = document.createElement("div");
        sub.style.fontSize = "11px";
        sub.style.opacity = "0.7";
        sub.textContent = m.subtitle;
        div.appendChild(sub);
      }
      mk.bindPopup(div);
      mk.on("click", () => selectRef.current?.(m.id));
      layer.addLayer(mk);
    });
    circleRef.current?.remove();
    circleRef.current = null;
    if (center) {
      if (center.radiusKm) {
        circleRef.current = L.circle([center.lat, center.lng], {
          radius: center.radiusKm * 1000,
          color: "var(--primary)",
          weight: 1,
          fillOpacity: 0.08,
        }).addTo(map);
        map.fitBounds(circleRef.current.getBounds(), { maxZoom: 11 });
      } else {
        map.setView([center.lat, center.lng], 10);
      }
    } else if (markers.length) {
      map.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng])), {
        padding: [30, 30],
        maxZoom: 6,
      });
    }
  }

  useEffect(draw, [markers, center]);

  return <div ref={el} className={className} style={{ zIndex: 0 }} />;
}
