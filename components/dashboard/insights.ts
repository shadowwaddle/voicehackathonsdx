import type { Genre, SessionMetrics, SessionReport } from "@/types/contract";

// Plain-English summaries. Wording is always positive or neutral, never shaming,
// and never names the child (Birbal doesn't know or store their name).

export const METRICS: { key: keyof SessionMetrics | "thinkingScore"; label: string; format: (v: number) => string }[] = [
  { key: "thinkingScore", label: "Thinking Score", format: (v) => `${Math.round(v)}` },
  { key: "talkShare", label: "Share of the talking", format: (v) => `${Math.round(v * 100)}%` },
  { key: "avgAnswerWords", label: "Words per answer", format: (v) => v.toFixed(1) },
  { key: "originalIdeas", label: "Original ideas per story", format: (v) => v.toFixed(1).replace(/\.0$/, "") },
  { key: "reasoningAnswers", label: "Reasoning answers per story", format: (v) => v.toFixed(1).replace(/\.0$/, "") },
  { key: "questionsAsked", label: "Questions asked per story", format: (v) => v.toFixed(1).replace(/\.0$/, "") },
];

export const valueOf = (r: SessionReport, key: (typeof METRICS)[number]["key"]) =>
  key === "thinkingScore" ? r.thinkingScore : r.metrics[key];

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

/** First 3 vs last 3 stories, per metric, in plain language. */
export function compare(reports: SessionReport[]) {
  const first = reports.slice(0, 3), last = reports.slice(-3);
  return METRICS.map((m) => {
    const a = avg(first.map((r) => valueOf(r, m.key)));
    const b = avg(last.map((r) => valueOf(r, m.key)));
    const pct = a === 0 ? (b > 0 ? 100 : 0) : Math.round(((b - a) / a) * 100);
    let text: string;
    if (pct >= 5) text = `Up from ${m.format(a)} to ${m.format(b)}`;
    else if (pct <= -5) text = `A little lower than at the start (${m.format(a)} → ${m.format(b)}). Stories vary, and that's normal.`;
    else text = `Steady at about ${m.format(b)}`;
    return { ...m, from: a, to: b, pct, text };
  });
}

/** One sentence about the latest story. */
export function insight(reports: SessionReport[]): string {
  const latest = reports[reports.length - 1];
  if (!latest) return "";
  const before = reports.slice(0, -1);
  const best = (k: keyof SessionMetrics) => Math.max(0, ...before.map((r) => r.metrics[k]));
  const m = latest.metrics;
  if (before.length > 0) {
    if (m.reasoningAnswers >= 2 && m.reasoningAnswers > best("reasoningAnswers"))
      return `Your child gave ${m.reasoningAnswers} reasoning answers ("because…", "maybe…") in the last story, the most so far!`;
    if (m.originalIdeas >= 2 && m.originalIdeas > best("originalIdeas"))
      return `Your child came up with ${m.originalIdeas} ideas of their own in the last story, a new high!`;
    if (m.questionsAsked >= 2 && m.questionsAsked > best("questionsAsked"))
      return `Your child asked ${m.questionsAsked} questions in the last story, more than ever. Curiosity is growing!`;
    const prev = before[before.length - 1].thinkingScore;
    if (latest.thinkingScore > prev) return `The Thinking Score went up ${latest.thinkingScore - prev} points since the story before.`;
  }
  if (m.wordsLearned > 0) return `Your child practiced ${m.wordsLearned} new words in another language in the last story.`;
  if (m.reasoningAnswers > 0) return `Your child explained their thinking ${m.reasoningAnswers} time${m.reasoningAnswers > 1 ? "s" : ""} in the last story.`;
  return "Another mystery solved together. Every story builds the habit of thinking out loud.";
}

/** 7 sample stories over two weeks with gradual improvement, for demos. Marked demo. */
export function demoHistory(now = Date.now()): SessionReport[] {
  const rows: [string, Genre, number, number, number, number, number, number, number][] = [
    // title, genre, score, talkShare, avgWords, ideas, reasoning, questions, wordsLearned
    ["The Missing Moon Cheese", "space", 41, 0.24, 3.8, 1, 0, 1, 0],
    ["The Whispering Waterfall", "jungle", 46, 0.27, 4.6, 2, 1, 0, 0],
    ["Who Took the Crown?", "fantasy", 50, 0.3, 5.1, 2, 1, 1, 3],
    ["The Lost Lighthouse Key", "ocean", 55, 0.33, 5.9, 3, 2, 1, 3],
    ["The Clockwork Robot's Riddle", "robots", 61, 0.36, 6.8, 3, 2, 2, 4],
    ["The Secret of Dino Valley", "dinosaurs", 66, 0.39, 7.4, 4, 3, 2, 4],
    ["The Case of the Silent Bell", "detective", 72, 0.42, 8.3, 5, 4, 3, 5],
  ];
  const daysAgo = [14, 12, 10, 8, 5, 3, 1];
  return rows.map(([storyTitle, genre, thinkingScore, talkShare, avgAnswerWords, originalIdeas, reasoningAnswers, questionsAsked, wordsLearned], i) => {
    const at = new Date(now - daysAgo[i] * 86400000 + i * 3600000).toISOString();
    return {
      id: `demo-${i}`,
      createdAt: at,
      storyTitle,
      genre,
      durationSeconds: 420 + i * 45,
      thinkingScore,
      metrics: { talkShare, avgAnswerWords, originalIdeas, reasoningAnswers, questionsAsked, puzzlesSolved: i < 2 ? 1 : 2, hintsUsed: Math.max(0, 3 - Math.floor(i / 2)), wordsLearned, childTurns: 9 + i * 2 },
      deletion: { audio: "skipped", transcript: "skipped", sandbox: "failed", at },
      demo: true,
    };
  });
}
