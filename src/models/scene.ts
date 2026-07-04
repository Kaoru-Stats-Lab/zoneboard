import type { BoardDocument, HideHalf, Piece, Scene, ScenePhase } from "./types";
import { uid } from "./id";

export function createScene(
  label: string,
  phase: ScenePhase = "custom",
  base?: Pick<Scene, "pieces" | "ball" | "objects">,
): Scene {
  return {
    id: uid(),
    label,
    phase,
    pieces: base ? structuredClone(base.pieces) : [],
    ball: base ? { ...base.ball } : { x: 0.5, y: 0.5 },
    objects: base ? structuredClone(base.objects) : [],
    hideHalf: "none",
  };
}

export function getActiveScene(board: BoardDocument): Scene {
  return (
    board.scenes.find((s) => s.id === board.activeSceneId) ?? board.scenes[0]
  );
}

export function mapActiveScene(
  board: BoardDocument,
  fn: (scene: Scene) => Scene,
): BoardDocument {
  const activeId = board.activeSceneId;
  return {
    ...board,
    scenes: board.scenes.map((s) => (s.id === activeId ? fn(s) : s)),
  };
}

/** ピッチ内かつ指定ハーフの駒を隠す。ベンチ帯は常に表示 */
export function isPieceDrawn(piece: Piece, hideHalf: HideHalf): boolean {
  if (piece.visible === false) return false;
  if (piece.role === "bench") return true;
  if (piece.x < 0 || piece.x > 1 || piece.y < 0 || piece.y > 1) return true;
  if (hideHalf === "left" && piece.x < 0.5) return false;
  if (hideHalf === "right" && piece.x >= 0.5) return false;
  return true;
}
