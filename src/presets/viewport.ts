import type { Viewport } from "../models/types";

export const DEFAULT_VIEWPORT: Viewport = { zoom: 1, cx: 0.5, cy: 0.5 };

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;

/**
 * 画角プリセット（駒は消さない・カメラだけ動かす）
 * CK / スローイン / ペナ / ファイナルサード（攻撃側 1/3）
 *
 * 座標系: x=0 左ゴール、x=1 右ゴール。
 * ファイナルサード = ゴール前の縦 1/3（x∈[0,1/3] または [2/3,1]）
 */
export type ViewPresetId =
  | "full"
  | "final-third-left"
  | "final-third-right"
  | "corner-tl"
  | "corner-tr"
  | "corner-bl"
  | "corner-br"
  | "throw-top"
  | "throw-bottom"
  | "pen-left"
  | "pen-right";

export const VIEW_PRESETS: Record<ViewPresetId, Viewport> = {
  full: { zoom: 1, cx: 0.5, cy: 0.5 },
  // 攻撃側 1/3 + ゴール裏バッファが収まる画角
  "final-third-left": { zoom: 2.35, cx: 0.17, cy: 0.5 },
  "final-third-right": { zoom: 2.35, cx: 0.83, cy: 0.5 },
  "corner-tl": { zoom: 2.4, cx: 0.14, cy: 0.14 },
  "corner-tr": { zoom: 2.4, cx: 0.86, cy: 0.14 },
  "corner-bl": { zoom: 2.4, cx: 0.14, cy: 0.86 },
  "corner-br": { zoom: 2.4, cx: 0.86, cy: 0.86 },
  "throw-top": { zoom: 2.1, cx: 0.5, cy: 0.06 },
  "throw-bottom": { zoom: 2.1, cx: 0.5, cy: 0.94 },
  "pen-left": { zoom: 2.5, cx: 0.12, cy: 0.5 },
  "pen-right": { zoom: 2.5, cx: 0.88, cy: 0.5 },
};

export function clampViewport(vp: Viewport): Viewport {
  const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vp.zoom));
  return {
    zoom,
    cx: Math.min(1.1, Math.max(-0.1, vp.cx)),
    cy: Math.min(1.1, Math.max(-0.1, vp.cy)),
  };
}
