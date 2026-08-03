import { isEnabled } from '../unleash.js';
import { answerFor } from '../data/assistant.js';

const FLAG = 'spending-assistant';

export default async function assistantRoutes(app) {
  // Availability probe. The Assistant screen polls this so the feature
  // appears and disappears with the flag, no reload. The session id keeps
  // a percentage rollout sticky while it climbs.
  app.post('/assistant', async (request, reply) => {
    const { sessionId } = request.body ?? {};
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    return { assistant: isEnabled(FLAG, { sessionId }) };
  });

  // Answers a spending question with a canned reply. Returns null when the
  // flag is off for the session, so a mid-conversation kill degrades to an
  // "unavailable" notice instead of an error.
  app.post('/assistant/ask', async (request, reply) => {
    const { sessionId, question } = request.body ?? {};
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    if (!isEnabled(FLAG, { sessionId })) {
      return { reply: null };
    }

    return { reply: answerFor(String(question ?? ''), sessionId) };
  });
}
