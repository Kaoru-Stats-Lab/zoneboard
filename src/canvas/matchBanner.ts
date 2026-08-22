import type { BoardDocument, GoalEntry } from "../models/types";
import { AWAY_COLOR, HOME_COLOR, UI_FONT_STACK } from "../models/types";

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
    board.goals.length > 0
  );
}

/** 得点者2行目があるときは高め */
export function matchBannerHeight(
  _canvasW: number,
  canvasH: number,
  board: BoardDocument,
): number {
  if (!bannerHasContent(board)) return 0;
  const oneLine = Math.max(34, canvasH * 0.042);
  if (board.goals.length === 0) return oneLine;
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

function formatGoalEntry(g: GoalEntry): string {
  const name = g.scorer.trim();
  const min = g.minute?.trim();
  if (min && name) return `${min}' ${name}`;
  return name || min || "—";
}

export function formatGoalLine(goals: GoalEntry[]): string {
  return goals.map(formatGoalEntry).join(" · ");
}

export function drawMatchBanner(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  bannerH: number,
  board: BoardDocument,
) {
  if (bannerH <= 0) return;

  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, canvasW, bannerH);

  const padX = Math.max(12, canvasW * 0.018);
  const home = board.homeTeam.trim() || "Home";
  const away = board.awayTeam.trim() || "Away";
  const homeScore = scoreForTeam(board.goals, "home");
  const awayScore = scoreForTeam(board.goals, "away");
  const hasGoals = board.goals.length > 0;
  const line1Y = hasGoals ? bannerH * 0.36 : bannerH * 0.5;
  const line2Y = bannerH * 0.78;

  const titleSize = Math.max(13, Math.min(18, bannerH * 0.28));
  const scoreSize = Math.max(14, Math.min(20, bannerH * 0.32));
  const goalSize = Math.max(11, Math.min(15, bannerH * 0.22));

  // 左: 大会・節
  ctx.fillStyle = "#e8e8e8";
  ctx.font = `600 ${titleSize}px ${UI_FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const title = board.matchLabel.trim();
  if (title) {
    const titleMax = canvasW * 0.42;
    ctx.fillText(truncate(ctx, title, titleMax), padX, line1Y);
  }

  // 右: 対戦カード + スコア（右寄せ・チーム色）
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  let xRight = canvasW - padX;
  const parts: { text: string; color: string }[] = [
    { text: away, color: AWAY_COLOR },
    { text: `  ${awayScore}`, color: "#ffffff" },
    { text: " - ", color: "#888888" },
    { text: `${homeScore}  `, color: "#ffffff" },
    { text: home, color: HOME_COLOR },
  ];
  ctx.font = `600 ${scoreSize}px ${UI_FONT_STACK}`;
  for (const p of parts) {
    ctx.fillStyle = p.color;
    const w = ctx.measureText(p.text).width;
    ctx.fillText(p.text, xRight, line1Y);
    xRight -= w;
  }

  // 2行目: 得点者（時系列）
  if (hasGoals) {
    ctx.font = `500 ${goalSize}px ${UI_FONT_STACK}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const maxW = canvasW - padX * 2;
    let x = padX;
    for (const g of board.goals) {
      const part = formatGoalEntry(g);
      const sep = x > padX ? " · " : "";
      const sepW = sep ? ctx.measureText(sep).width : 0;
      const color = g.team === "home" ? HOME_COLOR : AWAY_COLOR;
      ctx.fillStyle = "#aaaaaa";
      if (sep) ctx.fillText(sep, x, line2Y);
      x += sepW;
      ctx.fillStyle = color;
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
