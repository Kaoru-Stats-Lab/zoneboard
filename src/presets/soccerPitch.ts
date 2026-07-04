/**
 * FIFA / JFA 標準ピッチ寸法（メートル）
 * 出典: Jリーグ公式「サッカーコートの広さ」— FIFA 推奨 105×68、各エリア規定
 * https://www.jleague.jp/a-to-z/football_pitch/
 */
export const SOCCER_PITCH_M = {
  length: 105,
  width: 68,
  goalWidth: 7.32,
  goalAreaDepth: 5.5,
  goalAreaSide: 5.5,
  penaltyAreaDepth: 16.5,
  penaltyAreaSide: 16.5,
  penaltySpot: 11,
  centerCircleR: 9.15,
  cornerArcR: 1,
  /** ライン太さ上限（描画スケール用） */
  lineMaxM: 0.12,
} as const;

/** 正規化座標（長さ方向 x=0..1、幅方向 y=0..1）への換算 */
export const SOCCER_NORM = {
  penDepth: SOCCER_PITCH_M.penaltyAreaDepth / SOCCER_PITCH_M.length,
  goalDepth: SOCCER_PITCH_M.goalAreaDepth / SOCCER_PITCH_M.length,
  penSpot: SOCCER_PITCH_M.penaltySpot / SOCCER_PITCH_M.length,
  penHalfH:
    (SOCCER_PITCH_M.penaltyAreaSide + SOCCER_PITCH_M.goalWidth / 2) /
    SOCCER_PITCH_M.width,
  goalHalfH:
    (SOCCER_PITCH_M.goalAreaSide + SOCCER_PITCH_M.goalWidth / 2) /
    SOCCER_PITCH_M.width,
  centerR: SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.width,
  cornerR: SOCCER_PITCH_M.cornerArcR / SOCCER_PITCH_M.width,
  /** ペナルティアーク用: スポットからエリア線までの距離 */
  penArcR: SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.width,
} as const;

/**
 * 5レーン（Juego de Posición）
 * ゴールが左右のとき、タッチライン方向を5等分する縦レーン。
 * y=0 側 = 画面上 = ホームから見て左サイド（攻撃方向が右のとき）
 */
export const LANE5_LABELS = [
  "LW", // left wing
  "LHS", // left half-space
  "C", // center
  "RHS", // right half-space
  "RW", // right wing
] as const;
