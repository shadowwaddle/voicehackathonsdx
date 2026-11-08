"use client";
import { useEffect, useState } from "react";
import { GENRES, GENRE_INFO, type Genre, type ParentSettings } from "@/types/contract";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/settings";
import { TopBar } from "@/components/TopBar";

function PinPad({ title, onDone }: { title: string; onDone: (pin: string) => boolean }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const press = (d: string) => {
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (!onDone(next)) {
        setError(true);
        setTimeout(() => setPin(""), 400);
      }
    }
  };
  return (
    <div className="mx-auto max-w-sm rounded-[2rem] bg-white/80 p-8 text-center shadow-xl">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <div className="my-6 flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-4 w-4 rounded-full ${i < pin.length ? (error ? "bg-red-400" : "bg-ink") : "bg-ink/15"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k) =>
          k === "" ? (
            <span key="blank" />
          ) : (
            <button
              key={k}
              onClick={() => (k === "⌫" ? setPin(pin.slice(0, -1)) : press(k))}
              className="h-16 rounded-2xl bg-paper font-display text-2xl font-semibold shadow-sm active:scale-95"
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export default function ParentPage() {
  const [settings, setSettings] = useState<ParentSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  const update = (patch: Partial<ParentSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const toggleGenre = (g: Genre) =>
    update({
      allowedGenres: settings.allowedGenres.includes(g)
        ? settings.allowedGenres.filter((x) => x !== g)
        : GENRES.filter((x) => x === g || settings.allowedGenres.includes(x)),
    });

  if (!loaded) return null;

  return (
    <main className="pb-16">
      <TopBar right={saved ? <span className="text-sm font-bold text-emerald-600">Saved ✓</span> : null} />
      <section className="mx-auto max-w-3xl px-4 sm:px-8">
        {!unlocked ? (
          settings.pin ? (
            <PinPad title="Grown-ups only: enter PIN" onDone={(p) => (p === settings.pin ? (setUnlocked(true), true) : false)} />
          ) : (
            <PinPad title="Create a 4-digit parent PIN" onDone={(p) => (update({ pin: p }), setUnlocked(true), true)} />
          )
        ) : (
          <div className="float-up space-y-6 rounded-[2rem] bg-white/80 p-6 shadow-xl sm:p-10">
            <h1 className="font-display text-3xl font-bold">Parent settings</h1>

            <div>
              <h2 className="font-display text-xl font-semibold">Allowed story worlds</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const on = settings.allowedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`rounded-full px-4 py-2 font-bold transition ${on ? "bg-ink text-white" : "bg-ink/10 text-ink/60"}`}
                    >
                      {GENRE_INFO[g].emoji} {GENRE_INFO[g].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="font-display text-xl font-semibold">Child&apos;s age: {settings.childAge}</span>
              <input type="range" min={4} max={9} value={settings.childAge}
                onChange={(e) => update({ childAge: Number(e.target.value) })} className="mt-3 w-full accent-sun" />
            </label>

            <label className="block">
              <span className="font-display text-xl font-semibold">Max story time: {settings.maxMinutes} min</span>
              <input type="range" min={3} max={30} value={settings.maxMinutes}
                onChange={(e) => update({ maxMinutes: Number(e.target.value) })} className="mt-3 w-full accent-sun" />
              <span className="text-sm text-ink/60">Birbal starts wrapping up a minute before time runs out.</span>
            </label>

            <label className="flex items-center justify-between">
              <span className="font-display text-xl font-semibold">Sound effects</span>
              <input type="checkbox" checked={settings.soundEffects}
                onChange={(e) => update({ soundEffects: e.target.checked })} className="h-7 w-7 accent-sun" />
            </label>

            <p className="rounded-2xl bg-paper p-4 text-sm text-ink/70">
              🔒 Birbal never asks for or stores your child&apos;s name, school or location. Settings stay on this device.
            </p>

            <button onClick={() => update({ pin: "" })} className="text-sm font-bold text-ink/50 underline">
              Reset PIN
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
