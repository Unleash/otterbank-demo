import RegionSelect from './RegionSelect.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold text-cream">
            embeddr
            <span className="text-rose">.</span>
          </span>
          <span className="hidden font-mono text-xs text-muted sm:inline">
            find your nearest neighbor
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <RegionSelect />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rose to-lavender font-mono text-xs font-medium text-ink">
            U
          </span>
        </div>
      </div>
    </header>
  );
}
