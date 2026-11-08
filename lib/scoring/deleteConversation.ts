import type { DeletionStatus } from "@/types/contract";

// Deletes an ElevenLabs Agents conversation. One call removes both its audio and its
// transcript: DELETE /v1/convai/conversations/{id}.
const API = "https://api.elevenlabs.io/v1/convai/conversations";
const BACKOFF_MS = [1000, 2000, 4000, 8000]; // the conversation may still be processing right after the call

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function deleteConversation(conversationId: string | null | undefined): Promise<DeletionStatus> {
  if (!conversationId) return "skipped";
  if (!/^[\w-]{1,128}$/.test(conversationId)) return "failed";
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    console.error("[delete-conversation] ELEVENLABS_API_KEY is not set");
    return "failed";
  }
  const began = Date.now();
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    try {
      const res = await fetch(`${API}/${encodeURIComponent(conversationId)}`, {
        method: "DELETE",
        headers: { "xi-api-key": key },
      });
      if (res.ok) {
        console.log(`[delete-conversation] deleted after ${attempt + 1} tries, ${Date.now() - began}ms`);
        return "deleted";
      }
      if (res.status === 401 || res.status === 403) {
        console.error(`[delete-conversation] not allowed (${res.status}); check the key's permissions`);
        return "failed";
      }
      console.warn(`[delete-conversation] try ${attempt + 1}: HTTP ${res.status}`);
    } catch (e) {
      console.warn(`[delete-conversation] try ${attempt + 1}: ${e instanceof Error ? e.message : e}`);
    }
    if (attempt < BACKOFF_MS.length) await sleep(BACKOFF_MS[attempt]);
  }
  return "failed";
}
