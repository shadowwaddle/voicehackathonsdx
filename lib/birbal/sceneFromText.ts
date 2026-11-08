import type { Mood, Scene } from "@/types/contract";

// Keyword-driven colors, so the canvas follows the story even when the agent skips set_scene.
interface SettingRule { words: RegExp; location: string; palette: string[] }

const SETTINGS: SettingRule[] = [
  { words: /\b(forests?|trees?|woods?|jungle|vines?|leaf|leaves)\b/gi, location: "forest", palette: ["#3f8f5b", "#8cc26b", "#c7dd8a", "#2f6f55"] },
  { words: /\b(oceans?|seas?|water|rivers?|lakes?|waves?|tide)\b/gi, location: "water", palette: ["#2f7fc1", "#55b6d9", "#a5e0ea", "#1f5f9e"] },
  { words: /\b(space|stars?|moons?|night|planets?|galaxy|comet)\b/gi, location: "night sky", palette: ["#2b2f77", "#4c4fa3", "#e8c15a", "#1f2559"] },
  { words: /\b(castles?|towers?|palace|kingdom)\b/gi, location: "castle", palette: ["#7a5aa8", "#a58cc8", "#a9a4b5", "#5b4a80"] },
  { words: /\b(deserts?|sun|sand|dunes?|fire|volcano)\b/gi, location: "desert", palette: ["#e8833a", "#f2a64d", "#f7cf7e", "#d0602e"] },
  { words: /\b(caves?|cavern|tunnels?)\b/gi, location: "cave", palette: ["#134e52", "#1f6f70", "#3c8f8a", "#0e3a40"] },
  { words: /\b(snow|snowy|ice|icy|frozen|frost)\b/gi, location: "snow", palette: ["#cfe6f7", "#e9f4fc", "#ffffff", "#a9d0ec"] },
];

const MOODS: { words: RegExp; mood: Mood }[] = [
  { words: /\b(happy|hooray|yay|laugh\w*|giggl\w*)\b/gi, mood: "happy" },
  { words: /\b(myster\w*|whisper\w*|shadows?|hmm+|secret\w*)\b/gi, mood: "mysterious" },
  { words: /\b(excit\w*|quick\w*|run\w*|hurry|zoom\w*)\b/gi, mood: "exciting" },
];

export interface SceneMatch {
  keyword: string;
  location?: string;
  palette?: string[];
  mood?: Mood;
}

function lastMatch<T extends { words: RegExp }>(rules: T[], text: string) {
  let best: { rule: T; word: string; index: number } | null = null;
  for (const rule of rules) {
    for (const m of text.matchAll(rule.words)) {
      if (!best || m.index >= best.index) best = { rule, word: m[0].toLowerCase(), index: m.index };
    }
  }
  return best;
}

/** The latest mention wins, since that is where the story has moved to. */
export function sceneFromText(text: string): SceneMatch | null {
  const setting = lastMatch(SETTINGS, text);
  const mood = lastMatch(MOODS, text);
  if (!setting && !mood) return null;
  const keyword = (setting && (!mood || setting.index >= mood.index) ? setting : mood)!.word;
  return {
    keyword,
    ...(setting ? { location: setting.rule.location, palette: setting.rule.palette } : {}),
    ...(mood ? { mood: mood.rule.mood } : {}),
  };
}

export function applyMatch(prev: Scene | null, match: SceneMatch): Scene {
  return {
    location: match.location ?? prev?.location ?? "story",
    mood: match.mood ?? prev?.mood ?? "calm",
    palette: match.palette ?? prev?.palette ?? [],
    characters: prev?.characters ?? [],
    speaker: prev?.speaker ?? "Birbal",
  };
}
