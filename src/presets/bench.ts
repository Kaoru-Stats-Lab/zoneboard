/**
 * サブ（控え）人数。大会カテゴリではなく人数そのものを選ぶ。
 * 旧 benchLevel は migrate 時に人数へ変換する。
 */
export type BenchLevel =
  | "elementary"
  | "junior_high"
  | "high_school"
  | "university"
  | "adult";

/** @deprecated 旧データ互換のみ */
export const BENCH_MAX: Record<BenchLevel, number> = {
  elementary: 9,
  junior_high: 7,
  high_school: 7,
  university: 9,
  adult: 12,
};

export const BENCH_COUNT_MIN = 0;
export const BENCH_COUNT_MAX = 15;
export const DEFAULT_BENCH_COUNT = 12;

export const BENCH_COUNT_OPTIONS: number[] = Array.from(
  { length: BENCH_COUNT_MAX - BENCH_COUNT_MIN + 1 },
  (_, i) => BENCH_COUNT_MIN + i,
);

export function clampBenchCount(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_BENCH_COUNT;
  return Math.max(
    BENCH_COUNT_MIN,
    Math.min(BENCH_COUNT_MAX, Math.round(n)),
  );
}

export function resolveBenchCount(raw: {
  benchCount?: number;
  benchLevel?: BenchLevel;
}): number {
  if (typeof raw.benchCount === "number") return clampBenchCount(raw.benchCount);
  if (raw.benchLevel && raw.benchLevel in BENCH_MAX) {
    return BENCH_MAX[raw.benchLevel];
  }
  return DEFAULT_BENCH_COUNT;
}
