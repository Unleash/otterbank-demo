import { useEffect } from 'react';
import { fetchTheme } from '../lib/api.js';

// Same rhythm as the opener and QR corner: poll so a flag flip repaints the
// app within a few seconds, no reload.
const POLL_INTERVAL = 3000;

// Renders nothing. It asks the backend which theme to show and reflects the
// answer onto <html> as data-theme. Flag off (or backend unreachable) means
// no attribute, which is the original dark theme.
export default function ThemeController() {
  useEffect(() => {
    let cancelled = false;

    const apply = (theme) => {
      if (cancelled) return;
      const root = document.documentElement;
      if (theme === 'light') root.dataset.theme = 'light';
      else delete root.dataset.theme;
    };

    const poll = async () => apply(await fetchTheme());
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return null;
}
