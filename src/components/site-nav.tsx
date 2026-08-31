import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-[2px]">
      <nav className="mx-auto flex max-w-[1400px] items-baseline justify-between px-5 py-4 sm:px-8 md:py-5">
        <Link to="/" className="font-display text-2xl leading-none tracking-tight md:text-[1.75rem]">
          Bored?
        </Link>
        <div className="flex items-baseline gap-6 sm:gap-9">
          <Link
            to="/events"
            className="label-caps text-muted-foreground transition-colors hover:text-ink"
            activeProps={{ className: "label-caps text-ink" }}
          >
            Events
          </Link>
          <Link
            to="/submit"
            className="label-caps border-b border-silver-deep pb-0.5 text-ink transition-colors hover:border-ink"
          >
            Submit an Event
          </Link>
        </div>
      </nav>
    </header>
  );
}
