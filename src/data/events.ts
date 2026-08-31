import meetupImg from "@/assets/events/meetup.png";
import competitionImg from "@/assets/events/competetion.png";
import exhibitionImg from "@/assets/events/exhibition.png";
import otherImg from "@/assets/events/other.png";
import performanceImg from "@/assets/events/performance.png";
import talkImg from "@/assets/events/talk.png";
import workshopImg from "@/assets/events/workshop.png";

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  /** neighbourhood / locality inside the city */
  area: string;
  venue: string;
  /** one or two sentences — what actually happens */
  description: string;
  event_type: string;
  image: string;
  isFree: true;
  registrationRequired: boolean;
  /** present only when registration is required */
  registrationUrl?: string;
  /** real coordinates, used for the embedded OpenStreetMap view */
  lat: number;
  lng: number;
};

const events: EventItem[] = [
  {
    id: "open-mic-sanjay-place",
    title: "Open Mic",
    date: "26/12/2026",
    time: "7:30 PM",
    city: "Agra",
    area: "Sanjay Place",
    venue: "Chai Point, Sanjay Place",
    description:
      "Five minutes on the mic, whatever you've got — songs, jokes, a poem you wrote on the bus. Sign-up sheet goes up at 7, listeners are just as welcome as performers.",
    image: competitionImg,
    isFree: true,
    registrationRequired: false,
    lat: 27.1971,
    lng: 78.0086,
  },
  {
    id: "poetry-night-daryaganj",
    title: "Poetry Night",
    date: "26/12/2026",
    time: "6:00 PM",
    city: "Delhi",
    area: "Daryaganj",
    venue: "Daryaganj Book Bazaar",
    description:
      "An open circle of readers in the middle of the Sunday book market lanes. Bring something of your own or read a page from whatever you just bought.",
    image: talkImg,
    isFree: true,
    registrationRequired: false,
    lat: 28.6425,
    lng: 77.2405,
  },
  {
    id: "heritage-photo-walk",
    title: "Heritage Photo Walk",
    date: "26/12/2026",
    time: "6:15 AM",
    city: "Jaipur",
    area: "Hawa Mahal",
    venue: "Meet at Hawa Mahal Gate",
    description:
      "A slow three-hour walk through the old city at first light with two local photographers. Phone cameras absolutely count.",
    image: exhibitionImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-jaipur-photo-walk",
    lat: 26.9239,
    lng: 75.8267,
  },
  {
    id: "python-meetup",
    title: "Python Meetup",
    date: "26/12/2026",
    time: "6:30 PM",
    city: "Pune",
    area: "Kalyani Nagar",
    venue: "Kalyani Nagar Co-work Loft",
    description:
      "Two short talks, one live debugging session, and a long hallway conversation afterwards. Beginners get the front row.",
    image: meetupImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-pune-python",
    lat: 18.5484,
    lng: 73.9034,
  },
  {
    id: "public-lecture-cosmology",
    title: "Public Lecture: Cosmology",
    date: "26/12/2026",
    time: "5:00 PM",
    city: "Bengaluru",
    area: "Malleshwaram",
    venue: "Indian Institute of Science, Auditorium 2",
    description:
      "An hour on how we measure the age of the universe, pitched at anyone who finished school. Questions from the floor for the last twenty minutes.",
    image: meetupImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-blr-cosmology",
    lat: 13.0218,
    lng: 77.5671,
  },
  {
    id: "student-art-exhibition",
    title: "Student Art Exhibition",
    date: "26/12/2026",
    time: "11:00 AM",
    city: "Baroda",
    area: "Sayajigunj",
    venue: "Faculty of Fine Arts Gallery",
    description:
      "Final-year painting, print and sculpture work, with the students themselves standing next to it. Walk through in twenty minutes or stay two hours.",
    image: workshopImg,
    isFree: true,
    registrationRequired: false,
    lat: 22.3072,
    lng: 73.1812,
  },
  {
    id: "book-club-short-stories",
    title: "Book Club: Short Stories",
    date: "26/12/2026",
    time: "4:00 PM",
    city: "Kolkata",
    area: "Jadavpur",
    venue: "Jadavpur Reading Room",
    description:
      "One short story, read aloud in the room, then talked about properly. Nothing to prepare — you read it when you arrive.",
    image: talkImg,
    isFree: true,
    registrationRequired: false,
    lat: 22.4991,
    lng: 88.3714,
  },
  {
    id: "sunset-music-jam",
    title: "Sunset Music Jam",
    date: "26/12/2026",
    time: "5:45 PM",
    city: "Mumbai",
    area: "Bandra West",
    venue: "Carter Road Amphitheatre",
    description:
      "An open jam on the sea-facing steps. Guitars, a cajon, whoever turns up with something to play, until the light goes.",
    image: performanceImg,
    isFree: true,
    registrationRequired: false,
    lat: 19.0662,
    lng: 72.8199,
  },
  {
    id: "screenprinting-workshop",
    title: "Screenprinting Workshop",
    date: "26/12/2026",
    time: "2:00 PM",
    city: "Ahmedabad",
    area: "Navrangpura",
    venue: "CEPT Print Studio",
    description:
      "Pull your own poster on a hand-cranked press. Ink, screens and paper are provided; bring a t-shirt if you want one printed.",
    image: workshopImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-amd-screenprint",
    lat: 23.0365,
    lng: 72.5504,
  },
  {
    id: "courtyard-film-screening",
    title: "Courtyard Film Screening",
    day: "Friday",
    time: "8:00 PM",
    city: "Hyderabad",
    area: "Banjara Hills",
    venue: "Lamakaan",
    description:
      "A projector, a bedsheet screen and a courtyard full of plastic chairs. Discussion afterwards for whoever wants to stay.",
    image: otherImg,
    isFree: true,
    registrationRequired: false,
    lat: 17.4166,
    lng: 78.4406,
  },
  {
    id: "board-games-night",
    title: "Board Games Night",
    day: "Tuesday",
    time: "7:00 PM",
    city: "Chennai",
    area: "Besant Nagar",
    venue: "Besant Nagar Community Hall",
    description:
      "Thirty-odd games on a long table and people who will happily teach you the rules. Come alone, you'll be in a game within ten minutes.",
    image: meetupImg,
    isFree: true,
    registrationRequired: false,
    lat: 13.0002,
    lng: 80.2668,
  },
  {
    id: "river-cleanup-drive",
    title: "River Cleanup Drive",
    day: "Sunday",
    time: "7:00 AM",
    city: "Varanasi",
    area: "Assi Ghat",
    venue: "Assi Ghat",
    description:
      "Two hours of ghat cleaning with gloves, bags and a segregation station. Chai afterwards on the steps.",
    image: exhibitionImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-varanasi-cleanup",
    lat: 25.2882,
    lng: 83.0073,
  },
  {
    id: "college-cultural-night",
    title: "College Cultural Night",
    day: "Friday",
    time: "6:30 PM",
    city: "Lucknow",
    area: "Hasanganj",
    venue: "University Open Air Theatre",
    description:
      "Dance sets, a battle of the bands and a very loud crowd. Open to everyone, not just students.",
    image: performanceImg,
    isFree: true,
    registrationRequired: false,
    lat: 26.8695,
    lng: 80.9421,
  },
  {
    id: "farmers-and-makers-market",
    title: "Farmers & Makers Market",
    day: "Saturday",
    time: "8:30 AM",
    city: "Goa",
    area: "Assagao",
    venue: "Assagao Village Ground",
    description:
      "Produce, bread, ceramics and a lot of dogs. Entry is free; bring a bag and cash for the stalls.",
    image: otherImg,
    isFree: true,
    registrationRequired: false,
    lat: 15.6045,
    lng: 73.7807,
  },
  {
    id: "standup-open-list",
    title: "Stand-Up Open List",
    day: "Wednesday",
    time: "8:30 PM",
    city: "Delhi",
    area: "Hauz Khas",
    venue: "Hauz Khas Basement Room",
    description:
      "Fifteen comics, four minutes each, new material only. Sign up on the list at the door or just come and heckle politely.",
    image: competitionImg,
    isFree: true,
    registrationRequired: false,
    lat: 28.5535,
    lng: 77.1945,
  },
  {
    id: "urban-sketching-meet",
    title: "Urban Sketching Meet",
    day: "Sunday",
    time: "9:00 AM",
    city: "Kochi",
    area: "Fort Kochi",
    venue: "Fort Kochi Beach Road",
    description:
      "Sit somewhere along the water and draw what's in front of you for two hours, then everyone shows their page. Bring your own paper.",
    image: exhibitionImg,
    isFree: true,
    registrationRequired: false,
    lat: 9.9658,
    lng: 76.2422,
  },
  {
    id: "documentary-night",
    title: "Documentary Night",
    day: "Thursday",
    time: "7:45 PM",
    city: "Bhopal",
    area: "Shamla Hills",
    venue: "Bharat Bhavan Studio",
    description:
      "One independent documentary, followed by a conversation with someone who worked on it. Seats are limited to the studio's ninety chairs.",
    image: otherImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-bhopal-docs",
    lat: 23.2436,
    lng: 77.3925,
  },
  {
    id: "qawwali-evening",
    title: "Qawwali Evening",
    day: "Thursday",
    time: "8:00 PM",
    city: "Agra",
    area: "Tajganj",
    venue: "Dargah Courtyard",
    description:
      "Traditional qawwali in the open courtyard, sung by a family group who have done this for generations. Sit on the floor, cover your head.",
    image: performanceImg,
    isFree: true,
    registrationRequired: false,
    lat: 27.1697,
    lng: 78.0424,
  },
  {
    id: "teach-a-kid-saturday",
    title: "Teach A Kid Saturday",
    day: "Saturday",
    time: "10:00 AM",
    city: "Indore",
    area: "Rajwada",
    venue: "Rajwada Learning Centre",
    description:
      "Volunteer for a two-hour session helping neighbourhood kids with maths and reading. No teaching experience needed, just patience.",
    image: meetupImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-indore-teach",
    lat: 22.7177,
    lng: 75.8545,
  },
  {
    id: "zine-making-workshop",
    title: "Zine Making Workshop",
    day: "Saturday",
    time: "3:30 PM",
    city: "Bengaluru",
    area: "Vasanth Nagar",
    venue: "Champaca Bookstore Terrace",
    description:
      "Scissors, glue, a photocopier and one afternoon to make an eight-page zine about anything. You leave with copies.",
    image: workshopImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-blr-zine",
    lat: 12.9895,
    lng: 77.5905,
  },
  {
    id: "night-cycling-ride",
    title: "Night Cycling Ride",
    day: "Friday",
    time: "10:30 PM",
    city: "Mumbai",
    area: "Marine Drive",
    venue: "Marine Drive, Gate C",
    description:
      "A 22 km loop through empty streets at an easy pace, with a sweeper rider at the back. Working brakes and a rear light required.",
    image: exhibitionImg,
    isFree: true,
    registrationRequired: true,
    registrationUrl: "https://forms.gle/bored-mumbai-night-ride",
    lat: 18.9432,
    lng: 72.8236,
  },
  {
    id: "street-food-history-walk",
    title: "Street Food History Walk",
    day: "Sunday",
    time: "5:00 PM",
    city: "Delhi",
    area: "Chandni Chowk",
    venue: "Chandni Chowk Metro Gate 5",
    description:
      "A walking history of six lanes and what has been fried in them for two hundred years. The walk is free; the food is on you.",
    image: otherImg,
    isFree: true,
    registrationRequired: false,
    lat: 28.6577,
    lng: 77.2306,
  },
];

