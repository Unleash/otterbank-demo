import { account } from '../data/account.js';

export default function BalanceCard() {
  return (
    <section className="animate-card-in rounded-3xl bg-gradient-to-br from-brand-deep to-brand p-6 text-white shadow-[0_16px_40px_-16px_rgba(11,79,74,0.5)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/75">{account.name}</p>
        <p className="font-mono text-xs text-white/60">{account.number}</p>
      </div>
      <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
        {account.balance}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          {account.delta}
        </span>
        <span className="text-xs text-white/60">Updated just now</span>
      </div>
    </section>
  );
}
