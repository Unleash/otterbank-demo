// The "demo" badge doubles as the door to the demo controls panel: honest
// labeling for viewers, and an unobtrusive way for the operator to switch
// users or sessions on camera.
export default function Header({ activeUser, onOpenDemoPanel }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-lg" aria-hidden="true">
            🦦
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Otterbank
          </span>
          <button
            type="button"
            onClick={onOpenDemoPanel}
            className="rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 font-mono text-[10px] font-medium tracking-widest text-amber uppercase transition-transform active:scale-95"
          >
            demo
          </button>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-deep font-mono text-xs font-medium text-white">
          {activeUser.firstName[0]}
        </span>
      </div>
    </header>
  );
}
