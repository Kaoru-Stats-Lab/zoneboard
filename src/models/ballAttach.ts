import type { BallState, Piece } from "./types";

/** 吸着判定（ピッチ正規化距離） */
export const BALL_SNAP_RADIUS = 0.05;

/** 駒の向き側に少しずらして持つ */
export function ballPosOnPiece(piece: Piece): { x: number; y: number } {
  const rad = (piece.facing * Math.PI) / 180;
  const d = 0.032;
  return {
    x: piece.x + Math.cos(rad) * d,
    y: piece.y + Math.sin(rad) * d,
  };
}

export function nearestPiece(
  pieces: Piece[],
  x: number,
  y: number,
  maxDist = BALL_SNAP_RADIUS,
): Piece | null {
  let best: Piece | null = null;
  let bestD = maxDist;
  for (const p of pieces) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/** ドロップ位置で吸着 or 解除 */
export function ballAfterDrop(
  pieces: Piece[],
  x: number,
  y: number,
): BallState {
  const piece = nearestPiece(pieces, x, y);
  if (!piece) return { x, y, attachedTo: null };
  const pos = ballPosOnPiece(piece);
  return { x: pos.x, y: pos.y, attachedTo: piece.id };
}

/** 駒移動にボールを追従 */
export function ballFollowingPiece(
  ball: BallState,
  piece: Piece,
): BallState | null {
  if (ball.attachedTo !== piece.id) return null;
  const pos = ballPosOnPiece(piece);
  return { ...ball, x: pos.x, y: pos.y };
}
