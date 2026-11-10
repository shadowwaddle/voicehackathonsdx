"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentStatus, Genre, LearnedWord, LearningLanguage, ReportRequest, Scene, StartOptions,
  StorybookResult, TranscriptLine, VoiceAgent,
} from "@/types/contract";
import { submitReport } from "@/lib/scoring/submit";
import { GENRE_INFO } from "@/lib/genres";
import { bookFromSession } from "@/lib/birbal/fallbackBook";
import { DEMO_BIRBAL, DEMO_CHILD, DEMO_OPENER, DEMO_TITLE } from "@/lib/birbal/demoAudio";
import { BASE_PATH, STATIC_SITE } from "@/lib/birbal/platform";
import { bookLink } from "@/lib/birbal/shareBook";
import { parseStorybookRequest } from "@/lib/scene";
import { SESSION_SECONDS } from "@/lib/birbal/timeline";
import { useSceneDirector } from "@/lib/birbal/useSceneDirector";
import { useReports } from "@/hooks/useReports";

// Demo voice agent: plays a prerecorded story, so it never uses ElevenLabs. Also used to build the UI.
// Same interface as hooks/useVoiceAgent.ts (Lane B): swap the import to go live.

const PIP = { name: "Pip", color: "#f5a25d" };
const LUNA = { name: "Luna", color: "#8fb8ea" };
const MOSS = { name: "Moss", color: "#86c5a0" };

type Step = { scene?: Scene; birbal: string; child: string };

// Keywords here repaint the canvas; step 4 shows an agent set_scene outranking them.
const SCRIPT: Step[] = [
  { birbal: "You step into a whispering forest, and the tall trees lean in close. Can you hear something?", child: "I hear a river!" },
  { birbal: "Follow the river! Cold water rushes over the stones. What do you see on the bank?", child: "A map under the moon!" },
  { birbal: "Night falls, and the moon and stars light the way. Where should we go?", child: "Into that dark cave!" },
  { birbal: "The cave is quiet. Something whispers from the shadows. Do you hear it?", child: "Let's be brave!" },
  {
    scene: { location: "the old oak tree", mood: "exciting", palette: ["#86c5a0", "#fae3a0", "#f5a25d", "#c6e3dc"], characters: [PIP, LUNA, MOSS], speaker: "Moss" },
    birbal: "It was me! I only wanted to share them at my party, far across the desert sand. Can you help me say sorry?",
    child: "You can bake new buns together!",
  },
  { birbal: "Snow begins to fall on the path home. What will you carry?", child: "The map!" },
  { birbal: "Hooray! The mystery is solved and everyone is laughing. I'm making your storybook right now.", child: "" },
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
  const director = useSceneDirector();
  const { scenesSeen } = director;
  const bookMade = useRef(false);
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

  // Same end-of-story flow as the real hook; reports are marked as demo data.
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
    const report = { ...(await submitReport(req)), demo: true };
    lines.current = [];
    setTranscript([]);
    saveReport.current(report);
  }, []);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const live = useRef(false);

  const player = useRef<HTMLAudioElement | null>(null);
  const play = (file: string) => {
    const p = player.current;
    if (!p) return;
    p.src = `${BASE_PATH}/demo/${file}`;
    void p.play().catch(() => {});
  };

  // The storybook travels inside its link on the static site; otherwise the app server makes it.
  const makeBook = useCallback(async () => {
    const s = session.current;
    const body = bookFromSession({ title: s.title, genre: s.genre, lines: lines.current, scenes: scenesSeen(), words: [] });
    if (STATIC_SITE) {
      const parsed = parseStorybookRequest(body);
      if (typeof parsed !== "string") setStorybook({ url: await bookLink({ ...parsed, wordsLearned: [] }), title: s.title });
      return;
    }
    const res = await fetch("/api/storybook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const made = (await res.json()) as StorybookResult;
    setStorybook({ ...made, url: new URL(made.url, window.location.origin).href });
  }, [scenesSeen]);

  const clearAll = useCallback(() => {
    player.current?.pause();
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
    director.fromLine(text);
  };

  const stop = useCallback(async () => {
    clearAll();
    setVolume(0);
    setStatus("ended");
    // Ended early: same guaranteed storybook as the real hook.
    if (!bookMade.current) {
      bookMade.current = true;
      setStorybookLoading(true);
      try {
        await makeBook();
      } finally {
        setStorybookLoading(false);
      }
    }
    void finishSession();
  }, [clearAll, finishSession, makeBook]);

  const start = useCallback(
    async ({ genre, settings, returningCharacters, learningLanguage = "off" }: StartOptions) => {
      clearAll();
      live.current = true;
      setTranscript([]);
      lines.current = [];
      setStorybook(null);
      const title = DEMO_TITLE;
      // Unlock audio inside the tap that started the story (iPhones need this).
      player.current ??= new Audio();
      player.current.src = `${BASE_PATH}/demo/${DEMO_BIRBAL[0].file}`;
      void player.current.play().then(() => player.current?.pause()).catch(() => {});
      session.current = { genre, startedAt: Date.now(), title, puzzles: 0, words: 0, reported: false };
      bookMade.current = false;
      director.reset(GENRE_INFO[genre].label);
      setElapsed(0);
      setLearnedWords([]);
      setCurrentWord(null);
      setStatus("connecting");
      console.info("[mock agent] start", { genre, settings, returningCharacters, learningLanguage });
      const words = learningLanguage === "off" ? [] : MOCK_WORDS[learningLanguage];

      const limit = SESSION_SECONDS;
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
            if (step.scene) director.fromAgent(step.scene);
            setStatus("speaking");
            say("birbal", i === 0 ? `${DEMO_OPENER} ${step.birbal}` : step.birbal);
            if (DEMO_BIRBAL[i]) play(DEMO_BIRBAL[i].file);
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
          at += (DEMO_BIRBAL[i]?.ms ?? SPEAK_MS) + 400;
          if (i === SCRIPT.length - 1) {
            later(at, () => {
              setStatus("listening");
              setStorybookLoading(true);
            });
            later(at + 1500, async () => {
              bookMade.current = true;
              session.current.title = title;
              session.current.puzzles = 1;
              try {
                await makeBook();
              } finally {
                setStorybookLoading(false);
              }
              void stop();
            });
            return;
          }
          later(at, () => setStatus("listening"));
          later(at + 700, () => {
            say("child", step.child);
            if (DEMO_CHILD[i]) play(DEMO_CHILD[i].file);
          });
          at += Math.max(LISTEN_MS, (DEMO_CHILD[i]?.ms ?? 0) + 1500);
        });
      });
    },
    // `later`/`say` only touch refs and setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearAll, stop, makeBook],
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
    status, volume, transcript, scene: director.scene, sceneDebug: director.debug, elapsedSeconds, storybook, storybookLoading, error,
    learnedWords, currentWord, start, stop,
  };
}
