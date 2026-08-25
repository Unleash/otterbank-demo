import { isEnabled, getVariant } from '../unleash.js';
import { contextFrom } from '../context.js';
import { answerFor } from '../data/assistant.js';

const FLAG = 'spending-assistant';

// The full-stack experiment: spending-assistant-tone changes how answers are
// written server-side — same chat UI, different behavior behind it. The
// variant name ("classic" or "sassy") maps to a tone in
// server/data/assistant.js; anything unrecognized (flag off, variant
// renamed, degraded mode) falls back to the classic tone.
const TONE_FLAG = 'spending-assistant-tone';

export default async function assistantRoutes(app) {
  // Availability probe. The Assistant screen polls this so the feature
  // appears and disappears with the flag, no reload. The session id keeps
  // a percentage rollout sticky while it climbs.
  app.post('/assistant', async (request, reply) => {
    const context = contextFrom(request.body);
    if (!context) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    return { assistant: isEnabled(FLAG, context) };
  });

  // Answers a spending question with a canned reply. Returns null when the
  // flag is off for the session, so a mid-conversation kill degrades to an
  // "unavailable" notice instead of an error.
  app.post('/assistant/ask', async (request, reply) => {
    const context = contextFrom(request.body);
    if (!context) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }
    const { question } = request.body ?? {};

    if (!isEnabled(FLAG, context)) {
      return { reply: null };
    }

    const tone = getVariant(TONE_FLAG, context);
    return {
      reply: answerFor(String(question ?? ''), context.sessionId, tone.enabled ? tone.name : null),
    };
  });
}
