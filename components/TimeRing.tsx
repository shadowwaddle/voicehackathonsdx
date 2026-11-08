// Gentle ring that empties as story time runs out.
export function TimeRing({ elapsed, totalSeconds }: { elapsed: number; totalSeconds: number }) {
  const left = Math.max(0, totalSeconds - elapsed);
  const frac = totalSeconds > 0 ? left / totalSeconds : 0;
  const r = 20;
  const c = 2 * Math.PI * r;
  const mins = Math.ceil(left / 60);
  return (
    <div className="relative grid h-14 w-14 place-items-center" role="timer" aria-label={`${mins} minutes left`}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="rgb(255 255 255 / 0.7)" stroke="rgb(58 49 80 / 0.1)" strokeWidth="5" />
        <circle
          cx="24" cy="24" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
          stroke={frac < 0.15 ? "#e57f3c" : "#86c5a0"}
          strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 1s" }}
        />
      </svg>
      <span className="relative text-sm font-semibold tabular-nums">{mins}m</span>
    </div>
  );
}
