import { normalizePieceNumber } from "../canvas/pieceInk";
import type {
  BoardDocument,
  MatchStatus,
  Piece,
  SubEntry,
} from "./types";

export const DEFAULT_MAX_SUBS = 5;

/** @deprecated 残数 UI は出さない。互換ヘルパのみ。 */
export function subsUsedForTeam(
  board: BoardDocument,
  team: "home" | "away",
): number {
  return (board.subs ?? []).filter((s) => s.team === team).length;
}

/** @deprecated 残数 UI は出さない。 */
export function subsRemainingForTeam(
  board: BoardDocument,
  team: "home" | "away",
): number {
  const max = board.maxSubs > 0 ? board.maxSubs : DEFAULT_MAX_SUBS;
  return Math.max(0, max - subsUsedForTeam(board, team));
}

export function findTeamPieceByNumber(
  pieces: Piece[],
  team: "home" | "away",
  number: string,
): Piece | undefined {
  const n = normalizePieceNumber(number);
  if (!n) return undefined;
  return pieces.find(
    (p) => p.team === team && normalizePieceNumber(p.number) === n,
  );
}

/** Apply visual statuses for a recorded sub (does not move pieces). */
export function statusesAfterSub(
  pieces: Piece[],
  team: "home" | "away",
  outNumber: string,
  inNumber: string,
  injured: boolean,
): Piece[] {
  const outN = normalizePieceNumber(outNumber);
  const inN = normalizePieceNumber(inNumber);
  return pieces.map((p) => {
    if (p.team !== team) return p;
    const n = normalizePieceNumber(p.number);
    if (outN && n === outN) {
      return { ...p, matchStatus: injured ? "injured" : "out" };
    }
    if (inN && n === inN) {
      return { ...p, matchStatus: "in" };
    }
    return p;
  });
}

export function matchStatusLabelKey(
  status: MatchStatus | undefined,
): "matchStatusOn" | "matchStatusIn" | "matchStatusOut" | "matchStatusInjured" | "matchStatusClear" {
  if (status === "on") return "matchStatusOn";
  if (status === "in") return "matchStatusIn";
  if (status === "out") return "matchStatusOut";
  if (status === "injured") return "matchStatusInjured";
  return "matchStatusClear";
}

export type { SubEntry };
