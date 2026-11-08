"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GENRE_INFO, type Genre, type ParentSettings, type SavedStory } from "@/types/contract";
import { DEFAULT_SETTINGS, loadSettings, loadStories } from "@/lib/settings";
import { MOCK_STORIES } from "@/lib/mock";
import { TopBar } from "@/components/TopBar";

export default function Home() {
  const router = useRouter();
  const [settings, setSettings] = useState<ParentSettings>(DEFAULT_SETTINGS);
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [genre, setGenre] = useState<Genre | null>(null);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setGenre(s.allowedGenres[0] ?? null);
    const saved = loadStories();
    setStories(saved.length ? saved : MOCK_STORIES);
  }, []);

  const start = () => genre && router.push(`/story?genre=${genre}`);

  return (
    <main className="pb-16">
      <TopBar
        right={
          <Link href="/parent" className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold shadow-sm hover:bg-white">
            👪 Grown-ups
          </Link>
        }
      />

      <section className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="float-up rounded-[2rem] bg-white/70 p-6 shadow-xl backdrop-blur sm:p-10">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
            Ready for a mystery?
          </h1>
          <p className="mt-3 max-w-xl text-lg text-ink/70 sm:text-xl">
            Pick a world. Birbal tells the story — and you help solve the puzzle!
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {settings.allowedGenres.map((g) => {
              const info = GENRE_INFO[g];
              const active = g === genre;
              return (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`${info.color} flex min-h-28 flex-col items-start justify-between rounded-3xl p-4 text-left transition active:scale-95 ${
                    active ? "ring-4 ring-sun ring-offset-2" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className="text-4xl">{info.emoji}</span>
                  <span className="font-display text-xl font-semibold">{info.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={start}
            disabled={!genre}
            className="mt-8 w-full rounded-full bg-sun py-6 font-display text-3xl font-bold text-white shadow-lg shadow-sun/40 transition active:scale-[0.98] disabled:opacity-40"
          >
            ▶ Start a story
          </button>
          {settings.allowedGenres.length === 0 && (
            <p className="mt-3 text-center text-ink/60">Ask a grown-up to turn on some story worlds.</p>
          )}
        </div>

        <h2 className="mt-12 font-display text-3xl font-bold">Your storybooks</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {stories.map((s) => (
            <Link
              key={s.story_id}
              href={`/storybook?story=${s.story_id}`}
              className="flex gap-4 rounded-3xl bg-white/80 p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className={`${GENRE_INFO[s.genre].color} grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl`}>
                {GENRE_INFO[s.genre].emoji}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-semibold leading-snug">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-ink/60">{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
