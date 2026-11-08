// The 5-minute story clock. Every story is exactly this long, whatever is stored in settings.
export const SESSION_MINUTES = 5;
export const SESSION_SECONDS = SESSION_MINUTES * 60;
const GOODBYE_GRACE_SECONDS = 20;

export interface Cue {
  key: string;
  at: number;
  text: string;
}

export const CUES: Cue[] = [
  { key: "puzzle", at: 150, text: "Time check: 2:30. Move to the puzzle now." },
  { key: "resolve", at: 225, text: "Time check: 3:45. Resolve the story now, using the child's latest idea if the puzzle is not solved." },
  { key: "ending", at: 270, text: "Time check: 4:30. Give a two-sentence ending, call make_storybook, and say goodbye." },
];

export const STOP_UPDATE =
  "The child said Stop Birbal. Immediately give a two-sentence happy ending, call make_storybook, and say goodbye.";
export const STOP_GRACE_MS = 25000; // ends the call if the goodbye never comes

export const dueCues = (elapsed: number, sent: ReadonlySet<string>) =>
  CUES.filter((c) => elapsed >= c.at && !sent.has(c.key));

/** At 5:00 end as soon as Birbal is quiet, or after a 20s grace period for the goodbye. */
export const shouldHardStop = (elapsed: number, speaking: boolean) =>
  elapsed >= SESSION_SECONDS + GOODBYE_GRACE_SECONDS || (elapsed >= SESSION_SECONDS && !speaking);

const CODE_WORD = /\bstop (bir ?bal|birble|burble|beer ?ball|bear ?ball|verbal|herbal|bribal)\b/;

/** Only "Stop Birbal" ends a story early, so coughs and grown-ups chatting can't. */
export function saidStopBirbal(text: string): boolean {
  return CODE_WORD.test(text.toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim());
}
