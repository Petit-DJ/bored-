import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Discovery } from "@/components/discovery";
import { SiteNav } from "@/components/site-nav";
import { Splash } from "@/components/splash";

type IndexSearch = {
  event?: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bored? — Free Things Happening In Your City" },
      {
        name: "description",
        content:
          "There's probably something going on in your city. Discover free open mics, photo walks, screenings and jams — no login, no tickets.",
      },
      { property: "og:title", content: "Bored? — Free Things Happening In Your City" },
      {
        property: "og:description",
        content:
          "Discover free open mics, photo walks, screenings and jams happening near you tonight.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    const s: IndexSearch = {};
    if (typeof search['event'] === 'string') {
      s.event = search['event'];
    }
    return s;
  },
  component: Index,
});

function Index() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("splashDone") === "true") {
      setSplashDone(true);
    }
  }, []);

  const handleSplashDone = () => {
    sessionStorage.setItem("splashDone", "true");
    setSplashDone(true);
  };

  return (
    <div className="min-h-screen">
      <div className="grain-fixed" />
      {!splashDone && <Splash onDone={handleSplashDone} />}
      <div className={splashDone ? "animate-fade-rise" : "opacity-0"}>
        <SiteNav />
        <Discovery />
      </div>
    </div>
  );
}
