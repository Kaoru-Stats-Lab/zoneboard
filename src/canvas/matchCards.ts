import type { BoardDocument, CardEntry, CardKind, GoalEntry, Piece } from "../models/types";
import { AWAY_COLOR, HOME_COLOR } from "../models/types";

export const CARD_YELLOW = "#FFCC00";
export const CARD_RED = "#E53935";

export interface TeamCardTotals {
  yellow: number;
  red: number;
}

export function cardsForTeam(
  cards: CardEntry[],
  team: "home" | "away",
): TeamCardTotals {
  let yellow = 0;
  let red = 0;
  for (const c of cards) {
    if (c.team !== team) continue;
    if (c.kind === "YC") yellow += 1;
    else red += 1;
  }
  return { yellow, red };
}

export function formatCardTotals(t: TeamCardTotals): string {
  if (t.yellow === 0 && t.red === 0) return "";
  return `🟨${t.yellow} 🟥${t.red}`;
}

export function parseMinuteSort(minute?: string): number {
  if (!minute?.trim()) return 9999;
  const base = minute.trim().split("+")[0];
  const n = parseInt(base, 10);
  return Number.isFinite(n) ? n : 9999;
}

export type MatchTimelineEntry =
  | { kind: "goal"; sort: number; id: string; entry: GoalEntry }
  | { kind: "card"; sort: number; id: string; entry: CardEntry };

export function buildMatchTimeline(board: BoardDocument): MatchTimelineEntry[] {
  const out: MatchTimelineEntry[] = [];
  for (const g of board.goals) {
    out.push({
      kind: "goal",
      sort: parseMinuteSort(g.minute),
      id: `g-${g.id}`,
      entry: g,
    });
  }
  for (const c of board.cards ?? []) {
    out.push({
      kind: "card",
      sort: parseMinuteSort(c.minute),
      id: `c-${c.id}`,
      entry: c,
    });
  }
  out.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
  return out;
}

export function formatGoalTimelinePart(g: GoalEntry): string {
  const name = g.scorer.trim();
  const min = g.minute?.trim();
  if (min && name) return `${min}' ⚽ ${name}`;
  if (name) return `⚽ ${name}`;
  return min ? `${min}' ⚽` : "⚽";
}

export function formatCardTimelinePart(c: CardEntry, y2cLabel: string): string {
  const name = c.player.trim();
  const min = c.minute?.trim();
  const icon = c.kind === "YC" ? "🟨" : "🟥";
  const suffix = c.kind === "Y2C" ? ` (${y2cLabel})` : "";
  if (min && name) return `${min}' ${icon} ${name}${suffix}`;
  if (name) return `${icon} ${name}${suffix}`;
  return min ? `${min}' ${icon}${suffix}` : icon;
}

function pieceTeam(piece: Piece): "home" | "away" | null {
  if (piece.team === "home" || piece.team === "away") return piece.team;
  if (piece.color === HOME_COLOR) return "home";
  if (piece.color === AWAY_COLOR) return "away";
  return null;
}

function playerMatchesCard(piece: Piece, card: CardEntry): boolean {
  const pl = card.player.trim();
  if (!pl) return false;
  const num = piece.number.trim();
  if (num && num === pl) return true;
  const label = piece.label.trim();
  if (label && label.toLowerCase() === pl.toLowerCase()) return true;
  return false;
}

export interface PieceDiscipline {
  yellow: boolean;
  sentOff: boolean;
}

export function pieceDiscipline(
  board: BoardDocument,
  piece: Piece,
): PieceDiscipline {
  const team = pieceTeam(piece);
  if (!team) return { yellow: false, sentOff: false };
  const cards = board.cards ?? [];
  let yellow = false;
  let sentOff = false;
  for (const c of cards) {
    if (c.team !== team || !playerMatchesCard(piece, c)) continue;
    if (c.kind === "YC") yellow = true;
    if (c.kind === "RC" || c.kind === "Y2C") sentOff = true;
  }
  return { yellow: yellow && !sentOff, sentOff };
}

export function cardKindLabel(
  kind: CardKind,
  labels: { yc: string; rc: string; y2c: string },
): string {
  if (kind === "YC") return labels.yc;
  if (kind === "RC") return labels.rc;
  return labels.y2c;
}
