// Shared contract between the app, the API routes and the ElevenLabs agent.
// Both lanes depend on this file: log every change in PROGRESS.md.

export const GENRES = [
  "fantasy",
  "space",
  "jungle",
  "ocean",
  "detective",
  "dinosaurs",
] as const;
export type Genre = (typeof GENRES)[number];

export const GENRE_INFO: Record<Genre, { label: string; emoji: string; color: string }> = {
  fantasy: { label: "Magic Kingdom", emoji: "🏰", color: "bg-violet-200" },
  space: { label: "Outer Space", emoji: "🚀", color: "bg-sky-200" },
  jungle: { label: "Jungle Trek", emoji: "🐒", color: "bg-lime-200" },
  ocean: { label: "Under the Sea", emoji: "🐙", color: "bg-cyan-200" },
  detective: { label: "Mystery Town", emoji: "🔍", color: "bg-amber-200" },
  dinosaurs: { label: "Dino Valley", emoji: "🦕", color: "bg-emerald-200" },
};

/** Parent settings, stored in localStorage on the device only. */
export interface ParentSettings {
  pin: string; // 4 digits, empty until the parent sets one
  allowedGenres: Genre[];
  childAge: number; // 4-9
  maxMinutes: number;
  soundEffects: boolean;
}

/**
 * Dynamic variables passed to the agent in startSession().
 * The agent prompt references them as {{allowed_genres}}, {{child_age}}, etc.
 * Never add anything that identifies the child (name, school, location...).
 */
export interface AgentDynamicVariables {
  allowed_genres: string; // comma-separated Genre values
  genre: Genre; // the genre the child picked for this story
  child_age: number;
  max_minutes: number;
  sound_effects: boolean;
  session_id: string; // random id; the agent passes it back to make_storybook
}

/**
 * Body the ElevenLabs server tool `make_storybook` POSTs to /api/tools/make-storybook.
 * Configure these as tool body parameters; session_id comes from the dynamic variable.
 */
export interface MakeStorybookRequest {
  session_id: string;
  title: string;
  genre: Genre;
  summary: string;
  characters: string[];
  choices: string[]; // decisions/answers the child made
  puzzles_solved: string[];
}

export type MakeStorybookResponse =
  | { ok: true; story_id: string; url: string; message: string }
  | { ok: false; error: string };

/** What the client polls at GET /api/storybook?session=<session_id>. */
export type StorybookStatus =
  | { status: "pending" }
  | { status: "ready"; storybook: Storybook };

export interface Storybook extends MakeStorybookRequest {
  story_id: string;
  url: string;
  created_at: string; // ISO
}

/** Story saved on the device for the Home screen list. */
export interface SavedStory {
  story_id: string;
  title: string;
  genre: Genre;
  summary: string;
  url: string;
  created_at: string;
}

/** One caption line in the Story screen. */
export interface Caption {
  id: string;
  speaker: "birbal" | "child";
  character?: string; // character name when Birbal is voicing someone
  text: string;
}
