"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParentSettings } from "@/hooks/useParentSettings";
import { PinPad } from "@/components/PinPad";
import { Wordmark } from "@/components/Wordmark";
import { PrivacyTimeline } from "@/components/dashboard/PrivacyTimeline";

// First run, parent only: explain the privacy flow, get consent, set a PIN.
// Kids can't start a story until this is done (see app/page.tsx and app/story/page.tsx).
export default function WelcomePage() {
  const router = useRouter();
  const { update, ready } = useParentSettings();
  const [step, setStep] = useState<"intro" | "new" | "confirm">("intro");
  const [pin, setPin] = useState("");

  if (!ready) return null;

  return (
    <main className="min-h-dvh bg-stone-50 px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="py-2"><Wordmark size="sm" /></header>

        {step === "intro" ? (
          <div className="rise mt-6 space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2f8f83]">For grown-ups</p>
              <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Before the first story</h1>
              <p className="mt-2 text-muted">
                Birbal is a voice storyteller. Your child talks to it out loud, so it uses the microphone. Here is exactly what
                happens to what your child says.
              </p>
            </div>
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <PrivacyTimeline />
            </section>
            <ul className="space-y-2 rounded-3xl bg-white p-6 text-[15px] text-muted shadow-sm ring-1 ring-black/5">
              <li>• Birbal never asks for your child&apos;s name, school or location.</li>
              <li>• Scores compare your child only with their own past stories.</li>
              <li>• You can delete everything at any time in the dashboard&apos;s Privacy tab.</li>
            </ul>
            <button
              onClick={() => setStep("new")}
              className="w-full rounded-2xl bg-ink py-4 font-display text-xl font-semibold text-white shadow-soft transition active:scale-[0.99]"
            >
              I&apos;m the parent and I agree
            </button>
          </div>
        ) : (
          <div className="rise mx-auto mt-10 max-w-md rounded-3xl bg-white p-8 shadow-soft ring-1 ring-black/5">
            <PinPad
              key={step}
              title={step === "new" ? "Create a parent PIN" : "Enter it once more"}
              hint={step === "new" ? "4 digits your child won't guess" : "To make sure it's right"}
              onComplete={(p) => {
                if (step === "new") {
                  setPin(p);
                  setStep("confirm");
                  return true;
                }
                if (p !== pin) {
                  setStep("new");
                  return false;
                }
                update({ pin: p, consentAt: new Date().toISOString() });
                router.replace("/");
                return true;
              }}
            />
            <button onClick={() => setStep("intro")} className="mt-6 w-full text-sm font-medium text-muted hover:text-ink">Back</button>
          </div>
        )}
      </div>
    </main>
  );
}
