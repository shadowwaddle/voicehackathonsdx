"use client";
import { useCallback } from "react";
import type { ParentSettings } from "@/types/contract";
import { STORY_GENRES } from "@/lib/birbal/stories";
import { SESSION_MINUTES } from "@/lib/birbal/timeline";
import { useLocalStorage } from "./useLocalStorage";

export const DEFAULT_SETTINGS: ParentSettings = {
  childAge: 6,
  allowedGenres: [...STORY_GENRES],
  maxMinutes: SESSION_MINUTES,
  soundEffects: true,
  pin: "1234",
  learningLanguage: "off",
};

export function useParentSettings() {
  const [stored, save, ready] = useLocalStorage<Partial<ParentSettings>>("birbal.settings", {});
  const settings: ParentSettings = { ...DEFAULT_SETTINGS, ...stored };
  // Keep genres valid and in canonical order even if storage holds stale values.
  settings.allowedGenres = STORY_GENRES.filter((g) => settings.allowedGenres.includes(g));
  settings.maxMinutes = SESSION_MINUTES; // always 5, even if storage holds an old value

  const update = useCallback(
    (patch: Partial<ParentSettings>) => save({ ...DEFAULT_SETTINGS, ...stored, ...patch }),
    [save, stored],
  );

  return { settings, update, ready };
}
