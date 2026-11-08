// Shared contract between Lane A (UI) and Lane B (voice/backend).
// Both lanes depend on this file: log every change in PROGRESS.md.

export const GENRES = ["fantasy", "space", "jungle", "ocean", "detective", "dinosaurs"] as const;
export type Genre = (typeof GENRES)[number];

export const MAX_MINUTES_OPTIONS = [5, 10, 15, 20, 30] as const;

/** Parent settings, stored in localStorage on the device only. */
export interface ParentSettings {
  childAge: number; // 4-9
  allowedGenres: Genre[];
  maxMinutes: number; // one of MAX_MINUTES_OPTIONS
  soundEffects: boolean;
  pin: string; // 4 digits
}

export type Mood = "calm" | "happy" | "mysterious" | "exciting" | "silly";

export interface SceneCharacter {
  name: string;
  color: string; // hex, e.g. "#ff9f6b"
}

/** Params of the `set_scene` client tool. */
export interface Scene {
  location: string; // short, e.g. "moonlit library"
  mood: Mood;
  palette: string[]; // 3-5 hex colors for the background
  characters: SceneCharacter[]; // who is in the scene (max ~4)
  speaker: string; // name of who is talking now; "Birbal" when narrating
}

/** Params of the `make_storybook` client tool; the client POSTs this to /api/storybook. */
export interface StorybookRequest {
  title: string;
  genre: Genre;
  summary: string;
  choices: string[]; // decisions/answers the child made
  puzzles_solved: string[];
  characters: SceneCharacter[];
  scenes: Scene[];
}

/** Response of POST /api/storybook. */
export interface StorybookResult {
  url: string; // public Daytona preview URL
  title: string;
}

/** A finished story saved on the device. */
export interface SavedStory {
  id: string;
  title: string;
  genre: Genre;
  url: string;
  characters: string[]; // names, passed back as returning_characters
  createdAt: string; // ISO
}

export interface TranscriptLine {
  id: string;
  role: "child" | "birbal";
  text: string;
}

export type AgentStatus = "idle" | "connecting" | "listening" | "speaking" | "ended" | "error";

export interface StartOptions {
  genre: Genre;
  settings: ParentSettings;
  returningCharacters: string[]; // empty → "none"
}

/**
 * What useVoiceAgent() returns. hooks/useVoiceAgent.mock.ts (Lane A) and
 * hooks/useVoiceAgent.ts (Lane B) both implement this.
 *
 * Dynamic variables sent to the agent: child_age, genre, allowed_genres (comma list),
 * max_minutes, returning_characters (comma list or "none").
 * Client tools: set_scene(Scene), make_storybook(StorybookRequest), play_sound({ description }).
 */
export interface VoiceAgent {
  status: AgentStatus;
  volume: number; // 0-1, agent output level
  transcript: TranscriptLine[];
  scene: Scene | null;
  elapsedSeconds: number;
  storybook: StorybookResult | null;
  storybookLoading: boolean;
  error: string | null;
  start(opts: StartOptions): Promise<void>;
  stop(): Promise<void>;
}
