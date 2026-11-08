import type { ReactNode } from "react";

export function Panel({ title, detail, children, className = "" }: { title?: string; detail?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6 ${className}`}>
      {(title || detail) && (
        <div className="mb-4 flex items-baseline justify-between gap-4">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {detail && <span className="text-right text-sm text-muted">{detail}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: readonly T[]; value: T; onChange: (t: T) => void }) {
  return (
    <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Dashboard sections">
      <div className="inline-flex gap-1 rounded-2xl bg-stone-200/60 p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={t === value}
            onClick={() => onChange(t)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              t === value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </nav>
  );
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
export const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
