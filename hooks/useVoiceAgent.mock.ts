"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentStatus, Scene, StartOptions, StorybookResult, TranscriptLine, VoiceAgent,
} from "@/types/contract";

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
  const say = (role: TranscriptLine["role"], text: string) =>
    text && setTranscript((t) => [...t, { id: crypto.randomUUID(), role, text }]);

  const stop = useCallback(async () => {
    clearAll();
    setVolume(0);
    setStatus("ended");
  }, [clearAll]);

  const start = useCallback(
    async ({ genre, settings, returningCharacters }: StartOptions) => {
      clearAll();
      live.current = true;
      setTranscript([]);
      setStorybook(null);
      setElapsed(0);
      setStatus("connecting");
      console.info("[mock agent] start", { genre, settings, returningCharacters });

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
            say("birbal", step.birbal);
          });
          at += SPEAK_MS;
          if (i === SCRIPT.length - 1) {
            later(at, () => {
              setStatus("listening");
              setStorybookLoading(true);
            });
            later(at + 3000, () => {
              setStorybookLoading(false);
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

  return { status, volume, transcript, scene, elapsedSeconds, storybook, storybookLoading, error, start, stop };
}
