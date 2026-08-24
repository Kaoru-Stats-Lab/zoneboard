import type { BoardDocument, GoalEntry } from "../models/types";
import { BANNER_FONT_STACK } from "../models/types";
import { kitsFromBoard } from "../models/kits";
import {
  buildMatchTimeline,
  cardsForTeam,
  formatCardTimelinePart,
  formatCardTotals,
  formatGoalTimelinePart,
} from "./matchCards";

const BANNER_BG = "#141414";
const BANNER_IVORY = "#f3f3f1";
const BANNER_MUTED = "#9a9a96";
const SCORE_WHITE = "#ffffff";

export function scoreForTeam(
  goals: GoalEntry[],
  team: "home" | "away",
): number {
  return goals.filter((g) => g.team === team).length;
}

export function bannerHasContent(board: BoardDocument): boolean {
  if (!board.showMatchBanner) return false;
  return (
    !!board.matchLabel.trim() ||
    !!board.homeTeam.trim() ||
    !!board.awayTeam.trim() ||
    board.goals.length > 0 ||
    (board.cards?.length ?? 0) > 0
  );
}

/** 得点・カードタイムライン2行目 */
export function matchBannerHeight(
  _canvasW: number,
  canvasH: number,
  board: BoardDocument,
): number {
  if (!bannerHasContent(board)) return 0;
  const oneLine = Math.max(34, canvasH * 0.042);
  const hasTimeline =
    board.goals.length > 0 || (board.cards?.length ?? 0) > 0;
  if (!hasTimeline) return oneLine;
  return Math.max(52, oneLine * 1.65);
}

/** 描画幅で省略（書記素単位。サロゲートを割らない） */
export function truncateByWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
): string {
  if (!text || maxW <= 0) return text;
  if (ctx.measureText(text).width <= maxW) return text;

  const ellipsis = "…";
  const ellipsisW = ctx.measureText(ellipsis).width;
  const budget = maxW - ellipsisW;
  if (budget <= 0) return ellipsis;

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    let out = "";
    for (const { segment } of segmenter.segment(text)) {
      const next = out + segment;
      if (ctx.measureText(next).width > budget) break;
      out = next;
    }
    return out.length > 0 ? out + ellipsis : ellipsis;
  }

  let out = "";
  for (const cp of text) {
    const next = out + cp;
    if (ctx.measureText(next).width > budget) break;
    out = next;
  }
  return out.length > 0 ? out + ellipsis : ellipsis;
}

function drawKitBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  barW: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - h / 2, barW, h);
}

