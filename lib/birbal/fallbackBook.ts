import type { Genre, LearnedWord, Scene, StorybookRequest, TranscriptLine } from "@/types/contract";

const clean = (t: string) => t.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();

/** A storybook built from whatever happened, for when the agent never called make_storybook. */
export function bookFromSession(s: {
  title: string;
  genre: Genre;
  lines: Pick<TranscriptLine, "role" | "text">[];
  scenes: Scene[];
  words: LearnedWord[];
}): StorybookRequest & { wordsLearned: LearnedWord[] } {
  const birbal = s.lines.filter((l) => l.role === "birbal").map((l) => clean(l.text)).filter(Boolean);
  const child = s.lines.filter((l) => l.role === "child").map((l) => clean(l.text)).filter((t) => t.split(" ").length >= 2);
  const told = birbal.slice(1, 4).join(" ").slice(0, 900);
  const characters = [...new Map(s.scenes.flatMap((x) => x.characters).map((c) => [c.name, c])).values()].slice(0, 6);
  return {
    title: s.title,
    genre: s.genre,
    summary: told || "You and Birbal opened a brand-new adventure together. The rest of this story is still waiting for you.",
    choices: child.slice(0, 8).map((t) => t.slice(0, 90)),
    puzzles_solved: [],
    characters,
    scenes: s.scenes.slice(0, 8),
    wordsLearned: s.words,
  };
}
