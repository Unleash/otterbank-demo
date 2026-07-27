import { useEffect, useState } from 'react';
import { agents } from '../data/agents.js';
import { fetchConsent } from '../lib/api.js';
import ProfileCard from './ProfileCard.jsx';

// Same rhythm as the opener: the backend refreshes flags every 5s, polling
// every 3s keeps a flag flip or region change visible within seconds. One
// poll here covers the whole grid; the checkbox state stays per card.
const POLL_INTERVAL = 3000;

// Staggered entrance: each card arrives a beat after the previous one.
const entranceDelays = [
  '[animation-delay:0ms]',
  '[animation-delay:70ms]',
  '[animation-delay:140ms]',
  '[animation-delay:210ms]',
  '[animation-delay:280ms]',
  '[animation-delay:350ms]',
];

export default function MatchGrid() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const next = await fetchConsent();
      if (cancelled) return;
      // Keep the object stable across polls unless the design changed, so
      // the cards only re-render on an actual change of arm.
      setConsent((prev) => (prev?.design === next?.design ? prev : next));
    };

    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent, i) => (
        <div key={agent.id} className={`animate-card-in ${entranceDelays[i % entranceDelays.length]}`}>
          <ProfileCard agent={agent} consent={consent} />
        </div>
      ))}
    </section>
  );
}
