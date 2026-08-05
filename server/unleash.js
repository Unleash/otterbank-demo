import { initialize } from 'unleash-client';

// Flag refresh interval in milliseconds. 1s keeps a toggle visible in the
// app almost immediately: backend refresh plus frontend poll stays within
// a couple of seconds end to end, which is what the on-camera
// instant-transfers reveal needs.
const REFRESH_INTERVAL = 1000;

// The Unleash project the flags live in. The client token may already be
// scoped to it; this filter makes the scoping explicit either way.
const PROJECT_NAME = process.env.UNLEASH_PROJECT || 'otterbank-demo';

// Impact metrics for feedback taps on spending assistant replies. Counters
// only go up; the safeguard watches the thumbs-down rate over a short
// window. Reported on the METRICS_INTERVAL cadence.
const THUMBS_UP_METRIC = 'thumbs_up_count';
const THUMBS_DOWN_METRIC = 'thumbs_down_count';

// The flag the feedback metrics belong to. Passed as flag context on every
// increment so the samples carry the flag label — without it, a safeguard
// chart filtered to the flag sees no data and reads zero.
const ASSISTANT_FLAG = 'spending-assistant';

let client = null;

// Starts the server-side Unleash client. When the connection details are
// missing the backend still boots and every flag evaluates to off, so the
// app degrades to the plain Otterbank experience instead of crashing.
export function startUnleash(log) {
  const url = process.env.UNLEASH_API_URL;
  const token = process.env.UNLEASH_CLIENT_TOKEN;

  if (!url || !token) {
    log.warn(
      'UNLEASH_API_URL or UNLEASH_CLIENT_TOKEN is not set. ' +
        'Running without Unleash: all flags evaluate to off. ' +
        'Copy server/.env.example to server/.env and fill in your instance details.'
    );
    return null;
  }

  client = initialize({
    url,
    appName: 'otterbank-server',
    projectName: PROJECT_NAME,
    customHeaders: { Authorization: token },
    refreshInterval: REFRESH_INTERVAL,
    metricsInterval: Number(process.env.METRICS_INTERVAL) || 60000,
  });

  client.on('error', (err) => log.warn({ err: err.message }, 'unleash: client error'));
  client.on('warn', (msg) => log.warn(`unleash: ${msg}`));
  client.on('synchronized', () => log.info('unleash: flags synchronized'));

  client.impactMetrics.defineCounter(
    THUMBS_UP_METRIC,
    'Thumbs-up taps on spending assistant replies'
  );
  client.impactMetrics.defineCounter(
    THUMBS_DOWN_METRIC,
    'Thumbs-down taps on spending assistant replies'
  );

  return client;
}

// Evaluates a flag with the given Unleash context. Returns false when the
// client never started, so routes need no awareness of the degraded mode.
export function isEnabled(flagName, context) {
  return client ? client.isEnabled(flagName, context) : false;
}

// Reports one feedback tap to Unleash, labeled with the assistant flag so
// flag-scoped safeguard charts pick it up. A no-op in degraded mode, so
// the endpoint keeps answering even without an Unleash connection.
export function recordFeedback(helpful, sessionId) {
  if (!client) return;
  client.impactMetrics.incrementCounter(helpful ? THUMBS_UP_METRIC : THUMBS_DOWN_METRIC, 1, {
    flagNames: [ASSISTANT_FLAG],
    context: { sessionId },
  });
}

export function getClient() {
  return client;
}
