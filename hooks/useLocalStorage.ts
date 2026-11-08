"use client";
import { useCallback, useEffect, useState } from "react";

// JSON value in localStorage, kept in sync across hook instances and tabs.
// `ready` is false until the stored value has been read (avoids SSR mismatch).
export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        setValue(raw ? (JSON.parse(raw) as T) : fallback);
      } catch {
        setValue(fallback);
      }
    };
    read();
    setReady(true);
    const onChange = (e: Event) => {
      if (e instanceof StorageEvent ? e.key === key : (e as CustomEvent).detail === key) read();
    };
    window.addEventListener("storage", onChange);
    window.addEventListener("birbal-storage", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("birbal-storage", onChange);
    };
    // fallback is a constant default; reading it once is intended
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("birbal-storage", { detail: key }));
      } catch {
        /* storage unavailable: value lives in memory for this page only */
      }
    },
    [key],
  );

  return [value, save, ready] as const;
}
