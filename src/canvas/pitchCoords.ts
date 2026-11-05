import type { BoardDocument } from "../models/types";
import { BASKET_HALF_START, effectivePitchOrientation } from "../presets/sports";

/** World (full-pitch norm) → visible pitch norm for current view. */
export function worldToPitch(
  x: number,
  y: number,
  board: BoardDocument,
): { x: number; y: number } | null {
  // バッファ（サブ・ゴール裏・タッチ外）は常に表示
  if (y < 0 || y > 1 || x < 0 || x > 1) return { x, y };
  if (board.pitchView !== "half") {
    return { x, y };
  }
  if (board.sport === "basketball") {
    const start = BASKET_HALF_START;
    const end = 1 - BASKET_HALF_START;
    if (board.pitchFlipped) {
      if (x < -0.02 || x > end + 0.02) return null;
      return { x: Math.min(1, Math.max(0, x / end)), y };
    }
    if (x < start - 0.02 || x > 1.02) return null;
    return {
      x: Math.min(1, Math.max(0, (x - start) / (1 - start))),
      y,
    };
  }
  if (board.sport !== "soccer") {
    return { x, y };
  }
  // 縦: 長さ＝y。ハーフは下半分（flip 時は上）
  if (
    effectivePitchOrientation(board.sport, board.pitchOrientation) ===
    "portrait"
  ) {
    const visY = board.pitchFlipped ? (0.5 - y) * 2 : (y - 0.5) * 2;
    if (visY < -0.02 || visY > 1.02) return null;
    return { x, y: Math.min(1, Math.max(0, visY)) };
  }
  const visX = board.pitchFlipped ? (0.5 - x) * 2 : (x - 0.5) * 2;
  if (visX < -0.02 || visX > 1.02) return null;
  return { x: Math.min(1, Math.max(0, visX)), y };
}

/** Visible pitch norm → world (full-pitch norm). */
export function pitchToWorld(
  x: number,
  y: number,
  board: BoardDocument,
): { x: number; y: number } {
  if (y < 0 || y > 1 || x < 0 || x > 1) return { x, y };
  if (board.pitchView !== "half") {
    return { x, y };
  }
  if (board.sport === "basketball") {
    const start = BASKET_HALF_START;
    const end = 1 - BASKET_HALF_START;
    if (board.pitchFlipped) {
      return { x: x * end, y };
    }
    return { x: start + x * (1 - start), y };
  }
  if (board.sport !== "soccer") {
    return { x, y };
  }
  if (
    effectivePitchOrientation(board.sport, board.pitchOrientation) ===
    "portrait"
  ) {
    if (board.pitchFlipped) {
      return { x, y: 0.5 - y / 2 };
    }
    return { x, y: 0.5 + y / 2 };
  }
  if (board.pitchFlipped) {
    return { x: 0.5 - x / 2, y };
  }
  return { x: 0.5 + x / 2, y };
}
