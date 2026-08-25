import { useEffect, useRef, useState } from 'react';
import { askAssistant, reportFeedback } from '../lib/api.js';
import { suggestedQuestions } from '../data/account.js';

// Minimum "thinking" time so canned answers read as computed, not pasted.
const THINKING_MS = 700;

// Only reachable in the race between the flag turning off and the tab
// disappearing a second later; the answer endpoint returns null then.
const UNAVAILABLE_NOTICE =
  "I can't answer right now. Give me a moment and try again.";

function SendIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  );
}

function ThumbsIcon({ className, size = 16, up = false }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      transform={up ? 'rotate(180)' : undefined}
    >
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

// Fixed particle vectors: cheap, deterministic, transform-only.
const BURST_VECTORS = [
  '[--dx:-20px] [--dy:-44px]',
  '[--dx:-7px] [--dy:-54px] [animation-delay:40ms]',
  '[--dx:6px] [--dy:-48px] [animation-delay:20ms]',
  '[--dx:19px] [--dy:-40px] [animation-delay:60ms]',
  '[--dx:0px] [--dy:-32px] [animation-delay:80ms]',
];

// One feedback button. Every tap reports the matching impact metric, so
// repeated taps are allowed on purpose: spamming thumbs-down is how the
// demo trips the safeguard that pauses the rollout.
function FeedbackButton({ helpful }) {
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);
  const timersRef = useRef(new Set());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
      timers.clear();
    };
  }, []);

  const handleTap = () => {
    reportFeedback(helpful);
    const id = (idRef.current += 1);
    setBursts((b) => [...b, id]);
    const t = setTimeout(() => {
      timersRef.current.delete(t);
      setBursts((b) => b.filter((x) => x !== id));
    }, 700);
    timersRef.current.add(t);
  };

  const activeColor = helpful ? 'active:text-brand' : 'active:text-amber';
  const burstColor = helpful ? 'text-brand' : 'text-amber';

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={helpful ? 'Helpful' : 'Not helpful'}
      className={`relative flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted transition-colors active:bg-line/60 ${activeColor}`}
    >
      <ThumbsIcon up={helpful} />
      {bursts.map((id) => (
        <span key={id} aria-hidden="true" className="pointer-events-none absolute inset-0">
          {BURST_VECTORS.map((vec) => (
            <span key={vec} className={`animate-burst absolute top-1/2 left-1/2 -ml-1.5 -mt-1.5 ${burstColor} ${vec}`}>
              <ThumbsIcon size={12} up={helpful} />
            </span>
          ))}
        </span>
      ))}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="animate-line-in flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-surface-raised px-4 py-3.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-typing h-1.5 w-1.5 rounded-full bg-muted"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function BackIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

// The chat screen. Only rendered while spending-assistant serves this
// session — App owns that decision, and the "Try it now" card on Home is
// the only way in.
export default function Assistant({ onBack, activeUser }) {
  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      role: 'assistant',
      text:
        `Hi ${activeUser.firstName}! I'm your spending assistant. Ask me anything about ` +
        'your money — or try one of the questions below.',
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const idRef = useRef(0);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const send = async (question) => {
    const text = question.trim();
    if (!text || typing) return;
    setInput('');
    setMessages((m) => [...m, { id: `u${(idRef.current += 1)}`, role: 'user', text }]);
    setTyping(true);
    const [reply] = await Promise.all([
      askAssistant(text),
      new Promise((resolve) => setTimeout(resolve, THINKING_MS)),
    ]);
    setTyping(false);
    setMessages((m) => [
      ...m,
      reply
        ? { id: `a${(idRef.current += 1)}`, role: 'assistant', text: reply }
        : { id: `n${(idRef.current += 1)}`, role: 'assistant', text: UNAVAILABLE_NOTICE, notice: true },
    ]);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-center gap-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="-ml-3 grid h-11 w-11 place-items-center rounded-full text-muted transition-colors active:bg-line/60"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Assistant</h1>
          <p className="mt-0.5 text-sm text-muted">Ask about your spending.</p>
        </div>
      </section>

      <div className="flex flex-col gap-3" aria-live="polite">
        {messages.map((message) =>
          message.role === 'user' ? (
            <p
              key={message.id}
              className="animate-line-in max-w-[85%] self-end rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-white"
            >
              {message.text}
            </p>
          ) : (
            <div key={message.id} className="max-w-[90%] self-start">
              <p
                className={`animate-line-in rounded-2xl rounded-bl-md border border-line bg-surface-raised px-4 py-2.5 text-sm leading-relaxed ${
                  message.notice ? 'italic text-muted' : ''
                }`}
              >
                {message.text}
              </p>
              {!message.notice && message.id !== 'greeting' && (
                <div className="mt-0.5 flex justify-start gap-1">
                  <FeedbackButton helpful />
                  <FeedbackButton helpful={false} />
                </div>
              )}
            </div>
          )
        )}
        {typing && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => send(question)}
              className="shrink-0 rounded-full border border-line bg-surface-raised px-3.5 py-2 text-xs font-medium text-brand-deep transition-colors active:bg-mint"
            >
              {question}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your spending…"
            aria-label="Ask about your spending"
            className="min-h-12 flex-1 rounded-full border border-line bg-surface-raised px-4 text-sm outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            type="submit"
            aria-label="Send"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white transition-transform active:scale-95"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
