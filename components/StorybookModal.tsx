"use client";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import type { StorybookResult } from "@/types/contract";

export function StorybookModal({ storybook }: { storybook: StorybookResult }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm" role="dialog" aria-modal aria-labelledby="sb-title">
      <div className="rise w-full max-w-lg overflow-hidden rounded-[2rem] bg-paper shadow-lift">
        <div className="bg-[#fae3a0] px-8 pb-6 pt-8 text-center">
          <div className="text-5xl" aria-hidden>📖</div>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-ink/60">Mystery solved!</p>
          <h2 id="sb-title" className="mt-1 font-display text-3xl font-bold leading-tight">{storybook.title}</h2>
        </div>
        <div className="flex flex-col items-center gap-5 p-8">
          <div className="rounded-3xl bg-white p-4 shadow-soft">
            <QRCodeSVG value={storybook.url} size={168} fgColor="#3a3150" bgColor="#ffffff" level="M" />
          </div>
          <p className="-mt-2 text-sm text-muted">Grown-ups: scan to keep this storybook</p>
          <a
            href={storybook.url} target="_blank" rel="noreferrer"
            className="w-full rounded-full bg-sun py-4 text-center font-display text-xl font-bold text-white shadow-soft transition hover:bg-sun-deep"
          >
            Open storybook
          </a>
          <Link href="/" className="font-display text-lg font-semibold text-muted hover:text-ink">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
