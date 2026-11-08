"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentStatus, Genre, LearnedWord, LearningLanguage, ReportRequest, Scene, SessionReport, StartOptions,
  StorybookResult, TranscriptLine, VoiceAgent,
} from "@/types/contract";
import { submitReport } from "@/lib/scoring/submit";
import { pickOpening } from "@/lib/greetings";
import { GENRE_INFO } from "@/lib/genres";
import { useReports } from "@/hooks/useReports";

// Fake voice agent for building the UI without ElevenLabs.
// Same interface as hooks/useVoiceAgent.ts (Lane B): swap the import to go live.

const PIP = { name: "Pip", color: "#f5a25d" };
const LUNA = { name: "Luna", color: "#8fb8ea" };
const MOSS = { name: "Moss", color: "#86c5a0" };

type Step = { scene: Scene; birbal: string; child: string };

const SCRIPT: Step[] = [
  {
    scene: { location: "a sleepy village square", mood: "calm", palette: ["#f7d3b0", "#fae3a0", "#c6e3dc"], characters: [PIP], speaker: "Birbal" },
    birbal: "Hello, my clever friend! Something very odd happened last night. Are you ready to help me?",
    child: "Yes! What happened?",
  },
  {
    scene: { location: "the bakery", mood: "silly", palette: ["#f2c2c8", "#f7d3b0", "#fae3a0"], characters: [PIP, LUNA], speaker: "Pip" },
    birbal: "All the honey buns are gone! Not a single crumb left! What do you think happened?",
    child: "Maybe someone ate them in the night?",
  },
  {
    scene: { location: "a moonlit path", mood: "mysterious", palette: ["#6c6aa8", "#8fb8ea", "#c4b5e8", "#4f5d8a"], characters: [PIP, LUNA], speaker: "Luna" },
    birbal: "Look, tiny sticky footprints! They go toward the old oak tree. Should we follow them?",
    child: "Let's follow them!",
  },
  {
    scene: { location: "the old oak tree", mood: "exciting", palette: ["#86c5a0", "#fae3a0", "#f5a25d", "#c6e3dc"], characters: [PIP, LUNA, MOSS], speaker: "Moss" },
    birbal: "It was me! I only wanted to share them at my birthday party. Can you help me say sorry?",
    child: "You can bake new buns together!",
  },
  {
    scene: { location: "a birthday party", mood: "happy", palette: ["#fae3a0", "#f2c2c8", "#c6e3dc", "#d6cbf0"], characters: [PIP, LUNA, MOSS], speaker: "Birbal" },
    birbal: "What a wonderful idea! Mystery solved. I'm making your storybook right now.",
    child: "",
  },
];

type MockWord = Omit<LearnedWord, "language">;
const MOCK_WORDS: Record<Exclude<LearningLanguage, "off">, MockWord[]> = {
  es: [
    { word: "hola", translation: "hello", emoji: "👋" },
    { word: "gato", translation: "cat", emoji: "🐱" },
    { word: "¡abre!", translation: "open!", emoji: "🚪" },
    { word: "gracias", translation: "thank you", emoji: "🙏" },
  ],
  fr: [
    { word: "bonjour", translation: "hello", emoji: "👋" },
    { word: "chat", translation: "cat", emoji: "🐱" },
    { word: "ouvre !", translation: "open!", emoji: "🚪" },
    { word: "merci", translation: "thank you", emoji: "🙏" },
  ],
  zh: [
    { word: "你好", romanization: "nǐ hǎo", translation: "hello", emoji: "👋" },
    { word: "猫", romanization: "māo", translation: "cat", emoji: "🐱" },
    { word: "开", romanization: "kāi", translation: "open", emoji: "🚪" },
    { word: "谢谢", romanization: "xièxie", translation: "thank you", emoji: "🙏" },
  ],
  hi: [
    { word: "नमस्ते", romanization: "namaste", translation: "hello", emoji: "👋" },
    { word: "बिल्ली", romanization: "billi", translation: "cat", emoji: "🐱" },
    { word: "खोलो", romanization: "kholo", translation: "open", emoji: "🚪" },
    { word: "धन्यवाद", romanization: "dhanyavaad", translation: "thank you", emoji: "🙏" },
  ],
  ja: [
    { word: "こんにちは", romanization: "konnichiwa", translation: "hello", emoji: "👋" },
    { word: "ねこ", romanization: "neko", translation: "cat", emoji: "🐱" },
    { word: "ひらけ", romanization: "hirake", translation: "open", emoji: "🚪" },
    { word: "ありがとう", romanization: "arigatou", translation: "thank you", emoji: "🙏" },
  ],
};
const WORD_MS = 5000;

const SPEAK_MS = 5000;
const LISTEN_MS = 2600;

