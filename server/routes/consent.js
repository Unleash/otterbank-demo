import { isEnabled, getVariant } from '../unleash.js';
import { consentDesigns } from '../data/consent.js';

const FLAG = 'regional-consent-test';

export default async function consentRoutes(app) {
  app.post('/consent', async (request, reply) => {
    const { sessionId, region } = request.body ?? {};
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    // data-region is a custom context field, so it travels in properties.
    // The EU targeting lives in the flag's strategy constraint, not here:
    // outside the constrained regions the flag simply evaluates to off.
    const context = { sessionId, properties: { 'data-region': region ?? '' } };
    if (!isEnabled(FLAG, context)) {
      return { consent: null };
    }

    // The variant payload names the design; the copy stays in the bank so
    // the notice reads the same no matter how the A/B is reweighted.
    const variant = getVariant(FLAG, context);
    const consent = consentDesigns[variant?.payload?.value] ?? consentDesigns.classic;
    return { consent };
  });
}
