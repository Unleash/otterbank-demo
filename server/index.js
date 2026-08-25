import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { startUnleash } from './unleash.js';
import healthRoutes from './routes/health.js';
import transferRoutes from './routes/transfers.js';
import assistantRoutes from './routes/assistant.js';
import feedbackRoutes from './routes/feedback.js';
import savingsRoutes from './routes/savings.js';
import experimentRoutes from './routes/experiments.js';

// Request logging off: the frontend polls flag state every second, which
// would drown the logs that matter during a demo (sync status, warnings,
// thumbs-down taps).
const app = Fastify({ logger: true, disableRequestLogging: true });

await app.register(cors, {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
});

startUnleash(app.log);

await app.register(healthRoutes);
await app.register(transferRoutes);
await app.register(assistantRoutes);
await app.register(feedbackRoutes);
await app.register(savingsRoutes);
await app.register(experimentRoutes);

// Deployed mode: one process serves both the API and the frontend build.
// Registered API routes always win; unknown GET paths fall back to the SPA.
// In local dev the frontend runs on Vite instead, so a missing dist
// changes nothing.
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (existsSync(distDir)) {
  await app.register(fastifyStatic, { root: distDir });
  app.setNotFoundHandler((request, reply) => {
    const acceptsHtml = (request.headers.accept ?? '').includes('text/html');
    if (request.method === 'GET' && acceptsHtml) {
      return reply.sendFile('index.html');
    }
    return reply.code(404).send({ error: 'not found' });
  });
  app.log.info('serving the frontend build from dist');
}

const port = Number(process.env.PORT) || 3001;
await app.listen({ port, host: '0.0.0.0' });
