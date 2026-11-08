import { GENRES, type Mood, type Scene, type SceneCharacter, type StorybookRequest } from "@/types/contract";

// Validates what the agent sends. Colors end up inside SVG, so only hex passes.
const HEX = /^#[0-9a-f]{6}$/i;
const MOODS: Mood[] = ["calm", "happy", "mysterious", "exciting", "silly"];

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const items = (v: unknown): unknown[] => (Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : []);
const textList = (v: unknown) => items(v).map((x) => text(x, 200)).filter(Boolean).slice(0, 12);
const record = (v: unknown) => (typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null);

function parseCharacter(v: unknown): SceneCharacter | null {
  const c = record(v);
  const name = text(c ? c.name : v, 40);
  if (!name) return null;
  const color = text(c?.color, 7);
  return { name, color: HEX.test(color) ? color : "#f5a25d" };
}

const characters = (v: unknown) => items(v).map(parseCharacter).filter((c) => c !== null).slice(0, 4);

export function parseScene(v: unknown): Scene | null {
  const s = record(v);
  const location = text(s?.location, 120);
  if (!s || !location) return null;
  const mood = text(s.mood, 20) as Mood;
  return {
    location,
    mood: MOODS.includes(mood) ? mood : "calm",
    palette: items(s.palette).map((c) => text(c, 7)).filter((c) => HEX.test(c)).slice(0, 5),
    characters: characters(s.characters),
    speaker: text(s.speaker, 40) || "Birbal",
  };
}

export function parseStorybookRequest(v: unknown): StorybookRequest | string {
  const b = record(v);
  if (!b) return "body must be a JSON object";
  const title = text(b.title, 120);
  if (!title) return "title is required";
  const genre = text(b.genre, 20) as StorybookRequest["genre"];
  return {
    title,
    genre: GENRES.includes(genre) ? genre : "fantasy",
    summary: text(b.summary, 2000),
    choices: textList(b.choices),
    puzzles_solved: textList(b.puzzles_solved),
    characters: characters(b.characters),
    scenes: items(b.scenes).map(parseScene).filter((s) => s !== null).slice(0, 8),
  };
}
