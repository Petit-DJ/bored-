import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { eventTypeImages, type EventItem } from "@/data/events";
import { EventCard } from "@/components/event-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a Free Event — Bored?" },
      {
        name: "description",
        content:
          "Hosting something free and open to everyone? Send us the details and we'll put it on the platter.",
      },
      { property: "og:title", content: "Submit a Free Event — Bored?" },
      {
        property: "og:description",
        content: "Hosting something free? Send the details and we'll put it on the platter.",
      },
    ],
  }),
  component: SubmitPage,
});

const fields = [
  { name: "event_name", label: "Event name", placeholder: "Open Mic", type: "text" },
  { name: "event_type", label: "Event type", type: "select", options: ["Meetup", "Workshop", "Talk", "Performance", "Exhibition", "Competition", "Other"] },
  { name: "date", label: "Date", placeholder: "14 AUG", type: "text" },
  { name: "time", label: "Time", placeholder: "7:30 PM", type: "text" },
  { name: "city", label: "City", placeholder: "Agra", type: "text" },
  { name: "venue", label: "Venue", placeholder: "CSB", type: "text" },
];

function SubmitPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "Meetup",
    date: "",
    time: "",
    city: "",
    venue: "",
    maps_link: "",
    description: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = formData;

    // Basic inline validation
    if (!data.event_name || data.event_name.trim() === "") {
      setErrorMsg("Event name is required.");
      return;
    }
    if (!data.event_type || data.event_type === "") {
      setErrorMsg("Event type is required.");
      return;
    }
    if (!data.date || data.date.trim() === "") {
      setErrorMsg("Date is required.");
      return;
    }
    if (!data.time || data.time.trim() === "") {
      setErrorMsg("Time is required.");
      return;
    }
    if (!data.city || data.city.trim() === "") {
      setErrorMsg("City is required.");
      return;
    }
    if (!data.venue || data.venue.trim() === "") {
      setErrorMsg("Venue is required.");
      return;
    }
    if (!data.maps_link || data.maps_link.trim() === "") {
      setErrorMsg("Google Maps location link is required.");
      return;
    }
    if (!data.description || data.description.trim() === "") {
      setErrorMsg("Description is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      setErrorMsg("A valid email address is required.");
      return;
    }

    setErrorMsg("");
    setStatus("submitting");

    try {
      const url = import.meta.env.VITE_GOOGLE_SHEETS_SUBMISSION_URL;
      
      if (!url) {
        throw new Error("Submission URL is not configured. Please contact support.");
      }

      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(data),
      });

      setStatus("success");
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    }
  };

  // Construct dummy event for preview
  const previewEvent: EventItem = {
    id: "preview",
    title: formData.event_name || "Event Name",
    event_type: formData.event_type,
    date: formData.date || "14 AUG",
    time: formData.time || "7:30 PM",
    city: formData.city || "City",
    venue: formData.venue || "Venue",
    area: "",
    description: formData.description,
    image: eventTypeImages[formData.event_type] || eventTypeImages["Other"],
    isFree: true,
    registrationRequired: false,
    lat: 0,
    lng: 0,
  };

  return (
    <div className="min-h-screen">
      <div className="grain-fixed" />
      <SiteNav />
      <main className="mx-auto max-w-[1400px] px-5 pb-24 pt-10 sm:px-8 md:pt-16 lg:grid lg:grid-cols-[65%_35%] lg:gap-12 xl:gap-24">
        
        {/* FORM COLUMN */}
        <div className="lg:pr-0">
          <div className="mb-16">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
              Submit an event
            </p>
            <h1 className="font-display text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-[3.6rem] lg:text-[4rem] text-ink max-w-[20ch]">
              Know something happening worth showing up for?
            </h1>
            <p className="mt-5 text-[15px] text-muted-foreground">
              Tell us about it.
            </p>
          </div>

          {status === "success" ? (
            <div className="mt-10 border border-silver bg-card p-8 postcard-shadow max-w-xl">
              <h2 className="font-display text-3xl leading-tight">Event submitted.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                We'll review it before it appears on Bored? If it's free and real, it goes up.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl">
              
              {/* Event Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                {fields.map((field) => {
                  const isSelect = field.type === "select";
                  return (
                    <label key={field.name} className="block group">
                      <span className="text-[11px] uppercase tracking-widest text-ink font-semibold block mb-2 transition-colors">
                        {field.label}
                      </span>
                      {isSelect ? (
                        <Select
                          required
                          name={field.name}
                          value={formData[field.name as keyof typeof formData]}
                          onValueChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                        >
                          <SelectTrigger className="w-full h-auto border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors focus:border-ink rounded-none border-x-0 border-t-0 shadow-none px-0 focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-none">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <input
                          required
                          type={field.type}
                          name={field.name}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="w-full border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-ink"
                        />
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Description */}
              <label className="block mt-10 group">
                <span className="text-[11px] uppercase tracking-widest text-ink font-semibold block mb-2 transition-colors">
                  Description
                </span>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us what it is, who it’s for, and what to expect."
                  rows={3}
                  className="w-full border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-ink resize-none"
                />
              </label>

              <hr className="my-14 border-silver-deep" />

              {/* Location Section */}
              <div className="mb-14">
                <label className="block group">
                  <span className="text-[11px] uppercase tracking-widest text-ink font-semibold block mb-3 transition-colors">
                    Google Maps Location Link
                  </span>
                  <span className="block text-[13px] text-muted-foreground/80 mb-4 max-w-md">
                    Open the venue in Google Maps, tap Share → Copy link, and paste it here.
                  </span>
                  <input
                    required
                    type="url"
                    name="maps_link"
                    value={formData.maps_link}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-ink"
                  />
                </label>
              </div>

              <hr className="my-14 border-silver-deep" />

              {/* Email Section */}
              <div className="mb-14">
                <label className="block group">
                  <span className="text-[11px] uppercase tracking-widest text-ink font-semibold block mb-2 transition-colors">
                    Your Email
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-ink"
                  />
                </label>
              </div>

              {/* Mobile Preview (Inline) */}
              <div className="lg:hidden mb-14">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-6">
                  Event Preview
                </p>
                <div className="max-w-[260px]">
                  <EventCard event={previewEvent} priority={true} />
                </div>
              </div>

              <hr className="my-14 border-silver-deep" />

              {errorMsg && (
                <div className="mb-8 border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              {/* Submit Area */}
              <div className="flex flex-col items-start gap-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="bg-ink px-10 py-4 text-[11px] uppercase tracking-widest text-card transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Sending..." : "Submit Event"}
                </button>
                <p className="text-[13px] text-muted-foreground">
                  Your event will be reviewed before appearing on the site.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* DESKTOP PREVIEW COLUMN */}
        <div className="hidden lg:block relative">
          <div className="sticky top-28 xl:ml-auto xl:w-max">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-6">
              Event Preview
            </p>
            <div className="w-[300px] xl:w-[340px] transition-all duration-500 ease-out">
              <EventCard event={previewEvent} priority={true} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
