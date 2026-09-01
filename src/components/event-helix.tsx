import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EventCard } from "@/components/event-card";
import type { EventItem } from "@/data/events";

/**
 * A genuine 3D helix: cards are distributed around an invisible vertical axis.
 * Position is solved with helix geometry (angle + vertical pitch + radius),
 * rendered through a CSS perspective camera, and driven by one continuous
 * motion value (`progress`) shared by the ambient rotation and scroll inertia.
 *
 * Cards are recycled: a fixed number of slots render a windowed, wrapped view
 * of the event array, so the stream loops forever without duplicated data.
 */

type Geometry = {
  /** number of card slots rendered at once (odd, so one sits at the focus) */
  slots: number;
  /** helix radius in px */
  radius: number;
  /** degrees of rotation between neighbouring cards */
  angleStep: number;
  /** vertical distance between neighbouring cards, in px */
  pitch: number;
  /** rendered card width in px */
  cardWidth: number;
  /** camera perspective in px */
  perspective: number;
};

/**
 * Card aspect (4:5 image + caption block). Collision safety is solved from it:
 * every neighbouring pair is separated either vertically (pitch >= 0.9 * card
 * height) or horizontally (radius * sin(angleStep) > card width), so the pair
 * can never touch at any point of the rotation.
 */
const CARD_ASPECT = 1.55;

function geometryFor(width: number, height: number): Geometry {
  // Mobile: tight helix, one dominant card, only a couple of peripherals.
  if (width < 640) {
    const cardWidth = Math.min(196, width * 0.5, height * 0.32);
    return {
      slots: 7,
      // Narrow viewport: a visible sideways swing (so the spiral reads as 3D)
      // while every card stays inside the screen. Vertical pitch does the
      // heavy lifting for separation.
      radius: cardWidth * 0.95,
      angleStep: 34,
      pitch: cardWidth * CARD_ASPECT * 1.34,
      cardWidth,
      perspective: 1000,
    };
  }

  // Tablet: smaller radius, depth and separation preserved.
  if (width < 1024) {
    const cardWidth = Math.min(244, height * 0.38);
    return {
      slots: 9,
      radius: cardWidth * 1.6, // sin(50°) * 1.6 = 1.23 card widths apart
      angleStep: 50,
      pitch: cardWidth * CARD_ASPECT * 0.8,
      cardWidth,
      perspective: 1400,
    };
  }
  // Desktop: wide, immersive, generous spatial separation.
  const cardWidth = Math.min(width < 1440 ? 268 : 292, height * 0.36);
  return {
    slots: 9,
    radius: cardWidth * 1.7, // sin(55°) * 1.7 = 1.39 card widths apart
    angleStep: 55,
    pitch: cardWidth * CARD_ASPECT * 0.78,
    cardWidth,
    perspective: 1800,
  };
}

const AMBIENT_SPEED = 0.055; // cards per second while idle — never stops
const MAX_SPEED = 3.2; // cards per second
const RETURN_RATE = 1.15; // how quickly velocity eases back to ambient
const WHEEL_GAIN = 0.0016;
const TOUCH_GAIN = 0.0075;

type HelixProps = {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
  /** id of the card currently pulled out of the helix, if any */
  selectedId?: string | null;
};

