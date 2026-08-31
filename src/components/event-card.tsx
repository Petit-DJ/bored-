import { cn } from "@/lib/utils";
import type { EventItem } from "@/data/events";

type EventCardProps = {
  event: EventItem;
  className?: string;
  tilt?: number;
  priority?: boolean;
};

export function EventCard({ event, className, tilt = 0, priority = false }: EventCardProps) {
  return (
    <article
      className={cn(
        "group relative w-full max-w-[19rem] bg-card p-2.5 sm:p-3",
        "border border-border postcard-shadow",
        "transition-[transform,box-shadow] duration-500 ease-out",
        "hover:-translate-y-1 hover:[box-shadow:var(--shadow-postcard-lift)]",
        className,
      )}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      <div className="grain relative overflow-hidden bg-muted">
        <img
          src={event.image}
          alt={`${event.title} in ${event.city}`}
          width={1024}
          height={1280}
          loading={priority ? "eager" : "lazy"}
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute left-0 top-0 m-2 bg-primary px-2 py-1 label-micro text-primary-foreground">
          Free
        </span>
      </div>

      <div className="px-1 pb-1 pt-4">
        <h3 className="display-tight text-[1.45rem] sm:text-[1.7rem]">{event.title}</h3>
        <p className="mt-1.5 label-micro text-muted-foreground">{event.event_type}</p>
        <div className="mt-3.5 rule-silver pt-2.5">
          <p className="label-micro text-muted-foreground">
            {event.date} <span className="text-silver-deep">·</span> {event.time}
          </p>
          <p className="mt-2 font-display text-[1.05rem] italic leading-none text-ink/85 truncate">
            {event.city} <span className="text-silver-deep">/</span> {event.venue}
          </p>
        </div>
      </div>

    </article>
  );
}
