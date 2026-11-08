"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConversation } from "@elevenlabs/react";
import { GENRES, GENRE_INFO, type AgentDynamicVariables, type Caption, type Genre } from "@/types/contract";
import { loadSettings } from "@/lib/settings";
import { toCaption } from "@/lib/captions";
import { MOCK_CAPTIONS } from "@/lib/mock";
import { Orb } from "@/components/Orb";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

function StoryScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const genreParam = params.get("genre") as Genre;
  const genre: Genre = GENRES.includes(genreParam) ? genreParam : "fantasy";
  const demo = !AGENT_ID;

  const [captions, setCaptions] = useState<Caption[]>(demo ? MOCK_CAPTIONS : []);
  const [character, setCharacter] = useState("Birbal");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef(crypto.randomUUID());
  const started = useRef(false);
  const captionsEnd = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => router.push(`/storybook?session=${sessionId.current}`), [router]);

  const conversation = useConversation({
    onDisconnect: () => started.current && finish(),
    onError: (e: unknown) => setError(typeof e === "string" ? e : "Birbal lost the connection."),
    onMessage: (raw) => {
      // SDK versions differ: older send { source: "ai" }, newer { role: "agent" }.
      const m = raw as { message: string; source?: string; role?: string };
      const fromAgent = m.source === "ai" || m.role === "agent";
      const c = toCaption(m.message, fromAgent);
      if (fromAgent) setCharacter(c.character ?? "Birbal");
      setCaptions((prev) => [...prev.slice(-30), c]);
    },
  });
  const connected = conversation.status === "connected";

  const begin = async () => {
    if (demo) return finish();
    setError(null);
    const s = loadSettings();
    const dynamicVariables: AgentDynamicVariables = {
      allowed_genres: s.allowedGenres.join(","),
      genre,
      child_age: s.childAge,
      max_minutes: s.maxMinutes,
      sound_effects: s.soundEffects,
      session_id: sessionId.current,
    };
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID!,
        connectionType: "webrtc",
        dynamicVariables: { ...dynamicVariables },
      });
      started.current = true;
      setSecondsLeft(s.maxMinutes * 60);
    } catch {
      setError("We need the microphone so Birbal can hear you. Ask a grown-up to allow it.");
    }
  };

  // Session timer: nudge the agent 1 minute before, hard stop at 0.
  useEffect(() => {
    if (secondsLeft === null || !connected) return;
    if (secondsLeft === 60) {
      conversation.sendContextualUpdate?.(
        "One minute left. Wrap up: help the child solve the mystery now, then call make_storybook.",
      );
    }
    if (secondsLeft <= 0) {
      conversation.endSession();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, connected, conversation]);

  // Orb volume animation.
  useEffect(() => {
    if (!connected) return;
    let raf = 0;
    const tick = () => {
      setLevel(conversation.getOutputVolume?.() ?? 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [connected, conversation]);

  useEffect(() => captionsEnd.current?.scrollIntoView({ behavior: "smooth" }), [captions]);

  const info = GENRE_INFO[genre];
  const mmss = secondsLeft !== null ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}` : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-5 sm:px-8">
      <header className="flex items-center justify-between">
        <span className={`${info.color} rounded-full px-4 py-2 font-display text-lg font-semibold`}>
          {info.emoji} {info.label}
        </span>
        {mmss && <span className="rounded-full bg-white/80 px-4 py-2 font-display text-lg tabular-nums shadow-sm">⏱ {mmss}</span>}
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 lg:flex-row lg:gap-16">
        <Orb level={level} speaking={connected && conversation.isSpeaking} label={connected || demo ? character : undefined} />

        <div className="w-full max-w-md">
          <div className="h-72 space-y-3 overflow-y-auto rounded-[2rem] bg-white/70 p-5 shadow-inner sm:h-96">
            {captions.length === 0 && (
              <p className="pt-20 text-center text-lg text-ink/50">Birbal&apos;s words will appear here.</p>
            )}
            {captions.map((c) => (
              <div key={c.id} className={`float-up flex ${c.speaker === "child" ? "justify-end" : ""}`}>
                <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-lg leading-snug ${
                  c.speaker === "child" ? "bg-plum text-white" : "bg-paper shadow-sm"
                }`}>
                  {c.character && <div className="text-sm font-bold text-sun">{c.character}</div>}
                  {c.text}
                </div>
              </div>
            ))}
            <div ref={captionsEnd} />
          </div>
          {demo && <p className="mt-2 text-center text-sm text-ink/50">Demo mode: set NEXT_PUBLIC_ELEVENLABS_AGENT_ID to talk to Birbal.</p>}
        </div>
      </div>

      {error && <p className="mb-4 rounded-2xl bg-red-100 p-4 text-center text-red-700">{error}</p>}

      <footer className="flex justify-center gap-4 pb-4">
        {!connected ? (
          <button onClick={begin} disabled={conversation.status === "connecting"}
            className="rounded-full bg-sun px-12 py-5 font-display text-2xl font-bold text-white shadow-lg shadow-sun/40 active:scale-95 disabled:opacity-50">
            {conversation.status === "connecting" ? "Waking Birbal…" : demo ? "See the storybook →" : "🎙 Begin"}
          </button>
        ) : (
          <button onClick={() => conversation.endSession()}
            className="rounded-full bg-ink px-12 py-5 font-display text-2xl font-bold text-white shadow-lg active:scale-95">
            ■ The End
          </button>
        )}
      </footer>
    </main>
  );
}

export default function StoryPage() {
  return (
    <Suspense>
      <StoryScreen />
    </Suspense>
  );
}
