"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import type { AgentStatus, Scene, StartOptions, StorybookResult, TranscriptLine, VoiceAgent } from "@/types/contract";
import { parseScene } from "@/lib/scene";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export function useVoiceAgent(): VoiceAgent {
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [scene, setScene] = useState<Scene | null>(null);
  const [volume, setVolume] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [maxSeconds, setMaxSeconds] = useState<number | null>(null);
  const [storybook, setStorybook] = useState<StorybookResult | null>(null);
  const [storybookLoading, setStorybookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const started = useRef(false);
  const nudged = useRef(false);
  const soundEffects = useRef(false);

  const conversation = useConversation({
    onDisconnect: () => {
      if (!started.current) return;
      started.current = false;
      setEnded(true);
    },
    onError: (e: unknown) => setError(typeof e === "string" ? e : "Birbal lost the connection."),
    onMessage: (raw) => {
      // SDK versions differ: older send { source: "ai" }, newer { role: "agent" }.
      const m = raw as { message: string; source?: string; role?: string };
      const role = m.source === "ai" || m.role === "agent" ? "birbal" : "child";
      const text = m.message.replace(/<\/?[\w-]+>/g, "").trim(); // multi-voice tags
      if (text) setTranscript((prev) => [...prev, { id: crypto.randomUUID(), role, text }]);
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

  const start = useCallback(async ({ genre, settings, returningCharacters }: StartOptions) => {
    if (!AGENT_ID) return setError("NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set.");
    setError(null);
    setEnded(false);
    setTranscript([]);
    setScene(null);
    setStorybook(null);
    setElapsedSeconds(0);
    nudged.current = false;
    soundEffects.current = settings.soundEffects;
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      mic.getTracks().forEach((t) => t.stop()); // only needed the permission
    } catch {
      return setError("We need the microphone so Birbal can hear you. Ask a grown-up to allow it.");
    }
    started.current = true;
    setMaxSeconds(settings.maxMinutes * 60);
    // startSession returns void; connection failures arrive through onError.
    live.current.startSession({
      agentId: AGENT_ID,
      connectionType: "webrtc",
      dynamicVariables: {
        child_age: settings.childAge,
        genre,
        allowed_genres: settings.allowedGenres.join(","),
        max_minutes: settings.maxMinutes,
        returning_characters: returningCharacters.join(",") || "none",
      },
      clientTools: {
        set_scene: (params) => {
          const next = parseScene(params);
          if (!next) return "invalid scene: location is required";
          setScene(next);
          return "ok";
        },
        make_storybook: async (params) => {
          setStorybookLoading(true);
          try {
            const res = await fetch("/api/storybook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(params),
            });
            if (!res.ok) throw new Error(`storybook ${res.status}`);
            setStorybook((await res.json()) as StorybookResult);
            return "Storybook ready";
          } catch (e) {
            console.error(e);
            setError("We couldn't make the storybook this time.");
            return "The storybook could not be made. Say sorry kindly and say goodbye.";
          } finally {
            setStorybookLoading(false);
          }
        },
        play_sound: async (params) => {
          if (!soundEffects.current) return "sound effects are off";
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

  // Session clock.
  useEffect(() => {
    if (!connected) return;
    const began = Date.now();
    const t = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - began) / 1000)), 1000);
    return () => clearInterval(t);
  }, [connected]);

  // Nudge the agent 1 minute before the limit, hard stop at the limit.
  useEffect(() => {
    if (!connected || maxSeconds === null) return;
    if (elapsedSeconds >= maxSeconds) {
      void stop();
      return;
    }
    if (elapsedSeconds >= maxSeconds - 60 && !nudged.current) {
      nudged.current = true;
      live.current.sendContextualUpdate(
        "One minute left. Wrap up: help the child solve the mystery now, then call make_storybook.",
      );
    }
  }, [elapsedSeconds, connected, maxSeconds, stop]);

  // Orb volume.
  useEffect(() => {
    if (!connected) return;
    let raf = 0;
    const tick = () => {
      setVolume(live.current.getOutputVolume());
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

  return { status, volume, transcript, scene, elapsedSeconds, storybook, storybookLoading, error, start, stop };
}
