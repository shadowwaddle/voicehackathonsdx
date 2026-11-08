import type { Caption } from "@/types/contract";

// Agent lines may start with a character tag, e.g. "[Captain Pip] Hello!" or
// "<Captain_Pip>Hello!</Captain_Pip>" (ElevenLabs multi-voice). Split it out.
export function toCaption(text: string, fromAgent: boolean): Caption {
  const id = crypto.randomUUID();
  if (!fromAgent) return { id, speaker: "child", text };
  const bracket = text.match(/^\s*\[([^\]]{1,40})\]\s*(.*)$/s);
  if (bracket) return { id, speaker: "birbal", character: bracket[1], text: bracket[2] };
  const tag = text.match(/^\s*<([\w-]{1,40})>(.*?)<\/\1>\s*(.*)$/s);
  if (tag) return { id, speaker: "birbal", character: tag[1].replace(/_/g, " "), text: (tag[2] + " " + tag[3]).trim() };
  return { id, speaker: "birbal", text: text.replace(/<\/?[\w-]+>/g, "") };
}
