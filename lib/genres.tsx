import type { ReactNode } from "react";
import { GENRES, type Genre } from "@/types/contract";

const line = (d: string): ReactNode => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-[1em] w-[1em] align-[-0.125em]">
    <path d={d} />
  </svg>
);

export interface GenreInfo { label: string; icon: ReactNode; bg: string; ink: string }

const CARD_INFO: Partial<Record<Genre, GenreInfo>> = {
  fantasy: { label: "Fantasy", icon: line("M4 21V9l2 1.5L8 9v3h8V9l2 1.5L20 9v12zM10 21v-4a2 2 0 0 1 4 0v4"), bg: "#ece3ff", ink: "#5b3fb8" },
  space: { label: "Space", icon: line("M12 3c3 2 4.5 5.5 4.5 9L18 16h-2.5l-1 3h-5l-1-3H6l1.5-4C7.5 8.5 9 5 12 3zM12 9v.01"), bg: "#dff0ff", ink: "#2c62a8" },
  jungle: { label: "Jungle", icon: line("M5 19C5 10 11 5 20 4c0 9-5 15-13 15zM5 20l8-9"), bg: "#e6f5d6", ink: "#3f7a23" },
  ocean: { label: "Ocean", icon: line("M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"), bg: "#d9f5f2", ink: "#1f7a72" },
  detective: { label: "Mystery", icon: line("M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 21 21"), bg: "#fff0d1", ink: "#9a6410" },
  dinosaurs: { label: "Dinosaurs", icon: line("M12 21c-3 0-5-2-5-4.5S9.5 11 12 11s5 3 5 5.5-2 4.5-5 4.5zM7 8v.01M12 5v.01M17 8v.01"), bg: "#e0f5e6", ink: "#2e7a4a" },
  pirates: { label: "Pirates", icon: line("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z"), bg: "#e2ecf7", ink: "#2f5a8a" },
  robots: { label: "Robots", icon: line("M6 9h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM12 9V5M12 5v.01M9.5 13.5v.01M14.5 13.5v.01M9.5 16.5h5"), bg: "#e8ecf1", ink: "#4a5a70" },
  time_travel: { label: "Time Travel", icon: line("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2"), bg: "#e9e6fb", ink: "#4d45a8" },
  candy_land: { label: "Candy Land", icon: line("M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13v8M12 8a1.5 1.5 0 0 1 2-1.4"), bg: "#ffe6f4", ink: "#b23a87" },
};

// Old saved stories can reference genres that are no longer offered.
const RETIRED: GenreInfo = { label: "Story", icon: line("M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.500C17 4 14 4.500 12 6zM12 6v14.500"), bg: "#efece6", ink: "#6e5a48" };

export const GENRE_INFO = Object.fromEntries(GENRES.map((g) => [g, CARD_INFO[g] ?? RETIRED])) as Record<Genre, GenreInfo>;
