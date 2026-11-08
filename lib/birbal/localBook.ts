import type { StorybookRequest } from "@/types/contract";

// Served by the app itself when Daytona can't build the storybook.
const MAX_BOOKS = 200;
const g = globalThis as unknown as { __localBooks?: Map<string, string> };
const books = (g.__localBooks ??= new Map());

const esc = (v: unknown) => String(v).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const list = (title: string, items: string[]) =>
  items.length ? `<section><h2>${title}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></section>` : "";

function render(b: StorybookRequest): string {
  const words = (b.wordsLearned ?? []).map((w) => `${w.word}: ${w.translation}`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.title)}</title>
<style>body{margin:0;padding:24px 16px;background:linear-gradient(160deg,#ffe8cc,#e9d8ff);color:#2b2350;font-family:Georgia,serif}section{max-width:680px;margin:0 auto 20px;background:#fffaf0;border-radius:24px;padding:28px}h1{font-size:38px;margin:0}h2{color:#c8622a}p,li{font-size:20px;line-height:1.6}</style></head><body>
<section><h1>${esc(b.title)}</h1><p>Told by Birbal</p></section>
<section><h2>The Story</h2><p>${esc(b.summary)}</p></section>
${list("Places you visited", b.scenes.map((s) => s.location))}${list("Friends you met", b.characters.map((c) => c.name))}${list("Your choices", b.choices)}${list("Puzzles you solved", b.puzzles_solved)}${list("Words you learned", words)}
</body></html>`;
}

export function saveLocalBook(b: StorybookRequest): string {
  const id = crypto.randomUUID();
  if (books.size >= MAX_BOOKS) books.delete(books.keys().next().value!);
  books.set(id, render(b));
  return id;
}

export const getLocalBook = (id: string): string | undefined => books.get(id);
