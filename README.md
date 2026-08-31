# Bored?

> **There's probably something going on in your city.**

Bored? is a free local-events discovery platform for young people.

It helps people discover **free events happening around them** — things worth attending, people worth meeting, and places worth showing up to.

Unlike traditional event platforms that behave like searchable directories, Bored? is designed around **discovery**.

The experience is:

**Open → Discover → Get Curious → Explore → Select → Show Up**

The product currently focuses exclusively on **events**. Communities and social features may come later.

---

## Product

The core idea is simple:

> **A social network organised around places and things happening rather than followers.**

Bored? only surfaces events that are free to attend.

Instead of asking users to search through hundreds of listings, the interface presents events as an immersive visual experience.

The two primary ways to discover events are:

* **Helix** — an immersive 3D stream of event cards.
* **Map** — a geographically accurate interactive map showing where events are happening.

The user can switch between the two views.

---

# Core Experience

## 1. Splash

The experience begins with a cinematic introduction:

```text
BORED?

There's probably something going on in your city.
```

The splash screen transitions into discovery.

There is no login wall and no city-selection screen before browsing.

---

## 2. Helix

The Helix is the primary visual interaction.

Events are arranged in a **continuous vertical 3D helix** around an invisible axis.

Cards:

* rotate around the axis
* move vertically
* change scale with depth
* move in front of and behind other cards
* become more readable near the focal point
* remain visibly separated

The helix is continuously moving.

### Motion

When idle:

> slow ambient rotation

When scrolling:

> acceleration → momentum → smooth deceleration → ambient rotation

The event list is treated as an infinite circular stream:

```text
Event 1
   ↓
Event 2
   ↓
Event 3
   ↓
...
Event N
   ↓
Event 1
   ↓
Event 2
```

There should be no visible reset or jump.

---

# Event Cards

Cards combine the feel of:

**physical postcards × editorial event posters**

Each card contains:

1. Event image
2. Event name
3. Date
4. Time
5. Location
6. Event type
7. Free-event indication

Event imagery is currently selected from predefined images based on event type.

### Event Types

The current event types are:

* Meetup
* Workshop
* Talk
* Performance
* Exhibition
* Competition
* Other

There is currently no user image-upload system.

---

# Map

The Map view provides the geographic counterpart to the Helix.

It is a **real interactive geographic map**, not a decorative illustration.

Users can:

* pan
* zoom
* navigate around the map
* see event pins
* see clustered events
* select a pin
* preview an event
* open the event detail page

The map uses **MapLibre GL JS** with geographically accurate map data.

Events contain actual:

```text
latitude
longitude
```

coordinates.

The current architecture uses OSM-derived/third-party map tiles rather than drawing a fake geographic map.

---

# Event Discovery Flow

The intended interaction is:

```text
             ┌───────────┐
             │   BORED?  │
             └─────┬─────┘
                   ↓
          ┌─────────────────┐
          │ Discover Events │
          └────────┬────────┘
                   ↓
          ┌─────────────────┐
          │   HELIX / MAP   │
          └────────┬────────┘
                   ↓
          ┌─────────────────┐
          │ Select an Event │
          └────────┬────────┘
                   ↓
          ┌─────────────────┐
          │ Event Preview   │
          └────────┬────────┘
                   ↓
          ┌─────────────────┐
          │ Event Details   │
          └────────┬────────┘
                   ↓
                SHOW UP
```

---

# Event Detail

Selecting an event transitions into a compact event detail page.

The page contains:

* event image
* event type
* title
* date
* time
* venue
* city
* description
* free-event status
* registration/action
* location
* interactive map

The detail view is designed to fit the essential event information within one desktop viewport.

The map provides the actual geographic location of the event.

---

# Submit an Event

Users can submit free events through the **Submit an Event** page.

The current form collects:

* Event name
* Event type
* Date
* Time
* City
* Venue
* Description
* Google Maps location link
* Submitter email

The event type determines the predefined image that will eventually be used for the event card.

---


### Frontend

The current frontend is built with:

* React
* TypeScript
* JSX / TSX
* CSS
* MapLibre GL JS


### Maps

* MapLibre GL JS
* OSM-derived geographic data / raster tiles

---
# The Product in One Sentence

> **Bored? helps young people discover free things happening in their city through an immersive Helix and a real geographic map — so they can find something worth showing up for.**
