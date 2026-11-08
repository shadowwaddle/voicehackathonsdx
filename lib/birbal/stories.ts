import type { Genre } from "@/types/contract";

// The only stories on offer. Each card is a theme, never a script: lib/birbal/spark.ts
// makes every telling different.
export interface StoryCard {
  genre: Genre;
  theme: string;
}

export const STORY_CARDS: StoryCard[] = [
  { genre: "space", theme: "The Lost Moon Signal" },
  { genre: "ocean", theme: "The Singing Shipwreck" },
  { genre: "jungle", theme: "The Vanishing Waterfall" },
  { genre: "dinosaurs", theme: "The Egg That Hummed" },
  { genre: "detective", theme: "The Backward Clocks" },
  { genre: "fantasy", theme: "The Dragon Who Lost Its Spark" },
  { genre: "pirates", theme: "The Map That Redraws Itself" },
  { genre: "robots", theme: "The Robot Who Forgot Its Song" },
  { genre: "time_travel", theme: "The Extra Hour" },
  { genre: "candy_land", theme: "The Melting Gingerbread Bridge" },
];

export const STORY_GENRES: Genre[] = STORY_CARDS.map((c) => c.genre);

export const storyCard = (genre: Genre): StoryCard =>
  STORY_CARDS.find((c) => c.genre === genre) ?? STORY_CARDS[0];
