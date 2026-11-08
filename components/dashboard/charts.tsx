// Hand-built SVG charts (no chart library). Colors use currentColor-friendly neutrals.
import { formatDate } from "./ui";

const ACCENT = "#2f8f83";

export function LineChart({ points }: { points: { value: number; date: string; label: string }[] }) {
  const W = 640, H = 240, L = 36, R = 16, T = 16, B = 34;
  const n = points.length;
  const x = (i: number) => L + (n === 1 ? (W - L - R) / 2 : (i / (n - 1)) * (W - L - R));
  const y = (v: number) => T + (1 - v / 100) * (H - T - B);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = `${path} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
  const labelIdx = n <= 4 ? points.map((_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Thinking Score over ${n} stories`}>
      <defs>
        <linearGradient id="score-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0.22" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e7e2da" strokeDasharray={v === 0 ? undefined : "3 5"} />
          <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#9a93a8">{v}</text>
        </g>
      ))}
      <path d={area} fill="url(#score-fill)" />
      <path d={path} fill="none" stroke={ACCENT} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={i === n - 1 ? 6 : 4.5} fill="#fff" stroke={ACCENT} strokeWidth="2.5">
            <title>{`${p.label}: ${p.value}`}</title>
          </circle>
          {i === n - 1 && (
            <text x={x(i)} y={y(p.value) - 12} textAnchor="middle" fontSize="13" fontWeight="600" fill="#3a3150">{p.value}</text>
          )}
        </g>
      ))}
      {labelIdx.map((i) => (
        <text key={i} x={x(i)} y={H - 10} textAnchor={i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle"} fontSize="11" fill="#9a93a8">
          {formatDate(points[i].date)}
        </text>
      ))}
    </svg>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  const W = 120, H = 36;
  if (values.length < 2) return <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-28" aria-hidden />;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * (W - 6) + 3).toFixed(1)},${(H - 4 - ((v - min) / span) * (H - 8)).toFixed(1)}`);
  const last = pts[pts.length - 1].split(",");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-28" aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={ACCENT} />
    </svg>
  );
}
