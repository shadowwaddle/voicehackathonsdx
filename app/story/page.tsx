"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { GENRES, type Genre } from "@/types/contract";
import { useVoiceAgent as useRealAgent } from "@/hooks/useVoiceAgent";
import { useVoiceAgent as useMockAgent } from "@/hooks/useVoiceAgent.mock";
import { useParentSettings } from "@/hooks/useParentSettings";
import { useSavedStories } from "@/hooks/useSavedStories";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { GENRE_INFO } from "@/lib/genres";
import { WatercolorCanvas } from "@/components/WatercolorCanvas";
import { TimeRing } from "@/components/TimeRing";
import { StorybookModal } from "@/components/StorybookModal";
import { BackIcon } from "@/components/Icons";

// Real ElevenLabs agent by default; set NEXT_PUBLIC_MOCK_AGENT=1 to demo without it.
// Chosen once at module load, so the hook order never changes between renders.
const useVoiceAgent = process.env.NEXT_PUBLIC_MOCK_AGENT === "1" ? useMockAgent : useRealAgent;

function StoryScreen() {
  const params = useSearchParams();
  const { settings, ready } = useParentSettings();
  const { addStory, getStory } = useSavedStories();
  const [captionsOn, setCaptionsOn] = useLocalStorage("birbal.captions", true);
  const agent = useVoiceAgent();

  const asked = params.get("genre") as Genre;
  const genre: Genre = GENRES.includes(asked) ? asked : settings.allowedGenres[0] ?? "fantasy";
  const continuing = getStory(params.get("continue") ?? "");
  const info = GENRE_INFO[genre];

  // Remember every character we meet so they can return in the next story.
  const metCharacters = useRef(new Set<string>());
  useEffect(() => {
    agent.scene?.characters.forEach((c) => c.name.toLowerCase() !== "birbal" && metCharacters.current.add(c.name));
  }, [agent.scene]);

  // Save the story once the storybook arrives.
  const savedUrl = useRef<string | null>(null);
  useEffect(() => {
    const sb = agent.storybook;
    if (!sb || savedUrl.current === sb.url) return;
    savedUrl.current = sb.url;
    addStory({
      id: crypto.randomUUID(),
      title: sb.title,
      genre,
      url: sb.url,
      characters: [...new Set([...(continuing?.characters ?? []), ...metCharacters.current])],
      createdAt: new Date().toISOString(),
    });
  }, [agent.storybook, addStory, genre, continuing]);

  const begin = () =>
    agent.start({ genre, settings, returningCharacters: continuing?.characters ?? [] });

  const live = agent.status === "speaking" || agent.status === "listening";
  const speaker = agent.scene?.speaker || "Birbal";
  const lastLines = agent.transcript.slice(-2);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <WatercolorCanvas scene={agent.scene} volume={agent.volume} />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!live && (
              <Link href="/" aria-label="Back home" className="grid h-11 w-11 place-items-center rounded-full bg-white/70 shadow-soft backdrop-blur">
                <BackIcon />
              </Link>
            )}
            <span style={{ background: info.bg, color: info.ink }} className="rounded-full px-4 py-2 font-display text-lg font-semibold shadow-soft">
              <span aria-hidden>{info.icon}</span> {info.label}
            </span>
          </div>
          {live && (
            <span className="rise rounded-full bg-white/75 px-4 py-2 font-display text-lg font-semibold shadow-soft backdrop-blur" aria-live="polite">
              {speaker}
            </span>
          )}
          {live || agent.status === "connecting" ? (
            <TimeRing elapsed={agent.elapsedSeconds} totalSeconds={settings.maxMinutes * 60} />
          ) : (
            <span className="w-14" />
          )}
        </header>

        {/* Center */}
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          {agent.status === "idle" && (
            <button
              onClick={begin}
              disabled={!ready}
              className="rise group relative grid h-56 w-56 place-items-center rounded-full bg-sun text-white shadow-lift transition active:scale-95 disabled:opacity-50 sm:h-64 sm:w-64"
            >
              <span className="soft-pulse absolute inset-0 rounded-full bg-sun" aria-hidden />
              <span className="relative text-center">
                <span className="block text-6xl" aria-hidden>🦉</span>
                <span className="mt-2 block font-display text-2xl font-bold">Tap to start</span>
              </span>
            </button>
          )}

          {agent.status === "connecting" && <Status emoji="🦉" text="Waking Birbal up…" />}

          {live && (
            <div className="relative grid h-40 w-40 place-items-center" aria-live="polite">
              <span
                className={`soft-pulse absolute inset-0 rounded-full ${agent.status === "speaking" ? "bg-sun" : "bg-[#86c5a0]"}`}
                aria-hidden
              />
              <span className="relative grid h-28 w-28 place-items-center rounded-full bg-white/85 text-5xl shadow-soft backdrop-blur" aria-hidden>
                {agent.status === "speaking" ? "🦉" : "👂"}
              </span>
              <span className="absolute -bottom-12 whitespace-nowrap rounded-full bg-white/75 px-4 py-1.5 font-display text-lg font-medium backdrop-blur">
                {agent.status === "speaking" ? `${speaker} is speaking` : "Birbal is listening"}
              </span>
            </div>
          )}

          {agent.status === "ended" && !agent.storybook && !agent.storybookLoading && (
            <div className="rise rounded-[2rem] bg-paper/90 p-8 text-center shadow-lift backdrop-blur">
              <div className="text-5xl" aria-hidden>🌙</div>
              <h2 className="mt-3 font-display text-3xl font-bold">See you next time!</h2>
              <p className="mt-1 text-muted">Birbal will save the next mystery for you.</p>
              <Link href="/" className="mt-6 inline-block rounded-full bg-sun px-8 py-3 font-display text-xl font-bold text-white">
                Back home
              </Link>
            </div>
          )}

          {agent.error && (
            <p className="mt-6 max-w-md rounded-2xl bg-white/85 p-4 text-center text-rose-700 shadow-soft">{agent.error}</p>
          )}
        </div>

        {/* Bottom */}
        {live && (
          <footer className="space-y-3">
            {captionsOn && lastLines.length > 0 && (
              <div className="mx-auto max-w-2xl space-y-2 rounded-[1.75rem] bg-white/75 p-4 shadow-soft backdrop-blur">
                {lastLines.map((l, i) => (
                  <p
                    key={l.id}
                    className={`text-lg leading-snug sm:text-xl ${i < lastLines.length - 1 ? "opacity-55" : ""} ${l.role === "child" ? "text-right font-medium text-[#4f5d8a]" : ""}`}
                  >
                    {l.text}
                  </p>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCaptionsOn(!captionsOn)}
                aria-pressed={captionsOn}
                className="rounded-full bg-white/75 px-5 py-3 font-display text-lg font-medium shadow-soft backdrop-blur"
              >
                {captionsOn ? "Hide words" : "Show words"}
              </button>
              <button
                onClick={() => agent.stop()}
                className="rounded-full bg-ink px-7 py-3 font-display text-lg font-semibold text-white shadow-soft"
              >
                End story
              </button>
            </div>
          </footer>
        )}
      </div>

      {agent.storybookLoading && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-cream/60 backdrop-blur-sm">
          <Status emoji="🎨" text="Birbal is painting your storybook…" />
        </div>
      )}
      {agent.storybook && <StorybookModal storybook={agent.storybook} />}
    </main>
  );
}

function Status({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="rise flex flex-col items-center gap-4 text-center" role="status">
      <span className="bob grid h-28 w-28 place-items-center rounded-full bg-white/85 text-5xl shadow-soft" aria-hidden>{emoji}</span>
      <p className="font-display text-2xl font-semibold">{text}</p>
    </div>
  );
}

export default function StoryPage() {
  return (
    <Suspense>
      <StoryScreen />
    </Suspense>
  );
}
