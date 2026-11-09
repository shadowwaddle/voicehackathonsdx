import type { ReportRequest, SessionReport } from "@/types/contract";
import { STATIC_SITE } from "@/lib/birbal/platform";
import { buildReport, localMetrics, localScore } from "./localScore";

// Called by the voice hooks when a story ends. The server scores it, deletes the ElevenLabs
// conversation, and returns only numbers. Every story gets a report, whatever happens.
export async function submitReport(req: ReportRequest): Promise<SessionReport> {
  if (!STATIC_SITE) {
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (res.ok) return (await res.json()) as SessionReport;
    } catch {
      /* falls through to the on-device report */
    }
  }
  const metrics = localMetrics(req);
  const conversation = STATIC_SITE ? ("skipped" as const) : ("failed" as const);
  return buildReport(req, metrics, localScore(metrics), {
    audio: conversation, transcript: conversation, sandbox: "skipped", at: new Date().toISOString(),
  });
}
