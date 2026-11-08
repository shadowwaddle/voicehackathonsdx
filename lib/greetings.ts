// Birbal's opening line, different every story, always announcing the title.

const OPENINGS = [
  "Hello! I'm Birbal, and our story today is called {title}. It starts in {world}, and something there doesn't add up. Want to help me figure it out?",
  "Hi there! Birbal here. Today's story is {title}, and a little mystery just turned up in {world}. Shall we take a look?",
  "Well, hello! I'm Birbal. Our story is called {title}, and something strange is going on in {world}. Ready to look for clues?",
  "Ah, there you are! It's Birbal. Today we have {title}, a puzzle from {world}. Can you lend me your ears?",
  "Hello, friend! Birbal here. This one is called {title}, and it takes us to {world}. Ready?",
  "Hey there! I'm Birbal. The story is {title}, and I can't work it out alone. Will you come to {world} with me?",
  "Good to hear you! It's Birbal. Our story today is {title}, straight from {world}. Want to hear it?",
  "Hello, hello! Birbal here. Grab your thinking cap, because {title} is waiting in {world}. Shall we start?",
];

const LAST_KEY = "birbal.lastOpening";

/** Random opening for this story, never the same as last time. */
export function pickOpening(world: string, title: string): string {
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
  return OPENINGS[i].replace("{world}", world).replace("{title}", title);
}
