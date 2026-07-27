import { isEnabled } from '../unleash.js';

export default async function themeRoutes(app) {
  app.post('/theme', async (request, reply) => {
    const { sessionId } = request.body ?? {};
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    // The session id in the context keeps a percentage rollout sticky: a
    // session that gets light mode keeps it as the rollout climbs.
    const light = isEnabled('light-mode-embeddr-demo', { sessionId });
    return { theme: light ? 'light' : null };
  });
}
