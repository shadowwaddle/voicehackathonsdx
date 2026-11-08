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
  "The child wants to stop. Immediately give a two-sentence happy ending, call make_storybook, and say goodbye.";

export const dueCues = (elapsed: number, sent: ReadonlySet<string>) =>
  CUES.filter((c) => elapsed >= c.at && !sent.has(c.key));

/** At 5:00 end as soon as Birbal is quiet, or after a 20s grace period for the goodbye. */
export const shouldHardStop = (elapsed: number, speaking: boolean) =>
  elapsed >= SESSION_SECONDS + GOODBYE_GRACE_SECONDS || (elapsed >= SESSION_SECONDS && !speaking);

const WHOLE = /^(ok(ay)? |please )?(stop|bye|bye bye|goodbye|no more|i'?m done|i am done|i'?m tired|i am tired|i want to stop)( please| now| birbal)?$/;
const WITHIN = /\b(i want to stop|i wanna stop|i'?m done now|i am done now|i'?m tired now|stop the story|no more story|goodbye birbal|bye birbal)\b/;

/** Backup for the prompt rule. Short utterances only, so "stop the robot!" stays in the story. */
export function wantsToStop(text: string): boolean {
  const t = text.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();
  return WHOLE.test(t) || WITHIN.test(t);
}
