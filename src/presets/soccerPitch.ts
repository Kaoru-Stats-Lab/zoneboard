/**
 * FIFA / JFA 標準ピッチ寸法（メートル）
 * 105×68（推奨）。x = ゴール間（長さ105m）、y = タッチライン間（幅68m）
 *
 * 出典: IFAB Law 1 / Jリーグ
 * https://www.jleague.jp/a-to-z/football_pitch/
 */
export const SOCCER_PITCH_M = {
  length: 105,
  width: 68,
  goalWidth: 7.32,
  goalAreaDepth: 5.5,
  /** ゴールポスト内側からタッチライン方向（IFAB） */
  goalAreaSide: 5.5,
  penaltyAreaDepth: 16.5,
  penaltyAreaSide: 16.5,
  penaltySpot: 11,
  centerCircleR: 9.15,
  cornerArcR: 1,
  lineMaxM: 0.12,
} as const;

/** 法規から導出（105×68 固定） */
const PEN_AREA_WIDTH_M =
  SOCCER_PITCH_M.penaltyAreaSide * 2 + SOCCER_PITCH_M.goalWidth;
const GOAL_AREA_WIDTH_M =
  SOCCER_PITCH_M.goalAreaSide * 2 + SOCCER_PITCH_M.goalWidth;
const WIDE_LANE_M = (SOCCER_PITCH_M.width - PEN_AREA_WIDTH_M) / 2;
const CENTER_LANE_M = SOCCER_PITCH_M.centerCircleR * 2;
/** ペナ外側縦線〜センターサークル接線 */
const HALF_SPACE_M = PEN_AREA_WIDTH_M / 2 - SOCCER_PITCH_M.centerCircleR;

/**
 * FIFA 比率監査（105×68）
 * | 項目 | 規定(m) | 実装 | 一致 |
 * |------|---------|------|------|
 * | ペナ深度 | 16.5 | penDepth×105 | ✓ |
 * | ペナ幅 | 40.32 | penHalfH×2×68 | ✓ |
 * | ゴールエリア深 | 5.5 | goalDepth×105 | ✓ |
 * | ゴールエリア幅 | 18.32 | goalHalfH×2×68 | ✓ |
 * | PK点 | 11 | penSpot×105 | ✓ |
 * | センターサークル R | 9.15 | centerR×68 | ✓ |
 * | ペナアーク R | 9.15 | centerR×68 (=9.15/105×w) | ✓ |
 * | コーナー弧 R | 1 | cornerR×68 | ✓ |
 * | 5レーン外側界 | ペナ幅端 | penHalfH | ✓ |
 * | 5レーン HS 幅 | ペナ内〜センター円 | 11.01×2 | ✓ |
 */
export const SOCCER_PITCH_AUDIT = {
  penAreaWidthM: PEN_AREA_WIDTH_M,
  goalAreaWidthM: GOAL_AREA_WIDTH_M,
  wideLaneM: WIDE_LANE_M,
  centerLaneM: CENTER_LANE_M,
  halfSpaceM: HALF_SPACE_M,
  laneSumM: WIDE_LANE_M * 2 + CENTER_LANE_M + HALF_SPACE_M * 2,
} as const;

/** 正規化座標（x=長さ0..1、y=幅0..1） */
export const SOCCER_NORM = {
  penDepth: SOCCER_PITCH_M.penaltyAreaDepth / SOCCER_PITCH_M.length,
  goalDepth: SOCCER_PITCH_M.goalAreaDepth / SOCCER_PITCH_M.length,
  penSpot: SOCCER_PITCH_M.penaltySpot / SOCCER_PITCH_M.length,
  /** ペナ・ゴールエリアの半幅（ピッチ中心から外側縁まで） */
  penHalfH: PEN_AREA_WIDTH_M / 2 / SOCCER_PITCH_M.width,
  goalHalfH: GOAL_AREA_WIDTH_M / 2 / SOCCER_PITCH_M.width,
  centerR: SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.width,
  cornerR: SOCCER_PITCH_M.cornerArcR / SOCCER_PITCH_M.width,
} as const;

/**
 * 5レーン境界（幅方向 y、0=上タッチライン、1=下タッチライン）
 * Coaches' Voice 系: ワイド=タッチライン〜ペナ外側、中央=センターサークル幅
 */
export const LANE5_BOUNDARY_NORM = [
  0.5 - SOCCER_NORM.penHalfH,
  0.5 - SOCCER_NORM.centerR,
  0.5 + SOCCER_NORM.centerR,
  0.5 + SOCCER_NORM.penHalfH,
] as const;

export const LANE5_LABELS = [
  "LW",
  "LHS",
  "C",
  "RHS",
  "RW",
] as const;
