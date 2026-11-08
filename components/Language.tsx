"use client";
import { useEffect, useRef, useState } from "react";
import { LEARNING_LANGUAGES, type LearnedWord, type LearningLanguage } from "@/types/contract";

// Noto fonts for scripts the display font doesn't cover. Loaded only when a word in
// that language is on screen (React hoists and dedupes these <link> tags).
const NOTO: Partial<Record<LearningLanguage, string>> = {
  zh: "Noto Sans SC",
  hi: "Noto Sans Devanagari",
  ja: "Noto Sans JP",
};

export function langFont(lang: LearningLanguage | undefined): string | undefined {
  const f = lang && NOTO[lang];
  return f ? `"${f}", var(--font-display)` : undefined;
}

// Adds the font stylesheet to <head> once. A plain DOM insert on purpose: a React
// <link precedence> would suspend the story screen while the font downloads.
export function LangFonts({ langs }: { langs: (LearningLanguage | undefined)[] }) {
  const key = [...new Set(langs.map((l) => l && NOTO[l]).filter(Boolean))].join("|");
  useEffect(() => {
    for (const family of key ? key.split("|") : []) {
      const id = `font-${family.replace(/ /g, "-")}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@500;700&display=swap`;
      document.head.appendChild(link);
    }
  }, [key]);
  return null;
}

export const languageName = (lang: LearningLanguage | undefined) =>
  lang && lang !== "off" ? LEARNING_LANGUAGES[lang].name : "";

/** Big floating word card. Blooms in when `word` is set, fades out when it clears. */
export function WordCard({ word }: { word: LearnedWord | null }) {
  const [shown, setShown] = useState<LearnedWord | null>(word);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (word) {
      setShown(word);
      setLeaving(false);
      return;
    }
    setLeaving(true);
    const t = setTimeout(() => setShown(null), 700);
    return () => clearTimeout(t);
  }, [word]);

  if (!shown) return null;
  const romanized = shown.language !== "off" && LEARNING_LANGUAGES[shown.language].romanized;

  return (
    <div
      key={shown.word}
      className={`relative px-12 py-9 text-center ${leaving ? "word-leave" : "word-bloom"}`}
      role="status"
      aria-live="polite"
    >
      <LangFonts langs={[shown.language]} />
      {/* Soft painted backdrop; #wc-edge comes from WatercolorCanvas */}
      <div
        className="absolute inset-0 rounded-[45%] shadow-lift"
        style={{
          background: "radial-gradient(ellipse at 40% 35%, #fffdf8 0%, #fff6e6 55%, #fde7cf 100%)",
          filter: "url(#wc-edge)",
        }}
        aria-hidden
      />
      <div className="relative">
        <div className="text-5xl" aria-hidden>{shown.emoji}</div>
        <div lang={shown.language} className="mt-2 text-6xl font-bold leading-tight text-ink sm:text-7xl" style={{ fontFamily: langFont(shown.language) }}>
          {shown.word}
        </div>
        {romanized && shown.romanization && (
          <div className="mt-1 text-2xl font-medium text-muted">{shown.romanization}</div>
        )}
        <div className="mt-2 font-display text-2xl text-ink/80">“{shown.translation}”</div>
        <div className="mt-4 inline-block rounded-full bg-sun/90 px-5 py-2 font-display text-lg font-semibold text-white">
          🗣️ Say it with me!
        </div>
      </div>
    </div>
  );
}

/** "My words" strip that fills up as words are learned. */
export function MyWords({ words }: { words: LearnedWord[] }) {
  const seen = useRef(0);
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    if (words.length > seen.current) {
      setFresh(words[words.length - 1].word);
      const t = setTimeout(() => setFresh(null), 1400);
      seen.current = words.length;
      return () => clearTimeout(t);
    }
    seen.current = words.length;
  }, [words]);

  if (words.length === 0) return null;
  return (
    <div className="mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto rounded-full bg-white/70 px-3 py-2 shadow-soft backdrop-blur">
      <LangFonts langs={words.map((w) => w.language)} />
      <span className="shrink-0 pl-1 pr-1 font-display text-sm font-semibold text-muted">My words</span>
      {words.map((w) => (
        <span
          key={w.word}
          lang={w.language}
          title={w.translation}
          className={`relative shrink-0 rounded-full bg-paper px-3 py-1 text-base font-semibold ring-1 ring-black/5 ${w.word === fresh ? "chip-pop" : ""}`}
          style={{ fontFamily: langFont(w.language) }}
        >
          <span aria-hidden>{w.emoji}</span> {w.word}
          {w.word === fresh && <span className="sparkle" aria-hidden>✨</span>}
        </span>
      ))}
    </div>
  );
}
