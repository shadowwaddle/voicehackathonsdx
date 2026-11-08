// Builds a sample storybook.
//   npx tsx --env-file=.env scripts/test-storybook.ts   (real Daytona sandbox, prints the URL)
//   npx tsx scripts/test-storybook.ts --dry             (runs the Python locally, no Daytona)
//   add --lang=es or --lang=ja to include a "Words I learned" page
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { LearnedWord, StorybookRequest } from "../types/contract";
import { createStorybook } from "../lib/daytona";
import { STORYBOOK_SCRIPT } from "../lib/storybook-script";

const PIP = { name: "Captain Pip", color: "#f5a25d" };
const LUNA = { name: "Luna the Owl", color: "#8fb8ea" };

const sample: StorybookRequest = {
  title: "The Case of the Missing Moonbeam",
  genre: "fantasy",
  summary: "When the moonbeam vanished from the castle tower, a clever friend followed the silver footprints and worked out who had borrowed it.",
  choices: ["Followed the silver footprints", "Named the owl Luna"],
  puzzles_solved: ["Worked out that the mirror had caught the moonbeam"],
  characters: [PIP, LUNA],
  scenes: [
    { location: "The Castle Tower", mood: "mysterious", palette: ["#b79ced", "#ffd98a", "#8fc7e8"], characters: [PIP], speaker: "Captain Pip" },
    { location: "The Mirror Room", mood: "happy", palette: ["#f5b8d0", "#8fc7e8"], characters: [PIP, LUNA], speaker: "Birbal" },
  ],
};

const WORDS: Record<string, LearnedWord[]> = {
  es: [
    { word: "hola", translation: "hello", emoji: "👋", language: "es" },
    { word: "¡abre!", translation: "open!", emoji: "🚪", language: "es" },
    { word: "luna", translation: "moon", emoji: "🌙", language: "es" },
    { word: "gracias", translation: "thank you", emoji: "🙏", language: "es" },
  ],
  ja: [
    { word: "こんにちは", romanization: "konnichiwa", translation: "hello", emoji: "👋", language: "ja" },
    { word: "ひらけ", romanization: "hirake", translation: "open", emoji: "🚪", language: "ja" },
    { word: "つき", romanization: "tsuki", translation: "moon", emoji: "🌙", language: "ja" },
    { word: "ありがとう", romanization: "arigatou", translation: "thank you", emoji: "🙏", language: "ja" },
  ],
};
const lang = process.argv.find((a) => a.startsWith("--lang="))?.slice(7);
if (lang) sample.wordsLearned = WORDS[lang] ?? [];

async function main() {
  if (process.argv.includes("--dry")) {
    const dir = mkdtempSync(join(tmpdir(), "storybook-"));
    writeFileSync(join(dir, "build.py"), STORYBOOK_SCRIPT);
    writeFileSync(join(dir, "story.json"), JSON.stringify(sample));
    process.stdout.write(execFileSync("python3", [join(dir, "build.py")]));
    return console.log(join(dir, "site", "index.html"));
  }
  const began = Date.now();
  console.log(await createStorybook(sample), `${Date.now() - began}ms`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
