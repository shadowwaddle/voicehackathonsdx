"use client";
import type { ReactNode } from "react";
import { ConversationProvider } from "@elevenlabs/react";

// useConversation (inside hooks/useVoiceAgent.ts) must run under this provider.
export default function StoryLayout({ children }: { children: ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}
