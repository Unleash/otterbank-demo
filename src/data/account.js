// Static mock data for the demo. No real banking logic anywhere: the
// balance, transactions and contacts are fixed, and the assistant's canned
// answers in server/data/assistant.js quote the same numbers.

// The demo panel's "signed in" users. Their id goes into the Unleash
// context as userId, so switching users is how stickiness demos show an
// assignment following a person instead of a browser session. Mel is the
// default; the others exist to be switched to.
//
// The ids are hash-picked on purpose: with three evenly weighted
// savings-boost variants, mel and maya land in one bucket and jonas.feld
// and priya in the two others, so the four users always cover all three
// pitches regardless of the variants' order or exact weights. Renaming an
// id reshuffles that spread.
export const demoUsers = [
  { id: 'mel', firstName: 'Mel', fullName: 'Mel Rivers' },
  { id: 'maya', firstName: 'Maya', fullName: 'Maya Brook' },
  { id: 'jonas.feld', firstName: 'Jonas', fullName: 'Jonas Feld' },
  { id: 'priya', firstName: 'Priya', fullName: 'Priya Nair' },
];

export const user = demoUsers[0];

export const card = {
  number: '•••• •••• •••• 4021',
  expires: '09/29',
};

export const account = {
  name: 'Everyday checking',
  number: '•• 4021',
  balance: '$4,826.40',
  delta: '+$412 this month',
};

export const contacts = [
  { id: 'maya', name: 'Maya', initials: 'MA' },
  { id: 'jonas', name: 'Jonas', initials: 'JO' },
  { id: 'priya', name: 'Priya', initials: 'PR' },
  { id: 'sam', name: 'Sam', initials: 'SA' },
];

export const transactions = [
  { id: 't1', name: 'Fern & Ferry Coffee', detail: 'Today, 08:12', amount: '-$4.80', icon: '☕' },
  { id: 't2', name: 'GreenMart', detail: 'Yesterday, 17:36', amount: '-$62.35', icon: '🛒' },
  { id: 't3', name: 'Meridian Labs · Salary', detail: '1 Aug', amount: '+$3,850.00', icon: '💼' },
  { id: 't4', name: 'Streamly', detail: '31 Jul', amount: '-$11.99', icon: '🎬' },
  { id: 't5', name: 'City Transit', detail: '30 Jul', amount: '-$28.00', icon: '🚇' },
  { id: 't6', name: 'Fern & Ferry Coffee', detail: '29 Jul', amount: '-$5.20', icon: '☕' },
  { id: 't7', name: 'Maple Court · Rent', detail: '28 Jul', amount: '-$1,450.00', icon: '🏠' },
  { id: 't8', name: 'Riverside Swim Club', detail: '27 Jul', amount: '-$25.00', icon: '🦦' },
];

// The subscription amounts match the assistant's canned subscriptions answer.
export const upcomingPayments = [
  { id: 'p1', name: 'CloudTunes', detail: 'Due 5 Aug · Subscription', amount: '$9.99', icon: '🎧' },
  { id: 'p2', name: 'FitOtter', detail: 'Due 12 Aug · Subscription', amount: '$12.99', icon: '💪' },
  { id: 'p3', name: 'Maple Court · Rent', detail: 'Due 28 Aug · Autopay', amount: '$1,450.00', icon: '🏠' },
  { id: 'p4', name: 'Streamly', detail: 'Due 31 Aug · Subscription', amount: '$11.99', icon: '🎬' },
];

// Questions the assistant has polished canned answers for; shown as chips.
export const suggestedQuestions = [
  'How much did I spend on coffee?',
  "What's my biggest expense?",
  'How do my subscriptions look?',
  'How does this month compare to July?',
];
