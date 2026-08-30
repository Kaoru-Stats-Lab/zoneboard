import type { SportId, Viewport } from "../models/types";

export const DEFAULT_VIEWPORT: Viewport = { zoom: 1, cx: 0.5, cy: 0.5 };

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;

export function clampViewport(vp: Viewport): Viewport {
  const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vp.zoom));
  return {
    zoom,
    cx: Math.min(1.1, Math.max(-0.1, vp.cx)),
    cy: Math.min(1.1, Math.max(-0.1, vp.cy)),
  };
}

/**
 * layout.FIELD_BUFFER と揃える（viewport → layout の依存を避けるためここにも定数）。
 * cam 辺 = WORLD_SPAN / zoom。
 */
const FIELD_BUFFER_FOR_CAM = 0.14;
const WORLD_SPAN = 1 + 2 * FIELD_BUFFER_FOR_CAM;

/**
 * ゴール裏・ピッチサイドのはみ出し上限（ピッチ正規化 0..1）。
 * キャプチャ再現・ブランド用の「規定余白」。中心合わせで外側を広げない。
 */
export const CAPTURE_OUTSIDE_MARGIN = 0.035;

type OutsidePin = {
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
};

/**
 * 必須矩形を覆う正方形カメラ。外側ピン辺は CAPTURE_OUTSIDE_MARGIN までに抑え、
 * 余った辺長はピッチ内側へ回す（ゴール前センター寄せでゴール裏が膨らむのを防ぐ）。
 */
export function viewportCoveringRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  pin: OutsidePin,
  margin = CAPTURE_OUTSIDE_MARGIN,
): Viewport {
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);

  let side = Math.max(right - left, bottom - top, 0.2);
  if (pin.left) side = Math.max(side, right + margin);
  if (pin.right) side = Math.max(side, 1 + margin - left);
  if (pin.top) side = Math.max(side, bottom + margin);
  if (pin.bottom) side = Math.max(side, 1 + margin - top);

  let camLeft = pin.left
    ? -margin
    : pin.right
      ? 1 + margin - side
      : (left + right) / 2 - side / 2;
  let camTop = pin.top
    ? -margin
    : pin.bottom
      ? 1 + margin - side
      : (top + bottom) / 2 - side / 2;

  for (let i = 0; i < 3; i++) {
    if (right > camLeft + side) {
      if (pin.left) side = right - camLeft;
      else if (pin.right) {
        side = Math.max(side, right - left, 1 + margin - left);
        camLeft = 1 + margin - side;
      } else camLeft = right - side;
    }
    if (left < camLeft) {
      if (pin.right) {
        side = Math.max(side, right - left, 1 + margin - left);
        camLeft = 1 + margin - side;
      } else if (pin.left) side = Math.max(side, right - camLeft);
      else camLeft = left;
    }
    if (bottom > camTop + side) {
      if (pin.top) side = bottom - camTop;
      else if (pin.bottom) {
        side = Math.max(side, bottom - top, 1 + margin - top);
        camTop = 1 + margin - side;
      } else camTop = bottom - side;
    }
    if (top < camTop) {
      if (pin.bottom) {
        side = Math.max(side, bottom - top, 1 + margin - top);
        camTop = 1 + margin - side;
      } else if (pin.top) side = Math.max(side, bottom - camTop);
      else camTop = top;
    }
  }

  const zoom = WORLD_SPAN / side;
  const half = side / 2;
  return clampViewport({
    zoom,
    cx: camLeft + half,
    cy: camTop + half,
  });
}

/**
 * 画角プリセット（駒は消さない・カメラだけ動かす）
 * 競技ごとに語彙・画角が違う（局面タブで出し分け）
 */
