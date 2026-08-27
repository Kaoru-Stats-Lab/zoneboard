import type { BoardDocument, LineKind, ToolId } from "../models/types";
import {
  LINE_COLORS,
  TOOL_COLORS,
  ZONE_COLORS,
} from "../models/types";
import { kitsFromBoard } from "../models/kits";

export function usesGrassInk(board?: BoardDocument | null): boolean {
  return board?.sport === "soccer" && !!board.showGrassPitch;
}

/**
 * 芝生ピッチ向けインク。
 * 白地パレットは彩度・輝度が足りず、旧 Run の緑は地色と衝突した。
 * Run は放送グラフィック慣習に合わせ黄系へ（芝生時のみ）。黄は芝と差があるので白ハローは付けない。
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
/** 構成線（Link）— ピッチ白と Pen と差をつける象牙。STUDIO 字色と同系。 */
export const LINK_INK_GRASS = "#f3f3f1";
export const LINK_SHADOW_GRASS = "rgba(0, 0, 0, 0.48)";
export const HALO_INK_GRASS = "rgba(255, 255, 255, 0.9)";

export function lineColorForBoard(
  board: BoardDocument | null | undefined,
  kind: LineKind,
): string {
  return usesGrassInk(board) ? LINE_COLORS_GRASS[kind] : LINE_COLORS[kind];
}

export function zoneColorsForBoard(board: BoardDocument | null | undefined) {
  return usesGrassInk(board) ? ZONE_COLORS_GRASS : ZONE_COLORS;
}

export function penColorForBoard(board: BoardDocument | null | undefined): string {
  return usesGrassInk(board) ? PEN_INK_GRASS : "#111111";
}

export function linkColorForBoard(board: BoardDocument | null | undefined): string {
  return usesGrassInk(board) ? LINK_INK_GRASS : "#111111";
}

export function textColorForBoard(board: BoardDocument | null | undefined): string {
  return usesGrassInk(board) ? PEN_INK_GRASS : "#111111";
}

export function toolColorForBoard(
  board: BoardDocument | null | undefined,
  tool: ToolId,
): string {
  if (board && tool === "piece-home") return kitsFromBoard(board).home;
  if (board && tool === "piece-away") return kitsFromBoard(board).away;
  if (!usesGrassInk(board)) return TOOL_COLORS[tool];
  if (
    tool === "pass" ||
    tool === "run" ||
    tool === "dribble" ||
    tool === "screen"
  ) {
    return LINE_COLORS_GRASS[tool];
  }
  if (tool === "zone") return ZONE_COLORS_GRASS.stroke;
  if (tool === "link") return LINK_INK_GRASS;
  if (tool === "pen" || tool === "text") return PEN_INK_GRASS;
  return TOOL_COLORS[tool];
}

/** 芝生上の戦術線用白ハロー幅。Pen には使わない（白インク＋ハローは太くホバーに見える）。 */
export function grassHaloWidth(lw: number): number {
  return Math.max(2.5, lw * 1.85);
}
