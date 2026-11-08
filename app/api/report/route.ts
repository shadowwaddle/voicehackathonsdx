import { NextResponse } from "next/server";
import { GENRES, type ReportRequest, type SessionReport } from "@/types/contract";
import { runScoring } from "@/lib/scoring/runScoring";
import { deleteConversation } from "@/lib/scoring/deleteConversation";

// Scores a finished story in a throwaway Daytona sandbox, deletes the ElevenLabs
// conversation, and returns only numbers. The transcript is never logged or stored here.
export const runtime = "nodejs";
export const maxDuration = 120;

const num = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);

function parse(b: Record<string, unknown> | null): ReportRequest | string {
  if (!b) return "body must be a JSON object";
  const transcript = (Array.isArray(b.transcript) ? b.transcript : [])
    .slice(0, 400)
    .map((l) => ({
      role: (l as { role?: string })?.role === "child" ? ("child" as const) : ("birbal" as const),
      text: String((l as { text?: unknown })?.text ?? "").slice(0, 600),
    }))
    .filter((l) => l.text.trim());
  const genre = String(b.genre ?? "") as ReportRequest["genre"];
  return {
    transcript,
    puzzlesSolved: num(b.puzzlesSolved, 20),
    hintsUsed: num(b.hintsUsed, 50),
    wordsLearned: num(b.wordsLearned, 20),
    conversationId: typeof b.conversationId === "string" ? b.conversationId : null,
    storyTitle: String(b.storyTitle ?? "").trim().slice(0, 120) || "Untitled story",
    genre: GENRES.includes(genre) ? genre : "fantasy",
    durationSeconds: num(b.durationSeconds, 4 * 3600),
  };
}

export async function POST(req: Request) {
  const input = parse(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

  const { transcript, puzzlesSolved, hintsUsed, wordsLearned } = input;
  // Score and delete in parallel: deletion must not wait on (or depend on) scoring.
  const [scored, conversation] = await Promise.all([
    runScoring({ transcript, puzzlesSolved, hintsUsed, wordsLearned }),
    deleteConversation(input.conversationId),
  ]);
  const deletion = { audio: conversation, transcript: conversation, sandbox: scored.sandbox, at: new Date().toISOString() };

  if (!scored.metrics || scored.thinkingScore === null) {
    return NextResponse.json({ error: "Could not score this story.", deletion }, { status: 502 });
  }
  const report: SessionReport = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    storyTitle: input.storyTitle,
    genre: input.genre,
    durationSeconds: input.durationSeconds,
    thinkingScore: scored.thinkingScore,
    metrics: scored.metrics,
    deletion,
  };
  return NextResponse.json(report);
}
