import type { BoardDocument, LineKind, ToolId } from "../models/types";
import {
  LINE_COLORS,
  TOOL_COLORS,
  ZONE_COLORS,
  type SoccerPitchSurface,
} from "../models/types";
import { kitsFromBoard } from "../models/kits";

export function soccerPitchSurfaceOf(
  board?: BoardDocument | null,
): SoccerPitchSurface | null {
  if (board?.sport !== "soccer") return null;
  return board.soccerPitchSurface ?? "paper";
}

/** 芝面（緑縞）。描画・縞専用 */
export function usesGrassPitch(board?: BoardDocument | null): boolean {
  return soccerPitchSurfaceOf(board) === "grass";
}

export function usesSlatePitch(board?: BoardDocument | null): boolean {
  return soccerPitchSurfaceOf(board) === "slate";
}

/** 暗面インク（芝・スレート）。白パレットを載せない */
export function usesDarkPitchInk(board?: BoardDocument | null): boolean {
  const s = soccerPitchSurfaceOf(board);
  return s === "grass" || s === "slate";
}

/** @deprecated use usesDarkPitchInk — kept for gradual call-site renames */
export function usesGrassInk(board?: BoardDocument | null): boolean {
  return usesDarkPitchInk(board);
}

/**
 * 暗面向け戦術線インク。
 * 白地パレットは彩度・輝度が足りず、旧 Run の緑は芝と衝突した。
 * Run は放送グラフィック慣習に合わせ黄系（暗面時のみ）。黄は芝と差があるので白ハローは付けない。
 */
export const LINE_COLORS_GRASS = {
  pass: "#93c5fd",
  run: "#fde047",
  dribble: "#fdba74",
  screen: "#d8b4fe",
} as const;

export const ZONE_COLORS_GRASS = {
  fill: "rgba(147, 197, 253, 0.38)",
  stroke: "#f0f9ff",
} as const;

export const PEN_INK_GRASS = "#ffffff";
/** 構成線（Link）— 芝上で Pen 白と判別できるミディアムグレー */
export const LINK_INK_GRASS = "#959b95";
/** スレート: グレー on グレーを避ける一段明るい Link */
export const LINK_INK_SLATE = "#c5cbc5";
export const LINK_SHADOW_GRASS = "rgba(0, 0, 0, 0.28)";
export const HALO_INK_GRASS = "rgba(255, 255, 255, 0.9)";
/** スレート: 白ハロー禁止（ピッチ白線と干渉）→ 暗ハロー */
export const HALO_INK_SLATE = "rgba(0, 0, 0, 0.62)";

export function lineColorForBoard(
  board: BoardDocument | null | undefined,
  kind: LineKind,
): string {
  return usesDarkPitchInk(board) ? LINE_COLORS_GRASS[kind] : LINE_COLORS[kind];
}

export function zoneColorsForBoard(board: BoardDocument | null | undefined) {
  return usesDarkPitchInk(board) ? ZONE_COLORS_GRASS : ZONE_COLORS;
}

export function penColorForBoard(board: BoardDocument | null | undefined): string {
  return usesDarkPitchInk(board) ? PEN_INK_GRASS : "#111111";
}

export function linkColorForBoard(board: BoardDocument | null | undefined): string {
  if (usesSlatePitch(board)) return LINK_INK_SLATE;
  if (usesDarkPitchInk(board)) return LINK_INK_GRASS;
  return "#111111";
}

export function textColorForBoard(board: BoardDocument | null | undefined): string {
  return usesDarkPitchInk(board) ? PEN_INK_GRASS : "#111111";
}

/** 戦術線ハロー色。paper は null（ハローなし） */
export function pitchHaloInk(
  board: BoardDocument | null | undefined,
): string | null {
  if (usesSlatePitch(board)) return HALO_INK_SLATE;
  if (usesGrassPitch(board)) return HALO_INK_GRASS;
  return null;
}

export function toolColorForBoard(
  board: BoardDocument | null | undefined,
  tool: ToolId,
): string {
  if (board && tool === "piece-home") return kitsFromBoard(board).home;
  if (board && tool === "piece-away") return kitsFromBoard(board).away;
  if (!usesDarkPitchInk(board)) return TOOL_COLORS[tool];
  if (
    tool === "pass" ||
    tool === "run" ||
    tool === "dribble" ||
    tool === "screen"
  ) {
    return LINE_COLORS_GRASS[tool];
  }
  if (tool === "zone") return ZONE_COLORS_GRASS.stroke;
  if (tool === "link") return linkColorForBoard(board);
  if (tool === "pen" || tool === "text") return PEN_INK_GRASS;
  return TOOL_COLORS[tool];
}

/** 暗面上の戦術線用ハロー幅。Pen には使わない。 */
export function grassHaloWidth(lw: number): number {
  return Math.max(2.5, lw * 1.85);
}
