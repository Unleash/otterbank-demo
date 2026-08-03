import { useState } from 'react';
import { user, card } from '../data/account.js';

function Toggle({ label, initial = false }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      aria-pressed={on}
      className="flex min-h-12 w-full items-center justify-between px-4 py-2.5"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-line'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            on ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </button>
  );
}

// Supporting screen: makes the nav read like a real bank. Static mock
// data, minimal polish — it's never the star on camera.
export default function Cards() {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Cards</h1>
        <p className="mt-1 text-sm text-muted">Your everyday debit card.</p>
      </section>

      <section className="animate-card-in rounded-3xl bg-gradient-to-br from-brand-deep to-brand p-6 text-white shadow-[0_16px_40px_-16px_rgba(11,79,74,0.5)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-white/80 uppercase">Otterbank</span>
          <span className="text-xs text-white/60">Debit</span>
        </div>
        <span className="mt-8 block h-8 w-11 rounded-md bg-gradient-to-br from-amber-soft to-amber/50" aria-hidden="true" />
        <p className="mt-4 font-mono text-lg tracking-wider">{card.number}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-white/80">
          <span className="uppercase">{user.fullName}</span>
          <span className="font-mono">{card.expires}</span>
        </div>
      </section>

      <section className="divide-y divide-line rounded-3xl border border-line bg-surface-raised">
        <Toggle label="Freeze card" />
        <Toggle label="Online payments" initial />
        <Toggle label="Contactless" initial />
      </section>
    </div>
  );
}