export type ViewPresetId =
  | "full"
  // soccer
  | "final-third-left"
  | "final-third-right"
  | "corner-tl"
  | "corner-tr"
  | "corner-bl"
  | "corner-br"
  | "throw-top"
  | "throw-bottom"
  | "pen-left"
  | "pen-right"
  | "ck-setup-left"
  | "ck-setup-right"
  // basketball
  | "bball-front-right"
  | "bball-front-left"
  | "bball-paint-right"
  | "bball-paint-left"
  | "bball-top"
  | "bball-corner-tr"
  | "bball-corner-br"
  | "bball-corner-tl"
  | "bball-corner-bl"
  | "bball-wing-top"
  | "bball-wing-bot"
  | "bball-transition"
  // futsal / beach (goal-oriented, no CK/FT jargon)
  | "goal-left"
  | "goal-right"
  | "mid-left"
  | "mid-right";

/** CK 解説の必須面積（角〜ハーフ付近）。外側はピンで規定余白のみ */
const CK_TO_HALF = 0.52;
const CK_FAR_Y = 0.22; // ペナ遠方〜反対タッチ側の動き

export const VIEW_PRESETS: Record<ViewPresetId, Viewport> = {
  full: { zoom: 1, cx: 0.5, cy: 0.5 },
  "final-third-left": { zoom: 2.35, cx: 0.17, cy: 0.5 },
  "final-third-right": { zoom: 2.35, cx: 0.83, cy: 0.5 },
  /**
   * CK 角: 必須面積＋外側は規定余白のみ（ゴール裏をセンター寄せで膨らませない）。
   * docs/VIEWPORT_RESEARCH.md
   */
  "corner-tl": viewportCoveringRect(0, 0, CK_TO_HALF, 1 - CK_FAR_Y, {
    left: true,
    top: true,
  }),
  "corner-tr": viewportCoveringRect(1 - CK_TO_HALF, 0, 1, 1 - CK_FAR_Y, {
    right: true,
    top: true,
  }),
  "corner-bl": viewportCoveringRect(0, CK_FAR_Y, CK_TO_HALF, 1, {
    left: true,
    bottom: true,
  }),
  "corner-br": viewportCoveringRect(1 - CK_TO_HALF, CK_FAR_Y, 1, 1, {
    right: true,
    bottom: true,
  }),
  "throw-top": { zoom: 2.1, cx: 0.5, cy: 0.06 },
  "throw-bottom": { zoom: 2.1, cx: 0.5, cy: 0.94 },
  "pen-left": { zoom: 2.5, cx: 0.12, cy: 0.5 },
  "pen-right": { zoom: 2.5, cx: 0.88, cy: 0.5 },
  /** 攻撃エンド俯瞰。ゴール裏は規定余白、幅はピッチ内寄り */
  "ck-setup-left": viewportCoveringRect(0, 0.06, CK_TO_HALF, 0.94, {
    left: true,
  }),
  "ck-setup-right": viewportCoveringRect(1 - CK_TO_HALF, 0.06, 1, 0.94, {
    right: true,
  }),
  // バスケ（フロントコート中心・ペイント・コーナー・トランジション）
  "bball-front-right": { zoom: 1.45, cx: 0.7, cy: 0.5 },
  "bball-front-left": { zoom: 1.45, cx: 0.3, cy: 0.5 },
  "bball-paint-right": { zoom: 2.35, cx: 0.9, cy: 0.5 },
  "bball-paint-left": { zoom: 2.35, cx: 0.1, cy: 0.5 },
  "bball-top": { zoom: 2.0, cx: 0.72, cy: 0.5 },
  "bball-corner-tr": { zoom: 2.45, cx: 0.92, cy: 0.1 },
  "bball-corner-br": { zoom: 2.45, cx: 0.92, cy: 0.9 },
  "bball-corner-tl": { zoom: 2.45, cx: 0.08, cy: 0.1 },
  "bball-corner-bl": { zoom: 2.45, cx: 0.08, cy: 0.9 },
  "bball-wing-top": { zoom: 2.15, cx: 0.8, cy: 0.2 },
  "bball-wing-bot": { zoom: 2.15, cx: 0.8, cy: 0.8 },
  "bball-transition": { zoom: 1.55, cx: 0.5, cy: 0.5 },
  "goal-left": { zoom: 2.2, cx: 0.14, cy: 0.5 },
  "goal-right": { zoom: 2.2, cx: 0.86, cy: 0.5 },
  "mid-left": { zoom: 1.8, cx: 0.35, cy: 0.5 },
  "mid-right": { zoom: 1.8, cx: 0.65, cy: 0.5 },
};

