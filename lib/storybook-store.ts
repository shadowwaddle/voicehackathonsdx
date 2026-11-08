import type { Storybook } from "@/types/contract";

// In-memory store keyed by session_id. Fine for one dev server in a hackathon;
// it resets when the server restarts.
const g = globalThis as unknown as { __storybooks?: Map<string, Storybook> };
const store = (g.__storybooks ??= new Map());

export const putStorybook = (sessionId: string, book: Storybook) => store.set(sessionId, book);
export const getStorybook = (sessionId: string) => store.get(sessionId);
