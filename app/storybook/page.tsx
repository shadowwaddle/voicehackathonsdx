"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GENRE_INFO, type SavedStory, type StorybookStatus } from "@/types/contract";
import { loadStories, saveStory } from "@/lib/settings";
import { MOCK_STORIES } from "@/lib/mock";
import { TopBar } from "@/components/TopBar";
import { QrCode } from "@/components/QrCode";

const POLL_MS = 2000;
const POLL_LIMIT = 30; // ~1 minute

function StorybookScreen() {
  const params = useSearchParams();
  const session = params.get("session");
  const storyId = params.get("story");
  const [story, setStory] = useState<SavedStory | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (storyId) {
      const found = [...loadStories(), ...MOCK_STORIES].find((s) => s.story_id === storyId) ?? null;
      setStory(found);
      setState(found ? "ready" : "missing");
      return;
    }
    if (!session) {
      // Demo mode: no session means the story page ran without an agent.
      setStory(MOCK_STORIES[0]);
      setState("ready");
      return;
    }
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const res = await fetch(`/api/storybook?session=${encodeURIComponent(session)}`, { cache: "no-store" });
        const data = (await res.json()) as StorybookStatus;
        if (data.status === "ready") {
          const { story_id, title, genre, summary, url, created_at } = data.storybook;
          const saved = { story_id, title, genre, summary, url, created_at };
          saveStory(saved);
          setStory(saved);
          setState("ready");
          return;
        }
      } catch {
        /* keep polling */
      }
      if (++tries >= POLL_LIMIT) return setState("missing");
      timer = setTimeout(poll, POLL_MS);
    };
    poll();
    return () => clearTimeout(timer);
  }, [session, storyId]);

  return (
    <main className="pb-16">
      <TopBar />
      <section className="mx-auto max-w-3xl px-4 sm:px-8">
        {state === "loading" && (
          <div className="rounded-[2rem] bg-white/80 p-12 text-center shadow-xl">
            <div className="orb-idle text-7xl">📖</div>
            <h1 className="mt-6 font-display text-3xl font-bold">Birbal is binding your storybook…</h1>
            <p className="mt-2 text-lg text-ink/60">Painting the pages. Just a moment!</p>
          </div>
        )}

        {state === "missing" && (
          <div className="rounded-[2rem] bg-white/80 p-12 text-center shadow-xl">
            <div className="text-7xl">🦉</div>
            <h1 className="mt-6 font-display text-3xl font-bold">No storybook this time</h1>
            <p className="mt-2 text-lg text-ink/60">The mystery wasn&apos;t finished. Let&apos;s solve the next one!</p>
            <Link href="/" className="mt-8 inline-block rounded-full bg-sun px-10 py-4 font-display text-xl font-bold text-white">
              Back home
            </Link>
          </div>
        )}

        {state === "ready" && story && (
          <div className="float-up overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className={`${GENRE_INFO[story.genre].color} p-8 sm:p-10`}>
              <span className="text-6xl">{GENRE_INFO[story.genre].emoji}</span>
              <p className="mt-4 font-bold uppercase tracking-wider text-ink/60">Mystery solved! 🎉</p>
              <h1 className="mt-1 font-display text-4xl font-bold leading-tight sm:text-5xl">{story.title}</h1>
            </div>
            <div className="grid gap-8 p-8 sm:grid-cols-[1fr_auto] sm:p-10">
              <div>
                <p className="text-lg leading-relaxed text-ink/80">{story.summary}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={story.url} target="_blank" rel="noreferrer"
                    className="rounded-full bg-sun px-8 py-4 font-display text-xl font-bold text-white shadow-lg shadow-sun/30">
                    Open storybook ↗
                  </a>
                  <Link href="/" className="rounded-full bg-ink/10 px-8 py-4 font-display text-xl font-bold">
                    New story
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <QrCode value={story.url} />
                <span className="text-sm text-ink/60">Scan to keep it</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function StorybookPage() {
  return (
    <Suspense>
      <StorybookScreen />
    </Suspense>
  );
}
