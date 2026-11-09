import type { StorybookRequest } from "@/types/contract";
import { BASE_PATH } from "./platform";

// With no server to store it, the storybook travels inside its own link. Trimmed so the
// QR code stays scannable.
type Packed = [string, string, string, string[], string[], string[], string[], [string, string][]];

const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function run(data: BufferSource, stream: CompressionStream | DecompressionStream) {
  return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(stream)).arrayBuffer());
}

export async function bookLink(b: StorybookRequest): Promise<string> {
  const packed: Packed = [
    b.title, b.genre, b.summary.slice(0, 280),
    b.scenes.slice(0, 4).map((s) => s.location),
    b.characters.slice(0, 4).map((c) => c.name),
    b.choices.slice(0, 3).map((c) => c.slice(0, 60)),
    b.puzzles_solved.slice(0, 2).map((p) => p.slice(0, 60)),
    (b.wordsLearned ?? []).slice(0, 6).map((w) => [w.word, w.translation]),
  ];
  const data = await run(new TextEncoder().encode(JSON.stringify(packed)), new CompressionStream("deflate-raw"));
  return `${window.location.origin}${BASE_PATH}/book/#${toB64(data)}`;
}

export async function readBook(hash: string): Promise<StorybookRequest> {
  const data = await run(fromB64(hash), new DecompressionStream("deflate-raw"));
  const [title, genre, summary, places, friends, choices, puzzles, words] = JSON.parse(new TextDecoder().decode(data)) as Packed;
  return {
    title, genre: genre as StorybookRequest["genre"], summary, choices, puzzles_solved: puzzles,
    characters: friends.map((name) => ({ name, color: "#f5a25d" })),
    scenes: places.map((location) => ({ location, mood: "calm" as const, palette: [], characters: [], speaker: "Birbal" })),
    wordsLearned: words.map(([word, translation]) => ({ word, translation, emoji: "", language: "es" as const })),
  };
}
