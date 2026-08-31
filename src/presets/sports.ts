import type { PitchOrientation, SportId } from "../models/types";

/** Logical W:H ratios (SPEC §6). Landscape = length:width. */
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

/**
 * キャンバス用の論理比（幅/高さ）。
 * orientation 省略・soccer 以外の portrait → landscape と同一（回帰ゼロ）。
 * サッカー portrait フルは 68:105（横の逆）。ハーフは縦世界の長さ半分。
 */
export function aspectFor(
  sport: SportId,
  pitchView: "full" | "half",
  orientation: PitchOrientation = "landscape",
): number {
  const { w, h } = SPORT_RATIO[sport];
  const portrait = orientation === "portrait" && sport === "soccer";
  if (portrait) {
    if (pitchView === "half") {
      return h / (w / 2);
    }
    return h / w;
  }
  if (sport === "soccer" && pitchView === "half") {
    return w / 2 / h;
  }
  if (sport === "basketball" && pitchView === "half") {
    return (w * (1 - BASKET_HALF_START)) / h;
  }
  return w / h;
}

/** soccer 以外は常に landscape。欠落は landscape。 */
export function effectivePitchOrientation(
  sport: SportId,
  orientation: PitchOrientation | undefined | null,
): PitchOrientation {
  if (sport !== "soccer") return "landscape";
  return orientation === "portrait" ? "portrait" : "landscape";
}
