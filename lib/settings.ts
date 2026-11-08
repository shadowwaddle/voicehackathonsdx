"use client";
import { GENRES, type ParentSettings, type SavedStory } from "@/types/contract";

const SETTINGS_KEY = "birbal.settings";
const STORIES_KEY = "birbal.stories";

export const DEFAULT_SETTINGS: ParentSettings = {
  pin: "",
  allowedGenres: [...GENRES],
  childAge: 6,
  maxMinutes: 10,
  soundEffects: true,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: settings just won't persist */
  }
}

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) });
export const saveSettings = (s: ParentSettings) => write(SETTINGS_KEY, s);

export const loadStories = () => read<SavedStory[]>(STORIES_KEY, []);
export function saveStory(story: SavedStory) {
  const rest = loadStories().filter((s) => s.story_id !== story.story_id);
  write(STORIES_KEY, [story, ...rest].slice(0, 50));
}
