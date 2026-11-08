import { NextResponse } from "next/server";
import type { StorybookStatus } from "@/types/contract";
import { getStorybook } from "@/lib/storybook-store";

// Polled by the client after a story ends: GET /api/storybook?session=<session_id>
export async function GET(req: Request) {
  const session = new URL(req.url).searchParams.get("session") ?? "";
  const book = getStorybook(session);
  const body: StorybookStatus = book ? { status: "ready", storybook: book } : { status: "pending" };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
