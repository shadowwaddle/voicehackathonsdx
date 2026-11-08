import { NextResponse } from "next/server";
import { deleteConversation } from "@/lib/scoring/deleteConversation";

// POST { conversationId } → { status: "deleted" | "failed" | "skipped" }
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const id = typeof body?.conversationId === "string" ? body.conversationId : null;
  return NextResponse.json({ status: await deleteConversation(id) });
}
