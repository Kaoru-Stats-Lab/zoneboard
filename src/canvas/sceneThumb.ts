import type { BoardDocument, Scene } from "../models/types";
import { sceneViewport } from "../models/scene";
import { drawBoard } from "./drawBoard";
import { outerFillForBoard } from "./drawPitch";
import { fitField } from "./layout";

const cache = new Map<string, { url: string; w: number; h: number }>();
const MAX_CACHE = 80;

/** Compact fingerprint — invalidate when pitch content changes. */
export function sceneThumbRevision(board: BoardDocument, scene: Scene): string {
  const pieces = scene.pieces
    .map(
      (p) =>
        `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.team[0]},${p.role[0]},${(p.color ?? "").slice(0, 7)}`,
    )
    .join(";");
  const ball = `${scene.ball.x.toFixed(2)},${scene.ball.y.toFixed(2)}`;
  return [
    board.sport,
    board.soccerPitchSurface ?? "",
    board.pitchOrientation ?? "",
    board.pitchView ?? "",
    board.pieceScale ?? 1,
    board.homeColor ?? "",
    board.awayColor ?? "",
    scene.hideHalf,
    scene.teamFocus ?? "",
    scene.objects.length,
    ball,
    pieces,
  ].join("|");
}

function cacheKey(
  boardId: string,
  sceneId: string,
  cssW: number,
  rev: string,
): string {
  return `${boardId}:${sceneId}:${cssW}:${rev}`;
}

function trimCache() {
  while (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/**
 * Tiny / medium pitch preview as PNG data URL.
 * Failures return null — UI must fall back to text-only.
 */
export function getSceneThumbDataUrl(
  board: BoardDocument,
  scene: Scene,
  cssW: number,
): { url: string; w: number; h: number } | null {
  const w = Math.max(24, Math.round(cssW));
  const rev = sceneThumbRevision(board, scene);
  const key = cacheKey(board.id, scene.id, w, rev);
  const hit = cache.get(key);
  if (hit) return hit;

  try {
    const view = sceneViewport(scene, board.viewport);
    const boardView: BoardDocument = {
      ...board,
      viewport: view,
      activeSceneId: scene.id,
    };
    const probe = fitField(w * 4, w * 4, boardView, 2, view, 0);
    const aspect = probe.outer.w / Math.max(1, probe.outer.h);
    const h = Math.max(16, Math.round(w / aspect));

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const { outer, pitch } = fitField(w, h, boardView, 2, view, 0);
    const ground = outerFillForBoard(board);
    drawBoard(ctx, pitch, boardView, scene, {
      outer,
      background: ground,
      selectionColor: "#111111",
      watermark: null,
      watermarkImage: null,
      ballImage: null,
    });

    const result = {
      url: canvas.toDataURL("image/png"),
      w,
      h,
    };
    cache.set(key, result);
    trimCache();
    return result;
  } catch {
    return null;
  }
}

export function sceneThumbCssSize(cssW: number): { w: number; h: number } {
  const w = Math.max(24, Math.round(cssW));
  return { w, h: Math.round(w * 0.62) };
}
