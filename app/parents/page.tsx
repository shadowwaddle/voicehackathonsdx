"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParentSettings } from "@/hooks/useParentSettings";
import { useSavedStories } from "@/hooks/useSavedStories";
import { useReports } from "@/hooks/useReports";
import { PinPad } from "@/components/PinPad";
import { BackIcon, CheckIcon } from "@/components/Icons";
import { Tabs } from "@/components/dashboard/ui";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ProgressTab } from "@/components/dashboard/ProgressTab";
import { StoriesTab } from "@/components/dashboard/StoriesTab";
import { PrivacyTab } from "@/components/dashboard/PrivacyTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { demoHistory } from "@/components/dashboard/insights";

const TABS = ["Overview", "Progress", "Stories", "Privacy", "Settings"] as const;
type Tab = (typeof TABS)[number];
const MOCK = process.env.NEXT_PUBLIC_MOCK_AGENT === "1";

export default function ParentsPage() {
  const router = useRouter();
  const { settings, update, ready } = useParentSettings();
  const { stories, clearStories } = useSavedStories();
  const { reports, replaceAll } = useReports();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !settings.consentAt) router.replace("/parents/welcome");
  }, [ready, settings.consentAt, router]);

  const sorted = useMemo(() => [...reports].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [reports]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };
  const save = (patch: Parameters<typeof update>[0]) => {
    update(patch);
    flash("Saved");
  };
  const loadDemo = () => {
    const demo = demoHistory();
    replaceAll([...sorted.filter((r) => !r.id.startsWith("demo-")), ...demo].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    setTab("Overview");
    flash("Demo history loaded");
  };
  const deleteEverything = () => {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("birbal.")).forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable: nothing stored */
    }
    window.location.assign("/parents/welcome");
  };

  if (!ready || !settings.consentAt) return null;

  return (
    <main className="min-h-dvh bg-stone-50 px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-white hover:text-ink">
            <BackIcon className="h-4 w-4" /> Back to Birbal
          </Link>
          <span aria-live="polite" className={`text-sm font-medium text-emerald-700 transition ${toast ? "opacity-100" : "opacity-0"}`}>
            {toast ?? "Saved"} <CheckIcon className="inline h-4 w-4" />
          </span>
        </header>

        {!unlocked ? (
          <div className="rise mx-auto mt-10 max-w-md rounded-3xl bg-white p-8 shadow-soft ring-1 ring-black/5">
            <PinPad
              title="Grown-ups only"
              hint="Enter your 4-digit PIN"
              onComplete={(p) => {
                if (p !== settings.pin) return false;
                setUnlocked(true);
                return true;
              }}
            />
          </div>
        ) : (
          <div className="rise mt-4 space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold">Parent dashboard</h1>
              <p className="mt-1 text-muted">How your child thinks out loud, compared only with their own past stories.</p>
            </div>
            <Tabs tabs={TABS} value={tab} onChange={setTab} />
            {tab === "Overview" && <OverviewTab reports={sorted} onLoadDemo={MOCK ? loadDemo : undefined} />}
            {tab === "Progress" && <ProgressTab reports={sorted} />}
            {tab === "Stories" && <StoriesTab reports={sorted} />}
            {tab === "Privacy" && <PrivacyTab reports={sorted} onDeleteEverything={deleteEverything} />}
            {tab === "Settings" && (
              <SettingsTab
                settings={settings}
                save={save}
                storiesCount={stories.length}
                onClearStories={() => { clearStories(); flash("Stories cleared"); }}
                onLoadDemo={loadDemo}
                onPinChanged={() => flash("PIN changed")}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
