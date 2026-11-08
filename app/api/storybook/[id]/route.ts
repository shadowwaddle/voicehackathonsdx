import { getLocalBook } from "@/lib/birbal/localBook";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const html = getLocalBook((await params).id);
  if (!html) return new Response("Storybook not found", { status: 404 });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
