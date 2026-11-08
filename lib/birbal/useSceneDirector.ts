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

  const fromAgent = useCallback((next: Scene) => {
    agentUntil.current = Date.now() + AGENT_HOLD_MS;
    setScene(next);
    setDebug((d) => ({ ...d, source: "agent" }));
  }, []);

  const fromLine = useCallback((text: string) => {
    if (Date.now() < agentUntil.current) return;
    const match = sceneFromText(text);
    if (!match) return;
    setScene((prev) => applyMatch(prev, match));
    setDebug({ source: "keywords", keyword: match.keyword });
  }, []);

  /** New story: start from the card's own colors. */
  const reset = useCallback((seedText: string) => {
    agentUntil.current = 0;
    const match = sceneFromText(seedText);
    setScene(match ? applyMatch(null, match) : null);
    setDebug({ source: match ? "keywords" : "none", keyword: match?.keyword ?? null });
  }, []);

  return { scene, debug, fromAgent, fromLine, reset };
}
