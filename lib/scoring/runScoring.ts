import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Daytona } from "@daytonaio/sdk";
import type { SessionMetrics } from "@/types/contract";

export interface ScoringInput {
  transcript: { role: "child" | "birbal"; text: string }[];
  puzzlesSolved: number;
  hintsUsed: number;
  wordsLearned: number;
}

export interface ScoringResult {
  metrics: SessionMetrics | null;
  thinkingScore: number | null;
  sandbox: "destroyed" | "failed";
  error?: string;
}

const DIR = "/home/daytona/score";

// Scores one transcript in a brand-new ephemeral Daytona sandbox with all network access
// blocked, then deletes the sandbox. Logs only sizes and timings, never transcript text.
export async function runScoring(input: ScoringInput): Promise<ScoringResult> {
  if (!process.env.DAYTONA_API_KEY) {
    return { metrics: null, thinkingScore: null, sandbox: "failed", error: "DAYTONA_API_KEY is not set" };
  }
  const began = Date.now();
  const lap = (label: string) => console.log(`[report] ${label}: ${Date.now() - began}ms`);
  const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY });
  const script = await readFile(join(process.cwd(), "lib/scoring/score.py"), "utf8");

  let sandbox: Awaited<ReturnType<Daytona["create"]>> | null = null;
  let result: ScoringResult = { metrics: null, thinkingScore: null, sandbox: "failed" };
  try {
    sandbox = await daytona.create({
      language: "python",
      ephemeral: true, // deleted automatically if it ever stops
      networkBlockAll: true, // scoring needs no network
      autoStopInterval: 5,
      labels: { app: "birbal-scoring" },
    });
    lap("sandbox created");
    const payload = JSON.stringify(input);
    await sandbox.fs.createFolder(DIR, "700");
    await sandbox.fs.uploadFile(Buffer.from(script, "utf8"), `${DIR}/score.py`);
    await sandbox.fs.uploadFile(Buffer.from(payload, "utf8"), `${DIR}/input.json`);
    lap(`uploaded (${input.transcript.length} lines, ${payload.length} bytes)`);
    const run = await sandbox.process.executeCommand("python3 score.py input.json", DIR);
    if (run.exitCode !== 0) throw new Error(`score.py exited ${run.exitCode}`);
    const out = JSON.parse(run.result.trim().split("\n").pop() ?? "{}");
    result = { metrics: out.metrics, thinkingScore: out.thinkingScore, sandbox: "failed" };
    lap("scored");
  } catch (e) {
    result.error = e instanceof Error ? e.message.slice(0, 200) : "scoring failed";
    console.error(`[report] scoring failed: ${result.error}`);
  } finally {
    if (sandbox) {
      try {
        await sandbox.delete();
        result.sandbox = "destroyed";
        lap("sandbox destroyed");
      } catch (e) {
        console.error(`[report] sandbox delete failed: ${e instanceof Error ? e.message : e}`);
      }
    }
  }
  return result;
}
