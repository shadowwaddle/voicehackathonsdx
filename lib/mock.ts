import type { Caption, SavedStory } from "@/types/contract";

export const MOCK_STORIES: SavedStory[] = [
  {
    story_id: "demo-1",
    title: "The Case of the Missing Moon Cheese",
    genre: "space",
    summary: "Birbal and Captain Pip followed crumbs across three planets to find who took the moon cheese.",
    url: "#",
    created_at: "2026-11-07T18:00:00Z",
  },
  {
    story_id: "demo-2",
    title: "The Whispering Waterfall",
    genre: "jungle",
    summary: "A riddle carved in stone led to a parrot who had lost her song.",
    url: "#",
    created_at: "2026-11-06T18:00:00Z",
  },
];

export const MOCK_CAPTIONS: Caption[] = [
  { id: "1", speaker: "birbal", text: "Ah, you're just in time! Something very strange happened on the Moon last night..." },
  { id: "2", speaker: "birbal", character: "Captain Pip", text: "All the moon cheese is gone! Every last crumb!" },
  { id: "3", speaker: "child", text: "Maybe a space mouse ate it?" },
  { id: "4", speaker: "birbal", text: "A space mouse! Clever thinking. What clue should we look for first?" },
];
