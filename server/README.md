# Otterbank backend

A small Fastify service that evaluates every feature flag server-side and
reports the thumbs-down impact metric. The frontend renders whatever this
service returns; it never talks to Unleash directly.

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness check, returns `{ ok: true }` |
| `POST /instant-transfers` | Evaluates `instant-transfers` for the session, returns `{ instantTransfers: boolean }` |
| `POST /assistant` | Evaluates `spending-assistant` for the session, returns `{ assistant: boolean }` |
| `POST /assistant/ask` | Returns a canned answer to a spending question, or `{ reply: null }` when the flag is off |
| `POST /feedback` | Counts a feedback tap; `{ helpful: true }` increments the `thumbs_up_count` impact metric, anything else `thumbs_down_count` |

## Configuration

Copy `.env.example` to `.env` and fill in the values. Without Unleash
credentials the service still boots: every flag evaluates to off and the
app degrades to the plain Otterbank experience.

The SDK is scoped to the `otterbank-demo` Unleash project via the
`projectName` option (override with `UNLEASH_PROJECT`). The flag refresh
interval is 1 second so a toggle lands on camera fast.

`METRICS_INTERVAL` is in milliseconds and controls how often the SDK sends
metrics, including impact metrics, to Unleash. Lower it for the live demo
so the safeguard sees thumbs-down taps within seconds.

## Impact metric verification notes

Impact metrics and safeguards are beta features. The following was verified
on 2026-07-03 against a hosted Unleash instance (us.app.unleash-hosted.com)
with `unleash-client` 6.11.1.

- The server-side SDK registers a metric with
  `unleash.impactMetrics.defineCounter(name, help)` and reports with
  `unleash.impactMetrics.incrementCounter(name)`. The regular client returned
  by `initialize()` exposes `impactMetrics`; no separate client is needed.
- Impact metrics are batched with regular SDK metrics and sent on the
  `metricsInterval` cadence. Verified: with `METRICS_INTERVAL=5000`, taps
  appeared in the instance within seconds
  (`GET /api/admin/impact-metrics?metricName=thumbs_down_count&range=hour&aggregationMode=count&source=internal`).
- Naming: the docs define no constraints for internal metric names. Examples
  use Prometheus-style snake_case, so this service uses `thumbs_down_count`.
