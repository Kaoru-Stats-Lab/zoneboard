import type { SportId } from "../models/types";

/** Logical W:H ratios (SPEC §6) */
export const SPORT_RATIO: Record<SportId, { w: number; h: number }> = {
  soccer: { w: 105, h: 68 },
  futsal: { w: 40, h: 20 },
  beach_soccer: { w: 36, h: 27 },
  basketball: { w: 28, h: 15 },
  volleyball: { w: 18, h: 9 },
};

/**
 * バスケ「ハーフ」ビューのワールド x 開始位置（0–1）。
 * センターサークル全体＋自陣寄りの低い攻撃を含める（厳密なハーフライン切りではない）。
 * 0.36 ≈ センターより約 4 m バックコート側。
 */
export const BASKET_HALF_START = 0.36;

export function aspectFor(
  sport: SportId,
  pitchView: "full" | "half",
): number {
  const { w, h } = SPORT_RATIO[sport];
  if (sport === "soccer" && pitchView === "half") {
    return w / 2 / h;
  }
  if (sport === "basketball" && pitchView === "half") {
    return (w * (1 - BASKET_HALF_START)) / h;
  }
  return w / h;
}
