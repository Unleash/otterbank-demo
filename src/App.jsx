import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import Payments from './components/Payments.jsx';
import Cards from './components/Cards.jsx';
import Assistant from './components/Assistant.jsx';
import TabBar from './components/TabBar.jsx';
import AssistantFab from './components/AssistantFab.jsx';
import DemoPanel from './components/DemoPanel.jsx';
import {
  fetchAssistantAvailable,
  getDemoUserId,
  setDemoUserId,
  getSessionId,
  resetSession,
} from './lib/api.js';
import { demoUsers } from './data/account.js';

// The backend refreshes flags every second; polling every second means the
// assistant's floating otter button appears (or vanishes) within a second
// or two of the spending-assistant flag changing.
const POLL_INTERVAL = 1000;

// Single-column, mobile-first shell. On desktop the phone layout just sits
// centered; it will never be on camera, so it gets no layout of its own.
// The assistant is not a tab: it opens from the flag-gated floating otter
// button and closes back to Home, so the nav always looks like a normal
// bank's.
export default function App() {
  const [view, setView] = useState('home');
  const [assistantAvailable, setAssistantAvailable] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  // The demo panel's user and session state lives in lib/api.js (it goes
  // into every request); this state only mirrors it for rendering.
  const [activeUserId, setActiveUserId] = useState(getDemoUserId());
  const [sessionId, setSessionId] = useState(getSessionId());

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

  const activeUser = demoUsers.find((u) => u.id === activeUserId) ?? demoUsers[0];

  const selectUser = (id) => {
    setDemoUserId(id);
    setActiveUserId(id);
  };

  const newSession = () => {
    setSessionId(resetSession());
  };

  const screens = {
    home: <Home activeUser={activeUser} />,
    payments: <Payments />,
    cards: <Cards />,
    // Keyed by user and session so a switch in the demo panel remounts the
    // chat: fresh greeting, fresh history. Without the key the greeting
    // keeps naming whoever was signed in when the screen first opened.
    assistant: (
      <Assistant
        key={`${activeUserId}:${sessionId}`}
        activeUser={activeUser}
        onBack={() => setView('home')}
      />
    ),
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-line bg-surface sm:border-x">
      <Header activeUser={activeUser} onOpenDemoPanel={() => setDemoOpen(true)} />
      <main className="flex-1 px-5 pt-5 pb-28">{screens[view] ?? screens.home}</main>
      <TabBar tab={view} onChange={setView} />
      <AssistantFab
        available={assistantAvailable && view !== 'assistant'}
        onOpen={() => setView('assistant')}
      />
      <DemoPanel
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        activeUserId={activeUserId}
        onSelectUser={selectUser}
        sessionId={sessionId}
        onNewSession={newSession}
      />
    </div>
  );
}
