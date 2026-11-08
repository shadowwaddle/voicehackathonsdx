"use client";
import { useCallback } from "react";
import type { SavedStory } from "@/types/contract";
import { useLocalStorage } from "./useLocalStorage";

const EMPTY: SavedStory[] = [];

export function useSavedStories() {
  const [stories, save, ready] = useLocalStorage<SavedStory[]>("birbal.stories", EMPTY);

  const addStory = useCallback(
    (story: SavedStory) => save([story, ...stories.filter((s) => s.id !== story.id)].slice(0, 30)),
    [save, stories],
  );
  const clearStories = useCallback(() => save([]), [save]);
  const getStory = useCallback((id: string) => stories.find((s) => s.id === id), [stories]);

  return { stories, addStory, clearStories, getStory, ready };
}
