// Canned spending assistant replies. The numbers line up with the static
// transaction list on the Home screen, so answers read as real analysis of
// the account on camera. Keyword buckets are checked in order; the first
// match wins, and anything unmatched falls back to a stable generic line.

const ANSWER_BUCKETS = [
  {
    keywords: ['coffee', 'latte', 'cafe', 'café'],
    reply:
      "You've spent $38.60 on coffee in the last 30 days — eight visits to Fern & Ferry, " +
      'averaging $4.83 a cup. That works out to about $1.29 a day. As habits go, there are worse.',
  },
  {
    keywords: ['biggest', 'largest', 'most expensive', 'top expense'],
    reply:
      'Your biggest expense this month is rent: $1,450.00 to Maple Court on 28 July. ' +
      'Next comes groceries at $284.90, then subscriptions at $34.97.',
  },
  {
    keywords: ['subscription', 'streaming', 'recurring'],
    reply:
      'You have three active subscriptions totalling $34.97 a month: Streamly ($11.99), ' +
      "CloudTunes ($9.99) and FitOtter ($12.99). FitOtter hasn't been opened since May — just saying.",
  },
  {
    keywords: ['last month', 'compare', 'july', 'june', 'month before'],
    reply:
      "You've spent $1,586.34 so far this month — about 12% less than at the same point in July. " +
      'Groceries are down, transport is down, and coffee is… exactly the same. Consistency!',
  },
  {
    keywords: ['grocer', 'food', 'eating', 'supermarket'],
    reply:
      'Groceries add up to $284.90 this month, nearly all of it at GreenMart. ' +
      "That's $23 under your three-month average, so no notes from me.",
  },
  {
    keywords: ['save', 'saving', 'budget', 'goal'],
    reply:
      "At your current pace you'll end the month roughly $610 under July. Moving $150 of that " +
      'into savings would keep you on track for your $5,000 goal by December.',
  },
  {
    keywords: ['balance', 'how much do i have', 'account'],
    reply:
      'Your available balance is $4,826.40. Rent has already gone out this cycle, ' +
      'so the rest of the month should be smooth sailing.',
  },
];

// Fallback lines for questions outside the buckets. Picked by a stable hash
// so the same question gets the same answer across taps and demos.
const FALLBACK_REPLIES = [
  "Good question. Looking at your last 30 days, nothing unusual stands out — spending is steady and your balance is trending up since payday on 1 August.",
  "I dug through your recent activity and the short version is: you're fine. Rent and groceries dominate, everything else is small change.",
  "Nothing alarming in your recent transactions. If you want specifics, try asking about coffee, subscriptions, or your biggest expense.",
  "Based on your last 30 days, your spending is on the calm side. Ask me about a category — coffee, groceries, subscriptions — and I'll break it down.",
];

// Stable hash so a session keeps seeing the same fallback line for the same
// question instead of the answer reshuffling between polls or retries.
function stablePick(seed, length) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

export function answerFor(question, sessionId) {
  const normalized = question.toLowerCase();
  for (const bucket of ANSWER_BUCKETS) {
    if (bucket.keywords.some((keyword) => normalized.includes(keyword))) {
      return bucket.reply;
    }
  }
  return FALLBACK_REPLIES[stablePick(`${sessionId}:${normalized}`, FALLBACK_REPLIES.length)];
}
