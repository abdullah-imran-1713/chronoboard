export interface Quote {
  text: string
  author: string
}

export const QUOTES: Quote[] = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'What you get by achieving your goals is not as important as what you become.', author: 'Zig Ziglar' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Everything you\'ve ever wanted is on the other side of fear.', author: 'George Addair' },
  { text: 'Dream big and dare to fail.', author: 'Norman Vaughan' },
  { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
  { text: 'Keep your face always toward the sunshine—and shadows will fall behind you.', author: 'Walt Whitman' },
  { text: 'Opportunities don\'t happen. You create them.', author: 'Chris Grosser' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'The harder you work for something, the greater you\'ll feel when you achieve it.', author: 'Unknown' },
  { text: 'Great things never come from comfort zones.', author: 'Unknown' },
  { text: 'Success doesn\'t just find you. You have to go out and get it.', author: 'Unknown' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: 'If you are working on something exciting, it will keep you motivated.', author: 'Steve Jobs' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Time is what we want most, but what we use worst.', author: 'William Penn' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
]

export function getDateKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getQuoteIndexForDate(date = new Date()): number {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  return seed % QUOTES.length
}