export function useVoiceAgent(): VoiceAgent {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [scene, setScene] = useState<Scene | null>(null);
  const [elapsedSeconds, setElapsed] = useState(0);
  const [storybook, setStorybook] = useState<StorybookResult | null>(null);
  const [storybookLoading, setStorybookLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [currentWord, setCurrentWord] = useState<LearnedWord | null>(null);

  const lines = useRef<TranscriptLine[]>([]);
  const session = useRef({ genre: "fantasy" as Genre, startedAt: 0, title: "", puzzles: 0, words: 0, reported: true });
  const { addReport } = useReports();
  const saveReport = useRef(addReport);
  saveReport.current = addReport;

  // Same end-of-story flow as the real hook. Without a Daytona key the server can't
  // score, so fall back to a local report clearly marked as demo data.
  const finishSession = useCallback(async () => {
    const s = session.current;
    if (s.reported) return;
    s.reported = true;
    const req: ReportRequest = {
      transcript: lines.current.map(({ role, text }) => ({ role, text })),
      puzzlesSolved: s.puzzles,
      hintsUsed: 1,
      wordsLearned: s.words,
      conversationId: null, // nothing recorded by ElevenLabs in mock mode
      storyTitle: s.title || "A mock mystery",
      genre: s.genre,
      durationSeconds: Math.round((Date.now() - s.startedAt) / 1000),
    };
    const report = (await submitReport(req)) ?? demoReport(req);
    lines.current = [];
    setTranscript([]);
    if (report) saveReport.current(report);
  }, []);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const live = useRef(false);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
    live.current = false;
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  const say = (role: TranscriptLine["role"], text: string) => {
    if (!text) return;
    const line: TranscriptLine = { id: crypto.randomUUID(), role, text };
    lines.current = [...lines.current, line];
    setTranscript((t) => [...t, line]);
  };

  const stop = useCallback(async () => {
    clearAll();
    setVolume(0);
    setStatus("ended");
    void finishSession();
  }, [clearAll, finishSession]);

  const start = useCallback(
    async ({ genre, settings, returningCharacters, learningLanguage = "off" }: StartOptions) => {
      clearAll();
      live.current = true;
      setTranscript([]);
      lines.current = [];
      session.current = { genre, startedAt: Date.now(), title: "", puzzles: 0, words: 0, reported: false };
      setStorybook(null);
      setElapsed(0);
      setLearnedWords([]);
      setCurrentWord(null);
      setStatus("connecting");
      console.info("[mock agent] start", { genre, settings, returningCharacters, learningLanguage });
      const words = learningLanguage === "off" ? [] : MOCK_WORDS[learningLanguage];

      const limit = settings.maxMinutes * 60;
      later(900, () => {
        let seconds = 0;
        tick.current = setInterval(() => {
          seconds += 1;
          setElapsed(seconds);
          if (seconds >= limit) void stop();
        }, 1000);

        let at = 0;
        SCRIPT.forEach((step, i) => {
          later(at, () => {
            setScene(step.scene);
            setStatus("speaking");
            say("birbal", i === 0 ? pickOpening(GENRE_INFO[genre]?.label ?? String(genre)) : step.birbal);
          });
          // One new word in each of the first four scenes.
          const w = words[i];
          if (w) {
            const word: LearnedWord = { ...w, language: learningLanguage };
            later(at + 1500, () => {
              setCurrentWord(word);
              setLearnedWords((prev) => [...prev, word]);
              session.current.words += 1;
            });
            later(at + 1500 + WORD_MS, () => setCurrentWord((c) => (c === word ? null : c)));
          }
          at += SPEAK_MS;
          if (i === SCRIPT.length - 1) {
            later(at, () => {
              setStatus("listening");
              setStorybookLoading(true);
            });
            later(at + 3000, () => {
              setStorybookLoading(false);
              session.current.title = "The Case of the Missing Honey Buns";
              session.current.puzzles = 1;
              setStorybook({ url: "https://example.com/birbal-storybook", title: "The Case of the Missing Honey Buns" });
              void stop();
            });
            return;
          }
          later(at, () => setStatus("listening"));
          later(at + LISTEN_MS / 2, () => say("child", step.child));
          at += LISTEN_MS;
        });
      });
    },
    // `later`/`say` only touch refs and setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearAll, stop],
  );

  // Fake output volume while "speaking".
  useEffect(() => {
    if (status !== "speaking") {
      setVolume(0);
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      const v = 0.35 + 0.3 * Math.sin(now / 90) + 0.25 * Math.sin(now / 37);
      setVolume(Math.max(0, Math.min(1, v)));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  useEffect(() => clearAll, [clearAll]);

  return {
    status, volume, transcript, scene, elapsedSeconds, storybook, storybookLoading, error,
    learnedWords, currentWord, start, stop,
  };
}

/** Local stand-in report for mock mode when /api/report is unavailable. */
function demoReport(req: ReportRequest): SessionReport | null {
  const child = req.transcript.filter((l) => l.role === "child");
  if (child.length === 0) return null;
  const count = (t: string) => t.split(/\s+/).filter(Boolean).length;
  const childWords = child.reduce((n, l) => n + count(l.text), 0);
  const allWords = req.transcript.reduce((n, l) => n + count(l.text), 0);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    storyTitle: req.storyTitle,
    genre: req.genre,
    durationSeconds: req.durationSeconds,
    thinkingScore: 58,
    metrics: {
      talkShare: Math.round((childWords / Math.max(1, allWords)) * 1000) / 1000,
      avgAnswerWords: Math.round((childWords / child.length) * 10) / 10,
      originalIdeas: 2,
      reasoningAnswers: 1,
      questionsAsked: 1,
      puzzlesSolved: req.puzzlesSolved,
      hintsUsed: req.hintsUsed,
      wordsLearned: req.wordsLearned,
      childTurns: child.length,
    },
    deletion: { audio: "skipped", transcript: "skipped", sandbox: "failed", at: new Date().toISOString() },
    demo: true,
  };
}
