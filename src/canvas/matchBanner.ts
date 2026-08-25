import type { BoardDocument, GoalEntry } from "../models/types";
import { BANNER_FONT_STACK } from "../models/types";
import { kitsFromBoard } from "../models/kits";
import {
  buildMatchTimeline,
  cardTimelineName,
  drawTimelineBallMark,
  drawTimelineCardMark,
  formatGoalTimelinePart,
  goalTimelineName,
  timelineMinute,
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

/** 試合帯 ON なら 0–0 / Home–Away でも出す。空帯はトグル OFF だけ。 */
export function bannerHasContent(board: BoardDocument): boolean {
  return board.showMatchBanner;
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
  const r = Math.min(1.5, barW * 0.35);
  ctx.beginPath();
  ctx.roundRect(x, y - h / 2, barW, h, r);
  ctx.fill();
}

/** 行クラスタの光学的高さ（スコア桁とチーム名の大きい方） */
function lineClusterHeight(
  ctx: CanvasRenderingContext2D,
  nameFont: string,
  scoreFont: string,
): number {
  const prev = ctx.font;
  ctx.font = nameFont;
  const nameM = ctx.measureText("Ay");
  ctx.font = scoreFont;
  const scoreM = ctx.measureText("0");
  ctx.font = prev;
  const nameH =
    (nameM.actualBoundingBoxAscent ?? 0) + (nameM.actualBoundingBoxDescent ?? 0);
  const scoreH =
    (scoreM.actualBoundingBoxAscent ?? 0) + (scoreM.actualBoundingBoxDescent ?? 0);
  return Math.max(nameH, scoreH, 1);
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
  const home = board.homeTeam.trim() || "Home";
  const away = board.awayTeam.trim() || "Away";
  const homeScore = scoreForTeam(board.goals, "home");
  const awayScore = scoreForTeam(board.goals, "away");
  const timeline = buildMatchTimeline(board);
  const hasTimeline = timeline.length > 0;
  const line1Y = hasTimeline ? bannerH * 0.36 : bannerH * 0.5;
  const line2Y = bannerH * 0.78;

  const titleSize = Math.max(13, Math.min(18, bannerH * 0.28));
  const scoreSize = Math.max(16, Math.min(24, bannerH * 0.38));
  const eventSize = Math.max(11, Math.min(15, bannerH * 0.22));
  const nameFont = `600 ${titleSize}px ${BANNER_FONT_STACK}`;
  const scoreFont = `700 ${scoreSize}px ${BANNER_FONT_STACK}`;
  const rowH = lineClusterHeight(ctx, nameFont, scoreFont);
  const barH = rowH * 0.94;
  const barW = Math.max(4, Math.min(5, canvasW * 0.0045));
  const gapBarName = Math.max(5, titleSize * 0.38);
  const gapNameScore = Math.max(6, scoreSize * 0.3);
  const gapScoreInner = scoreSize * 0.35;
  const dash = "–";
  const barBlock = barW + gapBarName;

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

  ctx.font = scoreFont;
  const homeScoreStr = String(homeScore);
  const awayScoreStr = String(awayScore);
  const homeScoreW = ctx.measureText(homeScoreStr).width;
  const awayScoreW = ctx.measureText(awayScoreStr).width;
  ctx.font = `500 ${Math.round(scoreSize * 0.72)}px ${BANNER_FONT_STACK}`;
  const dashW = ctx.measureText(dash).width + gapScoreInner * 2;

  const scoreCoreW = homeScoreW + dashW + awayScoreW;
  const nameBudget = Math.max(
    48,
    canvasW - padX * 2 - titleW - gapNameScore * 2 - scoreCoreW - barBlock * 2,
  );
  const homeNameMax = nameBudget * 0.5;
  const awayNameMax = nameBudget * 0.5;

  ctx.font = nameFont;
  const homeNameStr = truncateByWidth(ctx, home, homeNameMax);
  const awayNameStr = truncateByWidth(ctx, away, awayNameMax);
  const homeNameW = ctx.measureText(homeNameStr).width;
  const awayNameW = ctx.measureText(awayNameStr).width;

  const clusterW =
    barBlock +
    homeNameW +
    gapNameScore +
    homeScoreW +
    dashW +
    awayScoreW +
    gapNameScore +
    awayNameW +
    barBlock;

  let x = canvasW - padX - clusterW;

  drawKitBar(ctx, x, line1Y, barH, barW, kits.home);
  x += barBlock;
  ctx.font = nameFont;
  ctx.fillStyle = BANNER_IVORY;
  ctx.textAlign = "left";
  ctx.fillText(homeNameStr, x, line1Y);
  x += homeNameW + gapNameScore;

  ctx.font = scoreFont;
  ctx.fillStyle = SCORE_WHITE;
  ctx.fillText(homeScoreStr, x, line1Y);
  x += homeScoreW + gapScoreInner;

  ctx.fillStyle = BANNER_MUTED;
  ctx.font = `500 ${Math.round(scoreSize * 0.72)}px ${BANNER_FONT_STACK}`;
  ctx.fillText(dash, x, line1Y);
  x += ctx.measureText(dash).width + gapScoreInner;

  ctx.font = scoreFont;
  ctx.fillStyle = SCORE_WHITE;
  ctx.fillText(awayScoreStr, x, line1Y);
  x += awayScoreW + gapNameScore;

  ctx.font = nameFont;
  ctx.fillStyle = BANNER_IVORY;
  ctx.fillText(awayNameStr, x, line1Y);
  x += awayNameW + gapBarName;
  drawKitBar(ctx, x, line1Y, barH, barW, kits.away);

  if (hasTimeline) {
    ctx.font = `500 ${eventSize}px ${BANNER_FONT_STACK}`;
    ctx.textAlign = "left";
    const maxW = canvasW - padX * 2;
    const dotR = Math.max(3, eventSize * 0.22);
    let tx = padX;

    const markH = Math.max(9, eventSize * 0.92);
    const markGap = Math.max(3, eventSize * 0.22);

    for (const ev of timeline) {
      const minute = timelineMinute(ev.entry.minute);
      const name =
        ev.kind === "goal"
          ? goalTimelineName(ev.entry)
          : cardTimelineName(ev.entry, y2cLabel);
      const team = ev.entry.team;
      const kitColor = team === "home" ? kits.home : kits.away;
      const markW =
        ev.kind === "card" && ev.entry.kind === "Y2C" ? markH * 0.92 : markH * 0.78;

      if (tx > padX) {
        ctx.fillStyle = BANNER_MUTED;
        const sep = " · ";
        ctx.fillText(sep, tx, line2Y);
        tx += ctx.measureText(sep).width;
      }

      const minuteW = minute ? ctx.measureText(minute).width : 0;
      const needed =
        dotR * 2 + 4 + (minuteW ? minuteW + markGap : 0) + markW + (name ? markGap : 0);
      const room = padX + maxW - tx;
      if (room < needed * 0.45) {
        ctx.fillStyle = BANNER_MUTED;
        ctx.fillText("…", tx, line2Y);
        break;
      }

      ctx.fillStyle = kitColor;
      ctx.beginPath();
      ctx.arc(tx + dotR, line2Y, dotR, 0, Math.PI * 2);
      ctx.fill();
      tx += dotR * 2 + 4;

      ctx.fillStyle = BANNER_IVORY;
      if (minute) {
        ctx.fillText(minute, tx, line2Y);
        tx += minuteW + markGap;
      }

      if (ev.kind === "goal") {
        drawTimelineBallMark(ctx, tx + markW / 2, line2Y, markH * 0.42);
      } else {
        drawTimelineCardMark(
          ctx,
          tx + markW / 2,
          line2Y,
          markH,
          ev.entry.kind,
        );
      }
      tx += markW;

      if (name) {
        tx += markGap;
        const nameRoom = padX + maxW - tx;
        const nameText = truncateByWidth(ctx, name, nameRoom);
        ctx.fillStyle = BANNER_IVORY;
        ctx.fillText(nameText, tx, line2Y);
        tx += ctx.measureText(nameText).width;
        if (nameText.endsWith("…")) break;
      }
    }
  }
}

export function formatGoalLine(goals: GoalEntry[]): string {
  return goals.map((g) => formatGoalTimelinePart(g)).join(" · ");
}
