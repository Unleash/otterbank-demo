import { useEffect, useRef, useState } from 'react';
import { fetchSavingsBoost, reportSavingsClick } from '../lib/api.js';

// The backend refreshes flags every second; polling every second keeps the
// card (and a variant reassignment) within a second or two of a change in
// Unleash — fast enough to land on camera during a side-by-side demo.
const POLL_INTERVAL = 1000;
// How long the collapse transition gets before the DOM is cleaned up.
const EXIT_MS = 350;
// How long the CTA shows its "recorded" state before inviting another tap.
const CONFIRM_MS = 900;

// One pitch per strategy variant of the savings-boost flag. The variant
// name picked in Unleash decides which one a session sees; an unknown name
// (say, a variant added on the fly during a workshop) falls back to a
// generic pitch instead of breaking the demo.
const PITCHES = {
  'round-up': {
    icon: '🪙',
    title: 'Round up your change',
    body: 'Round every card purchase up to the nearest dollar and drop the difference into savings. Small change, on autopilot.',
    cta: 'Turn on round-ups',
  },
  'goal-tracker': {
    icon: '🎯',
    title: 'Put a goal on it',
    body: "You're about $610 ahead of July. Set a savings goal and we'll route the surplus there before it wanders off.",
    cta: 'Set a goal',
  },
  cashback: {
    icon: '💸',
    title: '1% back, straight to savings',
    body: 'Earn 1% back on everyday card spending, deposited into your savings automatically every Friday.',
    cta: 'Activate cash back',
  },
};

const FALLBACK_PITCH = {
  icon: '🌱',
  title: 'Give your savings a boost',
  body: 'A little structure goes a long way. Let Otterbank set money aside for you automatically.',
  cta: 'Boost my savings',
};

// The A/B/n test surface: absent while savings-boost is off, and rendered
// per-variant while it's on. Every CTA tap reports the conversion metric,
// labeled with this session's variant. Repeated taps are allowed on
// purpose — that's how a demo generates enough conversions to chart.
export default function SavingsBoostCard() {
  const [variant, setVariant] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const variantRef = useRef(null);
  const exitTimer = useRef(null);
  const confirmTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const next = await fetchSavingsBoost();
      if (cancelled || next === variantRef.current) return;
      variantRef.current = next;
      if (next) {
        clearTimeout(exitTimer.current);
        setMounted(true);
        setVariant(next);
      } else {
        setVariant(null);
        exitTimer.current = setTimeout(() => setMounted(false), EXIT_MS);
      }
    };
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(exitTimer.current);
      clearTimeout(confirmTimer.current);
    };
  }, []);

  if (!mounted) return null;

  const pitch = PITCHES[variant] ?? FALLBACK_PITCH;

  const handleClick = () => {
    reportSavingsClick();
    setConfirmed(true);
    clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmed(false), CONFIRM_MS);
  };

  return (
    <section
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        variant ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="animate-card-in rounded-3xl border border-line bg-surface-raised p-5 shadow-[0_12px_32px_-20px_rgba(11,79,74,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">{pitch.icon}</span>
              <h2 className="font-display text-base font-semibold">{pitch.title}</h2>
            </div>
            <span className="rounded-full bg-mint px-2 py-0.5 font-mono text-[10px] font-medium tracking-widest text-brand-deep uppercase">
              savings
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted">{pitch.body}</p>
          <button
            type="button"
            onClick={handleClick}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition-transform active:scale-95"
          >
            {confirmed ? 'Nice — noted ✓' : pitch.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
