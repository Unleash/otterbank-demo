import { transactions } from '../data/account.js';

export default function TransactionList() {
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between px-1">
        <h2 className="font-display text-base font-semibold">Recent activity</h2>
        <button type="button" className="text-xs font-medium text-brand">
          See all
        </button>
      </div>
      <ul className="divide-y divide-line rounded-3xl border border-line bg-surface-raised">
        {transactions.map((tx) => {
          const incoming = tx.amount.startsWith('+');
          return (
            <li key={tx.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-base" aria-hidden="true">
                {tx.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{tx.name}</p>
                <p className="text-xs text-muted">{tx.detail}</p>
              </div>
              <p className={`font-mono text-sm ${incoming ? 'text-positive' : 'text-ink'}`}>
                {tx.amount}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
