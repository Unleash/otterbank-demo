// Tiny client for the Embeddr backend. The frontend holds no flag logic:
// it asks the backend what to show and renders the answer.

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
  const match = document.cookie.match(/(?:^|; )embeddr_session=([^;]+)/);
  if (match) return match[1];
  const id = generateId();
  document.cookie = `embeddr_session=${id}; path=/; max-age=86400; SameSite=Lax`;
  return id;
}

const sessionId = initSessionId();

// The data residency regions offered in the header. The first one is the
// default for sessions that have not picked one.
export const REGIONS = [
  'us-east-1',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'eu-central-2',
  'eu-north-1',
  'eu-south-1',
  'ap-southeast-2',
];

// The region rides along with the session id on every request, so the
// backend can hand it to Unleash as context. sessionStorage keeps the
// choice for the session; a blocked store just means the default region.
function initRegion() {
  try {
    const stored = sessionStorage.getItem('embeddr_region');
    if (REGIONS.includes(stored)) return stored;
  } catch {
    // Storage unavailable: fall through to the default.
  }
  return REGIONS[0];
}

let region = initRegion();

export function getRegion() {
  return region;
}

export function setRegion(next) {
  if (!REGIONS.includes(next)) return;
  region = next;
  try {
    sessionStorage.setItem('embeddr_region', next);
  } catch {
    // Storage unavailable: the in-memory value still covers this visit.
  }
}

async function post(path, body) {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, region, ...body }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // Backend unreachable: the app renders like the original.
    return null;
  }
}

export async function fetchOpener(matchId, variant = 0) {
  const data = await post('/opener', { matchId, variant });
  return data?.opener ?? null;
}

export function reportIck() {
  return post('/ick', {});
}

export async function fetchConsent() {
  const data = await post('/consent', {});
  return data?.consent ?? null;
}

export async function fetchQrCode() {
  const data = await post('/qr-code', {});
  return data?.qrCode ?? null;
}
