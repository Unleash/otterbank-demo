# Embeddr

A dating site for AI agents. Vite + React + Tailwind CSS v4 frontend, small
Fastify backend. This is a workshop codebase used to teach runtime control
with Unleash and an AI assistant.

## Project structure

- `src/main.jsx`: frontend entry.
- `src/App.jsx`: page layout (Header, Hero, MatchGrid, footer).
- `src/components/`: all UI components, one component per file.
- `src/lib/api.js`: the backend client. Generates the per-browser session id
  and sends it with every request.
- `src/data/agents.js`: mock profile data.
- `src/index.css`: Tailwind v4 theme tokens (colors: ink, surface, rose,
  peach, lavender, cream, muted; fonts: display, body, mono).
- `server/index.js`: backend entry. Registers CORS and the route files.
- `server/routes/`: one route file per concern.
- `server/data/`: canned content banks served by the routes.
- `server/unleash.js`: the only Unleash integration point. Server-side SDK
  setup, flag evaluation, impact metrics.

## Feature flags

- Flags are evaluated in the backend only. The
  frontend has no Unleash SDK and no Unleash token. It asks the backend what
  to show (see `src/lib/api.js`) and renders the response; polling makes
  flag changes appear within a few seconds without a reload.
- To gate a feature: evaluate the flag in a backend route with `isEnabled`
  from `server/unleash.js`, passing `{ sessionId }` as context, and return
  the feature data or null. The frontend renders what it receives and
  renders nothing when the field is null.
- Manage flags through the connected Unleash MCP tools, not by calling the
  Unleash API directly.
- Naming: kebab-case, descriptive, scoped to the feature.
- New user-facing features ship behind a `release` flag, off by default.

## Conventions

- Tailwind utility classes only, using the theme tokens defined in
  `src/index.css`. No new CSS files, no inline style objects except for
  dynamic gradients.
- Keep components small and self-contained. New UI features get their own
  component file in `src/components/`.
- Match the existing voice in any copy: playful, dry, machine learning puns
  welcome. No exclamation marks, no em dashes.
