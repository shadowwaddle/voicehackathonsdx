"use client";
import type { SessionReport } from "@/types/contract";
import { GENRE_INFO } from "@/lib/genres";
import { Panel, formatDate, formatDuration } from "./ui";

export function StoriesTab({ reports }: { reports: SessionReport[] }) {
  if (reports.length === 0) return <Panel><p className="py-8 text-center text-muted">Finished stories will be listed here.</p></Panel>;
  return (
    <Panel title="Past stories" detail={`${reports.length} total`}>
      <ul className="divide-y divide-stone-100">
        {[...reports].reverse().map((r) => {
          const g = GENRE_INFO[r.genre];
          return (
            <li key={r.id} className="flex items-center gap-4 py-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: g?.bg, color: g?.ink }}>
                <span className="h-6 w-6">{g?.icon}</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.storyTitle}</div>
                <div className="text-sm text-muted">
                  {g?.label ?? r.genre} · {formatDate(r.createdAt)} · {formatDuration(r.durationSeconds)}
                  {r.demo && <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 text-xs">sample</span>}
                </div>
              </div>
              <span className="rounded-full bg-[#eef6f4] px-3 py-1 font-display text-lg font-semibold tabular-nums text-[#1f5f57]">{r.thinkingScore}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
