import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Map as MlMap } from "maplibre-gl";
import type { EventItem } from "@/data/events";
import { cn } from "@/lib/utils";

/**
 * Real geographic map (MapLibre GL JS + OSM-derived raster tiles) with the
 * Bored? design language layered on top: warm-ivory tint on the basemap,
 * charcoal editorial markers, postcard preview.
 *
 * Markers are HTML overlays positioned every frame from map.project(), so they
 * stay attached to their true lat/lng while the user pans and zooms. Clustering
 * is done in screen space, so clusters split apart naturally as you zoom in.
 */

type EventMapProps = {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
  selectedId: string | null;
  active: boolean;
};

type Placed =
  | { kind: "pin"; key: string; x: number; y: number; event: EventItem }
  | { kind: "cluster"; key: string; x: number; y: number; items: EventItem[] };

const CLUSTER_PX = 54;

export function EventMap({ events, onSelect, selectedId, active }: EventMapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [ready, setReady] = useState(false);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [preview, setPreview] = useState<EventItem | null>(null);
  const [locating, setLocating] = useState<"idle" | "busy" | "denied">("idle");

  const center = useMemo(() => {
    // Initial viewport follows the events themselves, not a fixed country.
    const lngs = events.map((e) => e.lng);
    const lats = events.map((e) => e.lat);
    return {
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    };
  }, [events]);

  /* ---------------- map bootstrap (browser only) ---------------- */
  useEffect(() => {
    let cancelled = false;
    let map: MlMap | null = null;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !hostRef.current) return;

      map = new maplibregl.Map({
        container: hostRef.current,
        style: {
          version: 8,
          sources: {
            base: {
              type: "raster",
              tiles: [
                "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              maxzoom: 16,
              attribution:
                'Esri, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
            labels: {
              type: "raster",
              tiles: [
                "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              maxzoom: 16,
            },
          },
          layers: [
            { id: "paper", type: "background", paint: { "background-color": "#f6f1e7" } },
            { id: "base", type: "raster", source: "base", paint: { "raster-opacity": 0.9 } },
            { id: "labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.85 } },
          ],

        },
        center: [center.lng, center.lat],
        zoom: 4.2,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
      });
      const m = map;
      m.touchZoomRotate.disableRotation();
      mapRef.current = m;

      const boundsFit = () => {
        const lngs = events.map((e) => e.lng);
        const lats = events.map((e) => e.lat);
        m.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 72, duration: 0, maxZoom: 12 },
        );
      };

      m.on("load", () => {
        if (cancelled) return;
        m.resize();
        boundsFit();
        setReady(true);
      });

      const ro = new ResizeObserver(() => m.resize());
      ro.observe(hostRef.current!);
      resizeObs = ro;
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- project + cluster on every move ---------------- */
  const reproject = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts = events.map((event) => {
      const p = map.project([event.lng, event.lat]);
      return { event, x: p.x, y: p.y };
    });

    const out: Placed[] = [];
    const taken = new Set<number>();
    pts.forEach((seed, i) => {
      if (taken.has(i)) return;
      taken.add(i);
      const group = [seed];
      pts.forEach((other, j) => {
        if (j <= i || taken.has(j)) return;
        if (Math.hypot(other.x - seed.x, other.y - seed.y) < CLUSTER_PX) {
          taken.add(j);
          group.push(other);
        }
      });
      const first = group[0]!;
      if (group.length === 1) {
        out.push({ kind: "pin", key: first.event.id, x: first.x, y: first.y, event: first.event });
      } else {
        out.push({
          kind: "cluster",
          key: `c-${first.event.id}-${group.length}`,
          x: group.reduce((s2, g) => s2 + g.x, 0) / group.length,
          y: group.reduce((s2, g) => s2 + g.y, 0) / group.length,
          items: group.map((g) => g.event),
        });
      }
    });
    setPlaced(out);
  }, [events]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    reproject();
    map.on("move", reproject);
    map.on("resize", reproject);
    return () => {
      map.off("move", reproject);
      map.off("resize", reproject);
    };
  }, [ready, reproject]);

  /* the map lives in a hidden layer while the helix is on screen */
  useEffect(() => {
    if (active && ready) {
      const map = mapRef.current;
      requestAnimationFrame(() => map?.resize());
    }
  }, [active, ready]);

  const zoomTo = (place: Placed) => {
    const map = mapRef.current;
    if (!map) return;
    if (place.kind === "cluster") {
      const lngs = place.items.map((e) => e.lng);
      const lats = place.items.map((e) => e.lat);
      const same = Math.max(...lngs) - Math.min(...lngs) < 1e-4;
      if (same)
        map.easeTo({
          center: [lngs[0] ?? center.lng, lats[0] ?? center.lat],
          zoom: map.getZoom() + 2.5,
          duration: 600,
        });
      else
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 120, duration: 700, maxZoom: 16 },
        );
      return;
    }
    setPreview(place.event);
    map.easeTo({ center: [place.event.lng, place.event.lat], duration: 550 });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setLocating("denied");
      return;
    }
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating("idle");
        mapRef.current?.easeTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 13,
          duration: 900,
        });
      },
      () => {
        setLocating("denied");
        mapRef.current?.easeTo({ center: [center.lng, center.lat], zoom: 5, duration: 700 });
      },
      { timeout: 8000 },
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f6f1e7]">
      {/* real geographic canvas */}
      <div className="absolute inset-0">
        <div ref={hostRef} className="h-full w-full [&_.maplibregl-canvas]:outline-none" />
      </div>
      {/* warm ivory / editorial wash over the basemap */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[#e8dcc4] mix-blend-multiply opacity-25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(120%_100%_at_50%_50%,transparent_55%,rgba(28,28,30,0.10))]"
      />

      {/* markers */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        {placed.map((place) =>
          place.kind === "cluster" ? (
            <button
              key={place.key}
              type="button"
              onClick={() => zoomTo(place)}
              style={{ left: place.x, top: place.y, zIndex: 100000 }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 border border-ink bg-card/95 px-2.5 py-1.5 label-micro text-ink postcard-shadow transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`${place.items.length} free events here — zoom in`}
            >
              {place.items.length}
            </button>
          ) : (
            <button
              key={place.key}
              type="button"
              onClick={() => zoomTo(place)}
              style={{
                left: place.x,
                top: place.y,
                zIndex:
                  preview?.id === place.event.id || selectedId === place.event.id
                    ? 99999
                    : Math.max(1, Math.round(place.y)),
              }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`${place.event.title}, ${place.event.area}, ${place.event.city}`}
            >
              <span
                className={cn(
                  "flex flex-col items-center gap-0 transition-transform duration-300",
                  (preview?.id === place.event.id || selectedId === place.event.id) && "scale-[1.12]",
                )}
              >
                <span
                  className={cn(
                    "border px-2 py-1 label-micro whitespace-nowrap transition-colors",
                    preview?.id === place.event.id || selectedId === place.event.id
                      ? "border-ink bg-primary text-primary-foreground"
                      : "border-border bg-card/95 text-ink postcard-shadow",
                  )}
                >
                  {place.event.area}
                </span>
                <span className="h-3 w-px bg-ink/70" />
                <span className="mb-[-3px] h-1.5 w-1.5 rotate-45 bg-ink" />
              </span>
            </button>
          ),
        )}
      </div>

      {/* controls */}
      <div className="absolute bottom-20 right-4 z-[3] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={locate}
          className="border border-border bg-card/95 px-3 py-2 label-micro text-ink postcard-shadow transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {locating === "busy" ? "Locating…" : locating === "denied" ? "Location off" : "Locate me"}
        </button>
        <div className="flex border border-border bg-card/95 postcard-shadow">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
            className="min-h-9 w-9 label-micro text-ink transition-colors hover:bg-secondary"
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
            className="min-h-9 w-9 border-l border-silver label-micro text-ink transition-colors hover:bg-secondary"
          >
            −
          </button>
        </div>
      </div>

      {/* postcard preview */}
      {preview && (
        <div className="absolute bottom-16 left-1/2 z-[4] w-[min(20rem,calc(100vw-2.5rem))] -translate-x-1/2">
          <div className="relative border border-border bg-card p-2.5 postcard-shadow">
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label="Close preview"
              className="absolute right-2 top-2 z-[1] bg-card/90 px-2 py-1 label-micro text-muted-foreground hover:text-ink"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={() => onSelect(preview)}
              className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="grain relative block overflow-hidden bg-muted">
                <img
                  src={preview.image}
                  alt={`${preview.title} in ${preview.city}`}
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-0 top-0 m-2 bg-primary px-2 py-1 label-micro text-primary-foreground">
                  Free
                </span>
              </span>
              <span className="block px-1 pt-3">
                <span className="display-tight block text-[1.3rem]">{preview.title}</span>
                <span className="mt-2 block rule-silver pt-2 label-micro text-muted-foreground">
                  {preview.date} <span className="text-silver-deep">/</span> {preview.time}
                </span>
                <span className="mt-1.5 block font-display text-[1rem] italic leading-none text-ink/85">
                  {preview.area}, {preview.city}
                </span>
                <span className="mt-3 block label-micro text-ink underline decoration-silver-deep underline-offset-4">
                  Open event
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
