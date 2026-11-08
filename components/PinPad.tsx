"use client";
import { useEffect, useState } from "react";

// 4-digit PIN pad. onComplete returns false to show an error and clear.
export function PinPad({ title, hint, onComplete }: { title: string; hint?: string; onComplete: (pin: string) => boolean }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (onComplete(next)) return;
        setError(true);
        setPin("");
      }, 120);
    }
  };

  // Physical keyboard works the same as the on-screen keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        press(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setPin((p) => p.slice(0, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="mx-auto w-full max-w-xs text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className={`mt-1 h-5 text-sm ${error ? "text-rose-600" : "text-muted"}`}>{error ? "That PIN didn't match. Try again." : hint}</p>
      <div className="my-6 flex justify-center gap-4" aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-3.5 w-3.5 rounded-full transition ${i < pin.length ? "bg-ink" : "bg-ink/15"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <Key key={k} onClick={() => press(k)}>{k}</Key>
        ))}
        <span />
        <Key onClick={() => press("0")}>0</Key>
        <Key onClick={() => setPin(pin.slice(0, -1))} label="Delete">⌫</Key>
      </div>
    </div>
  );
}

function Key({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="h-16 rounded-2xl bg-white text-2xl font-medium shadow-sm ring-1 ring-black/5 transition active:scale-95 active:bg-stone-100"
    >
      {children}
    </button>
  );
}
