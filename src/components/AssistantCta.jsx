import { useEffect, useRef, useState } from 'react';

// How long the collapse transition gets before the DOM is cleaned up.
const EXIT_MS = 350;

// The spending-assistant entry point: absent while the flag is off for
// this session, slides in when the rollout reaches it. App owns the flag
// state (it polls every second); this card only animates it.
export default function AssistantCta({ available, onOpen }) {
  const [mounted, setMounted] = useState(available);
  const exitTimer = useRef(null);

  useEffect(() => {
    if (available) {
      clearTimeout(exitTimer.current);
      setMounted(true);
    } else {
      exitTimer.current = setTimeout(() => setMounted(false), EXIT_MS);
    }
    return () => clearTimeout(exitTimer.current);
  }, [available]);

  if (!mounted) return null;

  return (
    <section
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        available ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="animate-card-in rounded-3xl border border-brand/20 bg-gradient-to-br from-mint to-surface-raised p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">✨</span>
              <h2 className="font-display text-base font-semibold">
                Meet your spending assistant
              </h2>
            </div>
            <span className="rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] font-medium tracking-widest text-white uppercase">
              new
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Ask anything about your spending and get an instant answer.
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Try it now
          </button>
        </div>
      </div>
    </section>
  );
}
