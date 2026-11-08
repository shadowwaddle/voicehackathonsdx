"use client";
import { useCallback } from "react";
import { GENRES, type ParentSettings } from "@/types/contract";
import { useLocalStorage } from "./useLocalStorage";

export const DEFAULT_SETTINGS: ParentSettings = {
  childAge: 6,
  allowedGenres: [...GENRES],
  maxMinutes: 15,
  soundEffects: true,
  pin: "1234",
};

export function useParentSettings() {
  const [stored, save, ready] = useLocalStorage<Partial<ParentSettings>>("birbal.settings", {});
  const settings: ParentSettings = { ...DEFAULT_SETTINGS, ...stored };
  // Keep genres valid and in canonical order even if storage holds stale values.
  settings.allowedGenres = GENRES.filter((g) => settings.allowedGenres.includes(g));

  const update = useCallback(
    (patch: Partial<ParentSettings>) => save({ ...DEFAULT_SETTINGS, ...stored, ...patch }),
    [save, stored],
  );

  return { settings, update, ready };
}