/** Data-access layer. Swap the mock source later without touching the UI. */
export function getEvents(): EventItem[] {
  return events;
}

export function getEventById(id: string): EventItem | undefined {
  return events.find((event) => event.id === id);
}

export function getCities(): string[] {
  return Array.from(new Set(events.map((event) => event.city))).sort();
}

/** OpenStreetMap embed URL for an event's real coordinates. */
export function mapEmbedUrl(event: EventItem, spread = 0.006): string {
  const bbox = [event.lng - spread, event.lat - spread / 2, event.lng + spread, event.lat + spread / 2]
    .map((n) => n.toFixed(5))
    .join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${event.lat.toFixed(5)}%2C${event.lng.toFixed(5)}`;
}

export function mapLinkUrl(event: EventItem): string {
  return `https://www.openstreetmap.org/?mlat=${event.lat}&mlon=${event.lng}#map=16/${event.lat}/${event.lng}`;
}

export const eventTypeImages: Record<string, string> = {
  Meetup: meetupImg,
  Workshop: workshopImg,
  Talk: talkImg,
  Performance: performanceImg,
  Exhibition: exhibitionImg,
  Competition: competitionImg,
  Other: otherImg,
};

export async function fetchApprovedEvents(): Promise<EventItem[]> {
  const url = import.meta.env.VITE_GOOGLE_SHEETS_SUBMISSION_URL;
  if (!url) {
    throw new Error("Missing Google Sheets URL in environment");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch events from Google Sheets");
  }
  
  const data = await response.json();
  
  return data.map((item: any) => {
    const eventType = item.event_type || "Other";
    return {
      id: String(item.id),
      title: String(item.event_name),
      date: String(item.date),
      time: String(item.time),
      city: String(item.city),
      area: String(item.city), // Form does not have area, fallback to city
      venue: String(item.venue),
      description: String(item.description),
      event_type: eventType,
      image: eventTypeImages[eventType] || eventTypeImages["Other"],
      isFree: true,
      registrationRequired: false,
      lat: Number(item.lat),
      lng: Number(item.lng)
    };
  });
}

// Fallback for hardcoded events without an event_type
events.forEach(event => {
  if (!event.event_type) {
    event.event_type = "Other";
  }
});
