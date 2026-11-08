"use client";
import type { SessionReport } from "@/types/contract";
import { GENRE_INFO } from "@/lib/genres";
import { Panel, Stat, formatDate } from "./ui";
import { insight } from "./insights";

export function OverviewTab({ reports }: { reports: SessionReport[] }) {
  const latest = reports[reports.length - 1];
  if (!latest) {
    return (
      <Panel>
        <div className="py-10 text-center">
          <h2 className="font-display text-2xl font-semibold">No stories yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            After each story you&apos;ll see how your child thought out loud: their ideas, reasons and questions.
            We compare them only with their own past stories.
          </p>
        </div>
      </Panel>
    );
  }
  const prev = reports[reports.length - 2];
  const delta = prev ? latest.thinkingScore - prev.thinkingScore : 0;
  const m = latest.metrics;

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing score={latest.thinkingScore} />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted">Latest story · {formatDate(latest.createdAt)}</div>
            <h2 className="mt-1 truncate font-display text-2xl font-semibold">{latest.storyTitle}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted">
              <span className="inline-block h-4 w-4" style={{ color: GENRE_INFO[latest.genre]?.ink }}>{GENRE_INFO[latest.genre]?.icon}</span>
              {GENRE_INFO[latest.genre]?.label ?? latest.genre}
            </div>
            {prev && (
              <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${delta > 0 ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-muted"}`}>
                <span aria-hidden>{delta > 0 ? "↑" : delta < 0 ? "↘" : "→"}</span>
                {delta > 0 ? `${delta} points since last story` : delta < 0 ? "A bit lower than last time" : "Same as last time"}
              </div>
            )}
          </div>
        </div>
        <p className="mt-6 rounded-2xl bg-[#eef6f4] px-4 py-3 text-[#1f5f57]">{insight(reports)}</p>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Share of the talking" value={`${Math.round(m.talkShare * 100)}%`} hint="Child's words vs Birbal's" />
        <Stat label="Original ideas" value={m.originalIdeas} hint="New ideas Birbal hadn't said" />
        <Stat label="Reasoning answers" value={m.reasoningAnswers} hint={`"because", "maybe", "I think"…`} />
        <Stat label="Words learned" value={m.wordsLearned} hint="Language Adventure" />
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-36 w-36 shrink-0 place-items-center self-center" role="img" aria-label={`Thinking Score ${score} out of 100`}>
      <svg viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#efeae3" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke="#2f8f83" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="text-center">
        <div className="font-display text-4xl font-semibold tabular-nums">{score}</div>
        <div className="text-[10px] font-medium uppercase tracking-wide text-muted">Thinking<br />Score</div>
      </div>
    </div>
  );
}
