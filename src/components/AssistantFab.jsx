import { useEffect, useRef, useState } from 'react';

// How long the scale-out transition gets before the DOM is cleaned up.
const EXIT_MS = 300;

// The spending-assistant entry point: a floating otter hovering above the
// tab bar. Absent while the flag is off for this session, pops in when the
// rollout reaches it. App owns the flag state (it polls every second);
// this button only animates it. Fixed to the viewport but constrained to
// the phone column, so it hovers over every tab.
export default function AssistantFab({ available, onOpen }) {
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
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30">
      <div className="mx-auto flex w-full max-w-md justify-end px-5">
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open your spending assistant"
          className={`pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-2xl shadow-[0_10px_28px_-10px_rgba(11,79,74,0.65)] transition-[transform,opacity] duration-300 ease-out active:scale-90 ${
            available ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <span aria-hidden="true">🦦</span>
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-surface-raised text-[11px] shadow-sm"
          >
            ✨
          </span>
        </button>
      </div>
    </div>
  );
}
