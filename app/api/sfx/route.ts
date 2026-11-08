import { NextResponse } from "next/server";

// Short kid-safe sound effects for the agent's play_sound client tool.
export const runtime = "nodejs";
export const maxDuration = 30;

const BLOCKED =
  /\b(kill(s|ed|ing|er)?|murder(s|ed|ing|er)?|blood(y)?|gore|gun(s|shot|shots|fire)?|shoot(s|ing)?|knife|knives|stab(s|bed|bing)?|bomb(s)?|explosion(s)?|weapon(s)?|war|dead|death|die(s|d)?|dying|scream(s|ed|ing)?|torture|violen(t|ce)|horror|terror|terrifying|scary|creepy|demon(s)?|zombie(s)?|monster(s)?|ghost(s)?)\b/i;

const MAX_CACHE = 200;
const g = globalThis as unknown as { __sfxCache?: Map<string, ArrayBuffer> };
const cache = (g.__sfxCache ??= new Map());

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const audio = (bytes: ArrayBuffer) =>
  new NextResponse(bytes, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 200) : "";
  if (!description) return fail("description is required", 400);
  if (BLOCKED.test(description)) return fail("That sound isn't kid-friendly.", 400);

  const key = description.toLowerCase();
  const hit = cache.get(key);
  if (hit) return audio(hit);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return fail("ELEVENLABS_API_KEY is not set", 500);

  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text: description, duration_seconds: 3, prompt_influence: 0.5 }),
  });
  if (!res.ok) {
    console.error("sfx failed", res.status, await res.text().catch(() => ""));
    return fail("Could not make that sound right now.", 502);
  }
  const bytes = await res.arrayBuffer();
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(key, bytes);
  return audio(bytes);
}
