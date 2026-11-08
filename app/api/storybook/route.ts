import { NextResponse } from "next/server";
import { createStorybook, parseWordsLearned } from "@/lib/daytona";
import { saveLocalBook } from "@/lib/birbal/localBook";
import { parseStorybookRequest } from "@/lib/scene";

// Called by the client when a story ends. Always returns a storybook: Daytona first, retried
// once, then a simple page served by the app.
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseStorybookRequest({ ...body, title: body?.title || "A Birbal Story" });
  if (typeof parsed === "string") return NextResponse.json({ error: parsed }, { status: 400 });
  parsed.wordsLearned = parseWordsLearned(body?.wordsLearned);
  for (let attempt = 1; attempt <= 2 && process.env.DAYTONA_API_KEY; attempt++) {
    try {
      return NextResponse.json(await createStorybook(parsed));
    } catch (e) {
      console.error(`storybook attempt ${attempt} failed`, e);
    }
  }
  return NextResponse.json({ url: `/api/storybook/${saveLocalBook(parsed)}`, title: parsed.title });
}
