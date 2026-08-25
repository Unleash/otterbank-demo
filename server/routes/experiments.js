import { isEnabled, getVariant } from '../unleash.js';
import { contextFrom } from '../context.js';

// Evaluation snapshot for the demo panel: which flags and variants this
// exact context resolves to right now. This is the stickiness demo's
// readout — switch the user or start a new session in the panel and watch
// which assignments hold and which reshuffle. Only polled while the panel
// is open.
export default async function experimentRoutes(app) {
  app.post('/experiments', async (request, reply) => {
    const context = contextFrom(request.body);
    if (!context) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    const savings = getVariant('savings-boost', context);
    const tone = getVariant('spending-assistant-tone', context);

    return {
      context,
      flags: [
        { name: 'instant-transfers', state: isEnabled('instant-transfers', context) ? 'on' : 'off' },
        { name: 'spending-assistant', state: isEnabled('spending-assistant', context) ? 'on' : 'off' },
        { name: 'savings-boost', state: savings.enabled ? savings.name : 'off' },
        { name: 'spending-assistant-tone', state: tone.enabled ? tone.name : 'off' },
      ],
    };
  });
}
