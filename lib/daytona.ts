import { Daytona } from "@daytonaio/sdk";
import { LEARNING_LANGUAGES, type LearnedWord, type StorybookRequest, type StorybookResult } from "@/types/contract";
import { STORYBOOK_SCRIPT } from "@/lib/storybook-script";

// Validates the words for the storybook's "Words I learned" page (max 12, one language).
export function parseWordsLearned(v: unknown): LearnedWord[] {
  const s = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : "");
  const out: LearnedWord[] = [];
  for (const raw of Array.isArray(v) ? v : []) {
    const w = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    const language = s(w.language, 4) as LearnedWord["language"];
    const word = s(w.word, 40);
    const translation = s(w.translation, 80);
    if (!word || !translation || !(language in LEARNING_LANGUAGES)) continue;
    if (out.some((o) => o.word.toLowerCase() === word.toLowerCase())) continue;
    const romanization = s(w.romanization, 60);
    out.push({ word, translation, emoji: s(w.emoji, 16) || "⭐", language, ...(romanization ? { romanization } : {}) });
  }
  return out.filter((w) => w.language === out[0]?.language).slice(0, 12);
}

// Builds a storybook in its own public Daytona sandbox and serves it on port 8000.

const PORT = 8000;
const ROOT = "/home/daytona/storybook";
const AUTO_STOP_MINUTES = 1440; // the link dies when the sandbox stops

async function timed<T>(label: string, work: () => Promise<T>): Promise<T> {
  const began = Date.now();
  try {
    const result = await work();
    console.log(`[daytona] ${label}: ${Date.now() - began}ms`);
    return result;
  } catch (e) {
    throw new Error(`Daytona step "${label}" failed after ${Date.now() - began}ms: ${e instanceof Error ? e.message : e}`);
  }
}

export async function createStorybook(req: StorybookRequest): Promise<StorybookResult> {
  if (!process.env.DAYTONA_API_KEY) throw new Error("DAYTONA_API_KEY is not set");
  const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY });
  const sandbox = await timed("create sandbox", () =>
    daytona.create({ language: "python", public: true, autoStopInterval: AUTO_STOP_MINUTES, labels: { app: "birbal-storybook" } }),
  );
  try {
    await timed("upload files", async () => {
      await sandbox.fs.createFolder(ROOT, "755");
      await sandbox.fs.uploadFile(Buffer.from(STORYBOOK_SCRIPT, "utf8"), `${ROOT}/build.py`);
      await sandbox.fs.uploadFile(Buffer.from(JSON.stringify(req), "utf8"), `${ROOT}/story.json`);
    });
    await timed("generate page", async () => {
      const run = await sandbox.process.executeCommand("python3 build.py", ROOT);
      if (run.exitCode !== 0) throw new Error(run.result);
    });
    await timed("start server", async () => {
      const session = "storybook-server";
      await sandbox.process.createSession(session);
      await sandbox.process.executeSessionCommand(session, {
        command: `cd ${ROOT}/site && python3 -m http.server ${PORT}`,
        runAsync: true,
      });
      const ready = await sandbox.process.executeCommand(
        `sh -c 'for i in 1 2 3 4 5 6 7 8 9 10; do curl -sf -o /dev/null http://localhost:${PORT}/ && exit 0; sleep 1; done; exit 1'`,
      );
      if (ready.exitCode !== 0) throw new Error("server did not start");
    });
    const link = await timed("preview link", () => sandbox.getPreviewLink(PORT));
    return { url: link.url, title: req.title };
  } catch (e) {
    await sandbox.delete().catch(() => {}); // don't leave a broken sandbox running
    throw e;
  }
}
