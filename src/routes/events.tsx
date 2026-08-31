import { createFileRoute } from "@tanstack/react-router";
import { Discovery } from "@/components/discovery";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Free Events Near You — Bored?" },
      {
        name: "description",
        content:
          "Browse free open mics, photo walks, screenings, jams and workshops happening in your city this week. No sign-up, no tickets.",
      },
      { property: "og:title", content: "Free Events Near You — Bored?" },
      {
        property: "og:description",
        content: "Free open mics, photo walks, screenings and workshops happening this week.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <div className="min-h-screen">
      <div className="grain-fixed" />
      <SiteNav />
      <Discovery />
    </div>
  );
}
