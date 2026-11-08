"use client";
import Link from "next/link";
import { useState } from "react";
import { GENRES, LEARNING_LANGUAGES, MAX_MINUTES_OPTIONS, type Genre, type LearningLanguage } from "@/types/contract";
import { GENRE_INFO } from "@/lib/genres";
import { useParentSettings } from "@/hooks/useParentSettings";
import { useSavedStories } from "@/hooks/useSavedStories";
import { PinPad } from "@/components/PinPad";
import { BackIcon, CheckIcon, LockIcon } from "@/components/Icons";

type PinStep = null | "new" | "confirm";

export default function ParentsPage() {
  const { settings, update, ready } = useParentSettings();
  const { stories, clearStories } = useSavedStories();
  const [unlocked, setUnlocked] = useState(false);
  const [pinStep, setPinStep] = useState<PinStep>(null);
  const [newPin, setNewPin] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };
  const save = (patch: Parameters<typeof update>[0]) => {
    update(patch);
    flash("Saved");
  };
  const toggleGenre = (g: Genre) =>
    save({
      allowedGenres: settings.allowedGenres.includes(g)
        ? settings.allowedGenres.filter((x) => x !== g)
        : [...settings.allowedGenres, g],
    });

  if (!ready) return null;

  const shell = (children: React.ReactNode) => (
    <main className="min-h-dvh bg-stone-50 px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-white hover:text-ink">
            <BackIcon className="h-4 w-4" /> Back to Birbal
          </Link>
          <span aria-live="polite" className={`text-sm font-medium text-emerald-700 transition ${toast ? "opacity-100" : "opacity-0"}`}>
            {toast ?? "Saved"} <CheckIcon className="inline h-4 w-4" />
          </span>
        </header>
        {children}
      </div>
    </main>
  );

  if (!unlocked) {
    return shell(
      <div className="rise mt-10 rounded-3xl bg-white p-8 shadow-soft ring-1 ring-black/5">
        <PinPad
          title="Grown-ups only"
          hint="Enter your 4-digit PIN (default 1234)"
          onComplete={(p) => {
            if (p !== settings.pin) return false;
            setUnlocked(true);
            return true;
          }}
        />
      </div>,
    );
  }

  if (pinStep) {
    return shell(
      <div className="rise mt-10 rounded-3xl bg-white p-8 shadow-soft ring-1 ring-black/5">
        <PinPad
          key={pinStep}
          title={pinStep === "new" ? "Choose a new PIN" : "Enter it once more"}
          hint={pinStep === "new" ? "4 digits your child won't guess" : "To make sure it's right"}
          onComplete={(p) => {
            if (pinStep === "new") {
              setNewPin(p);
              setPinStep("confirm");
              return true;
            }
            if (p !== newPin) {
              setPinStep("new");
              return false;
            }
            update({ pin: p });
            setPinStep(null);
            flash("PIN changed");
            return true;
          }}
        />
        <button onClick={() => setPinStep(null)} className="mt-6 w-full text-sm font-medium text-muted hover:text-ink">
          Cancel
        </button>
      </div>,
    );
  }

  return shell(
    <div className="rise mt-4 space-y-4">
      <div>
        <h1 className="font-display text-3xl font-semibold">Parent settings</h1>
        <p className="mt-1 text-muted">These stay on this device and shape every story Birbal tells.</p>
      </div>

      <Card title="Child's age" detail={`${settings.childAge} years old`}>
        <input
          type="range" min={4} max={10} step={1} value={settings.childAge}
          onChange={(e) => save({ childAge: Number(e.target.value) })}
          className="w-full accent-sun" aria-label="Child's age"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          {[4, 5, 6, 7, 8, 9, 10].map((a) => <span key={a}>{a}</span>)}
        </div>
      </Card>

      <Card title="Allowed story worlds" detail={`${settings.allowedGenres.length} of ${GENRES.length}`}>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const on = settings.allowedGenres.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                aria-pressed={on}
                className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                  on ? "bg-ink text-white ring-ink" : "bg-white text-muted ring-black/10 hover:ring-black/20"
                }`}
              >
                <span aria-hidden>{GENRE_INFO[g].icon}</span> {GENRE_INFO[g].label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Language learning" detail="A friendly character teaches 3-6 words per story">
        <div className="flex flex-wrap gap-2">
          {(["off", ...Object.keys(LEARNING_LANGUAGES)] as LearningLanguage[]).map((code) => {
            const on = settings.learningLanguage === code;
            const label = code === "off" ? "Off" : `${LEARNING_LANGUAGES[code].name} · ${LEARNING_LANGUAGES[code].native}`;
            return (
              <button
                key={code}
                lang={code === "off" ? undefined : code}
                onClick={() => save({ learningLanguage: code })}
                aria-pressed={on}
                className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                  on ? "bg-ink text-white ring-ink" : "bg-white text-muted ring-black/10 hover:ring-black/20"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Story time limit" detail="Birbal wraps up a minute before">
        <div className="grid grid-cols-5 gap-2">
          {MAX_MINUTES_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => save({ maxMinutes: m })}
              aria-pressed={settings.maxMinutes === m}
              className={`rounded-xl py-3 text-sm font-medium ring-1 transition ${
                settings.maxMinutes === m ? "bg-ink text-white ring-ink" : "bg-white ring-black/10 hover:ring-black/20"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </Card>

      <Card title="Sound effects" detail="Gentle sounds like creaky doors and wind">
        <button
          role="switch"
          aria-checked={settings.soundEffects}
          onClick={() => save({ soundEffects: !settings.soundEffects })}
          className={`relative h-8 w-14 rounded-full transition ${settings.soundEffects ? "bg-emerald-500" : "bg-stone-300"}`}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${settings.soundEffects ? "left-7" : "left-1"}`} />
        </button>
      </Card>

      <Card title="Security & data">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setPinStep("new")} className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium ring-1 ring-black/10 hover:ring-black/20">
            Change PIN
          </button>
          {confirmClear ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => { clearStories(); setConfirmClear(false); flash("Stories cleared"); }}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                Yes, clear {stories.length}
              </button>
              <button onClick={() => setConfirmClear(false)} className="px-2 text-sm text-muted">Cancel</button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={stories.length === 0}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-black/10 hover:ring-rose-300 disabled:opacity-40"
            >
              Clear saved stories
            </button>
          )}
        </div>
      </Card>

      <p className="px-1 pt-2 text-sm leading-relaxed text-muted">
        <LockIcon className="mr-1 inline h-4 w-4" />Birbal never asks for or keeps your child&apos;s name, school or location. Stories are told by an AI voice
        and are designed to be gentle and age-appropriate.
      </p>
    </div>,
  );
}

function Card({ title, detail, children }: { title: string; detail?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {detail && <span className="text-right text-sm text-muted">{detail}</span>}
      </div>
      {children}
    </section>
  );
}
