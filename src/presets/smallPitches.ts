/**
 * フットサル・ビーチサッカー寸法（メートル）
 * FIFA Futsal / Beach Soccer Laws（国際試合レンジの中央値）
 */

/** 国際: 38–42 × 20–25 → 図面 40×20 */
export const FUTSAL_PITCH_M = {
  length: 40,
  width: 20,
  goalWidth: 3,
  penaltyR: 6,
  penaltySpot: 6,
  secondPenaltySpot: 10,
  centerCircleR: 3,
  cornerArcR: 0.25,
} as const;

export const FUTSAL_NORM = {
  penR: FUTSAL_PITCH_M.penaltyR / FUTSAL_PITCH_M.width,
  penSpot: FUTSAL_PITCH_M.penaltySpot / FUTSAL_PITCH_M.length,
  secondPenSpot: FUTSAL_PITCH_M.secondPenaltySpot / FUTSAL_PITCH_M.length,
  centerR: FUTSAL_PITCH_M.centerCircleR / FUTSAL_PITCH_M.width,
  cornerR: FUTSAL_PITCH_M.cornerArcR / FUTSAL_PITCH_M.width,
  goalHalfH: FUTSAL_PITCH_M.goalWidth / 2 / FUTSAL_PITCH_M.width,
} as const;

/** 国際: 35–37 × 26–28 → 図面 36×27 */
export const BEACH_PITCH_M = {
  length: 36,
  width: 27,
  goalWidth: 5.5,
  penaltyDepth: 9,
  penaltySpot: 9,
  centerCircleR: 5,
} as const;

export const BEACH_NORM = {
  penDepth: BEACH_PITCH_M.penaltyDepth / BEACH_PITCH_M.length,
  penSpot: BEACH_PITCH_M.penaltySpot / BEACH_PITCH_M.length,
  centerR: BEACH_PITCH_M.centerCircleR / BEACH_PITCH_M.width,
  goalHalfH: BEACH_PITCH_M.goalWidth / 2 / BEACH_PITCH_M.width,
} as const;

/** 5人制の既定ベンチ人数（スタメン5を除く） */
export const FIVE_A_SIDE_DEFAULT_BENCH = 7;
