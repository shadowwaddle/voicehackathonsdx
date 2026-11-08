"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Genre, SavedStory } from "@/types/contract";
import { GENRE_INFO } from "@/lib/genres";
import { GlobeIcon } from "@/components/Icons";
import { useParentSettings } from "@/hooks/useParentSettings";
import { useSavedStories } from "@/hooks/useSavedStories";
import { Wordmark } from "@/components/Wordmark";
import { GenreCard } from "@/components/GenreCard";
import { LockIcon } from "@/components/Icons";
import { LangFonts, languageName } from "@/components/Language";

export default function Home() {
  const router = useRouter();
  const { settings, ready } = useParentSettings();
  const { stories } = useSavedStories();
  const genres = settings.allowedGenres;
  // Kids can switch the parent's chosen language off (or back on) for this story only.
  const [langOn, setLangOn] = useState(true);
  const lang = settings.learningLanguage;
  const langParam = lang !== "off" && !langOn ? "&lang=off" : "";

  // First run: a parent must accept the privacy flow before any story can start.
  const needsSetup = ready && !settings.consentAt;
  const go = (url: string) => router.push(needsSetup ? "/parents/welcome" : url);
  const startGenre = (genre: Genre) => go(`/story?genre=${genre}${langParam}`);
  const surprise = () => genres.length && startGenre(genres[Math.floor(Math.random() * genres.length)]);
  const continueStory = (s: SavedStory) =>
    go(`/story?genre=${genres.includes(s.genre) ? s.genre : genres[0] ?? s.genre}&continue=${s.id}${langParam}`);

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
      <header className="flex items-center justify-between py-2">
        <Wordmark />
        <Link
          href="/parents"
          aria-label="Grown-ups settings"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-muted shadow-soft transition hover:text-ink"
        >
          <LockIcon />
        </Link>
      </header>

      <section className="rise mt-6 sm:mt-10">
        <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
          Ready for a mystery?
        </h1>
        <p className="mt-3 max-w-lg text-lg text-muted sm:text-xl">
          Birbal tells the story. You find the clues and solve the puzzle!
        </p>

        <button
          onClick={surprise}
          disabled={!ready || genres.length === 0}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-[2rem] bg-sun py-6 font-display text-3xl font-bold text-white shadow-lift transition hover:bg-sun-deep active:scale-[0.98] disabled:opacity-40 sm:py-7 sm:text-4xl"
        >
          {needsSetup ? "Ask a grown-up to set me up" : "Start a story"}
        </button>
        {needsSetup && (
          <p className="mt-3 text-center text-muted">A grown-up needs to say hello to Birbal first. It only takes a minute.</p>
        )}

        {ready && lang !== "off" && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className={`rounded-full px-4 py-2 font-display text-lg font-semibold shadow-soft transition ${langOn ? "bg-[#d9f5f2] text-[#1f7a72]" : "bg-white/70 text-muted"}`}>
              <GlobeIcon className="mr-1.5 inline h-4 w-4" />{langOn ? `Learning ${languageName(lang)}` : "Language Adventure off"}
            </span>
            <button
              role="switch"
              aria-checked={langOn}
              aria-label={`Learn ${languageName(lang)} words in this story`}
              onClick={() => setLangOn(!langOn)}
              className={`relative h-9 w-16 rounded-full shadow-soft transition ${langOn ? "bg-[#3fae9f]" : "bg-stone-300"}`}
            >
              <span className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${langOn ? "left-8" : "left-1"}`} />
            </button>
          </div>
        )}
      </section>

      <section className="rise mt-12" style={{ animationDelay: "80ms" }}>
        <h2 className="font-display text-2xl font-semibold">Pick a world</h2>
        {ready && genres.length === 0 ? (
          <p className="mt-3 rounded-3xl bg-white/70 p-6 text-muted">Ask a grown-up to switch on some story worlds.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {genres.map((g) => (
              <GenreCard key={g} genre={g} onClick={() => startGenre(g)} />
            ))}
          </div>
        )}
      </section>

      {stories.length > 0 && (
        <section className="rise mt-12" style={{ animationDelay: "160ms" }}>
          <h2 className="font-display text-2xl font-semibold">Saved adventures</h2>
          <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
            {stories.map((s) => {
              const g = GENRE_INFO[s.genre];
              return (
                <button
                  key={s.id}
                  onClick={() => continueStory(s)}
                  className="w-64 shrink-0 snap-start rounded-[1.75rem] bg-paper p-5 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span style={{ background: g.bg }} className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" aria-hidden>
                    {g.icon}
                  </span>
                  <h3 className="mt-3 line-clamp-2 font-display text-lg font-semibold leading-snug">{s.title}</h3>
                  {s.wordsLearned && s.wordsLearned.length > 0 && (
                    <p className="mt-1 text-sm font-medium text-[#1f7a72]">
                      <GlobeIcon className="mr-1 inline h-4 w-4" />Words learned: {s.wordsLearned.length} · {languageName(s.learningLanguage)}
                    </p>
                  )}
                  {s.characters.length > 0 && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted">With {s.characters.join(", ")}</p>
                  )}
                  <p className="mt-3 text-sm font-semibold" style={{ color: g.ink }}>Continue the adventure →</p>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
