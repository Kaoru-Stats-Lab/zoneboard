import type { BoardDocument, GoalEntry, PkKickSlot } from "../models/types";
import { BANNER_FONT_STACK } from "../models/types";
import { kitsFromBoard } from "../models/kits";
import {
  createPkShootout,
  pkScoredCount,
  pkStripVisible,
  teamLabelForPk,
} from "../models/pkShootout";
import {
  buildMatchTimeline,
  cardTimelineName,
  drawTimelineBallMark,
  drawTimelineCardMark,
  formatGoalTimelinePart,
  goalTimelineName,
  subTimelineBody,
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

export type BannerBands = {
  scoreBand: number;
  timelineBand: number;
  pkBand: number;
  total: number;
};

/**
 * 視聴面の縦割り（スコア / タイムライン / PK）。
 * 操作パネル（LiveMatchControls）とは独立 — 配信キャプチャの正本。
 */
export function matchBannerBands(
  canvasH: number,
  board: BoardDocument,
): BannerBands {
  if (!bannerHasContent(board)) {
    return { scoreBand: 0, timelineBand: 0, pkBand: 0, total: 0 };
  }
  const scoreBand = Math.max(34, canvasH * 0.042);
  const hasTimeline =
    board.goals.length > 0 ||
    (board.cards?.length ?? 0) > 0 ||
    (board.subs?.length ?? 0) > 0;
  const timelineBand = hasTimeline
    ? Math.max(20, scoreBand * 0.72)
    : 0;
  const pkBand = pkStripVisible(board.pk)
    ? Math.max(52, canvasH * 0.062)
    : 0;
  return {
    scoreBand,
    timelineBand,
    pkBand,
    total: scoreBand + timelineBand + pkBand,
  };
}

export function matchBannerHeight(
  _canvasW: number,
  canvasH: number,
  board: BoardDocument,
): number {
  return matchBannerBands(canvasH, board).total;
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

function slotGlyph(slot: PkKickSlot): string {
  if (slot.result === "scored") return "○";
  if (slot.result === "missed") return "✕";
  // 未キック: ブランク（◯枠は得点と同族）。列幅はグリッドで確保
  return "";
}

/**
 * 視聴用 PK — CL 型の列グリッド。
 * kit | 名前列（両行同幅） | 本数列 | スロット列（H/A で X 一致）
 * 未キックは空だがセルは潰さない。
 */
function drawPkStrip(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  y0: number,
  bandH: number,
  board: BoardDocument,
) {
  const pk = board.pk ?? createPkShootout(false);
  if (!pkStripVisible(pk) || bandH <= 0) return;

  const kits = kitsFromBoard(board);
  const padX = Math.max(12, canvasW * 0.018);
  const rowH = bandH / 2;
  const markSize = Math.max(12, Math.min(17, rowH * 0.52));
  const nameSize = Math.max(11, Math.min(14, rowH * 0.4));
  const countSize = Math.max(13, Math.min(17, rowH * 0.5));
  const barW = Math.max(3, Math.min(5, canvasW * 0.004));
  const gapKitName = Math.max(6, nameSize * 0.4);
  const gapNameCount = Math.max(10, nameSize * 0.65);
  const gapCountSlots = Math.max(14, markSize * 0.9);

  const slotCount = Math.max(pk.home.length, pk.away.length, 1);
  const nameFont = `600 ${nameSize}px ${BANNER_FONT_STACK}`;
  const countFont = `700 ${countSize}px ${BANNER_FONT_STACK}`;
  const markFont = `700 ${markSize}px ${BANNER_FONT_STACK}`;

  ctx.font = nameFont;
  const nameColMax = Math.min(canvasW * 0.22, Math.max(88, canvasW * 0.16));
  const homeNameStr = truncateByWidth(
    ctx,
    teamLabelForPk(board, "home"),
    nameColMax,
  );
  const awayNameStr = truncateByWidth(
    ctx,
    teamLabelForPk(board, "away"),
    nameColMax,
  );
  const nameColW = Math.max(
    ctx.measureText(homeNameStr).width,
    ctx.measureText(awayNameStr).width,
    nameSize * 3.2,
  );

  ctx.font = countFont;
  const countColW = Math.max(
    ctx.measureText("00").width,
    countSize * 1.15,
  );

  const kitBlock = barW + gapKitName;
  const slotsOrigin =
    padX + kitBlock + nameColW + gapNameCount + countColW + gapCountSlots;
  // 残幅いっぱいに伸ばさない（疎な帯は CL ではない）。等間隔の密な列。
  const slotPitch = Math.max(markSize * 1.45, Math.min(markSize * 1.85, 26));
  const slotsBlockW = slotPitch * slotCount;
  const maxSlotsW = Math.max(0, canvasW - padX - slotsOrigin);
  const pitch =
    slotsBlockW > maxSlotsW && slotCount > 0
      ? maxSlotsW / slotCount
      : slotPitch;

  ctx.textBaseline = "middle";

  (["home", "away"] as const).forEach((team, row) => {
    const cy = y0 + rowH * (row + 0.5);
    const kit = team === "home" ? kits.home : kits.away;
    const nameStr = team === "home" ? homeNameStr : awayNameStr;
    const slots = pk[team];
    const scored = pkScoredCount(slots);

    let x = padX;
    drawKitBar(ctx, x, cy, rowH * 0.55, barW, kit);
    x += kitBlock;

    ctx.font = nameFont;
    ctx.fillStyle = BANNER_IVORY;
    ctx.textAlign = "left";
    ctx.fillText(nameStr, x, cy);

    const countX = padX + kitBlock + nameColW + gapNameCount + countColW;
    ctx.font = countFont;
    ctx.fillStyle = SCORE_WHITE;
    ctx.textAlign = "right";
    ctx.fillText(String(scored), countX, cy);

    for (let i = 0; i < slotCount; i++) {
      const slot = slots[i];
      const cx = slotsOrigin + pitch * (i + 0.5);
      if (!slot) continue;

      const glyph = slotGlyph(slot);
      if (glyph) {
        ctx.font = markFont;
        ctx.fillStyle = BANNER_IVORY;
        ctx.textAlign = "center";
        ctx.fillText(glyph, cx, cy + 0.5);
      }

      if (slot.number) {
        ctx.font = `600 ${Math.max(8, markSize * 0.52)}px ${BANNER_FONT_STACK}`;
        ctx.fillStyle = BANNER_MUTED;
        ctx.textAlign = "center";
        ctx.fillText(slot.number, cx, cy - markSize * 0.7);
      }
    }
  });
}

/**
 * @param canvasH レイアウト基準高さ（matchBannerHeight に渡す値と同じ）
 */
export function drawMatchBanner(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  board: BoardDocument,
  y2cLabel = "2nd YC",
  injLabel = "INJ",
) {
  const { scoreBand, timelineBand, pkBand, total: bannerH } =
    matchBannerBands(canvasH, board);
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
  const hasTimeline = timeline.length > 0 && timelineBand > 0;
  const line1Y = scoreBand * 0.5;
  const line2Y = scoreBand + timelineBand * 0.5;

  const titleSize = Math.max(13, Math.min(18, scoreBand * 0.42));
  const scoreSize = Math.max(16, Math.min(24, scoreBand * 0.58));
  const eventSize = Math.max(
    11,
    Math.min(15, (timelineBand || scoreBand) * 0.55),
  );
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
          : ev.kind === "card"
            ? cardTimelineName(ev.entry, y2cLabel)
            : subTimelineBody(ev.entry, injLabel);
      const team = ev.entry.team;
      const kitColor = team === "home" ? kits.home : kits.away;
      const markW =
        ev.kind === "goal"
          ? markH * 0.78
          : ev.kind === "card"
            ? ev.entry.kind === "Y2C"
              ? markH * 0.92
              : markH * 0.78
            : 0;

      if (tx > padX) {
        ctx.fillStyle = BANNER_MUTED;
        const sep = " · ";
        ctx.fillText(sep, tx, line2Y);
        tx += ctx.measureText(sep).width;
      }

      const minuteW = minute ? ctx.measureText(minute).width : 0;
      const needed =
        dotR * 2 +
        4 +
        (minuteW ? minuteW + markGap : 0) +
        markW +
        (name ? markGap : 0) +
        (name ? ctx.measureText(name).width * 0.35 : 0);
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
        tx += markW;
      } else if (ev.kind === "card") {
        drawTimelineCardMark(
          ctx,
          tx + markW / 2,
          line2Y,
          markH,
          ev.entry.kind,
        );
        tx += markW;
      }

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

  if (pkBand > 0) {
    const yPk = scoreBand + timelineBand;
    ctx.strokeStyle = "rgba(243,243,241,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, yPk);
    ctx.lineTo(canvasW - padX, yPk);
    ctx.stroke();
    drawPkStrip(ctx, canvasW, yPk, pkBand, board);
  }
}

export function formatGoalLine(goals: GoalEntry[]): string {
  return goals.map((g) => formatGoalTimelinePart(g)).join(" · ");
}
