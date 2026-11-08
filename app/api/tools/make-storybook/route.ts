import { NextResponse } from "next/server";
import { GENRES, type MakeStorybookRequest, type MakeStorybookResponse, type Storybook } from "@/types/contract";
import { renderStorybookHtml } from "@/lib/storybook-html";
import { publishStorybook } from "@/lib/daytona";
import { putStorybook } from "@/lib/storybook-store";

// Called by the ElevenLabs server tool `make_storybook` when a story ends.
export const runtime = "nodejs";
export const maxDuration = 60;

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strList = (v: unknown) =>
  (Array.isArray(v) ? v : typeof v === "string" ? v.split(/\n|;/) : [])
    .map((x) => str(x, 200))
    .filter(Boolean)
    .slice(0, 12);

function parse(body: Record<string, unknown>): MakeStorybookRequest | string {
  const session_id = str(body.session_id, 64);
  const title = str(body.title, 120);
  const genre = str(body.genre) as MakeStorybookRequest["genre"];
  if (!session_id) return "session_id is required";
  if (!title) return "title is required";
  return {
    session_id,
    title,
    genre: GENRES.includes(genre) ? genre : "fantasy",
    summary: str(body.summary, 2000),
    characters: strList(body.characters),
    choices: strList(body.choices),
    puzzles_solved: strList(body.puzzles_solved),
  };
}

const reply = (body: MakeStorybookResponse, status = 200) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  const secret = process.env.TOOL_SECRET;
  if (secret && req.headers.get("x-tool-secret") !== secret) {
    return reply({ ok: false, error: "unauthorized" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false, error: "invalid JSON" }, 400);
  }
  const parsed = parse(body);
  if (typeof parsed === "string") return reply({ ok: false, error: parsed }, 400);

  const story_id = crypto.randomUUID().slice(0, 8);
  const draft: Storybook = { ...parsed, story_id, url: "", created_at: new Date().toISOString() };

  try {
    const url = await publishStorybook(story_id, renderStorybookHtml(draft));
    const book = { ...draft, url };
    putStorybook(parsed.session_id, book);
    return reply({
      ok: true,
      story_id,
      url,
      message: "The storybook is ready and is showing on the child's screen now.",
    });
  } catch (e) {
    console.error("make-storybook failed", e);
    return reply({ ok: false, error: "Could not build the storybook right now." }, 502);
  }
}
