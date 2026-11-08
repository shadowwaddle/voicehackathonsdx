// Birbal's opening line, different every story. Sent to the agent as the
// `opening_line` dynamic variable; the agent's first message is "{{opening_line}}".
// Varied, warm, no "you're the hero" lines.

const OPENINGS = [
  "Hello! I'm Birbal. I've got a {world} story today, and something in it doesn't add up. Want to help me figure it out?",
  "Hi there! Birbal here. A little mystery just turned up in {world}. Shall we take a look together?",
  "Well, hello, curious one! I'm Birbal. Something strange is going on in {world}. Ready to look for clues?",
  "Ah, there you are! It's Birbal. I need a sharp pair of ears for a puzzle in {world}. Can you help?",
  "Hello, my inquisitive friend! Birbal here. Today's story takes us to {world}, and there's a riddle waiting. Ready?",
  "Hey there! I'm Birbal. Something went missing in {world}, and I can't work it out alone. Will you help me think?",
  "Good to hear you! It's Birbal. I've just heard about a puzzle in {world}. Want to hear it?",
  "Hello, hello! Birbal here. Grab your thinking cap, because we're off to {world} to solve a mystery. Shall we start?",
  "Hi! I'm Birbal. Funny thing happened in {world} today, and I could use a clever helper. Ready to begin?",
  "Welcome back, puzzle-solver! It's Birbal. There's a brand-new mystery in {world}. Shall we dive in?",
  "Hello, bright spark! I'm Birbal. Something odd is happening in {world}. What do you say we find out why?",
  "Hi there, friend! Birbal here. I brought a {world} story with a tricky little puzzle inside. Want to try it?",
];

const LAST_KEY = "birbal.lastOpening";

/** Random opening for this story, never the same as last time. */
export function pickOpening(world: string): string {
  let last = -1;
  try {
    last = Number(localStorage.getItem(LAST_KEY) ?? -1);
  } catch {
    /* storage unavailable: any line is fine */
  }
  let i = Math.floor(Math.random() * OPENINGS.length);
  if (i === last) i = (i + 1) % OPENINGS.length;
  try {
    localStorage.setItem(LAST_KEY, String(i));
  } catch {
    /* ignore */
  }
  return OPENINGS[i].replace("{world}", world);
}
