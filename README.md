# Otterbank

A fictional mobile bank for demoing runtime control with
[Unleash](https://www.getunleash.io) — in videos, sales demos, and
conference talks.

The frontend (Vite, React, Tailwind CSS v4) is a single-column, mobile-first
layout: on desktop it just sits centered, because only the phone view is
ever on camera. It renders whatever the backend returns. The backend
(Fastify) evaluates every feature flag server-side with the Unleash SDK and
reports the assistant's thumbs-down impact metric. Turning a flag off stops
real server-side work, and the running app reflects it within a second or
two without a redeploy.

## The flags

Flags live in the `otterbank-demo` project on the shared Unleash cloud
instance (override with the `UNLEASH_PROJECT` env var). Flag names appear
on screen in Unleash during side-by-side demos, so they read as the feature
the viewer sees on the phone.

| Flag | Feature | Demo role |
|------|---------|-----------|
| `instant-transfers` | "Send money instantly" card on Home | One-click wow moment. Off: card absent. On: card slides in within a second or two of the toggle. |
| `spending-assistant` | AI assistant behind a floating otter button | Progressive rollout with the `thumbs_down_count` impact metric and an automated safeguard pause. Off: no trace of it. On: the otter button pops in above the tab bar within a second or two; tapping it opens the chat. |
| `savings-boost` | Savings promo card on the Payments tab | A/B/n test with strategy variants. Create variants named `round-up`, `goal-tracker` and `cashback`; the card renders whichever pitch the session is assigned (an unrecognized variant name falls back to a generic pitch). Every CTA tap reports the `savings_cta_click_count` impact metric, labeled with the variant that produced it. Enable **impression data** on this flag and the backend logs one impression event per evaluation. |
| `spending-assistant-tone` | The assistant's answer style | Full-stack experiment: same chat UI, different server-side behavior. Create variants `classic` and `sassy`; classic answers are brief and friendly, sassy answers are brief with attitude (marked 😏). Thumbs-up/down impact metrics carry this flag's variant label, so helpfulness can be compared per tone. Off or unknown variant: classic. |

Every flag is evaluated with the browser session id and the demo user id
as context. The backend refreshes flags every second and the frontend
polls the backend every second, so a toggle lands on camera in one to two
seconds.

## The demo panel

Tapping the "demo" badge in the header opens the demo controls: a user
switcher (which user id goes into the Unleash context), a "New session"
button (regenerates the session id without touching the user), and a live
readout of every flag and variant assignment for the current context.

That panel is the stickiness demo. Set a strategy's stickiness to
`sessionId` and "New session" may reshuffle the variant while the user
switcher does nothing; set it to `userId` and the assignment follows the
user across sessions. Note that Unleash's **default** stickiness prefers
`userId` when it's present in the context — and it always is here — so set
stickiness explicitly on flags where the distinction matters on camera.

## The impact metrics

All counters are defined in [`server/unleash.js`](server/unleash.js).
Charts for internal impact metrics can only filter by
`appName`/`environment`/`origin`, not by custom labels, so per-variant
comparisons get dedicated counters with the variant in the metric name.

Every feedback tap on an assistant reply increments `thumbs_up_count` or
`thumbs_down_count` (the overall counters the safeguard watches) plus the
counter for the session's tone: `thumbs_up_classic_count`,
`thumbs_down_sassy_count`, and so on. Every tap on the savings card's CTA
reports `savings_cta_click_count` plus one of
`savings_cta_click_round_up_count` / `..._goal_tracker_...` /
`..._cashback_...` — chart those against each other for the A/B/n
comparison.

Point the safeguard for the `spending-assistant` rollout at
`thumbs_down_count`; repeated thumbs-down taps during a demo trip the
automated pause. Lower `METRICS_INTERVAL` (milliseconds) so taps reach
Unleash within seconds. Repeated taps are allowed everywhere on purpose:
that's how a live demo generates enough samples to chart.

## Learning lab map

- **M5.1 Variants and A/B/n testing** — `savings-boost`: strategy
  variants pick the pitch, `savings_cta_click_count` is the conversion,
  and impression data (turn it on in the flag's settings) streams
  evaluation events into the backend log.
- **M5.2 Full-stack experimentation** — `spending-assistant-tone`: the flag
  changes what the server does, not what the UI shows, and the
  thumbs-up/down impact metrics measure which tone actually helps.
- **M5.3 Stickiness** — the demo panel behind the "demo" badge: switch
  users, reset the session, and watch which assignments hold.

## Run it

Prerequisites: Node.js 22 or later, and an Unleash instance with a backend
token for the `otterbank-demo` project.

1. Copy [`server/.env.example`](server/.env.example) to `server/.env` and
   fill in the Unleash connection values. The frontend needs no
   configuration for local use; [`.env.example`](.env.example) documents
   `VITE_BACKEND_URL` for deployed setups.
2. Run `npm install`. This also installs the backend dependencies.
3. Run `npm run dev`.

The frontend runs at http://localhost:5173 and the backend at
http://localhost:3001. Use `npm run dev:web` or `npm run dev:api` to run
either side alone. Without Unleash credentials the backend still boots,
every flag evaluates to off, and the app renders the plain Otterbank
experience.

## Deploy

The repo deploys as one Railway service: `railway.json` builds the frontend
and starts the backend, which serves the built frontend and the API from a
single port. This is its own service with its own domain.

Set `UNLEASH_API_URL`, `UNLEASH_CLIENT_TOKEN`, and `METRICS_INTERVAL` in
the service variables (`UNLEASH_PROJECT` too if the project id ever differs
from `otterbank-demo`); Railway provides `PORT`.

## Everything here is fake

Static mock data throughout: no real banking logic, no auth, no
persistence. The transactions on Home and the assistant's canned answers
(see [`server/data/assistant.js`](server/data/assistant.js)) quote the same
numbers so the demo holds together. The header wears a "demo" badge on
purpose.
