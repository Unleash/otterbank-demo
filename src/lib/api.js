// Tiny client for the Otterbank backend. The frontend holds no flag logic:
// it asks the backend what to show and renders the answer.

import { demoUsers } from '../data/account.js';

// In dev the backend runs on its own port; in a production build the
// backend serves the frontend, so relative URLs hit the same origin.
// VITE_BACKEND_URL overrides both, for split-origin deployments.
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ??
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

function generateId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `s-${Math.random().toString(36).slice(2)}`;
}

// One session id per browser, so percentage rollouts are sticky. The cookie
// keeps it stable across reloads, but nothing breaks without it: a blocked
// cookie just means a fresh session next visit.
function initSessionId() {
  const match = document.cookie.match(/(?:^|; )otterbank_session=([^;]+)/);
  if (match) return match[1];
  return storeSessionId(generateId());
}

function storeSessionId(id) {
  document.cookie = `otterbank_session=${id}; path=/; max-age=86400; SameSite=Lax`;
  return id;
}

let sessionId = initSessionId();

// The stickiness demo's escape hatch: pretend to be a brand-new browser
// without leaving the app. Session-sticky assignments may reshuffle;
// user-sticky ones hold.
export function resetSession() {
  sessionId = storeSessionId(generateId());
  return sessionId;
}

export function getSessionId() {
  return sessionId;
}

// The "signed in" demo user, persisted per browser. Sent as userId in the
// Unleash context on every call, so strategies with userId stickiness keep
// a person's variant stable across sessions and devices — the thing the
// demo panel's user switcher is for.
const USER_KEY = 'otterbank_user';
const DEFAULT_USER = 'mel';

// A stored id that no longer exists (say, after a persona rename) falls
// back to the default instead of silently sending a stale userId the UI
// can't display.
function readStoredUser() {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return demoUsers.some((u) => u.id === stored) ? stored : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

let userId = readStoredUser();

export function getDemoUserId() {
  return userId;
}

export function setDemoUserId(id) {
  userId = id;
  try {
    localStorage.setItem(USER_KEY, id);
  } catch {
    // Blocked storage just means the choice lasts until reload.
  }
}

async function post(path, body) {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, userId, ...body }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // Backend unreachable: the app renders with every feature off.
    return null;
  }
}

export async function fetchInstantTransfers() {
  const data = await post('/instant-transfers', {});
  return data?.instantTransfers ?? false;
}

export async function fetchAssistantAvailable() {
  const data = await post('/assistant', {});
  return data?.assistant ?? false;
}

export async function askAssistant(question) {
  const data = await post('/assistant/ask', { question });
  return data?.reply ?? null;
}

export function reportFeedback(helpful) {
  return post('/feedback', { helpful });
}

// The savings-boost A/B/n test: which variant (if any) this session sees.
export async function fetchSavingsBoost() {
  const data = await post('/savings-boost', {});
  return data?.variant ?? null;
}

// The test's conversion event: one CTA tap.
export function reportSavingsClick() {
  return post('/savings-boost/click', {});
}

// Live flag/variant assignments for the demo panel.
export async function fetchExperiments() {
  const data = await post('/experiments', {});
  return data?.flags ?? null;
}
