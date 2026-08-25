import type {
  BallState,
  BoardDocument,
  DrawObject,
  HideHalf,
  Piece,
  Scene,
  ScenePhase,
  Viewport,
} from "./types";
import { uid } from "./id";

function mirrorX(x: number): number {
  return 1 - x;
}

function mirrorFacingHorizontal(facing: number): number {
  return (360 - facing) % 360;
}

function mirrorHideHalf(h: HideHalf): HideHalf {
  if (h === "left") return "right";
  if (h === "right") return "left";
  return "none";
}

function mirrorBall(ball: BallState): BallState {
  return { ...ball, x: mirrorX(ball.x) };
}

function mirrorPiece(p: Piece): Piece {
  return {
    ...p,
    x: mirrorX(p.x),
    facing: mirrorFacingHorizontal(p.facing),
  };
}

function mirrorObject(obj: DrawObject): DrawObject {
  if (obj.type === "line" || obj.type === "pen") {
    return {
      ...obj,
      points: obj.points.map((pt) => ({ ...pt, x: mirrorX(pt.x) })),
    };
  }
  if (obj.type === "zone") {
    return { ...obj, x: mirrorX(obj.x + obj.w) };
  }
  return { ...obj, x: mirrorX(obj.x) };
}

/**
 * 前後半のエンドチェンジ用。ピッチ中心で左右ミラー。
 * 駒・向き・ボール・描画・ハーフ非表示を対象。チーム色は変えない。
 */
export function mirrorSceneHorizontal(scene: Scene): Scene {
  return {
    ...scene,
    pieces: scene.pieces.map(mirrorPiece),
    ball: mirrorBall(scene.ball),
    objects: scene.objects.map(mirrorObject),
    hideHalf: mirrorHideHalf(scene.hideHalf),
  };
}

/** 画角の注視点も左右入れ替え（ズームはそのまま） */
export function mirrorViewportHorizontal(vp: Viewport): Viewport {
  return { ...vp, cx: mirrorX(vp.cx) };
}

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
