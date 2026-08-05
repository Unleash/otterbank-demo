import { recordFeedback } from '../unleash.js';

// Feedback taps per session, in memory. The demo runs long enough for a
// rollout to pause, not long enough to need persistence.
const feedbackCounts = new Map();

export default async function feedbackRoutes(app) {
  app.post('/feedback', async (request, reply) => {
    const { sessionId, helpful } = request.body ?? {};
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    const kind = helpful ? 'up' : 'down';
    const counts = feedbackCounts.get(sessionId) ?? { up: 0, down: 0 };
    counts[kind] += 1;
    feedbackCounts.set(sessionId, counts);
    recordFeedback(Boolean(helpful), sessionId);
    request.log.info({ sessionId, ...counts }, `thumbs-${kind} recorded`);

    return { ok: true };
  });
}
