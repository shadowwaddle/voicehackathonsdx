import Link from "next/link";

export function TopBar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sun text-2xl shadow-md">🦉</span>
        <span className="font-display text-3xl font-bold tracking-tight">Birbal</span>
      </Link>
      {right}
    </header>
  );
}
