import { contacts, upcomingPayments } from '../data/account.js';

// Supporting screen: makes the nav read like a real bank. Static mock
// data, minimal polish — it's never the star on camera.
export default function Payments() {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted">Send, schedule, repeat.</p>
      </section>

      <section>
        <h2 className="font-display mb-2.5 px-1 text-base font-semibold">Send again</h2>
        <div className="flex gap-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex flex-col items-center gap-1.5">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-mint font-mono text-xs font-medium text-brand-deep">
                {contact.initials}
              </span>
              <span className="text-[11px] font-medium text-muted">{contact.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-line text-lg text-muted">
              +
            </span>
            <span className="text-[11px] font-medium text-muted">New</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-2.5 px-1 text-base font-semibold">Upcoming</h2>
        <ul className="divide-y divide-line rounded-3xl border border-line bg-surface-raised">
          {upcomingPayments.map((payment) => (
            <li key={payment.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-base" aria-hidden="true">
                {payment.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{payment.name}</p>
                <p className="text-xs text-muted">{payment.detail}</p>
              </div>
              <p className="font-mono text-sm">{payment.amount}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
