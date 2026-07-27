// Wraps a card's opener area in the consent notice the backend prescribes.
// No consent object means no notice: the children render untouched, which
// is also what a flag kill looks like mid-interaction. The design field is
// the A/B arm: classic is the loud bordered banner over a blurred opener,
// minimal is a small chip that opens the opener area up when ticked. The
// tick state lives in the card, which also uses it to gate the Match button.
export default function ConsentGate({ consent, agreed, onAgreedChange, children }) {
  if (!consent) return children;

  const checkbox = (
    <input
      type="checkbox"
      checked={agreed}
      onChange={(event) => onAgreedChange(event.target.checked)}
      className="h-4 w-4 shrink-0 cursor-pointer accent-lavender"
    />
  );

  if (consent.design === 'minimal') {
    return (
      <div>
        <label className="animate-line-in mb-5 flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-lavender/50 px-3 font-mono text-xs text-muted transition-colors hover:border-lavender hover:text-cream">
          {checkbox}
          {consent.notice}
        </label>
        <div
          aria-hidden={!agreed}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${agreed ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="min-h-0 overflow-hidden">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="animate-line-in mb-5 rounded-xl border-2 border-lavender bg-lavender/10 p-3 shadow-[0_0_28px_-8px_rgba(183,166,240,0.7)]">
        <p className="font-mono text-xs font-medium tracking-widest text-lavender uppercase">
          consent required
        </p>
        <p className="mt-1 text-sm leading-relaxed text-cream/90">{consent.notice}</p>
        <label className="mt-1 flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-cream">
          {checkbox}
          {consent.checkboxLabel}
        </label>
      </div>
      {agreed ? (
        children
      ) : (
        // overflow-hidden clips both the blur bleed and the overlay line, so
        // an empty opener area (Auto-Rizz off) shows nothing at all.
        <div className="relative overflow-hidden rounded-xl">
          <div aria-hidden="true" className="pointer-events-none select-none blur-md">
            {children}
          </div>
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center font-mono text-xs text-lavender">
            {consent.withheldLabel}
          </p>
        </div>
      )}
    </div>
  );
}
