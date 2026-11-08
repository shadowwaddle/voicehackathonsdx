"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Genre, LearnedWord, LearningLanguage } from "@/types/contract";
import { useVoiceAgent as useRealAgent } from "@/hooks/useVoiceAgent";
import { useVoiceAgent as useMockAgent } from "@/hooks/useVoiceAgent.mock";
import { useParentSettings } from "@/hooks/useParentSettings";
import { useSavedStories } from "@/hooks/useSavedStories";
import { GENRE_INFO } from "@/lib/genres";
import { STORY_GENRES } from "@/lib/birbal/stories";
import { SESSION_SECONDS } from "@/lib/birbal/timeline";
import { DebugOverlay } from "./DebugOverlay";
import { BirbalMark, BrushIcon, ListenIcon, MoonIcon } from "@/components/Icons";
import { WatercolorCanvas } from "@/components/WatercolorCanvas";
import { TimeRing } from "@/components/TimeRing";
import { StorybookModal } from "@/components/StorybookModal";
import { BackIcon } from "@/components/Icons";
import { MyWords, WordCard } from "@/components/Language";

// Real ElevenLabs agent by default; set NEXT_PUBLIC_MOCK_AGENT=1 to demo without it.
// Chosen once at module load, so the hook order never changes between renders.
const useVoiceAgent = process.env.NEXT_PUBLIC_MOCK_AGENT === "1" ? useMockAgent : useRealAgent;

function StoryScreen() {
  const params = useSearchParams();
  const { settings, ready } = useParentSettings();
  const router = useRouter();
  // No stories until a parent has accepted the privacy flow.
  useEffect(() => {
    if (ready && !settings.consentAt) router.replace("/parents/welcome");
  }, [ready, settings.consentAt, router]);
  const { stories, addStory, getStory } = useSavedStories();
  const agent = useVoiceAgent();

  const asked = params.get("genre") as Genre;
  const genre: Genre = STORY_GENRES.includes(asked) ? asked : settings.allowedGenres[0] ?? "fantasy";
  const continuing = getStory(params.get("continue") ?? "");
  const info = GENRE_INFO[genre];
  const lang: LearningLanguage = params.get("lang") === "off" ? "off" : settings.learningLanguage;

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
      learningLanguage: lang,
      wordsLearned: agent.learnedWords,
    });
  }, [agent.storybook, agent.learnedWords, addStory, genre, continuing, lang]);

  const begin = () => {
    const earlier = lang === "off" ? [] : stories.filter((s) => s.learningLanguage === lang).flatMap((s) => s.wordsLearned ?? []);
    const reviewWords: LearnedWord[] = [...new Map(earlier.map((w) => [w.word, w])).values()].slice(0, 5);
    agent.start({
      genre, settings, returningCharacters: continuing?.characters ?? [], learningLanguage: lang,
      recentTitles: stories.slice(0, 5).map((s) => s.title), reviewWords,
    });
  };

  const live = agent.status === "speaking" || agent.status === "listening";
  const speaker = agent.scene?.speaker || "Birbal";

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <WatercolorCanvas scene={agent.scene} volume={agent.volume} />
      {params.get("debug") === "1" && <DebugOverlay scene={agent.scene} debug={agent.sceneDebug} volume={agent.volume} />}

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
            <TimeRing elapsed={agent.elapsedSeconds} totalSeconds={SESSION_SECONDS} />
          ) : (
            <span className="w-14" />
          )}
        </header>

        {/* Center */}
        <div className={`flex flex-1 flex-col items-center py-8 ${live ? "justify-start" : "justify-center"}`}>
          {agent.status === "idle" && (
            <button
              onClick={begin}
              disabled={!ready}
              className="rise group relative grid h-56 w-56 place-items-center rounded-full bg-sun text-white shadow-lift transition active:scale-95 disabled:opacity-50 sm:h-64 sm:w-64"
            >
              <span className="soft-pulse absolute inset-0 rounded-full bg-sun" aria-hidden />
              <span className="relative text-center">
                <BirbalMark className="mx-auto h-16 w-16" />
                <span className="mt-2 block font-display text-2xl font-bold">Tap to start</span>
              </span>
            </button>
          )}

          {agent.status === "connecting" && <Status icon={<BirbalMark />} text="Waking Birbal up…" />}

          {live && agent.currentWord && <WordCard word={agent.currentWord} />}

          {live && !agent.currentWord && (
            <div className="relative grid h-40 w-40 place-items-center" aria-live="polite">
              <span
                className={`soft-pulse absolute inset-0 rounded-full ${agent.status === "speaking" ? "bg-sun" : "bg-[#86c5a0]"}`}
                aria-hidden
              />
              <span className="relative grid h-28 w-28 place-items-center rounded-full bg-white/85 text-5xl shadow-soft backdrop-blur" aria-hidden>
                {agent.status === "speaking" ? <BirbalMark /> : <ListenIcon />}
              </span>
            </div>
          )}

          {agent.status === "ended" && !agent.storybook && !agent.storybookLoading && (
            <div className="rise rounded-[2rem] bg-paper/90 p-8 text-center shadow-lift backdrop-blur">
              <div className="grid justify-items-center text-5xl text-sun"><MoonIcon /></div>
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
            <MyWords words={agent.learnedWords} />
            <div className="flex items-center justify-center gap-3">
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
          <Status icon={<BrushIcon />} text="Birbal is painting your storybook…" />
        </div>
      )}
      {agent.storybook && <StorybookModal storybook={agent.storybook} words={agent.learnedWords} language={lang} />}
    </main>
  );
}

function Status({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rise flex flex-col items-center gap-4 text-center" role="status">
      <span className="bob grid h-28 w-28 place-items-center rounded-full bg-white/85 text-5xl shadow-soft" aria-hidden>{icon}</span>
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
