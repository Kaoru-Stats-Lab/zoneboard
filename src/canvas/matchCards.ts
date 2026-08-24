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

export function timelineMinute(minute?: string): string {
  const min = minute?.trim();
  return min ? `${min}'` : "";
}

export function goalTimelineName(g: GoalEntry): string {
  return g.scorer.trim();
}

export function cardTimelineName(c: CardEntry, y2cLabel: string): string {
  const name = c.player.trim();
  const suffix = c.kind === "Y2C" ? ` (${y2cLabel})` : "";
  return `${name}${suffix}`.trim();
}

/** 帯・ログ用。記号はキャンバス側で描く。絵文字は入れない */
export function formatGoalTimelinePart(g: GoalEntry): string {
  return [timelineMinute(g.minute), goalTimelineName(g)].filter(Boolean).join(" ");
}

export function formatCardTimelinePart(c: CardEntry, y2cLabel: string): string {
  return [timelineMinute(c.minute), cardTimelineName(c, y2cLabel)]
    .filter(Boolean)
    .join(" ");
}

function roundCardRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function paintCardFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  fill: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  roundCardRect(ctx, -w / 2, -h / 2, w, h, Math.max(0.7, h * 0.08));
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = Math.max(0.7, h * 0.06);
  ctx.stroke();
  ctx.restore();
}

/** 放送の警告カード。絵文字の四角ではない */
export function drawTimelineCardMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  h: number,
  kind: CardKind,
) {
  const w = h * 0.66;
  if (kind === "Y2C") {
    paintCardFace(ctx, cx - h * 0.12, cy - h * 0.06, w, h, CARD_YELLOW);
    paintCardFace(ctx, cx + h * 0.12, cy + h * 0.06, w, h, CARD_RED);
    return;
  }
  paintCardFace(ctx, cx, cy, w, h, kind === "YC" ? CARD_YELLOW : CARD_RED);
}

/** 幾何の球。OS 絵文字のサッカーボールは使わない */
export function drawTimelineBallMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#f2f2ef";
  ctx.fill();
  ctx.strokeStyle = "rgba(12,12,12,0.82)";
  ctx.lineWidth = Math.max(0.85, r * 0.13);
  ctx.stroke();

  ctx.beginPath();
  const pr = r * 0.3;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x = cx + Math.cos(a) * pr;
    const y = cy + Math.sin(a) * pr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#161616";
  ctx.fill();

  ctx.strokeStyle = "rgba(18,18,18,0.88)";
  ctx.lineWidth = Math.max(0.65, r * 0.1);
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (pr * 0.92), cy + Math.sin(a) * (pr * 0.92));
    ctx.lineTo(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86);
    ctx.stroke();
  }
  ctx.restore();
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
