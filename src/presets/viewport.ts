import type { SportId, Viewport } from "../models/types";

export const DEFAULT_VIEWPORT: Viewport = { zoom: 1, cx: 0.5, cy: 0.5 };

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;

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

export const VIEW_PRESETS: Record<ViewPresetId, Viewport> = {
  full: { zoom: 1, cx: 0.5, cy: 0.5 },
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
  /** 攻撃ハーフ全体（CK 配置・ゾーン説明向け） */
  "ck-setup-right": { zoom: 1.95, cx: 0.83, cy: 0.5 },
  "ck-setup-left": { zoom: 1.95, cx: 0.17, cy: 0.5 },
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

export function clampViewport(vp: Viewport): Viewport {
  const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vp.zoom));
  return {
    zoom,
    cx: Math.min(1.1, Math.max(-0.1, vp.cx)),
    cy: Math.min(1.1, Math.max(-0.1, vp.cy)),
  };
}
