import { EventCard } from "@/components/event-card";
import type { EventItem } from "@/data/events";

/**
 * Reduced-motion discovery: the same platter, laid flat. Same data, same
 * selection behaviour, no rotation.
 */
export function EventGrid({
  events,
  onSelect,
}: {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
}) {
  return (
    <ul className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-5 pb-16 pt-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
      {events.map((event, i) => (
        <li key={event.id} className="flex justify-center">
          <button
            type="button"
            onClick={() => onSelect(event)}
            aria-label={`${event.title}, ${event.date} ${event.time}, ${event.venue}, ${event.city} — free`}
            className="w-full max-w-[19rem] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <EventCard event={event} className="max-w-none" priority={i < 3} />
          </button>
        </li>
      ))}
    </ul>
  );
}
