import { useEffect, useState } from 'react';
import { fetchExperiments } from '../lib/api.js';
import { demoUsers } from '../data/account.js';
import demoQr from '../assets/demo-qr.svg';

// Where the QR code below points: the deployed demo, so viewers can pull
// the app up on their own phones mid-presentation.
const DEMO_URL = 'https://otterbank-demo-production.up.railway.app/';

// Poll cadence for the live assignment readout, matching the rest of the
// app so the panel reflects a toggle or reassignment within a second or two.
const POLL_INTERVAL = 1000;

// The stickiness demo's control surface, opened from the "demo" badge in
// the header. Switch the signed-in user (userId in the Unleash context) or
// start a fresh session (new sessionId), then watch the live assignment
// readout: session-sticky assignments reshuffle with a new session,
// user-sticky ones follow the user. Deliberately out-of-world — this is
// the demo operator's panel, not part of the bank.
export default function DemoPanel({ open, onClose, activeUserId, onSelectUser, sessionId, onNewSession }) {
  const [flags, setFlags] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const poll = async () => {
      const next = await fetchExperiments();
      if (!cancelled && next) setFlags(next);
    };
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col justify-end">
      <button
        type="button"
        aria-label="Close demo controls"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
      />
      <div className="animate-card-in relative rounded-t-3xl border border-b-0 border-line bg-surface-raised p-5 pb-8 shadow-[0_-12px_40px_-20px_rgba(11,79,74,0.5)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Demo controls</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors active:bg-line/60"
          >
            ✕
          </button>
        </div>

        <section className="mt-4">
          <h3 className="font-mono text-[10px] font-medium tracking-widest text-muted uppercase">
            Signed in as · userId
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {demoUsers.map((demoUser) => (
              <button
                key={demoUser.id}
                type="button"
                onClick={() => onSelectUser(demoUser.id)}
                className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                  demoUser.id === activeUserId
                    ? 'border-brand bg-brand text-white'
                    : 'border-line bg-surface text-brand-deep active:bg-mint'
                }`}
              >
                {demoUser.fullName}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <h3 className="font-mono text-[10px] font-medium tracking-widest text-muted uppercase">
            Session · sessionId
          </h3>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="truncate font-mono text-xs text-muted">{sessionId}</span>
            <button
              type="button"
              onClick={onNewSession}
              className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-brand-deep transition-colors active:bg-mint"
            >
              New session
            </button>
          </div>
        </section>

        <section className="mt-4">
          <h3 className="font-mono text-[10px] font-medium tracking-widest text-muted uppercase">
            Live assignments
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {(flags ?? []).map((flag) => (
              <li key={flag.name} className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs">{flag.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase ${
                    flag.state === 'off' ? 'bg-line/60 text-muted' : 'bg-mint text-brand-deep'
                  }`}
                >
                  {flag.state}
                </span>
              </li>
            ))}
            {!flags && <li className="text-xs text-muted">Waiting for the backend…</li>}
          </ul>
        </section>

        <section className="mt-4">
          <h3 className="font-mono text-[10px] font-medium tracking-widest text-muted uppercase">
            Try it yourself
          </h3>
          <div className="mt-2 flex items-center gap-4">
            <img
              src={demoQr}
              alt="QR code linking to the deployed Otterbank demo"
              className="h-28 w-28 shrink-0 rounded-xl border border-line bg-white"
            />
            <p className="text-xs text-muted">
              Scan to open the deployed demo on your phone, or visit{' '}
              <a href={DEMO_URL} className="font-medium text-brand-deep underline">
                {new URL(DEMO_URL).host}
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
