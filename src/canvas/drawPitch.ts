import type { BoardDocument } from "../models/types";
import { SOCCER_NORM, SOCCER_PITCH_M } from "../presets/soccerPitch";
import type { PitchRect } from "./layout";

const LINE = "#1a1a1a";

function strokeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lw: number,
) {
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.strokeRect(x, y, w, h);
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lw: number,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();
}

export function pitchLineWidth(pitch: PitchRect): number {
  return Math.max(1.2, Math.min(pitch.w, pitch.h) * 0.0035);
}

/** ピッチ面（最下層の塗り） */
export function drawPitchSurface(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(pitch.x, pitch.y, pitch.w, pitch.h);
}

/** 5レーン（ロゴより下） */
export function drawPitchLanes(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
) {
  if (board.sport === "soccer" && board.showLanes5) {
    drawLanes5(ctx, pitch, pitchLineWidth(pitch));
  }
}

/** ピッチ線・ゴール等（ロゴより上、駒より下） */
export function drawPitchMarkings(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
) {
  const lw = pitchLineWidth(pitch);
  const { x, y, w, h } = pitch;
  strokeRect(ctx, x, y, w, h, lw);

  if (board.sport === "soccer") {
    drawSoccerMarkings(ctx, pitch, board, lw);
  } else if (board.sport === "basketball") {
    drawBasketball(ctx, pitch, lw);
  } else {
    drawVolleyball(ctx, pitch, lw);
  }
}

/** 一括描画（互換用） */
export function drawPitch(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
) {
  drawPitchSurface(ctx, pitch);
  drawPitchLanes(ctx, pitch, board);
  drawPitchMarkings(ctx, pitch, board);
}

function drawSoccerMarkings(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  const half = board.pitchView === "half";
  const N = SOCCER_NORM;

  if (!half) {
    line(ctx, x + w / 2, y, x + w / 2, y + h, lw);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const cr = N.centerR * h;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.lineWidth = lw;
    ctx.strokeStyle = LINE;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2, lw), 0, Math.PI * 2);
    ctx.fillStyle = LINE;
    ctx.fill();

    drawPenaltyBoxAccurate(ctx, pitch, lw, "left");
    drawPenaltyBoxAccurate(ctx, pitch, lw, "right");
    drawCorners(ctx, pitch, lw);
    drawGoalPosts(ctx, pitch, lw, "left");
    drawGoalPosts(ctx, pitch, lw, "right");
  } else {
    drawPenaltyBoxAccurate(ctx, pitch, lw, "right", true);
    const cr = N.centerR * h * 2;
    ctx.beginPath();
    ctx.arc(x, y + h / 2, cr, -Math.PI / 2, Math.PI / 2);
    ctx.lineWidth = lw;
    ctx.strokeStyle = LINE;
    ctx.stroke();
    drawGoalPosts(ctx, pitch, lw, "right", true);
  }
}

