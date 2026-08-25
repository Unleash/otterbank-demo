import { getVariant, recordSavingsClick } from '../unleash.js';
import { contextFrom } from '../context.js';

// The savings-boost A/B/n test. The flag's strategy variants decide which
// pitch a session sees; the frontend renders whichever name comes back.
// With impression data enabled on the flag, every evaluation here also
// logs an impression event server-side.
export default async function savingsRoutes(app) {
  app.post('/savings-boost', async (request, reply) => {
    const context = contextFrom(request.body);
    if (!context) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    const variant = getVariant('savings-boost', context);
    return {
      enabled: variant.feature_enabled ?? false,
      variant: variant.enabled ? variant.name : null,
    };
  });

  // The conversion event of the test: one tap on the card's CTA. The
  // impact metric sample carries the session's variant, so Unleash charts
  // the variants against each other.
  app.post('/savings-boost/click', async (request, reply) => {
    const context = contextFrom(request.body);
    if (!context) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    recordSavingsClick(context);
    request.log.info(context, 'savings CTA click recorded');
    return { ok: true };
  });
}
