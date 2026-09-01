import { useEffect, useRef, useState } from "react";
import { mapEmbedUrl, mapLinkUrl, type EventItem } from "@/data/events";
import { cn } from "@/lib/utils";
import doraLogo from "@/assets/dora_logo.png";

type EventDetailProps = {
  event: EventItem;
  onClose: () => void;
  /** true once the card-pull transition has brought the detail forward */
  visible?: boolean;
};

/**
 * The postcard, pulled out of the helix and turned over: hero on one side,
 * the details written on the other. Sized to sit inside one desktop viewport.
 */
export function EventDetail({ event, onClose, visible = true }: EventDetailProps) {
  const [interested, setInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(12);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setInterested(false);
    setInterestedCount(12);
  }, [event.id]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, event.id]);

  const needsRegistration = event.registrationRequired;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      className={cn(
        "fixed inset-0 z-[4000] overflow-y-auto bg-background backdrop-blur-sm",
        "transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <div className="mx-auto flex min-h-full max-w-[1400px] flex-col px-5 py-5 sm:px-8 md:py-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="label-caps text-muted-foreground">Pulled from the platter</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close event details and return to discovery"
            className="label-caps border-b border-silver-deep pb-0.5 text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Back to the helix
          </button>
        </div>

        <article className="grid flex-1 gap-6 border border-border bg-card p-3 postcard-shadow sm:p-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-8 lg:p-5">
          {/* Hero */}
          <div className="grain relative overflow-hidden bg-muted lg:self-start">
            <img
              src={event.image}
              alt={`${event.title} in ${event.city}`}
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full object-cover lg:aspect-[4/4.4]"
            />
            <span className="absolute left-0 top-0 m-2 border border-silver bg-card/90 px-2 py-1 label-caps text-ink">
              Free
            </span>
          </div>

          <div className="flex min-w-0 flex-col pt-2 lg:pt-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
              {event.event_type} · {event.city}
            </p>
            <h1
              id="event-detail-title"
              className="font-display text-[2.2rem] font-bold leading-[1] tracking-tight sm:text-[2.8rem] lg:text-[3.2rem]"
            >
              {event.title}
            </h1>

            <dl className="mt-6 grid grid-cols-3 gap-x-4 rule-silver pt-5 pb-5">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Day</dt>
                <dd className="mt-1 font-display text-[1.2rem] text-ink">{event.date}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Time</dt>
                <dd className="mt-1 font-display text-[1.2rem] text-ink">{event.time}</dd>
              </div>
              <div className="truncate pr-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Where</dt>
                <dd className="mt-1 font-display text-[1.2rem] text-ink truncate">{event.venue}</dd>
              </div>
            </dl>

            {event.description && (
              <p className="mt-2 text-base leading-relaxed text-ink/90 whitespace-pre-wrap">
                {event.description}
              </p>
            )}

            <div className="mt-6 flex items-center gap-2">
              <img
                src={doraLogo}
                alt="DoraDAO"
                className="h-[18px] w-auto grayscale opacity-70"
              />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Powered by DoraDAO
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              {needsRegistration ? (
                <>
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="label-caps inline-flex min-h-11 items-center bg-primary px-8 text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    Register
                  </a>
                  <span className="text-sm text-muted-foreground">Registration required</span>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setInterestedCount(c => interested ? c - 1 : c + 1);
                      setInterested((v) => !v);
                    }}
                    aria-pressed={interested}
                    className={cn(
                      "label-caps inline-flex min-h-11 items-center px-8 transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                      interested
                        ? "border border-silver-deep bg-card text-ink"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {interested ? "I'm interested" : "I'm interested"}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Walk-in · {interestedCount} going
                  </span>
                </>
              )}
            </div>

            {/* Where + map */}
            <section aria-label="Location" className="mt-8 rule-silver pt-5">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Where</p>
                <a
                  href={mapLinkUrl(event)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] uppercase tracking-wider border-b border-silver-deep pb-0.5 text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  Open map
                </a>
              </div>
              <p className="mb-4 font-display text-lg text-ink">
                {event.venue} — {event.city}
              </p>
              <div className="border border-border bg-muted">
                <iframe
                  title={`Map of ${event.venue}, ${event.city}`}
                  src={mapEmbedUrl(event)}
                  loading="lazy"
                  className="h-[120px] w-full"
                />
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
