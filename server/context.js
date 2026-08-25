// Builds the Unleash context for one request. The session id keeps
// percentage rollouts and variant assignments sticky per browser; the user
// id (the demo panel's "signed in" user) is what custom stickiness demos
// switch to, so the same person keeps the same variant across sessions and
// devices. Returns null when the session id is missing, so routes can 400.
export function contextFrom(body) {
  const { sessionId, userId } = body ?? {};
  if (!sessionId) return null;
  const context = { sessionId };
  if (userId) context.userId = String(userId);
  return context;
}
