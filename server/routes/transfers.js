import { isEnabled } from '../unleash.js';
import { contextFrom } from '../context.js';

export default async function transferRoutes(app) {
  app.post('/instant-transfers', async (request, reply) => {
    // The session id in the context makes percentage rollouts sticky: a
    // session that receives instant transfers keeps them as a rollout climbs.
    const context = contextFrom(request.body);
    if (!context) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    return { instantTransfers: isEnabled('instant-transfers', context) };
  });
}
