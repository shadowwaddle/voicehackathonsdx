import { NextResponse } from "next/server";
import { createStorybook } from "@/lib/daytona";
import { parseStorybookRequest } from "@/lib/scene";

// Called by the client when the agent uses the make_storybook tool.
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const parsed = parseStorybookRequest(await req.json().catch(() => null));
  if (typeof parsed === "string") return NextResponse.json({ error: parsed }, { status: 400 });
  try {
    return NextResponse.json(await createStorybook(parsed));
  } catch (e) {
    console.error("storybook failed", e);
    return NextResponse.json({ error: "Could not build the storybook right now." }, { status: 502 });
  }
}
