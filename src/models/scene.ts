import type {
  BallState,
  BoardDocument,
  DrawObject,
  HideHalf,
  Piece,
  Scene,
  ScenePhase,
  TeamFocus,
  Viewport,
} from "./types";
import { uid } from "./id";
import { clampViewport, DEFAULT_VIEWPORT } from "../presets/viewport";

function rotateNorm180(n: number): number {
  return 1 - n;
}

function rotateFacing180(facing: number): number {
  return (facing + 180) % 360;
}

function swapHideHalf(h: HideHalf): HideHalf {
  if (h === "left") return "right";
  if (h === "right") return "left";
  return "none";
}

function rotateBall180(ball: BallState): BallState {
  return {
    ...ball,
    x: rotateNorm180(ball.x),
    y: rotateNorm180(ball.y),
  };
}

function rotatePiece180(p: Piece): Piece {
  return {
    ...p,
    x: rotateNorm180(p.x),
    y: rotateNorm180(p.y),
    facing: rotateFacing180(p.facing),
  };
}

function rotateObject180(obj: DrawObject): DrawObject {
  if (obj.type === "line" || obj.type === "pen") {
    return {
      ...obj,
      points: obj.points.map((pt) => ({
        ...pt,
        x: rotateNorm180(pt.x),
        y: rotateNorm180(pt.y),
      })),
    };
  }
  if (obj.type === "link") {
    // Anchored to piece ids; piece positions are rotated separately.
    return obj;
  }
  if (obj.type === "zone") {
    return {
      ...obj,
      x: rotateNorm180(obj.x + obj.w),
      y: rotateNorm180(obj.y + obj.h),
    };
  }
  return {
    ...obj,
    x: rotateNorm180(obj.x),
    y: rotateNorm180(obj.y),
  };
}

/**
 * 前後半のエンドチェンジ用。ピッチ中心で 180° 回転（鏡反転ではない）。
 * 駒・向き・ボール・描画・ハーフ非表示を対象。チーム色は変えない。
 */
export function swapSceneEnds(scene: Scene): Scene {
  return {
    ...scene,
    pieces: scene.pieces.map(rotatePiece180),
    ball: rotateBall180(scene.ball),
    objects: scene.objects.map(rotateObject180),
    hideHalf: swapHideHalf(scene.hideHalf),
  };
}

/** @deprecated Use swapSceneEnds */
export const mirrorSceneHorizontal = swapSceneEnds;

/** 画角の注視点もエンドチェンジに合わせて 180° 回転（ズームはそのまま） */
export function swapViewportEnds(vp: Viewport): Viewport {
  return {
    ...vp,
    cx: rotateNorm180(vp.cx),
    cy: rotateNorm180(vp.cy),
  };
}

/** @deprecated Use swapViewportEnds */
export const mirrorViewportHorizontal = swapViewportEnds;

/** 局面の画角。未指定は board 移行値 → DEFAULT */
export function sceneViewport(
  scene: Pick<Scene, "viewport">,
  boardFallback?: Viewport,
): Viewport {
  return clampViewport(
    scene.viewport ?? boardFallback ?? DEFAULT_VIEWPORT,
  );
}

/** アクティブ局面の画角（描画・Export の正本） */
export function activeViewport(board: BoardDocument): Viewport {
  return sceneViewport(getActiveScene(board), board.viewport);
}

/** drawBoard / fitField 用。viewport をアクティブ局面に揃えた board */
export function boardWithActiveViewport(board: BoardDocument): BoardDocument {
  return { ...board, viewport: activeViewport(board) };
}

export function createScene(
  label: string,
  phase: ScenePhase = "custom",
  base?: Pick<Scene, "pieces" | "ball" | "objects" | "viewport">,
): Scene {
  return {
    id: uid(),
    label,
    phase,
    pieces: base ? structuredClone(base.pieces) : [],
    ball: base ? { ...base.ball } : { x: 0.5, y: 0.5 },
    objects: base ? structuredClone(base.objects) : [],
    hideHalf: "none",
    teamFocus: "both",
    viewport: base?.viewport ? { ...base.viewport } : undefined,
    notes: "",
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

/**
 * 描画・ヒット対象か。
 * teamFocus（所属）→ visible → hideHalf（空間）。ベンチは hideHalf では隠さない。
 */
export function isPieceDrawn(
  piece: Piece,
  scene: Pick<Scene, "hideHalf" | "teamFocus">,
): boolean {
  if (piece.visible === false) return false;
  const focus: TeamFocus = scene.teamFocus ?? "both";
  if (focus === "home" && piece.team !== "home") return false;
  if (focus === "away" && piece.team !== "away") return false;
  if (piece.role === "bench") return true;
  if (piece.x < 0 || piece.x > 1 || piece.y < 0 || piece.y > 1) return true;
  const hideHalf = scene.hideHalf;
  if (hideHalf === "left" && piece.x < 0.5) return false;
  if (hideHalf === "right" && piece.x >= 0.5) return false;
  return true;
}
