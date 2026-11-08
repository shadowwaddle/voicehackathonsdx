"use client";
import { useEffect, useRef, useState } from "react";
import type { Mood, Scene } from "@/types/contract";

// Full-bleed, softly animated watercolor background with simple blob characters.
// Canvas paints drifting translucent pigment blobs; SVG turbulence filters bleed the
// edges and add paper grain. The current speaker's blob grows and talks with `volume`.

const PAPER = "#fdf6ea";
const DEFAULT_PALETTE = ["#f7d3b0", "#f2c2c8", "#d6cbf0", "#c6e3dc", "#fae3a0"];
const BLOB_COUNT = 8;
const FADE_MS = 2000;
const FRAME_MS = 1000 / 30; // 30fps is plenty for slow paint and kinder to iPads
const RESOLUTION = 0.5; // canvas pixels per CSS pixel; blur hides it

const MOODS: Record<Mood, { speed: number; saturate: number; brightness: number }> = {
  calm: { speed: 0.6, saturate: 0.95, brightness: 1 },
  happy: { speed: 1, saturate: 1.1, brightness: 1.03 },
  mysterious: { speed: 0.4, saturate: 0.75, brightness: 0.84 },
  exciting: { speed: 1.5, saturate: 1.3, brightness: 1.05 },
  silly: { speed: 1.25, saturate: 1.15, brightness: 1.04 },
};

type RGB = [number, number, number];

