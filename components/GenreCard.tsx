import type { Genre } from "@/types/contract";
import { GENRE_INFO } from "@/lib/genres";

export function GenreCard({ genre, onClick }: { genre: Genre; onClick: () => void }) {
  const g = GENRE_INFO[genre];
  return (
    <button
      onClick={onClick}
      style={{ background: g.bg, color: g.ink }}
      className="group flex min-h-36 flex-col items-start justify-between rounded-[1.75rem] p-5 text-left shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift active:scale-[0.97]"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/70 text-3xl transition group-hover:scale-110" aria-hidden>
        {g.icon}
      </span>
      <span className="font-display text-xl font-semibold leading-tight">{g.label}</span>
    </button>
  );
}
