import { recordFeedback } from '../unleash.js';
import { contextFrom } from '../context.js';

// Feedback taps per session, in memory. The demo runs long enough for a
// rollout to pause, not long enough to need persistence.
const feedbackCounts = new Map();

export default async function feedbackRoutes(app) {
  app.post('/feedback', async (request, reply) => {
    const context = contextFrom(request.body);
    if (!context) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }
    const { helpful } = request.body ?? {};

    const kind = helpful ? 'up' : 'down';
    const counts = feedbackCounts.get(context.sessionId) ?? { up: 0, down: 0 };
    counts[kind] += 1;
    feedbackCounts.set(context.sessionId, counts);
    recordFeedback(Boolean(helpful), context);
    request.log.info({ sessionId: context.sessionId, ...counts }, `thumbs-${kind} recorded`);

    return { ok: true };
  });
}