function hexToRgb(hex: string, fallback: RGB = [240, 210, 190]): RGB {
  const m = hex.trim().replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (!/^[0-9a-f]{6}$/i.test(full)) return fallback;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;

// Deterministic pseudo-random so the layout is stable between renders.
const seeded = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const BLOBS = Array.from({ length: BLOB_COUNT }, (_, i) => ({
  x: 0.1 + seeded(i) * 0.8,
  y: 0.1 + seeded(i + 20) * 0.8,
  r: 0.26 + seeded(i + 40) * 0.2,
  phase: seeded(i + 60) * Math.PI * 2,
  drift: 0.6 + seeded(i + 80) * 0.6,
}));

function paletteFor(scene: Scene | null): RGB[] {
  const p = scene?.palette?.length ? scene.palette : DEFAULT_PALETTE;
  return BLOBS.map((_, i) => hexToRgb(p[i % p.length]));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function WatercolorCanvas({ scene, volume }: { scene: Scene | null; volume: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const mood = MOODS[scene?.mood ?? "calm"] ?? MOODS.calm;

  // Animation state lives in refs so the loop never restarts on prop changes.
  const colors = useRef({ from: paletteFor(null), to: paletteFor(null), current: paletteFor(null), start: 0 });
  const speed = useRef(mood.speed);
  speed.current = mood.speed;
  const redraw = useRef<() => void>(() => {});

  const paletteKey = (scene?.palette ?? []).join(",");
  useEffect(() => {
    const c = colors.current;
    c.from = c.current;
    c.to = paletteFor(scene);
    c.start = performance.now();
    redraw.current();
    // paletteKey captures the only part of scene this effect needs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * RESOLUTION));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * RESOLUTION));
    };
    resize();

    let t = 0;
    let last = performance.now();
    let lastDraw = 0;
    let raf = 0;

    const paint = (now: number) => {
      const { width: w, height: h } = canvas;
      const c = colors.current;
      const k = reduced ? 1 : ease(Math.min(1, (now - c.start) / FADE_MS));
      c.current = c.from.map((f, i) => mix(f, c.to[i], k));

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "multiply";

      const size = Math.max(w, h);
      BLOBS.forEach((b, i) => {
        const cx = (b.x + Math.sin(t * 0.07 * b.drift + b.phase) * 0.08) * w;
        const cy = (b.y + Math.cos(t * 0.06 * b.drift + b.phase * 1.3) * 0.08) * h;
        const R = b.r * size;
        const col = c.current[i];

        // Wobbly outline, like pigment spreading unevenly.
        ctx.beginPath();
        for (let s = 0; s <= 48; s++) {
          const a = (s / 48) * Math.PI * 2;
          const wob = 1 + 0.07 * Math.sin(3 * a + t * 0.08 + b.phase) + 0.04 * Math.sin(5 * a - t * 0.05 * b.drift);
          const x = cx + Math.cos(a) * R * wob;
          const y = cy + Math.sin(a) * R * wob;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        // Pigment pools slightly at the edges, then fades out.
        const g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.08);
        g.addColorStop(0, rgba(col, 0.22));
        g.addColorStop(0.72, rgba(col, 0.3));
        g.addColorStop(0.9, rgba(col, 0.38));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.fill();
      });
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < FRAME_MS) return;
      t += (Math.min(now - last, 100) / 1000) * speed.current * 10;
      last = now;
      lastDraw = now;
      paint(now);
    };

    redraw.current = () => paint(performance.now());
    const ro = new ResizeObserver(() => {
      resize();
      paint(performance.now());
    });
    ro.observe(canvas);

    if (reduced) paint(performance.now());
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      redraw.current = () => {};
    };
  }, [reduced]);

  const characters = (scene?.characters ?? []).slice(0, 4);
  const speaker = scene?.speaker?.trim().toLowerCase() ?? "";

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden style={{ background: PAPER }}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="wc-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wc-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wc-paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11" />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.55 0" />
          </filter>
        </defs>
      </svg>

      {/* Pigment layer. Oversized so displaced edges never show the frame. */}
      <div
        className="absolute -inset-[6%]"
        style={{
          filter: `saturate(${mood.saturate}) brightness(${mood.brightness})`,
          transition: "filter 2s ease",
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" style={{ filter: "url(#wc-bleed) blur(6px)" }} />
      </div>

      {/* Characters */}
      <svg className="absolute inset-x-0 bottom-0 h-[55%] w-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMax meet">
        {characters.map((ch, i) => {
          const n = characters.length;
          const x = (1000 / (n + 1)) * (i + 1);
          const isSpeaker = ch.name.trim().toLowerCase() === speaker;
          return (
            <Character
              key={ch.name}
              x={x}
              y={330 + (i % 2) * 40}
              color={hexToRgb(ch.color)}
              speaking={isSpeaker}
              volume={isSpeaker ? volume : 0}
              delay={i * 0.6}
              reduced={reduced}
            />
          );
        })}
      </svg>

      {/* Paper grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.22] mix-blend-multiply">
        <rect width="100%" height="100%" filter="url(#wc-paper)" />
      </svg>
    </div>
  );
}

function Character({
  x, y, color, speaking, volume, delay, reduced,
}: { x: number; y: number; color: RGB; speaking: boolean; volume: number; delay: number; reduced: boolean }) {
  const v = Math.min(1, Math.max(0, volume));
  const scale = speaking ? 1.08 + v * 0.08 : 1;
  const mouthOpen = speaking ? 2 + v * 14 : 0;
  const light = mix(color, [255, 255, 255], 0.45);

  return (
    <g transform={`translate(${x} ${y})`} style={{ animation: "wc-wash 2s ease both" }}>
      <g className={reduced ? undefined : "bob"} style={{ animationDelay: `${delay}s` }}>
        <g style={{ transform: `scale(${scale})`, transformBox: "fill-box", transformOrigin: "50% 100%", transition: "transform 180ms ease-out" }}>
          <g filter="url(#wc-edge)">
            <ellipse cx="0" cy="0" rx="92" ry="86" fill={rgba(color, 0.78)} />
            <ellipse cx="-22" cy="-28" rx="44" ry="34" fill={rgba(light, 0.55)} />
          </g>
          <circle cx="-26" cy="-8" r="8" fill="#3a3150" />
          <circle cx="26" cy="-8" r="8" fill="#3a3150" />
          <circle cx="-23" cy="-11" r="2.5" fill="#fff" />
          <circle cx="29" cy="-11" r="2.5" fill="#fff" />
          {mouthOpen > 3 ? (
            <ellipse cx="0" cy="26" rx="13" ry={mouthOpen} fill="#5a3a4a" />
          ) : (
            <path d="M -12 22 Q 0 33 12 22" stroke="#3a3150" strokeWidth="5" strokeLinecap="round" fill="none" />
          )}
        </g>
      </g>
    </g>
  );
}
