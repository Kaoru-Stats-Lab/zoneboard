import type { BoardDocument, GoalEntry } from "../models/types";
import { AWAY_COLOR, HOME_COLOR, UI_FONT_STACK } from "../models/types";
import {
  buildMatchTimeline,
  cardsForTeam,
  formatCardTimelinePart,
  formatCardTotals,
  formatGoalTimelinePart,
} from "./matchCards";

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

function truncate(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) {
    t = t.slice(0, -1);
  }
  return `${t}…`;
}

export function drawMatchBanner(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  bannerH: number,
  board: BoardDocument,
  y2cLabel = "2nd YC",
) {
  if (bannerH <= 0) return;

  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, canvasW, bannerH);

  const padX = Math.max(12, canvasW * 0.018);
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
  const scoreSize = Math.max(14, Math.min(20, bannerH * 0.32));
  const eventSize = Math.max(11, Math.min(15, bannerH * 0.22));
  const cardBadgeSize = Math.max(10, Math.min(13, bannerH * 0.2));

  ctx.fillStyle = "#e8e8e8";
  ctx.font = `600 ${titleSize}px ${UI_FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const title = board.matchLabel.trim();
  if (title) {
    const titleMax = canvasW * 0.42;
    ctx.fillText(truncate(ctx, title, titleMax), padX, line1Y);
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  let xRight = canvasW - padX;
  const parts: { text: string; color: string; size?: number }[] = [
    { text: away, color: AWAY_COLOR },
  ];
  if (awayCardStr) {
    parts.push({ text: ` ${awayCardStr}`, color: "#cccccc", size: cardBadgeSize });
  }
  parts.push(
    { text: `  ${awayScore}`, color: "#ffffff" },
    { text: " - ", color: "#888888" },
    { text: `${homeScore}  `, color: "#ffffff" },
  );
  if (homeCardStr) {
    parts.push({ text: `${homeCardStr} `, color: "#cccccc", size: cardBadgeSize });
  }
  parts.push({ text: home, color: HOME_COLOR });

  for (const p of parts) {
    ctx.font = `600 ${p.size ?? scoreSize}px ${UI_FONT_STACK}`;
    ctx.fillStyle = p.color;
    const w = ctx.measureText(p.text).width;
    ctx.fillText(p.text, xRight, line1Y);
    xRight -= w;
  }

  if (hasTimeline) {
    ctx.font = `500 ${eventSize}px ${UI_FONT_STACK}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const maxW = canvasW - padX * 2;
    let x = padX;
    for (const ev of timeline) {
      const part =
        ev.kind === "goal"
          ? formatGoalTimelinePart(ev.entry)
          : formatCardTimelinePart(ev.entry, y2cLabel);
      const team = ev.entry.team;
      const sep = x > padX ? " · " : "";
      const sepW = sep ? ctx.measureText(sep).width : 0;
      ctx.fillStyle = "#aaaaaa";
      if (sep) ctx.fillText(sep, x, line2Y);
      x += sepW;
      ctx.fillStyle = team === "home" ? HOME_COLOR : AWAY_COLOR;
      const partW = ctx.measureText(part).width;
      if (x + partW > padX + maxW) {
        ctx.fillStyle = "#888888";
        ctx.fillText("…", x, line2Y);
        break;
      }
      ctx.fillText(part, x, line2Y);
      x += partW;
    }
  }
}

export function formatGoalLine(goals: GoalEntry[]): string {
  return goals.map((g) => formatGoalTimelinePart(g)).join(" · ");
}
