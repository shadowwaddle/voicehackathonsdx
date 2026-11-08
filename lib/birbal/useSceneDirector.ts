"use client";
import { useCallback, useRef, useState } from "react";
import type { Scene, SceneDebug } from "@/types/contract";
import { applyMatch, sceneFromText } from "./sceneFromText";

const AGENT_HOLD_MS = 15000;

/** One scene for both voice hooks: an agent set_scene outranks keywords for 15 seconds. */
export function useSceneDirector() {
  const [scene, setScene] = useState<Scene | null>(null);
  const [debug, setDebug] = useState<SceneDebug>({ source: "none", keyword: null });
  const agentUntil = useRef(0);
  const current = useRef<Scene | null>(null);
  const visited = useRef<Scene[]>([]);

  const show = useCallback((next: Scene) => {
    current.current = next;
    if (!visited.current.some((s) => s.location === next.location)) visited.current.push(next);
    setScene(next);
  }, []);

  const fromAgent = useCallback((next: Scene) => {
    agentUntil.current = Date.now() + AGENT_HOLD_MS;
    show(next);
    setDebug((d) => ({ ...d, source: "agent" }));
  }, [show]);

  const fromLine = useCallback((text: string) => {
    if (Date.now() < agentUntil.current) return;
    const match = sceneFromText(text);
    if (!match) return;
    show(applyMatch(current.current, match));
    setDebug({ source: "keywords", keyword: match.keyword });
  }, [show]);

  /** New story: start from the card's own colors. */
  const reset = useCallback((seedText: string) => {
    agentUntil.current = 0;
    current.current = null;
    visited.current = [];
    setScene(null);
    const match = sceneFromText(seedText);
    if (match) show(applyMatch(null, match));
    setDebug({ source: match ? "keywords" : "none", keyword: match?.keyword ?? null });
  }, [show]);

  const scenesSeen = useCallback(() => visited.current, []);

  return { scene, debug, fromAgent, fromLine, reset, scenesSeen };
}
