"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import {
  LEARNING_LANGUAGES,
  type AgentStatus, type Genre, type LearnedWord, type LearningLanguage, type StartOptions,
  type StorybookResult, type TranscriptLine, type VoiceAgent,
} from "@/types/contract";
import { parseScene, parseStorybookRequest } from "@/lib/scene";
import { STATIC_SITE } from "@/lib/birbal/platform";
import { bookLink } from "@/lib/birbal/shareBook";
import { localSoundUrl } from "@/lib/birbal/localSfx";
import { submitReport } from "@/lib/scoring/submit";
import { GENRE_INFO } from "@/lib/genres";
import { buildBirbalSession } from "@/lib/birbal/prompt";
import { makeSpark } from "@/lib/birbal/spark";
import { storyCard } from "@/lib/birbal/stories";
import { bookFromSession } from "@/lib/birbal/fallbackBook";
import { SESSION_MINUTES, STOP_GRACE_MS, STOP_UPDATE, dueCues, saidStopBirbal, shouldHardStop } from "@/lib/birbal/timeline";
import { useSceneDirector } from "@/lib/birbal/useSceneDirector";
import { useReports } from "@/hooks/useReports";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
const WORD_MS = 6000;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validates teach_word params from the agent. */
function parseWord(v: unknown, language: LearningLanguage): LearnedWord | null {
  const p = typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
  const word = str(p.word, 40);
  const translation = str(p.translation, 80);
  if (!word || !translation) return null;
  const romanization = str(p.romanization, 60);
  return { word, translation, emoji: str(p.emoji, 16) || "⭐", language, ...(romanization ? { romanization } : {}) };
}

