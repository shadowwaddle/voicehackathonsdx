import { GENRE_INFO, type Storybook } from "@/types/contract";

// Storybook HTML page hosted in Daytona. Owned by sthavir007's lane: restyle freely,
// just keep the function signature.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const list = (items: string[]) =>
  items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "<p>—</p>";

export function renderStorybookHtml(book: Storybook): string {
  const g = GENRE_INFO[book.genre] ?? { label: book.genre, emoji: "📖" };
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(book.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root{--ink:#2b2350;--paper:#fffaf0;--accent:#ff8a3d;--soft:#f3e8ff}
  *{box-sizing:border-box}body{margin:0;background:linear-gradient(160deg,#ffe8cc,#e9d8ff);font-family:Nunito,sans-serif;color:var(--ink);min-height:100vh;padding:24px 16px}
  .book{max-width:720px;margin:0 auto;background:var(--paper);border-radius:28px;padding:40px 32px;box-shadow:0 20px 60px rgba(43,35,80,.18)}
  .tag{display:inline-block;background:var(--soft);border-radius:999px;padding:6px 14px;font-weight:700}
  h1{font-family:Fredoka,sans-serif;font-size:clamp(28px,6vw,44px);margin:16px 0 8px;line-height:1.1}
  h2{font-family:Fredoka,sans-serif;color:var(--accent);margin:28px 0 8px}
  p,li{font-size:19px;line-height:1.6}ul{padding-left:22px}
  .chars{display:flex;flex-wrap:wrap;gap:8px}.chars span{background:#fff;border:2px solid var(--soft);border-radius:12px;padding:6px 12px;font-weight:700}
  footer{margin-top:32px;font-size:14px;opacity:.6;text-align:center}
</style></head><body>
<article class="book">
  <span class="tag">${g.emoji} ${esc(g.label)}</span>
  <h1>${esc(book.title)}</h1>
  <h2>The Story</h2><p>${esc(book.summary)}</p>
  <h2>Characters</h2><div class="chars">${book.characters.map((c) => `<span>${esc(c)}</span>`).join("")}</div>
  <h2>Your Brilliant Choices</h2>${list(book.choices)}
  <h2>Puzzles You Solved</h2>${list(book.puzzles_solved)}
  <footer>Told by Birbal · ${new Date(book.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}</footer>
</article></body></html>`;
}
