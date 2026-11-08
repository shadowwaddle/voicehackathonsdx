import type { ReactNode } from "react";
import type { Genre } from "@/types/contract";

const line = (d: string): ReactNode => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-[1em] w-[1em] align-[-0.125em]">
    <path d={d} />
  </svg>
);

export interface GenreInfo { label: string; icon: ReactNode; bg: string; ink: string }

export const GENRE_INFO: Record<Genre, GenreInfo> = {
  fantasy: { label: "Magic Kingdom", icon: line("M4 21V9l2 1.5L8 9v3h8V9l2 1.5L20 9v12zM10 21v-4a2 2 0 0 1 4 0v4"), bg: "#ece3ff", ink: "#5b3fb8" },
  space: { label: "Outer Space", icon: line("M12 3c3 2 4.5 5.5 4.5 9L18 16h-2.5l-1 3h-5l-1-3H6l1.5-4C7.5 8.5 9 5 12 3zM12 9v.01"), bg: "#dff0ff", ink: "#2c62a8" },
  jungle: { label: "Jungle Trek", icon: line("M5 19C5 10 11 5 20 4c0 9-5 15-13 15zM5 20l8-9"), bg: "#e6f5d6", ink: "#3f7a23" },
  ocean: { label: "Under the Sea", icon: line("M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"), bg: "#d9f5f2", ink: "#1f7a72" },
  detective: { label: "Mystery Town", icon: line("M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 21 21"), bg: "#fff0d1", ink: "#9a6410" },
  dinosaurs: { label: "Dino Valley", icon: line("M12 21c-3 0-5-2-5-4.5S9.5 11 12 11s5 3 5 5.5-2 4.5-5 4.5zM7 8v.01M12 5v.01M17 8v.01"), bg: "#e0f5e6", ink: "#2e7a4a" },
  fairytale: { label: "Fairytale Woods", icon: line("M4 18 3 8l5 4 4-7 4 7 5-4-1 10z"), bg: "#fde6f0", ink: "#a83a72" },
  pirates: { label: "Pirate Seas", icon: line("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z"), bg: "#e2ecf7", ink: "#2f5a8a" },
  robots: { label: "Robot City", icon: line("M6 9h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM12 9V5M12 5v.01M9.5 13.5v.01M14.5 13.5v.01M9.5 16.5h5"), bg: "#e8ecf1", ink: "#4a5a70" },
  superheroes: { label: "Hero Academy", icon: line("M13 3 5 14h6l-1 7 8-11h-6z"), bg: "#ffe9dc", ink: "#b5501f" },
  time_travel: { label: "Time Machine", icon: line("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2"), bg: "#e9e6fb", ink: "#4d45a8" },
  arctic: { label: "Frozen North", icon: line("M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"), bg: "#e3f4fb", ink: "#2a7a9c" },
  desert: { label: "Golden Dunes", icon: line("M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 19c4-6 8-6 12-2 2-2 4-2 6 0"), bg: "#fcf0d6", ink: "#a06c14" },
  farm: { label: "Barnyard", icon: line("M4 21V10l8-6 8 6v11zM9 21v-7h6v7M9 14l6 7M15 14l-6 7"), bg: "#f7ead9", ink: "#955a26" },
  circus: { label: "Big Top", icon: line("M3 19 12 5l9 14zM12 5V2M9 19l3-7 3 7"), bg: "#ffe3e3", ink: "#b53a3a" },
  candy_land: { label: "Candy Land", icon: line("M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13v8M12 8a1.5 1.5 0 0 1 2-1.4"), bg: "#ffe6f4", ink: "#b23a87" },
  sky_islands: { label: "Sky Islands", icon: line("M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 9.5a4.2 4.2 0 0 1 .5 8.5z"), bg: "#e4f1ff", ink: "#3a6fb0" },
  tiny_world: { label: "Tiny World", icon: line("M4 12a8 8 0 0 1 16 0zM10 12v6a2 2 0 0 0 4 0v-6"), bg: "#eef5dc", ink: "#5f7a22" },
  friendly_ghosts: { label: "Friendly Ghosts", icon: line("M5 21V11a7 7 0 0 1 14 0v10l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2zM9.5 10.5v.01M14.5 10.5v.01"), bg: "#ecebf5", ink: "#5c5788" },
  inventors: { label: "Inventor's Lab", icon: line("M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"), bg: "#fff5cf", ink: "#8f7410" },
  sports: { label: "Big Game", icon: line("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 10c5 0 12 4 13 10M20.5 14c-5 0-12-4-13-10"), bg: "#def5ee", ink: "#1f7a62" },
  music: { label: "Music Land", icon: line("M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"), bg: "#f2e5fb", ink: "#7a3fa8" },
  mythology: { label: "Land of Legends", icon: line("M4 21h16M6 18h12M7 18V8M12 18V8M17 18V8M4 8l8-5 8 5z"), bg: "#f3efe4", ink: "#7a6a3a" },
  wild_west: { label: "Wild West", icon: line("M10 21V5a2 2 0 0 1 4 0v16M10 13H7a2 2 0 0 1-2-2V9M14 15h3a2 2 0 0 0 2-2v-2M7 21h10"), bg: "#f8e8d2", ink: "#9a5f1c" },
  dream_world: { label: "Dream World", icon: line("M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"), bg: "#e6e4f8", ink: "#4a46a0" },
  museum: { label: "Midnight Museum", icon: line("M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5"), bg: "#f1ece6", ink: "#6e5a48" },
  train_journey: { label: "Night Train", icon: line("M7 4h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2zM5 11h14M8 21l1.5-3M16 21l-1.5-3"), bg: "#e5ebf5", ink: "#3f5a88" },
  toy_box: { label: "Toy Box", icon: line("M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"), bg: "#ffeed9", ink: "#b0671c" },
  garden: { label: "Secret Garden", icon: line("M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 12v9M12 17c-3 0-5-1.5-5-4M12 19c3 0 5-1.5 5-4"), bg: "#e5f6e0", ink: "#3a7f35" },
  volcano_island: { label: "Volcano Island", icon: line("M2 20l7-11h6l7 11zM9.5 9 12 12l2.5-3M12 6V3M8 5 7 3M16 5l1-2"), bg: "#ffe5da", ink: "#b0482a" },
};