export function useVoiceAgent(): VoiceAgent {
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const director = useSceneDirector();
  const [volume, setVolume] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [storybook, setStorybook] = useState<StorybookResult | null>(null);
  const [storybookLoading, setStorybookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [currentWord, setCurrentWord] = useState<LearnedWord | null>(null);
  const started = useRef(false);
  const sentCues = useRef(new Set<string>());
  const stopSent = useRef(false);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const book = useRef<"none" | "making" | "done">("none");
  const soundEffects = useRef(false);
  const language = useRef<LearningLanguage>("off");
  const learned = useRef<LearnedWord[]>([]); // mirrors learnedWords for tool handlers
  const wordTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // End-of-story report: kept in refs, the transcript is cleared once it has been scored.
  const conversationId = useRef<string | null>(null);
  const lines = useRef<TranscriptLine[]>([]);
  const session = useRef({ genre: "fantasy" as Genre, startedAt: 0, title: "", puzzles: 0, hints: 0 });
  const { addReport } = useReports();
  const saveReport = useRef(addReport);
  saveReport.current = addReport;

  const finishSession = useCallback(async () => {
    const s = session.current;
    const transcript = lines.current.map(({ role, text }) => ({ role, text }));
    const report = await submitReport({
      transcript,
      puzzlesSolved: s.puzzles,
      hintsUsed: s.hints,
      wordsLearned: learned.current.length,
      conversationId: conversationId.current,
      storyTitle: s.title,
      genre: s.genre,
      durationSeconds: Math.round((Date.now() - s.startedAt) / 1000),
    });
    // Processed, never kept: drop the words now that they've been scored.
    lines.current = [];
    conversationId.current = null;
    setTranscript([]);
    saveReport.current(report);
  }, []);

  // Two tries, and the server falls back to its own page if Daytona is down.
  const sendBook = useCallback(async (body: object) => {
    book.current = "making";
    setStorybookLoading(true);
    for (let attempt = 0; attempt < (STATIC_SITE ? 0 : 2); attempt++) {
      try {
        const res = await fetch("/api/storybook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) continue;
        const made = (await res.json()) as StorybookResult;
        setStorybook({ ...made, url: new URL(made.url, window.location.origin).href });
        book.current = "done";
        setStorybookLoading(false);
        return;
      } catch (e) {
        console.error(e);
      }
    }
    // No server (or it's unreachable): the browser packs the whole book into its link.
    const raw = body as { title?: string; wordsLearned?: LearnedWord[] };
    const parsed = parseStorybookRequest({ ...raw, title: raw.title || "A Birbal Story" });
    if (typeof parsed !== "string") {
      setStorybook({ url: await bookLink({ ...parsed, wordsLearned: raw.wordsLearned ?? [] }), title: parsed.title });
    }
    book.current = "done";
    setStorybookLoading(false);
  }, []);

  const conversation = useConversation({
    onConnect: (props?: { conversationId?: string }) => {
      conversationId.current = props?.conversationId ?? live.current.getId?.() ?? null;
    },
    onDisconnect: () => {
      if (!started.current) return;
      started.current = false;
      setEnded(true);
      clearTimeout(stopTimer.current);
      // However the story ended, there is always a storybook. Must run before the transcript is cleared.
      if (book.current === "none") {
        const s = session.current;
        void sendBook(bookFromSession({ title: s.title, genre: s.genre, lines: lines.current, scenes: director.scenesSeen(), words: learned.current }));
      }
      void finishSession();
    },
    onError: (e: unknown) => setError(typeof e === "string" ? e : "Birbal lost the connection."),
    onMessage: (raw) => {
      // SDK versions differ: older send { source: "ai" }, newer { role: "agent" }.
      const m = raw as { message: string; source?: string; role?: string };
      const role = m.source === "ai" || m.role === "agent" ? "birbal" : "child";
      const text = m.message.replace(/<\/?[\w-]+>/g, "").trim(); // multi-voice tags
      if (!text) return;
      const line: TranscriptLine = { id: crypto.randomUUID(), role, text };
      lines.current = [...lines.current, line];
      setTranscript((prev) => [...prev, line]);
      director.fromLine(text);
      // Backup for the prompt's code word, with a deadline in case the goodbye never comes.
      if (role === "child" && !stopSent.current && saidStopBirbal(text)) {
        stopSent.current = true;
        live.current.sendContextualUpdate(STOP_UPDATE);
        stopTimer.current = setTimeout(() => void live.current.endSession(), STOP_GRACE_MS);
      }
    },
  });
  // The hook returns a new object on most renders; effects read it through this ref.
  const live = useRef(conversation);
  useEffect(() => {
    live.current = conversation;
  });
  const connected = conversation.status === "connected";

  const stop = useCallback(async () => {
    await live.current.endSession();
  }, []);

  const start = useCallback(async ({ genre, settings, returningCharacters, learningLanguage = "off", recentTitles = [], reviewWords = [] }: StartOptions) => {
    if (!AGENT_ID) return setError("NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set.");
    setError(null);
    setEnded(false);
    setTranscript([]);
    lines.current = [];
    conversationId.current = null;
    const card = storyCard(genre);
    const spark = makeSpark(genre, recentTitles);
    const birbal = buildBirbalSession({
      card, spark, childAge: settings.childAge, learningLanguage, reviewWords, recentTitles, returningCharacters,
      allowedWorlds: settings.allowedGenres.map((g) => GENRE_INFO[g].label),
    });
    session.current = { genre, startedAt: Date.now(), title: spark.title, puzzles: 0, hints: 0 };
    director.reset(`${GENRE_INFO[genre].label} ${card.theme}`);
    setStorybook(null);
    setElapsedSeconds(0);
    sentCues.current = new Set();
    stopSent.current = false;
    clearTimeout(stopTimer.current);
    book.current = "none";
    soundEffects.current = settings.soundEffects;
    language.current = learningLanguage;
    learned.current = [];
    setLearnedWords([]);
    setCurrentWord(null);
    clearTimeout(wordTimer.current);
    const langName = learningLanguage === "off" ? "none" : LEARNING_LANGUAGES[learningLanguage].name;
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      mic.getTracks().forEach((t) => t.stop()); // only needed the permission
    } catch {
      return setError("We need the microphone so Birbal can hear you. Ask a grown-up to allow it.");
    }
    started.current = true;
    // startSession returns void; connection failures arrive through onError.
    live.current.startSession({
      agentId: AGENT_ID,
      connectionType: "websocket",
      overrides: { agent: { prompt: { prompt: birbal.prompt }, firstMessage: birbal.firstMessage } },
      dynamicVariables: {
        child_age: settings.childAge,
        genre,
        allowed_genres: settings.allowedGenres.join(","),
        max_minutes: SESSION_MINUTES,
        returning_characters: returningCharacters.join(",") || "none",
        learning_language: langName,
        learning_language_code: learningLanguage === "off" ? "none" : learningLanguage,
        opening_line: birbal.firstMessage,
      },
      clientTools: {
        set_scene: (params) => {
          const next = parseScene(params);
          if (!next) return "invalid scene: location is required";
          director.fromAgent(next);
          return "ok";
        },
        make_storybook: async (params) => {
          const mergeWords = (have: LearnedWord[], extra: unknown) => {
            const seen = new Set(have.map((w) => w.word.toLowerCase()));
            const more = (Array.isArray(extra) ? extra : [])
              .map((w) => parseWord(w, language.current))
              .filter((w): w is LearnedWord => !!w && !seen.has(w.word.toLowerCase()));
            return language.current === "off" ? [] : [...have, ...more].slice(0, 12);
          };
          const p = (params ?? {}) as { title?: unknown; puzzles_solved?: unknown; hintsUsed?: unknown };
          if (typeof p.title === "string" && p.title) session.current.title = p.title;
          session.current.puzzles = Array.isArray(p.puzzles_solved) ? p.puzzles_solved.length : 0;
          session.current.hints = typeof p.hintsUsed === "number" ? p.hintsUsed : 0;
          // Always include the words taught this session, plus any extra the agent listed.
          await sendBook({
            ...params,
            title: session.current.title,
            genre: session.current.genre,
            wordsLearned: mergeWords(learned.current, params?.wordsLearned),
          });
          return "Storybook ready";
        },
        teach_word: (params) => {
          if (language.current === "off") return "language learning is off for this story";
          const word = parseWord(params, language.current);
          if (!word) return "invalid word: word and translation are required";
          const key = word.word.toLowerCase();
          if (!learned.current.some((w) => w.word.toLowerCase() === key)) {
            learned.current = [...learned.current, word];
            setLearnedWords(learned.current);
          }
          setCurrentWord(word);
          clearTimeout(wordTimer.current);
          wordTimer.current = setTimeout(() => setCurrentWord(null), WORD_MS);
          return "ok";
        },
        play_sound: async (params) => {
          if (!soundEffects.current) return "sound effects are off";
          if (STATIC_SITE) {
            const file = localSoundUrl(params.description);
            if (file) await new Audio(file).play().catch(() => {});
            return "ok";
          }
          const res = await fetch("/api/sfx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: params.description }),
          });
          if (!res.ok) return "no sound played";
          const url = URL.createObjectURL(await res.blob());
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          await audio.play().catch(() => URL.revokeObjectURL(url));
          return "ok";
        },
      },
    });
  }, []);

  useEffect(() => () => {
    clearTimeout(wordTimer.current);
    clearTimeout(stopTimer.current);
  }, []);

  // Session clock.
  useEffect(() => {
    if (!connected) return;
    const began = Date.now();
    const t = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - began) / 1000)), 1000);
    return () => clearInterval(t);
  }, [connected]);

  // Story beats and the 5:00 hard stop. Skips the beats once the child has asked to stop.
  useEffect(() => {
    if (!connected) return;
    for (const cue of dueCues(elapsedSeconds, sentCues.current)) {
      sentCues.current.add(cue.key);
      if (!stopSent.current) live.current.sendContextualUpdate(cue.text);
    }
    if (shouldHardStop(elapsedSeconds, live.current.isSpeaking)) void stop();
  }, [elapsedSeconds, connected, stop]);

  // Orb volume.
  useEffect(() => {
    if (!connected) return;
    let raf = 0;
    let lastVolume = -1;
    const tick = () => {
      const next = Math.round(live.current.getOutputVolume() * 12) / 12;
      if (next !== lastVolume) setVolume((lastVolume = next)); // re-render only on visible change
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [connected]);

  let status: AgentStatus = "idle";
  if (connected) status = conversation.isSpeaking ? "speaking" : "listening";
  else if (error) status = "error";
  else if (ended) status = "ended";
  else if (conversation.status === "connecting") status = "connecting";

  return {
    status, volume, transcript, scene: director.scene, sceneDebug: director.debug, elapsedSeconds, storybook, storybookLoading, error,
    learnedWords, currentWord, start, stop,
  };
}
