/**
 * Multi-ball persist helpers (Group 1).
 * Canonical: Scene.balls: BallObject[]. Legacy scene.ball → one-element migrate.
 */
import { uid } from "./id";
import type { BallObject, Piece } from "./types";
import { ballFollowingPiece, ballPosOnPiece } from "./ballAttach";

/** World-norm nudge — match Shape duplicate offset. */
export const BALL_DUP_OFFSET = 0.018;

export function createBallObject(
  partial: Partial<BallObject> = {},
): BallObject {
  const x = typeof partial.x === "number" && Number.isFinite(partial.x) ? partial.x : 0.5;
  const y = typeof partial.y === "number" && Number.isFinite(partial.y) ? partial.y : 0.5;
  const next: BallObject = {
    id:
      typeof partial.id === "string" && partial.id.length > 0
        ? partial.id
        : uid(),
    x,
    y,
  };
  if (partial.attachedTo === null) next.attachedTo = null;
  else if (typeof partial.attachedTo === "string" && partial.attachedTo) {
    next.attachedTo = partial.attachedTo;
  }
  return next;
}

function sanitizeOneBall(raw: unknown): BallObject | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const x = typeof o.x === "number" ? o.x : Number(o.x);
  const y = typeof o.y === "number" ? o.y : Number(o.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return createBallObject({
    id: typeof o.id === "string" ? o.id : undefined,
    x,
    y,
    attachedTo:
      o.attachedTo === null
        ? null
        : typeof o.attachedTo === "string"
          ? o.attachedTo
          : undefined,
  });
}

/**
 * Prefer `balls[]`. Fall back to legacy single `ball`.
 * Always returns ≥1 ball.
 */
export function normalizeSceneBalls(
  balls: unknown,
  legacyBall?: unknown,
): BallObject[] {
  if (Array.isArray(balls) && balls.length > 0) {
    const out: BallObject[] = [];
    for (const row of balls) {
      const b = sanitizeOneBall(row);
      if (b) out.push(b);
    }
    if (out.length > 0) return out;
  }
  const legacy = sanitizeOneBall(legacyBall);
  if (legacy) return [legacy];
  return [createBallObject()];
}

/** Primary ball for tools that still act on “the” ball (corridor, ball tool). */
export function primaryBall(balls: BallObject[]): BallObject {
  return balls[0] ?? createBallObject();
}

export function rotateBallObject180(ball: BallObject): BallObject {
  return {
    ...ball,
    x: 1 - ball.x,
    y: 1 - ball.y,
  };
}

/** Follow attached hosts after piece moves. */
export function ballsFollowingMovedPieces(
  balls: BallObject[],
  pieces: Piece[],
  movedIds: Set<string>,
): BallObject[] {
  return balls.map((ball) => {
    if (!ball.attachedTo || !movedIds.has(ball.attachedTo)) return ball;
    const host = pieces.find((p) => p.id === ball.attachedTo);
    if (!host) return ball;
    const followed = ballFollowingPiece(ball, host);
    return followed ?? ball;
  });
}

/** Clear attach when host piece ids are removed. */
export function ballsAfterPieceDelete(
  balls: BallObject[],
  deletedPieceIds: Set<string>,
): BallObject[] {
  return balls.map((ball) =>
    ball.attachedTo && deletedPieceIds.has(ball.attachedTo)
      ? { ...ball, attachedTo: null }
      : ball,
  );
}

export function offsetBallCopy(source: BallObject): BallObject {
  return createBallObject({
    x: source.x + BALL_DUP_OFFSET,
    y: source.y + BALL_DUP_OFFSET,
    attachedTo: null,
  });
}

/** Re-seat on piece facing (attach helper for drop). */
export function attachBallToPiece(ball: BallObject, piece: Piece): BallObject {
  const pos = ballPosOnPiece(piece);
  return { ...ball, x: pos.x, y: pos.y, attachedTo: piece.id };
}
