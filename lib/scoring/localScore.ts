import type { ReportRequest, SessionMetrics, SessionReport } from "@/types/contract";

// TypeScript twin of score.py, for chats too short to need a sandbox or when Daytona is down.
export const MIN_SCORED_SECONDS = 30;

const STOP = new Set("about after again also been before being both could does down each from have here into just more most only other over same should some such than that their them then there these they this those through under until very were what when where which while will with would your yeah okay like want really thing things going said sure maybe think".split(" "));
const REASONING = /\b(because|so that|maybe|what if|i think|might)\b|\bif\b.*\bthen\b/;
const ASKS = new Set(["what", "why", "how", "where", "who", "can"]);
const words = (t: string) => t.toLowerCase().match(/[a-z']+/g) ?? [];
const part = (v: number, target: number) => Math.min(1, v / target);

export function localMetrics(req: Pick<ReportRequest, "transcript" | "puzzlesSolved" | "hintsUsed" | "wordsLearned">): SessionMetrics {
  let childTurns = 0, childWords = 0, allWords = 0, originalIdeas = 0, reasoningAnswers = 0, questionsAsked = 0;
  const heard = new Set<string>();
  for (const { role, text } of req.transcript) {
    const w = words(text);
    allWords += w.length;
    if (role !== "child") {
      w.forEach((x) => heard.add(x));
      continue;
    }
    childTurns += 1;
    childWords += w.length;
    const lower = text.toLowerCase().trim();
    if (w.some((x) => x.length >= 4 && !STOP.has(x) && !heard.has(x))) originalIdeas += 1;
    if (REASONING.test(lower)) reasoningAnswers += 1;
    if (lower.endsWith("?") || ASKS.has(w[0] ?? "")) questionsAsked += 1;
  }
  return {
    talkShare: allWords ? Math.round((childWords / allWords) * 1000) / 1000 : 0,
    avgAnswerWords: childTurns ? Math.round((childWords / childTurns) * 10) / 10 : 0,
    originalIdeas, reasoningAnswers, questionsAsked,
    puzzlesSolved: req.puzzlesSolved, hintsUsed: req.hintsUsed, wordsLearned: req.wordsLearned, childTurns,
  };
}

export function localScore(m: SessionMetrics): number {
  if (m.childTurns === 0) return 0;
  const hints = m.puzzlesSolved ? Math.max(0.4, 1 - (0.15 * m.hintsUsed) / m.puzzlesSolved) : 0;
  return Math.round(
    20 * part(m.talkShare, 0.5) + 15 * part(m.avgAnswerWords, 12) + 20 * part(m.originalIdeas, 5) +
    20 * part(m.reasoningAnswers, 4) + 10 * part(m.questionsAsked, 3) + 15 * part(m.puzzlesSolved, 2) * hints,
  );
}

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function length(seconds: number) {
  if (seconds < 60) return count(seconds, "second");
  const s = seconds % 60;
  return `${count(Math.floor(seconds / 60), "minute")}${s ? ` ${count(s, "second")}` : ""}`;
}

/** Plain-English record of what happened, from the numbers only. Never quotes the child. */
export function describeSession(req: Pick<ReportRequest, "durationSeconds" | "storyTitle">, m: SessionMetrics): string {
  const span = length(req.durationSeconds);
  if (m.childTurns === 0) return `"${req.storyTitle}" began and ended after ${span}, before your child said anything.`;
  const did = [
    count(m.childTurns, "reply", "replies"),
    m.originalIdeas && count(m.originalIdeas, "idea of their own", "ideas of their own"),
    m.reasoningAnswers && count(m.reasoningAnswers, "reasoned answer"),
    m.questionsAsked && count(m.questionsAsked, "question"),
    m.puzzlesSolved && count(m.puzzlesSolved, "puzzle solved", "puzzles solved"),
    m.wordsLearned && count(m.wordsLearned, "new word"),
  ].filter(Boolean).join(", ");
  const note = req.durationSeconds < MIN_SCORED_SECONDS ? ` Stories of ${MIN_SCORED_SECONDS} seconds or more get a Thinking Score.` : "";
  return `In ${span} of "${req.storyTitle}", your child gave ${did}.${note}`;
}

export function buildReport(req: ReportRequest, metrics: SessionMetrics, thinkingScore: number, deletion: SessionReport["deletion"]): SessionReport {
  const short = req.durationSeconds < MIN_SCORED_SECONDS;
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    storyTitle: req.storyTitle,
    genre: req.genre,
    durationSeconds: req.durationSeconds,
    thinkingScore: short ? 0 : thinkingScore,
    metrics,
    deletion,
    short,
    summary: describeSession(req, metrics),
  };
}
