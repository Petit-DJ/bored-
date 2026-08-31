import { useCallback, useEffect, useState } from "react";
import { EventDetail } from "@/components/event-detail";
import { EventGrid } from "@/components/event-grid";
import { EventHelix } from "@/components/event-helix";
import { EventMap } from "@/components/event-map";
import { OrbitField } from "@/components/orbit-field";
import { ViewToggle, type DiscoveryMode } from "@/components/view-toggle";

import { fetchApprovedEvents, type EventItem } from "@/data/events";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function Discovery() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchApprovedEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load events:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const [mode, setMode] = useState<DiscoveryMode>("helix");
  // Once the map has been opened it stays mounted, so its centre, zoom and
  // preview survive every trip back to the helix.
  const [mapMounted, setMapMounted] = useState(false);
  const [selected, setSelected] = useState<EventItem | null>(null);
  // The detail layer waits for the card to travel forward before it appears.
  const [detailVisible, setDetailVisible] = useState(false);

  const changeMode = useCallback((next: DiscoveryMode) => {
    if (next === "map") setMapMounted(true);
    setMode(next);
  }, []);

  const select = useCallback(
    (event: EventItem) => {
      setSelected(event);
      if (reduced) {
        setDetailVisible(true);
        return;
      }
      window.setTimeout(() => setDetailVisible(true), 320);
    },
    [reduced],
  );

  const close = useCallback(() => {
    setDetailVisible(false);
    // Let the detail fade before the card settles back into its helix slot.
    window.setTimeout(() => setSelected(null), reduced ? 0 : 240);
  }, [reduced]);

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <OrbitField />
        <div className="z-10 flex flex-col items-center gap-4 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          <p className="label-caps text-muted-foreground">Gathering events...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <OrbitField />
        <div className="z-10 flex max-w-md flex-col items-center gap-6 p-8 text-center bg-card border border-border postcard-shadow">
          <p className="label-caps text-red-500">Connection Error</p>
          <h2 className="font-display text-3xl">Couldn't load the platter.</h2>
          <p className="text-muted-foreground text-sm">
            We're having trouble connecting to the event source right now. Please check your connection or try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 border border-ink px-6 py-2 label-caps text-ink transition-colors hover:bg-ink hover:text-background"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (events.length === 0) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <OrbitField />
        <div className="z-10 flex max-w-md flex-col items-center gap-6 p-8 text-center bg-card border border-border postcard-shadow">
          <p className="label-caps text-muted-foreground">It's quiet</p>
          <h2 className="font-display text-3xl">Nothing on the platter yet.</h2>
          <p className="text-muted-foreground text-sm">
            There are no free events approved right now. Check back later or add something yourself!
          </p>
          <a 
            href="/submit" 
            className="mt-2 border border-ink bg-primary px-6 py-2 label-caps text-primary-foreground transition-colors hover:bg-transparent hover:text-ink"
          >
            Submit an Event
          </a>
        </div>
      </main>
    );
  }

  const mapLayer = mapMounted ? (
    <div
      className={
        "absolute inset-x-0 top-0 z-[2500] h-[calc(100svh-4.5rem)] transition-opacity duration-500 " +
        (mode === "map" ? "opacity-100" : "pointer-events-none opacity-0")
      }
      aria-hidden={mode !== "map"}
      inert={mode !== "map"}
    >
      <EventMap
        events={events}
        onSelect={select}
        selectedId={selected?.id ?? null}
        active={mode === "map"}
      />
    </div>
  ) : null;

  return (
    <main className="relative overflow-hidden">
      <OrbitField />
      {reduced ? (
        <>
          <header className="relative mx-auto max-w-[1400px] px-5 pt-8 sm:px-8">
            <p className="label-micro text-muted-foreground">Happening near you</p>
            <h1 className="display-tight mt-4 text-[2.4rem] sm:text-[3.25rem]">
              Something&rsquo;s going on.
            </h1>
            <p className="mt-4 max-w-[42ch] font-display text-lg italic leading-[1.4] text-muted-foreground">
              A silver platter of things you can walk into tonight. Every one of them free.
            </p>
            <div className="mt-6">
              <ViewToggle mode={mode} onChange={changeMode} />
            </div>
          </header>
          {mode === "map" ? (
            <div className="relative mx-auto mt-6 h-[70svh] max-w-[1400px] border border-border">
              <EventMap
                events={events}
                onSelect={select}
                selectedId={selected?.id ?? null}
                active
              />
            </div>
          ) : (
            <EventGrid events={events} onSelect={select} />
          )}
        </>
      ) : (
        <>
          <div
            className={
              "transition-opacity duration-500 " +
              (mode === "map" ? "pointer-events-none opacity-0" : "opacity-100")
            }
          >
            <EventHelix events={events} onSelect={select} selectedId={selected?.id ?? null} />
          </div>

          {mapLayer}

          {/* Semantic, keyboard-navigable layer for every event — not just the
              cards currently rendered in the 3D stream. */}
          <nav
            aria-label="All free events"
            className="pointer-events-none absolute left-4 top-24 z-[3500] w-[min(22rem,calc(100vw-2rem))] focus-within:pointer-events-auto focus-within:outline-none"
          >
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto rounded-none border border-transparent bg-transparent p-0 opacity-0 [clip-path:inset(50%)] focus-within:border-border focus-within:bg-card focus-within:p-3 focus-within:opacity-100 focus-within:postcard-shadow focus-within:[clip-path:none]">
              {events.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => select(event)}
                    className="block w-full px-2 py-2 text-left text-sm transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="font-display text-base">{event.title}</span>
                    <span className="mt-0.5 block label-caps text-muted-foreground">
                      {event.date} · {event.time} · {event.city} · Free
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-[3000] px-5 pt-5 sm:px-8 md:pt-10">
            <div className="mx-auto flex max-w-[1400px] items-start justify-between gap-6">
              <div className="pr-3 pb-2">
                <p className="label-micro text-muted-foreground">
                  {mode === "map" ? "Happening around you" : "Happening near you"}
                </p>
                <h1 className="display-tight mt-3.5 max-w-[10ch] text-[2.05rem] sm:max-w-none sm:text-[2.9rem] lg:text-[3.6rem]">
                  {mode === "map" ? "Where it's going on." : "Something's going on."}
                </h1>
              </div>
              <p className="hidden max-w-[17rem] pt-1 text-right font-display text-[1.0625rem] italic leading-[1.45] tracking-[-0.01em] text-muted-foreground md:block">
                {mode === "map"
                  ? "The same platter, laid out as a city. Every point on it is free."
                  : "A silver platter of things you can walk into tonight. Every one of them free."}
              </p>
            </div>
          </div>

          {mode === "helix" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3000] bg-background/85 px-5 pb-5 pt-3 sm:px-8 md:pb-8">
              <div className="mx-auto flex max-w-[1400px] items-baseline justify-between gap-4 rule-silver pt-4">
                <p className="label-micro text-muted-foreground">Scroll to move / tap a card</p>
                <p className="label-micro text-ink">{events.length} free events</p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3600] flex justify-center pb-3">
            <ViewToggle mode={mode} onChange={changeMode} />
          </div>
        </>
      )}

      {selected && <EventDetail event={selected} visible={detailVisible} onClose={close} />}
    </main>
  );
}