function drawLanes5(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;

  ctx.fillStyle = "rgba(52, 152, 219, 0.07)";
  ctx.fillRect(x, y + h * 0.2, w, h * 0.2);
  ctx.fillRect(x, y + h * 0.6, w, h * 0.2);

  ctx.setLineDash([5, 5]);
  ctx.globalAlpha = 0.45;
  for (let i = 1; i < 5; i++) {
    const ly = y + (h * i) / 5;
    line(ctx, x, ly, x + w, ly, lw * 0.75);
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function drawGoalPosts(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
  side: "left" | "right",
  _halfView = false,
) {
  const { x, y, w, h } = pitch;
  const goalHalf =
    SOCCER_PITCH_M.goalWidth / 2 / SOCCER_PITCH_M.width;
  const postThick = Math.max(3, lw * 2.2);
  const depth = Math.max(postThick * 2.8, w * 0.025);
  const top = y + h * (0.5 - goalHalf);
  const bot = y + h * (0.5 + goalHalf);
  const left = side === "left";
  const goalLineX = left ? x : x + w;
  const backX = left ? goalLineX - depth : goalLineX + depth - postThick;

  ctx.fillStyle = LINE;
  ctx.fillRect(
    left ? backX : goalLineX,
    top - postThick / 2,
    depth,
    postThick,
  );
  ctx.fillRect(
    left ? backX : goalLineX,
    bot - postThick / 2,
    depth,
    postThick,
  );
  ctx.fillRect(backX, top, postThick, bot - top);
}

function drawPenaltyBoxAccurate(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
  side: "left" | "right",
  halfView = false,
) {
  const { x, y, w, h } = pitch;
  const N = SOCCER_NORM;
  const penW = (halfView ? N.penDepth * 2 : N.penDepth) * w;
  const penH = N.penHalfH * 2 * h;
  const goalW = (halfView ? N.goalDepth * 2 : N.goalDepth) * w;
  const goalH = N.goalHalfH * 2 * h;
  const by = y + (h - penH) / 2;
  const gy = y + (h - goalH) / 2;
  const left = side === "left";
  const bx = left ? x : x + w - penW;
  const gx = left ? x : x + w - goalW;

  strokeRect(ctx, bx, by, penW, penH, lw);
  strokeRect(ctx, gx, gy, goalW, goalH, lw);

  const spotX = left
    ? x + (halfView ? N.penSpot * 2 : N.penSpot) * w
    : x + w - (halfView ? N.penSpot * 2 : N.penSpot) * w;
  const spotY = y + h / 2;
  ctx.beginPath();
  ctx.arc(spotX, spotY, Math.max(2, lw * 1.2), 0, Math.PI * 2);
  ctx.fillStyle = LINE;
  ctx.fill();

  const arcR = N.centerR * h;
  const boxEdgeX = left ? bx + penW : bx;
  ctx.beginPath();
  if (left) {
    const ang = Math.acos(
      Math.min(1, Math.max(-1, (boxEdgeX - spotX) / arcR)),
    );
    ctx.arc(spotX, spotY, arcR, -ang, ang);
  } else {
    const ang = Math.acos(
      Math.min(1, Math.max(-1, (spotX - boxEdgeX) / arcR)),
    );
    ctx.arc(spotX, spotY, arcR, Math.PI - ang, Math.PI + ang);
  }
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();
}

function drawCorners(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  const r = SOCCER_NORM.cornerR * h;
  const corners: [number, number, number, number][] = [
    [x, y, 0, Math.PI / 2],
    [x + w, y, Math.PI / 2, Math.PI],
    [x, y + h, -Math.PI / 2, 0],
    [x + w, y + h, Math.PI, Math.PI * 1.5],
  ];
  for (const [cx, cy, a0, a1] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, a0, a1);
    ctx.lineWidth = lw;
    ctx.strokeStyle = LINE;
    ctx.stroke();
  }
}

function drawBasketball(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  line(ctx, x + w / 2, y, x + w / 2, y + h, lw);
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, h * 0.12, 0, Math.PI * 2);
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();

  const laneW = w * (5.8 / 28);
  const laneH = h * (4.9 / 15);
  strokeRect(ctx, x, y + (h - laneH) / 2, laneW, laneH, lw);
  strokeRect(ctx, x + w - laneW, y + (h - laneH) / 2, laneW, laneH, lw);

  ctx.beginPath();
  ctx.arc(x + laneW * 0.3, y + h / 2, h * 0.42, -Math.PI / 2.2, Math.PI / 2.2);
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + w - laneW * 0.3,
    y + h / 2,
    h * 0.42,
    Math.PI - Math.PI / 2.2,
    Math.PI + Math.PI / 2.2,
  );
  ctx.stroke();
}

function drawVolleyball(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  line(ctx, x + w / 2, y, x + w / 2, y + h, lw);
  const attack = w * (3 / 18);
  line(ctx, x + w / 2 - attack, y, x + w / 2 - attack, y + h, lw);
  line(ctx, x + w / 2 + attack, y, x + w / 2 + attack, y + h, lw);
}
