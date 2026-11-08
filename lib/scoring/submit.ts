import type { ReportRequest, SessionReport } from "@/types/contract";

// Called by the voice hooks when a story ends. Sends the transcript once for scoring
// (the server deletes the ElevenLabs conversation too) and returns only the numbers.
// With no child turns there is nothing to score, so it only asks for deletion.
export async function submitReport(req: ReportRequest): Promise<SessionReport | null> {
  const childTurns = req.transcript.filter((l) => l.role === "child").length;
  try {
    if (childTurns === 0) {
      if (req.conversationId) {
        await fetch("/api/delete-conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: req.conversationId }),
        });
      }
      return null;
    }
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null;
    return (await res.json()) as SessionReport;
  } catch {
    return null;
  }
}
