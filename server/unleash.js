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

// Per-variant feedback counters for the tone experiment. Internal impact
// metric charts can only filter by appName/environment/origin, not by
// custom labels, so the variant goes into the metric name instead (the
// docs' "dedicated metric with the scope already applied"). Only known
// variants get counters; an unexpected variant name skips the per-variant
// increment rather than minting metrics dynamically.
const TONE_VARIANTS = ['classic', 'sassy'];
const toneMetric = (helpful, variant) =>
  `thumbs_${helpful ? 'up' : 'down'}_${variant}_count`;

// Conversion metric for the savings-boost A/B/n test: one increment per
// tap on the savings card's call to action, plus one per-variant counter
// (variant in the metric name, same reasoning as the tone counters) so
// the pitches can be charted against each other.
const SAVINGS_CLICK_METRIC = 'savings_cta_click_count';
const SAVINGS_VARIANTS = ['round-up', 'goal-tracker', 'cashback'];
const savingsMetric = (variant) => `savings_cta_click_${variant.replace(/-/g, '_')}_count`;

// The flags the metrics belong to. Passed as flag context on every
// increment so the samples carry the flag and variant labels — without
// them, a chart filtered to the flag sees no data and reads zero.
// Feedback taps carry spending-assistant-tone too, so thumbs-down can be broken
// down by tone variant: the full-stack experiment's success metric.
const ASSISTANT_FLAG = 'spending-assistant';
const TONE_FLAG = 'spending-assistant-tone';
const SAVINGS_FLAG = 'savings-boost';

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

  // Impression capture: flags with "impression data" enabled in Unleash
  // emit one event per evaluation. Logging them is the demo — the log line
  // is what shows an analytics pipeline would receive (event type, flag,
  // variant, session). The frontend polls every second, so expect a steady
  // stream while such a flag is on screen.
  client.on('impression', (event) => {
    log.info(
      {
        eventType: event.eventType,
        featureName: event.featureName,
        enabled: event.enabled,
        variant: event.variant,
        sessionId: event.context?.sessionId,
        userId: event.context?.userId,
      },
      'unleash: impression'
    );
  });

  client.impactMetrics.defineCounter(
    THUMBS_UP_METRIC,
    'Thumbs-up taps on spending assistant replies'
  );
  client.impactMetrics.defineCounter(
    THUMBS_DOWN_METRIC,
    'Thumbs-down taps on spending assistant replies'
  );
  for (const variant of TONE_VARIANTS) {
    client.impactMetrics.defineCounter(
      toneMetric(true, variant),
      `Thumbs-up taps on ${variant}-tone assistant replies`
    );
    client.impactMetrics.defineCounter(
      toneMetric(false, variant),
      `Thumbs-down taps on ${variant}-tone assistant replies`
    );
  }
  client.impactMetrics.defineCounter(
    SAVINGS_CLICK_METRIC,
    'Taps on the savings-boost card call to action'
  );
  for (const variant of SAVINGS_VARIANTS) {
    client.impactMetrics.defineCounter(
      savingsMetric(variant),
      `Taps on the savings-boost card call to action (${variant} variant)`
    );
  }

  return client;
}

// Evaluates a flag with the given Unleash context. Returns false when the
// client never started, so routes need no awareness of the degraded mode.
export function isEnabled(flagName, context) {
  return client ? client.isEnabled(flagName, context) : false;
}

// Evaluates a variant flag. The disabled fallback mirrors the SDK's own
// shape, so routes can read .enabled and .name without null checks in
// degraded mode.
export function getVariant(flagName, context) {
  if (!client) return { name: 'disabled', enabled: false, feature_enabled: false };
  return client.getVariant(flagName, context);
}

// Reports one feedback tap to Unleash: once on the overall counter the
// safeguard watches, and once on the per-variant counter for the tone the
// session is in, so the experiment can be charted per variant. A no-op in
// degraded mode, so the endpoint keeps answering even without an Unleash
// connection.
export function recordFeedback(helpful, context) {
  if (!client) return;
  const flagContext = { flagNames: [ASSISTANT_FLAG, TONE_FLAG], context };
  client.impactMetrics.incrementCounter(
    helpful ? THUMBS_UP_METRIC : THUMBS_DOWN_METRIC,
    1,
    flagContext
  );
  const tone = client.getVariant(TONE_FLAG, context);
  if (tone.enabled && TONE_VARIANTS.includes(tone.name)) {
    client.impactMetrics.incrementCounter(toneMetric(helpful, tone.name), 1, flagContext);
  }
}

// Reports one savings-card CTA tap: the conversion event of the A/B/n
// test, on the overall counter and on the counter for the session's
// variant.
export function recordSavingsClick(context) {
  if (!client) return;
  const flagContext = { flagNames: [SAVINGS_FLAG], context };
  client.impactMetrics.incrementCounter(SAVINGS_CLICK_METRIC, 1, flagContext);
  const variant = client.getVariant(SAVINGS_FLAG, context);
  if (variant.enabled && SAVINGS_VARIANTS.includes(variant.name)) {
    client.impactMetrics.incrementCounter(savingsMetric(variant.name), 1, flagContext);
  }
}

export function getClient() {
  return client;
}
