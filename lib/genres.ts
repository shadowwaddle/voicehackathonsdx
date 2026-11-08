import type { Genre } from "@/types/contract";

export const GENRE_INFO: Record<Genre, { label: string; icon: string; bg: string; ink: string }> = {
  fantasy: { label: "Magic Kingdom", icon: "🏰", bg: "#ece3ff", ink: "#5b3fb8" },
  space: { label: "Outer Space", icon: "🚀", bg: "#dff0ff", ink: "#2c62a8" },
  jungle: { label: "Jungle Trek", icon: "🐒", bg: "#e6f5d6", ink: "#3f7a23" },
  ocean: { label: "Under the Sea", icon: "🐙", bg: "#d9f5f2", ink: "#1f7a72" },
  detective: { label: "Mystery Town", icon: "🔍", bg: "#fff0d1", ink: "#9a6410" },
  dinosaurs: { label: "Dino Valley", icon: "🦕", bg: "#e0f5e6", ink: "#2e7a4a" },
};
