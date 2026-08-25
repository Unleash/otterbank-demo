// Canned spending assistant replies. The numbers line up with the static
// transaction list on the Home screen, so answers read as real analysis of
// the account on camera. Keyword buckets are checked in order; the first
// match wins, and anything unmatched falls back to a stable generic line.
//
// Two tones, switched by the spending-assistant-tone variant flag, each a
// complete short reply: "classic" is brief and friendly, "sassy" is brief
// with attitude (marked 😏 so the variant is identifiable on camera). Kept
// to one or two lines on purpose — long answers upstage a demo.

const ANSWER_BUCKETS = [
  {
    keywords: ['coffee', 'latte', 'cafe', 'café'],
    reply: 'Coffee: $38.60 in the last 30 days — eight Fern & Ferry runs at about $4.83 a cup.',
    sassy: '$38.60 on coffee this month. The barista is basically on your payroll. 😏',
  },
  {
    keywords: ['biggest', 'largest', 'most expensive', 'top expense'],
    reply: 'Rent is the big one: $1,450.00 to Maple Court. Groceries ($284.90) come a distant second.',
    sassy: 'Rent. $1,450.00. Shocking, I know. 😏',
  },
  {
    keywords: ['subscription', 'streaming', 'recurring'],
    reply: 'Three subscriptions, $34.97 a month: Streamly, CloudTunes and FitOtter.',
    sassy: 'Streamly, CloudTunes, FitOtter — $34.97 a month. One of those is purely aspirational, isn’t it? 😏',
  },
  {
    keywords: ['last month', 'compare', 'july', 'june', 'month before'],
    reply: "You're at $1,586.34 this month — about 12% less than July at this point.",
    sassy: 'Down 12% from July. Everything shrank except the coffee budget. Sacred, apparently. 😏',
  },
  {
    keywords: ['grocer', 'food', 'eating', 'supermarket'],
    reply: 'Groceries: $284.90 this month, about $23 under your usual. Nicely done.',
    sassy: '$284.90 on groceries — under budget. Adulting achievement unlocked. 😏',
  },
  {
    keywords: ['save', 'saving', 'budget', 'goal'],
    reply: "You're about $610 under July. Move $150 to savings and your $5,000 goal stays on track.",
    sassy: "$610 ahead, and your savings account hasn't heard about any of it. Interesting strategy. 😏",
  },
  {
    keywords: ['balance', 'how much do i have', 'account'],
    reply: 'Your balance is $4,826.40, and rent is already paid this cycle.',
    sassy: "$4,826.40. Rent's paid — try not to celebrate it all at Fern & Ferry. 😏",
  },
];

// Fallback lines for questions outside the buckets. Picked by a stable hash
// so the same question gets the same answer across taps and demos.
const FALLBACK_REPLIES = [
  'Nothing unusual in your last 30 days — spending steady, balance up since payday.',
  "Short version: you're fine. Try asking about coffee, subscriptions, or your biggest expense.",
  'All calm. Ask me about a category — coffee, groceries, subscriptions — for the details.',
];

const FALLBACK_SASSY =
  'All quiet. I know — riveting. Ask about your subscriptions if you want drama. 😏';

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

export function answerFor(question, sessionId, tone) {
  const sassy = tone === 'sassy';
  const normalized = question.toLowerCase();
  for (const bucket of ANSWER_BUCKETS) {
    if (bucket.keywords.some((keyword) => normalized.includes(keyword))) {
      return sassy ? bucket.sassy : bucket.reply;
    }
  }
  if (sassy) return FALLBACK_SASSY;
  return FALLBACK_REPLIES[stablePick(`${sessionId}:${normalized}`, FALLBACK_REPLIES.length)];
}