export function drawMatchBanner(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  bannerH: number,
  board: BoardDocument,
  y2cLabel = "2nd YC",
) {
  if (bannerH <= 0) return;

  ctx.fillStyle = BANNER_BG;
  ctx.fillRect(0, 0, canvasW, bannerH);

  const kits = kitsFromBoard(board);
  const padX = Math.max(12, canvasW * 0.018);
  const barW = Math.max(3, Math.min(4, canvasW * 0.004));
  const barGap = 4;
  const home = board.homeTeam.trim() || "Home";
  const away = board.awayTeam.trim() || "Away";
  const homeScore = scoreForTeam(board.goals, "home");
  const awayScore = scoreForTeam(board.goals, "away");
  const cards = board.cards ?? [];
  const homeCards = cardsForTeam(cards, "home");
  const awayCards = cardsForTeam(cards, "away");
  const homeCardStr = formatCardTotals(homeCards);
  const awayCardStr = formatCardTotals(awayCards);
  const timeline = buildMatchTimeline(board);
  const hasTimeline = timeline.length > 0;
  const line1Y = hasTimeline ? bannerH * 0.36 : bannerH * 0.5;
  const line2Y = bannerH * 0.78;

  const titleSize = Math.max(13, Math.min(18, bannerH * 0.28));
  const scoreSize = Math.max(16, Math.min(24, bannerH * 0.38));
  const eventSize = Math.max(11, Math.min(15, bannerH * 0.22));
  const cardBadgeSize = Math.max(10, Math.min(12, bannerH * 0.19));
  const gapSm = scoreSize * 0.2;
  const gapMd = scoreSize * 0.35;
  const dash = "–";
  const barBlock = barW + barGap;

  ctx.textBaseline = "middle";

  const title = board.matchLabel.trim();
  let titleW = 0;
  if (title) {
    ctx.font = `600 ${titleSize}px ${BANNER_FONT_STACK}`;
    const titleMax = canvasW * 0.38;
    const titleText = truncateByWidth(ctx, title, titleMax);
    titleW = ctx.measureText(titleText).width;
    ctx.fillStyle = BANNER_IVORY;
    ctx.textAlign = "left";
    ctx.fillText(titleText, padX, line1Y);
  }

  ctx.font = `700 ${scoreSize}px ${BANNER_FONT_STACK}`;
  const homeScoreStr = String(homeScore);
  const awayScoreStr = String(awayScore);
  const homeScoreW = ctx.measureText(homeScoreStr).width;
  const awayScoreW = ctx.measureText(awayScoreStr).width;
  ctx.font = `600 ${titleSize}px ${BANNER_FONT_STACK}`;
  const dashW = ctx.measureText(dash).width + gapMd * 2;

  ctx.font = `500 ${cardBadgeSize}px ${BANNER_FONT_STACK}`;
  const homeCardW = homeCardStr
    ? ctx.measureText(homeCardStr).width + gapSm
    : 0;
  const awayCardW = awayCardStr
    ? ctx.measureText(awayCardStr).width + gapSm
    : 0;

  const scoreCoreW = homeScoreW + dashW + awayScoreW;
  const nameBudget = Math.max(
    48,
    canvasW - padX * 2 - titleW - gapSm * 4 - scoreCoreW - homeCardW - awayCardW - barBlock * 2,
  );
  const homeNameMax = nameBudget * 0.5;
  const awayNameMax = nameBudget * 0.5;

  ctx.font = `600 ${titleSize}px ${BANNER_FONT_STACK}`;
  const homeNameStr = truncateByWidth(ctx, home, homeNameMax);
  const awayNameStr = truncateByWidth(ctx, away, awayNameMax);
  const homeNameW = ctx.measureText(homeNameStr).width;
  const awayNameW = ctx.measureText(awayNameStr).width;

  const clusterW =
    barBlock +
    homeNameW +
    homeCardW +
    gapSm +
    homeScoreW +
    dashW +
    awayScoreW +
    gapSm +
    awayCardW +
    awayNameW +
    barBlock;

  let x = canvasW - padX - clusterW;
  const barH = titleSize * 0.92;

  drawKitBar(ctx, x, line1Y, barH, barW, kits.home);
  x += barBlock;
  ctx.font = `600 ${titleSize}px ${BANNER_FONT_STACK}`;
  ctx.fillStyle = BANNER_IVORY;
  ctx.textAlign = "left";
  ctx.fillText(homeNameStr, x, line1Y);
  x += homeNameW;

  if (homeCardStr) {
    x += gapSm * 0.35;
    ctx.font = `500 ${cardBadgeSize}px ${BANNER_FONT_STACK}`;
    ctx.fillStyle = BANNER_MUTED;
    ctx.fillText(homeCardStr, x, line1Y);
    x += homeCardW - gapSm * 0.35;
  }

  x += gapSm;
  ctx.font = `700 ${scoreSize}px ${BANNER_FONT_STACK}`;
  ctx.fillStyle = SCORE_WHITE;
  ctx.fillText(homeScoreStr, x, line1Y);
  x += homeScoreW + gapMd;

  ctx.fillStyle = BANNER_MUTED;
  ctx.font = `600 ${titleSize}px ${BANNER_FONT_STACK}`;
  ctx.fillText(dash, x, line1Y);
  x += ctx.measureText(dash).width + gapMd;

  ctx.font = `700 ${scoreSize}px ${BANNER_FONT_STACK}`;
  ctx.fillStyle = SCORE_WHITE;
  ctx.fillText(awayScoreStr, x, line1Y);
  x += awayScoreW + gapSm;

  if (awayCardStr) {
    ctx.font = `500 ${cardBadgeSize}px ${BANNER_FONT_STACK}`;
    ctx.fillStyle = BANNER_MUTED;
    ctx.fillText(awayCardStr, x, line1Y);
    x += awayCardW;
  }

  x += gapSm * 0.35;
  ctx.font = `600 ${titleSize}px ${BANNER_FONT_STACK}`;
  ctx.fillStyle = BANNER_IVORY;
  ctx.fillText(awayNameStr, x, line1Y);
  x += awayNameW;
  drawKitBar(ctx, x, line1Y, barH, barW, kits.away);

  if (hasTimeline) {
    ctx.font = `500 ${eventSize}px ${BANNER_FONT_STACK}`;
    ctx.textAlign = "left";
    const maxW = canvasW - padX * 2;
    const dotR = Math.max(3, eventSize * 0.22);
    let tx = padX;

    for (const ev of timeline) {
      const part =
        ev.kind === "goal"
          ? formatGoalTimelinePart(ev.entry)
          : formatCardTimelinePart(ev.entry, y2cLabel);
      const team = ev.entry.team;
      const kitColor = team === "home" ? kits.home : kits.away;

      if (tx > padX) {
        ctx.fillStyle = BANNER_MUTED;
        const sep = " · ";
        ctx.fillText(sep, tx, line2Y);
        tx += ctx.measureText(sep).width;
      }

      ctx.fillStyle = kitColor;
      ctx.beginPath();
      ctx.arc(tx + dotR, line2Y, dotR, 0, Math.PI * 2);
      ctx.fill();
      tx += dotR * 2 + 4;

      ctx.fillStyle = BANNER_IVORY;
      const room = padX + maxW - tx;
      const partText = truncateByWidth(ctx, part, room);
      const partW = ctx.measureText(partText).width;
      if (room < dotR * 2) {
        ctx.fillStyle = BANNER_MUTED;
        ctx.fillText("…", tx, line2Y);
        break;
      }
      ctx.fillText(partText, tx, line2Y);
      tx += partW;

      if (partText.endsWith("…")) break;
    }
  }
}

export function formatGoalLine(goals: GoalEntry[]): string {
  return goals.map((g) => formatGoalTimelinePart(g)).join(" · ");
}
