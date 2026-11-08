import Link from "next/link";

export function Wordmark({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Birbal home">
      <span
        className={`grid place-items-center rounded-[40%] bg-sun text-white shadow-soft ${
          size === "lg" ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg"
        }`}
        aria-hidden
      >
        🦉
      </span>
      <span className={`font-display font-bold tracking-tight ${size === "lg" ? "text-4xl" : "text-2xl"}`}>
        Birbal
      </span>
    </Link>
  );
}
