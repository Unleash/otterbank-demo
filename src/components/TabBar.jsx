function HomeIcon({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function PaymentsIcon({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M17 17V7H7" />
    </svg>
  );
}

function CardIcon({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'payments', label: 'Payments', Icon: PaymentsIcon },
  { id: 'cards', label: 'Cards', Icon: CardIcon },
];

// Bottom tabs keep primary actions in thumb reach on a phone. The set is
// fixed so the nav always reads like a real bank; the flag-gated assistant
// lives behind the card on Home, not here.
export default function TabBar({ tab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md border-t border-line bg-surface-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-brand' : 'text-muted'
                }`}
              >
                <Icon />
                <span className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
