import type { Scene, SceneDebug } from "@/types/contract";

// Only rendered with ?debug=1.
export function DebugOverlay({ scene, debug, volume }: { scene: Scene | null; debug: SceneDebug; volume: number }) {
  return (
    <div data-testid="debug" data-source={debug.source} data-keyword={debug.keyword ?? ""} data-volume={volume}
      className="fixed bottom-3 left-3 z-30 rounded-xl bg-black/75 p-3 font-mono text-xs leading-5 text-white">
      <div>source: {debug.source}</div>
      <div>keyword: {debug.keyword ?? "-"}</div>
      <div>mood: {scene?.mood ?? "-"}</div>
      <div>volume: {volume.toFixed(2)}</div>
      <div className="mt-1 flex gap-1" data-testid="swatches">
        {(scene?.palette ?? []).map((c, i) => <span key={i} title={c} className="h-4 w-4 rounded" style={{ background: c }} />)}
      </div>
    </div>
  );
}
