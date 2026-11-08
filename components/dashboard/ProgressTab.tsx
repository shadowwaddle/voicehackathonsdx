"use client";
import type { SessionReport } from "@/types/contract";
import { Panel } from "./ui";
import { LineChart, Sparkline } from "./charts";
import { METRICS, compare, valueOf } from "./insights";

export function ProgressTab({ reports }: { reports: SessionReport[] }) {
  if (reports.length < 3) {
    return (
      <Panel>
        <div className="py-10 text-center">
          <h2 className="font-display text-2xl font-semibold">Trends appear after 3 stories.</h2>
          <p className="mt-2 text-muted">{reports.length} of 3 so far. We only ever compare your child with their own past stories.</p>
        </div>
      </Panel>
    );
  }
  const rows = compare(reports);
  return (
    <div className="space-y-4">
      <Panel title="Thinking Score" detail={`${reports.length} stories`}>
        <LineChart points={reports.map((r) => ({ value: r.thinkingScore, date: r.createdAt, label: r.storyTitle }))} />
      </Panel>
      <Panel title="First 3 stories vs last 3" detail="Compared only with their own past">
        <ul className="divide-y divide-stone-100">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{row.label}</div>
                <div className="text-sm text-muted">{row.text}</div>
              </div>
              <Sparkline values={reports.map((r) => valueOf(r, row.key))} />
              <span className={`w-16 text-right text-sm font-semibold tabular-nums ${row.pct >= 5 ? "text-emerald-700" : "text-muted"}`}>
                {row.pct > 0 ? "+" : ""}{row.pct}%
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
