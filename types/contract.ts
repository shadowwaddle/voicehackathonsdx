// Shared contract between Lane A (UI) and Lane B (voice/backend).
// Both lanes depend on this file: log every change in PROGRESS.md.

export const GENRES = [
  "fantasy", "space", "jungle", "ocean", "detective", "dinosaurs",
  "fairytale", "pirates", "robots", "superheroes", "time_travel", "arctic", "desert", "farm", "circus", "candy_land", "sky_islands", "tiny_world", "friendly_ghosts", "inventors", "sports", "music", "mythology", "wild_west", "dream_world", "museum", "train_journey", "toy_box", "garden", "volcano_island",
] as const;
export type Genre = (typeof GENRES)[number];

export const MAX_MINUTES_OPTIONS = [5, 10, 15, 20, 30] as const;

/** Language Adventure: target language the child learns a few words in ("off" = none). */
export type LearningLanguage = "off" | "es" | "fr" | "zh" | "hi" | "ja";

export const LEARNING_LANGUAGES: Record<Exclude<LearningLanguage, "off">, { name: string; native: string; romanized: boolean }> = {
  es: { name: "Spanish", native: "Español", romanized: false },
  fr: { name: "French", native: "Français", romanized: false },
  zh: { name: "Mandarin", native: "中文", romanized: true },
  hi: { name: "Hindi", native: "हिन्दी", romanized: true },
  ja: { name: "Japanese", native: "日本語", romanized: true },
};

/** A word taught during the story (params of the `teach_word` client tool + language). */
export interface LearnedWord {
  word: string; // in target script, e.g. "abre", "猫"
  romanization?: string; // for zh/hi/ja, e.g. "māo"
  translation: string; // English meaning
  emoji: string; // one kid-friendly emoji
  language: LearningLanguage;
}

/** Parent settings, stored in localStorage on the device only. */
export interface ParentSettings {
  childAge: number; // 4-10
  allowedGenres: Genre[];
  maxMinutes: number; // one of MAX_MINUTES_OPTIONS
  soundEffects: boolean;
  pin: string; // 4 digits
  learningLanguage: LearningLanguage;
  consentAt?: string; // ISO time a parent accepted the privacy flow; no stories before this
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
  wordsLearned?: LearnedWord[];
  hintsUsed?: number; // hints Birbal gave; fewer hints = higher problem-solving score
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
  learningLanguage?: LearningLanguage;
  wordsLearned?: LearnedWord[];
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
  learningLanguage?: LearningLanguage; // defaults to "off"
  recentTitles?: string[]; // last 5 stories, so the new one is clearly different
  reviewWords?: LearnedWord[]; // words from earlier stories to bring back
}

/**
 * What useVoiceAgent() returns. hooks/useVoiceAgent.mock.ts (Lane A) and
 * hooks/useVoiceAgent.ts (Lane B) both implement this.
 *
 * Dynamic variables sent to the agent: child_age, genre, allowed_genres (comma list),
 * max_minutes, returning_characters (comma list or "none"),
 * learning_language (e.g. "Spanish" or "none"), learning_language_code (e.g. "es" or "none").
 * Client tools: set_scene(Scene), make_storybook(StorybookRequest), play_sound({ description }),
 * teach_word({ word, romanization?, translation, emoji }).
 */
/** Where the current background came from, for the ?debug=1 overlay. */
export interface SceneDebug {
  source: "agent" | "keywords" | "none";
  keyword: string | null;
}

export interface VoiceAgent {
  status: AgentStatus;
  volume: number; // 0-1, agent output level
  transcript: TranscriptLine[];
  scene: Scene | null;
  elapsedSeconds: number;
  storybook: StorybookResult | null;
  storybookLoading: boolean;
  error: string | null;
  learnedWords: LearnedWord[];
  currentWord: LearnedWord | null; // set for ~6s after teach_word
  sceneDebug: SceneDebug;
  start(opts: StartOptions): Promise<void>;
  stop(): Promise<void>;
}

/** Numbers computed from one story's transcript by lib/scoring/score.py. */
export interface SessionMetrics {
  talkShare: number; // 0-1, child words / all words
  avgAnswerWords: number;
  originalIdeas: number;
  reasoningAnswers: number;
  questionsAsked: number;
  puzzlesSolved: number;
  hintsUsed: number;
  wordsLearned: number;
  childTurns: number;
}

export type DeletionStatus = "deleted" | "failed" | "skipped";

/** The only thing kept after a story: scores + deletion receipt. Stored on this device. */
export interface SessionReport {
  id: string;
  createdAt: string;
  storyTitle: string;
  genre: Genre;
  durationSeconds: number;
  thinkingScore: number; // 0-100
  metrics: SessionMetrics;
  deletion: {
    audio: DeletionStatus;
    transcript: DeletionStatus;
    sandbox: "destroyed" | "failed" | "skipped"; // skipped: too short to need one
    at: string;
  };
  demo?: boolean; // sample/mock data: nothing was recorded, nothing to delete
  short?: boolean; // under 30 seconds: listed, but no Thinking Score or trends
  summary?: string; // plain-English account of the session, from the numbers only
}

/** Body of POST /api/report. */
export interface ReportRequest {
  transcript: { role: TranscriptLine["role"]; text: string }[];
  puzzlesSolved: number;
  hintsUsed: number;
  wordsLearned: number;
  conversationId: string | null;
  storyTitle: string;
  genre: Genre;
  durationSeconds: number;
}
