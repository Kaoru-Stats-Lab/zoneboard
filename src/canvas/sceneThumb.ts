import type { BoardDocument, DrawObject, Scene } from "../models/types";
import { sceneViewport } from "../models/scene";
import { DEFAULT_VIEWPORT } from "../presets/viewport";
import { drawBoard } from "./drawBoard";
import { outerFillForBoard } from "./drawPitch";
import { fitField } from "./layout";

const cache = new Map<string, { url: string; w: number; h: number }>();
const MAX_CACHE = 80;

function objectThumbSig(obj: DrawObject): string {
  switch (obj.type) {
    case "shape":
      return `sh:${obj.kind}:${obj.fillColor}:${obj.fillOpacity}:${obj.strokeEnabled !== false ? 1 : 0}:${obj.x.toFixed(2)},${obj.y.toFixed(2)},${obj.w.toFixed(2)},${obj.h.toFixed(2)},${obj.rotationDeg ?? 0}`;
    case "text":
      return `tx:${obj.text.slice(0, 48)}:${obj.color}:${obj.fontSize}:${obj.align ?? ""}:${obj.x.toFixed(2)},${obj.y.toFixed(2)},${obj.rotationDeg ?? 0},${obj.width ?? ""}`;
    case "zone":
      return `zn:${obj.color}:${obj.x.toFixed(2)},${obj.y.toFixed(2)},${obj.w.toFixed(2)},${obj.h.toFixed(2)}`;
    case "line":
      return `ln:${obj.kind}:${obj.points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(";")}`;
    case "pen":
      return `pn:${obj.points.length}:${obj.points[0]?.x.toFixed(2) ?? ""},${obj.points[0]?.y.toFixed(2) ?? ""}`;
    case "link":
      return `lk:${obj.pieceIds.join(",")}`;
    default: {
      const unk = obj as { type?: string; id?: string };
      return `unk:${unk.type ?? "?"}:${unk.id ?? ""}`;
    }
  }
}

/** Compact fingerprint — invalidate when pitch content changes. */
export function sceneThumbRevision(board: BoardDocument, scene: Scene): string {
  const pieces = scene.pieces
    .map(
      (p) =>
        `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.team[0]},${p.role[0]},${(p.color ?? "").slice(0, 7)},${p.number ?? ""}`,
    )
    .join(";");
  const ball = scene.balls
    .map(
      (b) =>
        `${b.id.slice(0, 6)}:${b.x.toFixed(2)},${b.y.toFixed(2)},${b.attachedTo ?? ""}`,
    )
    .join(";");
  const objects = scene.objects.map(objectThumbSig).join(";");
  return [
    board.sport,
    board.soccerPitchSurface ?? "",
    board.pitchOrientation ?? "",
    board.pitchView ?? "",
    board.pieceScale ?? 1,
    board.homeColor ?? "",
    board.awayColor ?? "",
    board.homeAccentColor ?? "",
    board.awayAccentColor ?? "",
    board.homeGkColor ?? "",
    board.awayGkColor ?? "",
    scene.hideHalf,
    scene.teamFocus ?? "",
    objects,
    ball,
    pieces,
  ].join("|");
}

export type SceneThumbOptions = {
  /**
   * Extra cache namespace (e.g. File Library entry id).
   * Prevents collisions when two files share board.id / scene.id but differ in content
   * that revision might under-represent — and isolates library thumbs from Editor cache.
   */
  cacheScope?: string;
  /**
   * Use full default viewport instead of the scene's saved zoom/pan.
   * Recommended for small Dashboard list thumbs.
   */
  overview?: boolean;
};

function cacheKey(
  scope: string,
  boardId: string,
  sceneId: string,
  cssW: number,
  rev: string,
  overview: boolean,
): string {
  return `${scope}|${boardId}:${sceneId}:${cssW}:${overview ? "ov" : "sc"}:${rev}`;
}

function trimCache() {
  while (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/** Drop thumbs for a File Library entry (or any cacheScope prefix). */
export function clearSceneThumbCacheScope(scope: string): void {
  if (!scope) return;
  const prefix = `${scope}|`;
  for (const key of [...cache.keys()]) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

/** Clear all scene thumbs (tests / rare resets). */
export function clearSceneThumbCache(): void {
  cache.clear();
}

/**
 * Tiny / medium pitch preview as PNG data URL.
 * Always draws with interactiveChrome:false.
 * Failures return null — UI must fall back to text-only.
 */
export function getSceneThumbDataUrl(
  board: BoardDocument,
  scene: Scene,
  cssW: number,
  opts: SceneThumbOptions = {},
): { url: string; w: number; h: number } | null {
  const w = Math.max(24, Math.round(cssW));
  const rev = sceneThumbRevision(board, scene);
  const overview = opts.overview === true;
  const scope = opts.cacheScope ?? "";
  const key = cacheKey(scope, board.id, scene.id, w, rev, overview);
  const hit = cache.get(key);
  if (hit) return hit;

  try {
    const view = overview
      ? { ...DEFAULT_VIEWPORT }
      : sceneViewport(scene, board.viewport);
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
      interactiveChrome: false,
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

/** Resolve scene for Dashboard preview (active → first). */
export function resolvePreviewScene(
  board: BoardDocument,
  sceneId?: string | null,
): Scene | null {
  if (!board.scenes.length) return null;
  if (sceneId) {
    const hit = board.scenes.find((s) => s.id === sceneId);
    if (hit) return hit;
  }
  return (
    board.scenes.find((s) => s.id === board.activeSceneId) ?? board.scenes[0] ?? null
  );
}
