"use client";
import { useState } from "react";
import type { DeletionStatus, SessionReport } from "@/types/contract";
import { Panel, formatDate } from "./ui";
import { PrivacyTimeline } from "./PrivacyTimeline";

const time = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Row({ ok, skipped, text }: { ok: boolean; skipped?: boolean; text: string }) {
  const tone = ok ? "text-emerald-700" : skipped ? "text-muted" : "text-amber-700";
  return (
    <li className={`flex items-center gap-2 text-sm ${tone}`}>
      <span aria-hidden className="w-4 text-center font-semibold">{ok ? "✓" : skipped ? "–" : "!"}</span>
      {text}
    </li>
  );
}

const recording = (s: DeletionStatus, what: string) =>
  s === "deleted" ? `${what} deleted` : s === "skipped" ? `${what}: nothing to delete` : `${what}: deletion failed, check ElevenLabs`;

export function PrivacyTab({ reports, onDeleteEverything }: { reports: SessionReport[]; onDeleteEverything: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-4">
      <Panel title="What happens to your child's voice">
        <PrivacyTimeline />
        <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-muted">
          The storybook page (story title, summary, your child&apos;s choices and words learned) is hosted in its own Daytona sandbox.
          Its link stops working once that sandbox has been idle for 24 hours.
        </p>
      </Panel>

      <Panel title="Deletion receipts" detail="One per story">
        {reports.length === 0 ? (
          <p className="text-muted">Receipts appear here after each story.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {[...reports].reverse().map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-medium">{r.storyTitle}</span>
                  <span className="shrink-0 text-sm text-muted">{r.demo ? formatDate(r.createdAt) : time(r.deletion.at)}</span>
                </div>
                {r.demo ? (
                  <p className="mt-1 text-sm text-muted">Sample data: no recording existed, so there was nothing to delete.</p>
                ) : (
                  <ul className="mt-1.5 space-y-0.5">
                    <Row ok={r.deletion.audio === "deleted"} skipped={r.deletion.audio === "skipped"} text={recording(r.deletion.audio, "Audio")} />
                    <Row ok={r.deletion.transcript === "deleted"} skipped={r.deletion.transcript === "skipped"} text={recording(r.deletion.transcript, "Transcript")} />
                    <Row ok={r.deletion.sandbox === "destroyed"} text={r.deletion.sandbox === "destroyed" ? "Scoring sandbox destroyed" : "Scoring sandbox: delete failed (it removes itself once stopped)"} />
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Delete everything" detail="Can't be undone">
        <p className="text-sm text-muted">Removes all reports, saved stories and settings from this device. You&apos;ll set Birbal up again afterwards.</p>
        <button onClick={() => setConfirm(true)} className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-black/10 hover:ring-rose-300">
          Delete everything
        </button>
      </Panel>

      {confirm && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/30 p-4" role="dialog" aria-modal aria-labelledby="del-title">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h2 id="del-title" className="font-display text-xl font-semibold">Delete everything?</h2>
            <p className="mt-2 text-sm text-muted">
              {reports.length} report{reports.length === 1 ? "" : "s"}, all saved stories and your settings will be removed from this device.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirm(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted hover:text-ink">Cancel</button>
              <button onClick={onDeleteEverything} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white">Delete everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
