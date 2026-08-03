import { isEnabled } from '../unleash.js';

export default async function transferRoutes(app) {
  app.post('/instant-transfers', async (request, reply) => {
    const { sessionId } = request.body ?? {};
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    // The session id in the context makes percentage rollouts sticky: a
    // session that receives instant transfers keeps them as a rollout climbs.
    return { instantTransfers: isEnabled('instant-transfers', { sessionId }) };
  });
}
