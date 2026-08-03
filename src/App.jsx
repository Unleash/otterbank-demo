import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import Payments from './components/Payments.jsx';
import Cards from './components/Cards.jsx';
import Assistant from './components/Assistant.jsx';
import TabBar from './components/TabBar.jsx';
import { fetchAssistantAvailable } from './lib/api.js';

// The backend refreshes flags every second; polling every second means the
// assistant's "Try it now" card on Home appears (or vanishes) within a
// second or two of the spending-assistant flag changing.
const POLL_INTERVAL = 1000;

// Single-column, mobile-first shell. On desktop the phone layout just sits
// centered; it will never be on camera, so it gets no layout of its own.
// The assistant is not a tab: it opens from the flag-gated card on Home
// and closes back to it, so the nav always looks like a normal bank's.
export default function App() {
  const [view, setView] = useState('home');
  const [assistantAvailable, setAssistantAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const on = await fetchAssistantAvailable();
      if (!cancelled) setAssistantAvailable(on);
    };
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // The feature disappearing takes the screen with it: back to Home.
  useEffect(() => {
    if (!assistantAvailable && view === 'assistant') setView('home');
  }, [assistantAvailable, view]);

  const screens = {
    home: (
      <Home
        assistantAvailable={assistantAvailable}
        onOpenAssistant={() => setView('assistant')}
      />
    ),
    payments: <Payments />,
    cards: <Cards />,
    assistant: <Assistant onBack={() => setView('home')} />,
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-line bg-surface sm:border-x">
      <Header />
      <main className="flex-1 px-5 pt-5 pb-28">{screens[view] ?? screens.home}</main>
      <TabBar tab={view} onChange={setView} />
    </div>
  );
}
