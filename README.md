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
| `spending-assistant` | AI assistant behind a "Try it now" card on Home | Progressive rollout with the `thumbs_down_count` impact metric and an automated safeguard pause. Off: no trace of it. On: the card appears within a second or two; tapping it opens the chat. |

Both flags are evaluated with the browser session id as context, so
percentage rollouts are sticky per browser. The backend refreshes flags
every second and the frontend polls the backend every second, so a toggle
lands on camera in one to two seconds.

## The impact metrics

Every feedback tap on an assistant reply increments a counter defined in
[`server/unleash.js`](server/unleash.js): thumbs-up reports
`thumbs_up_count`, thumbs-down reports `thumbs_down_count`. Point the
safeguard for the `spending-assistant` rollout at `thumbs_down_count`;
repeated thumbs-down taps during a demo trip the automated pause. Lower
`METRICS_INTERVAL` (milliseconds) so taps reach Unleash within seconds.

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
