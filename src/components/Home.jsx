import BalanceCard from './BalanceCard.jsx';
import InstantTransferCard from './InstantTransferCard.jsx';
import TransactionList from './TransactionList.jsx';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// One flag-gated card at most: instant transfers. The savings pitch lives
// on Payments and the assistant floats as the otter button, so Home stays
// clean even with every flag on.
export default function Home({ activeUser }) {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {greeting()}, {activeUser.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s your money at a glance.</p>
      </section>
      <BalanceCard />
      <InstantTransferCard />
      <TransactionList />
    </div>
  );
}
