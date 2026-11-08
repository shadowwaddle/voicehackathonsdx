import { Daytona, type Sandbox } from "@daytonaio/sdk";

// Hosts storybook pages in one shared, public Daytona sandbox running a static server.
// Each storybook lives at /<story_id>/ on that server.

const PORT = 8080;
const ROOT = "/home/daytona/books";

const g = globalThis as unknown as { __bookSandbox?: Promise<Sandbox> };

async function getSandbox(): Promise<Sandbox> {
  const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY });
  const existing = process.env.STORYBOOK_SANDBOX_ID;
  const sandbox = existing
    ? await daytona.get(existing)
    : await daytona.create({ public: true, labels: { app: "birbal-storybooks" } });
  if (existing && sandbox.state !== "started") await sandbox.start();

  await sandbox.process.executeCommand(`mkdir -p ${ROOT}`);
  // Start the static server once; ignore "already running".
  const running = await sandbox.process.executeCommand(`pgrep -f "http.server ${PORT}" || true`);
  if (!running.result.trim()) {
    const sid = "books-server";
    await sandbox.process.createSession(sid).catch(() => {});
    await sandbox.process.executeSessionCommand(sid, {
      command: `cd ${ROOT} && python3 -m http.server ${PORT}`,
      runAsync: true,
    });
  }
  return sandbox;
}

export async function publishStorybook(storyId: string, html: string): Promise<string> {
  g.__bookSandbox ??= getSandbox().catch((e) => {
    g.__bookSandbox = undefined; // retry next time
    throw e;
  });
  const sandbox = await g.__bookSandbox;
  await sandbox.fs.createFolder(`${ROOT}/${storyId}`, "755");
  await sandbox.fs.uploadFile(Buffer.from(html, "utf8"), `${ROOT}/${storyId}/index.html`);
  const link = await sandbox.getPreviewLink(PORT);
  return `${link.url.replace(/\/$/, "")}/${storyId}/`;
}
