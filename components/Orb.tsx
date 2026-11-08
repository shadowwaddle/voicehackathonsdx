"use client";

// Speaking orb. `level` is 0-1 output volume; `speaking` switches the glow.
export function Orb({ level = 0, speaking = false, label }: { level?: number; speaking?: boolean; label?: string }) {
  const scale = 1 + Math.min(level, 1) * 0.18;
  return (
    <div className="relative grid place-items-center">
      <div
        className={`absolute h-72 w-72 rounded-full blur-3xl transition-opacity duration-500 sm:h-80 sm:w-80 ${
          speaking ? "bg-sun/50 opacity-100" : "bg-plum/30 opacity-70"
        }`}
      />
      <div
        className={`relative grid h-56 w-56 place-items-center rounded-full shadow-2xl transition-transform duration-100 sm:h-64 sm:w-64 ${
          speaking ? "" : "orb-idle"
        }`}
        style={{
          transform: speaking ? `scale(${scale})` : undefined,
          background: "radial-gradient(circle at 35% 30%, #fff3d6, #ffb36b 45%, #ff7a3d 75%, #c94f8a)",
        }}
      >
        <span className="text-7xl drop-shadow-sm sm:text-8xl" aria-hidden>🦉</span>
      </div>
      {label && (
        <div className="relative mt-6 rounded-full bg-white/80 px-5 py-2 font-display text-xl font-semibold shadow">
          {label}
        </div>
      )}
    </div>
  );
}
