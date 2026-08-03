import BalanceCard from './BalanceCard.jsx';
import InstantTransferCard from './InstantTransferCard.jsx';
import AssistantCta from './AssistantCta.jsx';
import TransactionList from './TransactionList.jsx';
import { user } from '../data/account.js';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home({ assistantAvailable, onOpenAssistant }) {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {greeting()}, {user.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s your money at a glance.</p>
      </section>
      <BalanceCard />
      <InstantTransferCard />
      <AssistantCta available={assistantAvailable} onOpen={onOpenAssistant} />
      <TransactionList />
    </div>
  );
}