/** Camera AABB in pitch-normalized coords (square; may extend past 0..1). */
export function cameraNormRect(vp: Viewport): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const { zoom, cx, cy } = clampViewport(vp);
  const side = WORLD_SPAN / zoom;
  return { x: cx - side / 2, y: cy - side / 2, w: side, h: side };
}

export function viewportMatchesPreset(vp: Viewport, id: ViewPresetId): boolean {
  const p = VIEW_PRESETS[id];
  return (
    Math.abs(vp.zoom - p.zoom) < 0.08 &&
    Math.abs(vp.cx - p.cx) < 0.04 &&
    Math.abs(vp.cy - p.cy) < 0.04
  );
}

export type ViewPresetEntry = { id: ViewPresetId; key: string };

/** 局面タブに出す画角ボタン（競技別） */
export function viewPresetsForSport(sport: SportId): ViewPresetEntry[] {
  if (sport === "basketball") {
    return [
      { id: "full", key: "viewFull" },
      { id: "bball-front-right", key: "viewBballFrontR" },
      { id: "bball-front-left", key: "viewBballFrontL" },
      { id: "bball-paint-right", key: "viewBballPaintR" },
      { id: "bball-paint-left", key: "viewBballPaintL" },
      { id: "bball-top", key: "viewBballTop" },
      { id: "bball-wing-top", key: "viewBballWingT" },
      { id: "bball-wing-bot", key: "viewBballWingB" },
      { id: "bball-corner-tr", key: "viewBballCornerTR" },
      { id: "bball-corner-br", key: "viewBballCornerBR" },
      { id: "bball-corner-tl", key: "viewBballCornerTL" },
      { id: "bball-corner-bl", key: "viewBballCornerBL" },
      { id: "bball-transition", key: "viewBballTransition" },
    ];
  }
  if (sport === "futsal" || sport === "beach_soccer") {
    return [
      { id: "full", key: "viewFull" },
      { id: "goal-left", key: "viewGoalL" },
      { id: "goal-right", key: "viewGoalR" },
      { id: "mid-left", key: "viewMidL" },
      { id: "mid-right", key: "viewMidR" },
      { id: "corner-tl", key: "viewCornerTL" },
      { id: "corner-tr", key: "viewCornerTR" },
      { id: "corner-bl", key: "viewCornerBL" },
      { id: "corner-br", key: "viewCornerBR" },
    ];
  }
  if (sport === "volleyball") {
    return [
      { id: "full", key: "viewFull" },
      { id: "mid-left", key: "viewVolleyL" },
      { id: "mid-right", key: "viewVolleyR" },
    ];
  }
  // soccer
  return [
    { id: "full", key: "viewFull" },
    { id: "final-third-left", key: "viewFtL" },
    { id: "final-third-right", key: "viewFtR" },
    { id: "ck-setup-left", key: "viewCkSetupL" },
    { id: "ck-setup-right", key: "viewCkSetupR" },
    { id: "corner-bl", key: "viewCkBl" },
    { id: "corner-br", key: "viewCkBr" },
    { id: "corner-tl", key: "viewCkTl" },
    { id: "corner-tr", key: "viewCkTr" },
    { id: "throw-top", key: "viewThrowTop" },
    { id: "throw-bottom", key: "viewThrowBot" },
    { id: "pen-left", key: "viewPenL" },
    { id: "pen-right", key: "viewPenR" },
  ];
}
