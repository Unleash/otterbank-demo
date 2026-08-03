import { useEffect, useRef, useState } from 'react';
import { fetchInstantTransfers } from '../lib/api.js';
import { contacts } from '../data/account.js';

// The backend refreshes flags every second; polling every second keeps the
// card's appearance within a second or two of the toggle — fast enough to
// land on camera during a side-by-side demo.
const POLL_INTERVAL = 1000;
// How long the collapse transition gets before the DOM is cleaned up.
const EXIT_MS = 350;

function BoltIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 4.1 12.9a.6.6 0 0 0 .5 1h5.3L9 22l8.9-10.9a.6.6 0 0 0-.5-1h-5.3Z" />
    </svg>
  );
}

// The one-click wow moment: absent while instant-transfers is off, slides
// in within a second or two of the flag turning on.
export default function InstantTransferCard() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const enabledRef = useRef(false);
  const exitTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const on = await fetchInstantTransfers();
      if (cancelled || on === enabledRef.current) return;
      enabledRef.current = on;
      if (on) {
        clearTimeout(exitTimer.current);
        setMounted(true);
        setEnabled(true);
      } else {
        setEnabled(false);
        exitTimer.current = setTimeout(() => setMounted(false), EXIT_MS);
      }
    };
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(exitTimer.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <section
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        enabled ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="animate-card-in rounded-3xl border border-line bg-surface-raised p-5 shadow-[0_12px_32px_-20px_rgba(11,79,74,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand">
              <BoltIcon />
              <h2 className="font-display text-base font-semibold text-ink">
                Send money instantly
              </h2>
            </div>
            <span className="rounded-full bg-amber-soft px-2 py-0.5 font-mono text-[10px] font-medium tracking-widest text-amber uppercase">
              new
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Transfers now arrive in seconds, around the clock. Free while it&apos;s new.
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            {contacts.map((contact) => (
              <span
                key={contact.id}
                title={contact.name}
                className="grid h-11 w-11 place-items-center rounded-full bg-mint font-mono text-xs font-medium text-brand-deep"
              >
                {contact.initials}
              </span>
            ))}
            <span className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-line text-lg text-muted">
              +
            </span>
          </div>
          <button
            type="button"
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-transform active:scale-95"
          >
            <BoltIcon className="h-4 w-4" />
            Send money
          </button>
        </div>
      </div>
    </section>
  );
}
