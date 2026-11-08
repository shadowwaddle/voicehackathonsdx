"use client";
import { useState } from "react";
import { LEARNING_LANGUAGES, type Genre, type LearningLanguage, type ParentSettings } from "@/types/contract";
import { GENRE_INFO } from "@/lib/genres";
import { STORY_GENRES } from "@/lib/birbal/stories";
import { PinPad } from "@/components/PinPad";
import { Panel } from "./ui";

type PinStep = null | "new" | "confirm";

export function SettingsTab({
  settings, save, storiesCount, onClearStories, onPinChanged,
}: {
  settings: ParentSettings;
  save: (patch: Partial<ParentSettings>) => void;
  storiesCount: number;
  onClearStories: () => void;
  onPinChanged: () => void;
}) {
  const [pinStep, setPinStep] = useState<PinStep>(null);
  const [newPin, setNewPin] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const toggleGenre = (g: Genre) =>
    save({
      allowedGenres: settings.allowedGenres.includes(g)
        ? settings.allowedGenres.filter((x) => x !== g)
        : [...settings.allowedGenres, g],
    });

  if (pinStep) {
    return (
      <Panel>
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
            save({ pin: p });
            setPinStep(null);
            onPinChanged();
            return true;
          }}
        />
        <button onClick={() => setPinStep(null)} className="mt-6 w-full text-sm font-medium text-muted hover:text-ink">Cancel</button>
      </Panel>
    );
  }

  const chip = (on: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${on ? "bg-ink text-white ring-ink" : "bg-white text-muted ring-black/10 hover:ring-black/20"}`;

  return (
    <div className="space-y-4">
      <Panel title="Child's age" detail={`${settings.childAge} years old`}>
        <input type="range" min={4} max={10} step={1} value={settings.childAge}
          onChange={(e) => save({ childAge: Number(e.target.value) })} className="w-full accent-[#2f8f83]" aria-label="Child's age" />
        <div className="mt-1 flex justify-between text-xs text-muted">{[4, 5, 6, 7, 8, 9, 10].map((a) => <span key={a}>{a}</span>)}</div>
      </Panel>

      <Panel title="Allowed story worlds" detail={`${settings.allowedGenres.length} of ${STORY_GENRES.length}`}>
        <div className="flex flex-wrap gap-2">
          {STORY_GENRES.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)} aria-pressed={settings.allowedGenres.includes(g)} className={chip(settings.allowedGenres.includes(g))}>
              {GENRE_INFO[g].label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Language learning" detail="A friendly character teaches 3-6 words per story">
        <div className="flex flex-wrap gap-2">
          {(["off", ...Object.keys(LEARNING_LANGUAGES)] as LearningLanguage[]).map((code) => (
            <button key={code} lang={code === "off" ? undefined : code} onClick={() => save({ learningLanguage: code })}
              aria-pressed={settings.learningLanguage === code} className={chip(settings.learningLanguage === code)}>
              {code === "off" ? "Off" : `${LEARNING_LANGUAGES[code].name} · ${LEARNING_LANGUAGES[code].native}`}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Sound effects" detail="Gentle sounds like creaky doors and wind">
        <button role="switch" aria-checked={settings.soundEffects} aria-label="Sound effects" onClick={() => save({ soundEffects: !settings.soundEffects })}
          className={`relative h-8 w-14 rounded-full transition ${settings.soundEffects ? "bg-[#2f8f83]" : "bg-stone-300"}`}>
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${settings.soundEffects ? "left-7" : "left-1"}`} />
        </button>
      </Panel>

      <Panel title="Security & data">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setPinStep("new")} className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium ring-1 ring-black/10 hover:ring-black/20">Change PIN</button>
          {confirmClear ? (
            <span className="flex items-center gap-2">
              <button onClick={() => { onClearStories(); setConfirmClear(false); }} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white">
                Yes, clear {storiesCount}
              </button>
              <button onClick={() => setConfirmClear(false)} className="px-2 text-sm text-muted">Cancel</button>
            </span>
          ) : (
            <button onClick={() => setConfirmClear(true)} disabled={storiesCount === 0}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-black/10 hover:ring-rose-300 disabled:opacity-40">
              Clear saved stories
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}
