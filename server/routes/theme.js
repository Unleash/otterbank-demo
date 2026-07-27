import { isEnabled } from '../unleash.js';

export default async function themeRoutes(app) {
  app.post('/theme', async (request, reply) => {
    const { sessionId } = request.body ?? {};
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    // The flag gates the control, not the theme: when it serves true the
    // frontend shows the toggle, and the light or dark choice is the
    // user's own. The session id keeps a percentage rollout sticky.
    const themeToggle = isEnabled('light-mode', { sessionId });
    return { themeToggle };
  });
}