export function EventHelix({ events, onSelect, selectedId = null }: HelixProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progress = useRef(0);
  const velocity = useRef(AMBIENT_SPEED);
  const geometry = useRef<Geometry>(geometryFor(1280, 900));
  /** eased 0 → 1 "pulled out of the helix" amount for the selected card */
  const pull = useRef(0);
  const selectedIndex = useRef<number | null>(null);

  const [geo, setGeo] = useState<Geometry>(() => geometryFor(1280, 900));
  // `base` is the integer card index at the focus; bumping it recycles slots.
  const [base, setBase] = useState(0);
  const baseRef = useRef(0);

  const renderedBaseRef = useRef(0);
  useLayoutEffect(() => {
    renderedBaseRef.current = base;
  }, [base]);

  useEffect(() => {
    const idx = selectedId ? events.findIndex((e) => e.id === selectedId) : -1;
    selectedIndex.current = idx >= 0 ? idx : null;
  }, [selectedId, events]);


  const measure = useCallback(() => {
    const next = geometryFor(window.innerWidth, window.innerHeight);
    geometry.current = next;
    setGeo(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /** Ambient + inertial motion loop. Writes transforms directly to the DOM. */
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let lastProgress = -999;
    let lastP = -999;
    let lastSelectedIndex: number | null = -999;
    let lastBase = -999;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // A selection pulls one card out: the stream slows to a stop, the chosen
      // card travels toward the viewer, everything else recedes.
      const pullTarget = selectedIndex.current !== null ? 1 : 0;
      pull.current += (pullTarget - pull.current) * (1 - Math.exp(-4.2 * dt));
      if (Math.abs(pullTarget - pull.current) < 0.001) {
        pull.current = pullTarget;
      }
      const p = Math.max(0, Math.min(1, pull.current));

      // Velocity always eases back toward the ambient drift — smooth
      // deceleration, no snapping, and the helix never freezes.
      const ease = 1 - Math.exp(-RETURN_RATE * dt);
      velocity.current += (AMBIENT_SPEED - velocity.current) * ease;
      if (Math.abs(AMBIENT_SPEED - velocity.current) < 0.001) {
        velocity.current = AMBIENT_SPEED;
      }
      progress.current += (reduced ? AMBIENT_SPEED * 0.35 : velocity.current) * dt * (1 - p);

      const g = geometry.current;
      const half = (g.slots - 1) / 2;
      const count = events.length;

      // Recycle: keep the focus slot aligned with the nearest integer index.
      const nextBase = Math.round(progress.current);
      if (nextBase !== baseRef.current) {
        baseRef.current = nextBase;
        setBase(nextBase);
      }

      if (
        progress.current === lastProgress &&
        p === lastP &&
        selectedIndex.current === lastSelectedIndex &&
        renderedBaseRef.current === lastBase
      ) {
        frame = requestAnimationFrame(tick);
        return;
      }

      lastProgress = progress.current;
      lastP = p;
      lastSelectedIndex = selectedIndex.current;
      lastBase = renderedBaseRef.current;

      for (let i = 0; i < g.slots; i++) {
        const el = slotRefs.current[i];
        if (!el) continue;
        // Use renderedBaseRef.current so geometry matches the visible DOM
        const t = renderedBaseRef.current + (i - half) - progress.current;
        const theta = (t * g.angleStep * Math.PI) / 180;
        const x = g.radius * Math.sin(theta);
        const z = g.radius * Math.cos(theta) - g.radius; // 0 at focus, negative behind
        const y = t * g.pitch;
        const distance = Math.abs(t);

        // Depth falloff is gentle enough that the third and fourth rings stay
        // legible — that's what makes the spiral path readable as 3D.
        let opacity = Math.max(0, 1 - distance * 0.165);
        let blur = Math.min(2.2, Math.max(0, distance - 1.15) * 0.62);


        const cardIndex = (((renderedBaseRef.current + (i - half)) % count) + count) % count;
        const isChosen = selectedIndex.current === cardIndex;
        const s = isChosen ? p : 0;

        // Chosen card: glide to centre, grow, come forward, then hand over to
        // the detail view. Others: recede and fade behind it.
        const cx = x * (1 - s);
        const cy = y * (1 - s);
        const cz = z * (1 - s) + s * g.perspective * 0.18 - (isChosen ? 0 : p * 260);
        const rotation = t * g.angleStep * (1 - s);
        const scale = 1 + s * 0.5;

        if (isChosen) {
          opacity = Math.max(opacity, s) * (1 - Math.max(0, (s - 0.6) / 0.4));
          blur = blur * (1 - s);
        } else {
          opacity *= 1 - p;
          blur += p * 3;
        }

        el.style.transform = `translate3d(-50%, -50%, 0) translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, ${cz.toFixed(2)}px) rotateY(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
        el.style.zIndex = String(2000 + Math.round(cz) + (isChosen ? 500 : 0));
      }


      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [events.length]);

  /** Wheel + touch both feed the single velocity value. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const push = (amount: number) => {
      velocity.current = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, velocity.current + amount));
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      push(e.deltaY * WHEEL_GAIN);
    };

    let lastTouch: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      lastTouch = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (y == null || lastTouch == null) return;
      e.preventDefault();
      push((lastTouch - y) * TOUCH_GAIN);
      lastTouch = y;
    };
    const onTouchEnd = () => {
      lastTouch = null;
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
      stage.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const half = (geo.slots - 1) / 2;
  const count = events.length;

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="relative h-[calc(100svh-4.5rem)] w-full touch-none overflow-hidden select-none"
      style={{ perspective: `${geo.perspective}px`, perspectiveOrigin: "50% 50%" }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-0 w-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: geo.slots }, (_, i) => {
          const index = (((base + (i - half)) % count) + count) % count;
          const event = events[index]!;
          return (
            <div
              key={i}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 will-change-transform"
              style={{ width: geo.cardWidth, transformStyle: "preserve-3d" }}
            >
              <div
                role="presentation"
                onClick={() => onSelect(event)}
                className="block w-full cursor-pointer text-left"
              >
                <EventCard event={event} className="max-w-none" priority={i === half} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
