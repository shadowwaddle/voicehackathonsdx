"use client";
import { useEffect, useState } from "react";
import { renderLocalBook } from "@/lib/birbal/localBook";
import { readBook } from "@/lib/birbal/shareBook";

// Opens a storybook from the data inside its own link. The sandboxed iframe keeps it inert.
export default function BookPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    readBook(window.location.hash.slice(1)).then((b) => setHtml(renderLocalBook(b))).catch(() => setFailed(true));
  }, []);
  if (failed) return <p className="p-8 text-center text-lg">This storybook link looks incomplete. Try scanning it again.</p>;
  if (!html) return null;
  return <iframe title="Storybook" srcDoc={html} sandbox="" className="fixed inset-0 h-full w-full border-0" />;
}
