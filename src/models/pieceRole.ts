/**
 * ベンチ帯だけ小さくする。
 * タッチライン際（スローイン）・ゴール裏は試合中のプレーなのでフルサイズ。
 *
 * ピッチ: y ∈ [0, 1]
 * アクティブ外帯: 線のすぐ外側（フルサイズ）
 * ベンチ帯: y <= -BENCH_BAND または y >= 1 + BENCH_BAND
 */
export const BENCH_BAND = 0.05;

export function roleFromPosition(
  _x: number,
  y: number,
): "starter" | "bench" {
  if (y <= -BENCH_BAND || y >= 1 + BENCH_BAND) return "bench";
  return "starter";
}
