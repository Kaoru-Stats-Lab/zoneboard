import type { BoardDocument } from "../models/types";
import { BEACH_NORM, FUTSAL_NORM } from "../presets/smallPitches";
import {
  LANE5_BOUNDARY_NORM,
  SOCCER_NORM,
  SOCCER_PITCH_M,
  soccerMowingStripeWidthsM,
} from "../presets/soccerPitch";
import { BASKET_HALF_START } from "../presets/sports";
import { fromNorm, type PitchRect } from "./layout";

const LINE = "#1a1a1a";
const GRASS_INK = "rgba(255, 255, 255, 0.94)";

function usesGrassPitch(board?: BoardDocument): boolean {
  return board?.sport === "soccer" && !!board.showGrassPitch;
}

function pitchInk(board?: BoardDocument): string {
  return usesGrassPitch(board) ? GRASS_INK : LINE;
}

/** drawPitchMarkings / drawPitchLanes 中の線色（line / strokeRect が参照） */
let activePitchInk = LINE;

function setActivePitchInk(board?: BoardDocument) {
  activePitchInk = pitchInk(board);
}

function strokeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lw: number,
) {
  ctx.lineWidth = lw;
  ctx.strokeStyle = activePitchInk;
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
  ctx.strokeStyle = activePitchInk;
  ctx.stroke();
}

export function outerFillForBoard(board: BoardDocument): string {
  return usesGrassPitch(board) ? "#1f5230" : "#ffffff";
}

export function pitchLineWidth(pitch: PitchRect): number {
  return Math.max(1.2, Math.min(pitch.w, pitch.h) * 0.0035);
}

/** ピッチ面（最下層の塗り） */
export function drawPitchSurface(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board?: BoardDocument,
) {
  const { x, y, w, h } = pitch;
  if (board?.sport === "beach_soccer") {
    ctx.fillStyle = "#f7edd4";
    ctx.fillRect(x, y, w, h);
  } else if (board?.sport === "basketball" && board.showWoodCourt) {
    drawWoodSurface(ctx, pitch);
  } else if (usesGrassPitch(board)) {
    drawGrassSurface(ctx, pitch, board);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, w, h);
  }
}

/** サッカー芝（UEFA 刈り込み縞＋微細ノイズ。配信向け） */
function drawGrassSurface(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board?: BoardDocument,
) {
  const { x, y, w, h } = pitch;
  ctx.fillStyle = "#2f6e38";
  ctx.fillRect(x, y, w, h);

  const view = board?.pitchView === "half" ? "half" : "full";
  const widthsM = soccerMowingStripeWidthsM(view);
  const lengthM =
    view === "half" ? SOCCER_PITCH_M.length / 2 : SOCCER_PITCH_M.length;
  let cursor = x;
  for (let i = 0; i < widthsM.length; i++) {
    const sw = (widthsM[i]! / lengthM) * w;
    const sx = cursor;
    cursor += sw;
    const bandW = i === widthsM.length - 1 ? x + w - sx : sw + 1;
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
    ctx.fillRect(sx, y, bandW, h);
  }

  const grains = Math.min(900, Math.floor((w * h) / 620));
  for (let i = 0; i < grains; i++) {
    const gx = x + (((i * 7919) % 997) / 997) * w;
    const gy = y + (((i * 6271) % 991) / 991) * h;
    ctx.fillStyle = i % 3 === 0 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)";
    ctx.fillRect(gx, gy, 1.1, 1.1);
  }
}

/** バスケ木目（FastDraw 系。配信でも黒線が読める程度の地味さ） */
function drawWoodSurface(ctx: CanvasRenderingContext2D, pitch: PitchRect) {
  const { x, y, w, h } = pitch;
  ctx.fillStyle = "#c9955a";
  ctx.fillRect(x, y, w, h);

  const rows = Math.max(8, Math.ceil(h / 8));
  for (let i = 0; i < rows; i++) {
    const ry = y + (i * h) / rows;
    const rh = h / rows + 1;
    const v = (i * 17) % 7;
    ctx.fillStyle = `rgba(${72 + v * 10}, ${44 + v * 5}, ${18 + v * 3}, 0.1)`;
    ctx.fillRect(x, ry, w, rh);
  }

  const streaks = Math.max(4, Math.floor(w / 36));
  for (let i = 0; i < streaks; i++) {
    const sx = x + (((i * 73 + 11) % 997) / 997) * w;
    ctx.fillStyle = "rgba(55, 32, 12, 0.05)";
    ctx.fillRect(sx, y, 2, h);
  }
}

/** 競技別オーバーレイ（ロゴより下） */
export function drawPitchLanes(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
) {
  const lw = pitchLineWidth(pitch);
  setActivePitchInk(board);
  if (board.sport === "soccer" && board.showLanes5) {
    drawLanes5(ctx, pitch, lw);
  }
  if (board.sport === "futsal") {
    if (board.showCorridors3) drawCorridors3(ctx, pitch, lw);
    if (board.showPressLines) drawPressLines(ctx, pitch, lw);
  }
  if (board.sport === "basketball") {
    drawBasketOverlays(ctx, pitch, board, lw);
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
  setActivePitchInk(board);
  strokeRect(ctx, x, y, w, h, lw);

  if (board.sport === "soccer") {
    drawSoccerMarkings(ctx, pitch, board, lw);
  } else if (board.sport === "futsal") {
    drawFutsalMarkings(ctx, pitch, lw);
  } else if (board.sport === "beach_soccer") {
    drawBeachMarkings(ctx, pitch, lw);
  } else if (board.sport === "basketball") {
    drawBasketball(ctx, pitch, board, lw);
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
  drawPitchSurface(ctx, pitch, board);
  drawPitchLanes(ctx, pitch, board);
  drawPitchMarkings(ctx, pitch, board);
}

/**
 * ビーチ: 射線（Pasillo de tiro）
 * ボール位置から両ゴールの両ポストへ。ON/OFF。
 */
export function drawShotCorridor(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  ball: { x: number; y: number },
) {
  const posts: { x: number; y: number }[] = [
    { x: 0, y: 0.5 - BEACH_NORM.goalHalfH },
    { x: 0, y: 0.5 + BEACH_NORM.goalHalfH },
    { x: 1, y: 0.5 - BEACH_NORM.goalHalfH },
    { x: 1, y: 0.5 + BEACH_NORM.goalHalfH },
  ];
  const from = fromNorm(ball.x, ball.y, pitch);
  const lw = pitchLineWidth(pitch);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "rgba(230, 126, 34, 0.75)";
  ctx.lineWidth = lw * 0.9;
  for (const p of posts) {
    const to = fromNorm(p.x, p.y, pitch);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawFutsalMarkings(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  const N = FUTSAL_NORM;

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

  drawFutsalPenalty(ctx, pitch, lw, "left");
  drawFutsalPenalty(ctx, pitch, lw, "right");
  drawSmallCorners(ctx, pitch, lw, N.cornerR * h);
  drawSizedGoals(ctx, pitch, lw, N.goalHalfH, "left");
  drawSizedGoals(ctx, pitch, lw, N.goalHalfH, "right");
}

function drawFutsalPenalty(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
  side: "left" | "right",
) {
  const { x, y, w, h } = pitch;
  const N = FUTSAL_NORM;
  const r = N.penR * h;
  const goalHalf = N.goalHalfH;
  const topPostY = y + h * (0.5 - goalHalf);
  const botPostY = y + h * (0.5 + goalHalf);
  const left = side === "left";
  const gx = left ? x : x + w;
  const lineX = left ? x + N.penSpot * w : x + w - N.penSpot * w;
  const spotX = left ? x + N.penSpot * w : x + w - N.penSpot * w;
  const spot2X = left
    ? x + N.secondPenSpot * w
    : x + w - N.secondPenSpot * w;

  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  if (left) {
    ctx.arc(gx, topPostY, r, -Math.PI / 2, 0);
    ctx.lineTo(lineX, botPostY);
    ctx.arc(gx, botPostY, r, 0, Math.PI / 2);
  } else {
    ctx.arc(gx, topPostY, r, -Math.PI / 2, Math.PI, true);
    ctx.lineTo(lineX, botPostY);
    ctx.arc(gx, botPostY, r, Math.PI, Math.PI / 2, true);
  }
  ctx.stroke();

  for (const sx of [spotX, spot2X]) {
    ctx.beginPath();
    ctx.arc(sx, y + h / 2, Math.max(2, lw), 0, Math.PI * 2);
    ctx.fillStyle = LINE;
    ctx.fill();
  }
}

function drawBeachMarkings(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  const N = BEACH_NORM;

  line(ctx, x + w / 2, y, x + w / 2, y + h, lw);
  const cr = N.centerR * h;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, cr, 0, Math.PI * 2);
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, Math.max(2, lw), 0, Math.PI * 2);
  ctx.fillStyle = LINE;
  ctx.fill();

  // 9m 仮想ペナルティ線（ピッチに実線はなく、黄旗を結ぶ仮想線）
  const penW = N.penDepth * w;
  const flagR = Math.max(3, lw * 2);
  ctx.setLineDash([8, 7]);
  ctx.strokeStyle = "#e6b800";
  ctx.lineWidth = lw * 1.35;
  ctx.beginPath();
  ctx.moveTo(x + penW, y);
  ctx.lineTo(x + penW, y + h);
  ctx.moveTo(x + w - penW, y);
  ctx.lineTo(x + w - penW, y + h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = LINE;

  for (const [fx, fy] of [
    [x + penW, y],
    [x + penW, y + h],
    [x + w - penW, y],
    [x + w - penW, y + h],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy - flagR * 2.2);
    ctx.lineWidth = lw;
    ctx.strokeStyle = "#e6b800";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx, fy - flagR * 2.2);
    ctx.lineTo(fx + flagR * 1.4, fy - flagR * 1.5);
    ctx.lineTo(fx, fy - flagR * 0.9);
    ctx.closePath();
    ctx.fillStyle = "#f1c40f";
    ctx.fill();
  }
  ctx.strokeStyle = LINE;

  for (const sx of [x + N.penSpot * w, x + w - N.penSpot * w]) {
    ctx.beginPath();
    ctx.arc(sx, y + h / 2, Math.max(2, lw), 0, Math.PI * 2);
    ctx.fillStyle = LINE;
    ctx.fill();
  }

  drawSizedGoals(ctx, pitch, lw, N.goalHalfH, "left");
  drawSizedGoals(ctx, pitch, lw, N.goalHalfH, "right");
}

function drawSmallCorners(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
  r: number,
) {
  const { x, y, w, h } = pitch;
  const corners: [number, number, number, number][] = [
    [x, y, 0, Math.PI / 2],
    [x + w, y, Math.PI / 2, Math.PI],
    [x, y + h, -Math.PI / 2, 0],
    [x + w, y + h, Math.PI, Math.PI * 1.5],
  ];
  for (const [cx, cy, a0, a1] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(r, lw * 2), a0, a1);
    ctx.lineWidth = lw;
    ctx.strokeStyle = LINE;
    ctx.stroke();
  }
}

function drawSizedGoals(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
  goalHalfH: number,
  side: "left" | "right",
) {
  const { x, y, w, h } = pitch;
  const postThick = Math.max(3, lw * 2.2);
  const depth = Math.max(postThick * 2.8, w * 0.03);
  const top = y + h * (0.5 - goalHalfH);
  const bot = y + h * (0.5 + goalHalfH);
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
    ctx.strokeStyle = activePitchInk;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2, lw), 0, Math.PI * 2);
    ctx.fillStyle = activePitchInk;
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
    ctx.strokeStyle = activePitchInk;
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
  const [lhsOuter, lhsInner, rhsInner, rhsOuter] = LANE5_BOUNDARY_NORM;

  ctx.fillStyle = "rgba(52, 152, 219, 0.07)";
  ctx.fillRect(x, y + lhsOuter * h, w, (lhsInner - lhsOuter) * h);
  ctx.fillRect(x, y + rhsInner * h, w, (rhsOuter - rhsInner) * h);

  ctx.setLineDash([5, 5]);
  ctx.globalAlpha = 0.45;
  for (const t of LANE5_BOUNDARY_NORM) {
    const ly = y + h * t;
    line(ctx, x, ly, x + w, ly, lw * 0.75);
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

/** フットサル: 縦3廊下（左アラ / 中央 / 右アラ） */
function drawCorridors3(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  ctx.fillStyle = "rgba(52, 152, 219, 0.06)";
  ctx.fillRect(x, y, w, h / 3);
  ctx.fillRect(x, y + (h * 2) / 3, w, h / 3);

  ctx.setLineDash([6, 5]);
  ctx.globalAlpha = 0.5;
  for (let i = 1; i < 3; i++) {
    const ly = y + (h * i) / 3;
    line(ctx, x, ly, x + w, ly, lw * 0.8);
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

/** フットサル: プレス基準線（1/4・ハーフ・3/4） */
function drawPressLines(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  ctx.setLineDash([4, 6]);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#c0392b";
  ctx.lineWidth = lw * 0.85;
  for (const t of [0.25, 0.5, 0.75]) {
    const lx = x + w * t;
    ctx.beginPath();
    ctx.moveTo(lx, y);
    ctx.lineTo(lx, y + h);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = LINE;
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

  ctx.fillStyle = activePitchInk;
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
  ctx.fillStyle = activePitchInk;
  ctx.fill();

  const arcR = (SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.length) * w;
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
  ctx.strokeStyle = activePitchInk;
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
    ctx.strokeStyle = activePitchInk;
    ctx.stroke();
  }
}

/**
 * FIBA / JBA / Bリーグ現行（2010年以降）
 * - コート 28×15 m
 * - 制限区域: 長方形 5.8×4.9 m（旧台形ではない）
 * - 3P: リング中心から 6.75 m の弧 ＋ エンドラインから出るコーナー直線（サイドから 0.90 m）
 * リング中心はエンドライン内側から 1.575 m
 */
function drawBasketball(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  const half = board.pitchView === "half";
  const sy = h / 15;

  if (!half) {
    const sx = w / 28;
    line(ctx, x + w / 2, y, x + w / 2, y + h, lw);
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 1.8 * sy, 0, Math.PI * 2);
    ctx.lineWidth = lw;
    ctx.strokeStyle = LINE;
    ctx.stroke();
    drawFibaKeyAndThree(ctx, pitch, lw, "left", sx, sy);
    drawFibaKeyAndThree(ctx, pitch, lw, "right", sx, sy);
    return;
  }

  // ハーフ: センターサークル付近〜エンド（自陣寄りの低い攻撃を含む）
  const span = 1 - BASKET_HALF_START;
  const visibleM = 28 * span;
  const sx = w / visibleM;
  const flipped = board.pitchFlipped;
  const worldToPx = (wx: number) => {
    if (flipped) {
      return x + (wx / (1 - BASKET_HALF_START)) * w;
    }
    return x + ((wx - BASKET_HALF_START) / span) * w;
  };

  const midX = worldToPx(0.5);
  line(ctx, midX, y, midX, y + h, lw);
  ctx.beginPath();
  ctx.arc(midX, y + h / 2, 1.8 * sy, 0, Math.PI * 2);
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();

  drawFibaKeyAndThree(ctx, pitch, lw, flipped ? "left" : "right", sx, sy);
}

function drawFibaKeyAndThree(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
  side: "left" | "right",
  sx: number,
  sy: number,
) {
  const { x, y, w, h } = pitch;
  const left = side === "left";
  const endX = left ? x : x + w;
  // リング中心
  const basketX = left ? x + 1.575 * sx : x + w - 1.575 * sx;
  const basketY = y + h / 2;
  // 制限区域（長方形）: エンドから 5.8 m、幅 4.9 m
  const keyDepth = 5.8 * sx;
  const keyHalf = (4.9 / 2) * sy;
  const keyX = left ? x : x + w - keyDepth;
  strokeRect(ctx, keyX, basketY - keyHalf, keyDepth, keyHalf * 2, lw);

  // フリースロー半円（半径 1.80 m）
  const ftR = 1.8 * sy;
  const ftX = left ? x + keyDepth : x + w - keyDepth;
  ctx.beginPath();
  if (left) {
    ctx.arc(ftX, basketY, ftR, -Math.PI / 2, Math.PI / 2);
  } else {
    ctx.arc(ftX, basketY, ftR, Math.PI / 2, -Math.PI / 2);
  }
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();

  // 3P: コーナー直線（サイドから 0.90 m）＋弧（半径 6.75 m）
  const cornerInset = 0.9 * sy;
  const threeR = 6.75 * sy;
  const yTop = y + cornerInset;
  const yBot = y + h - cornerInset;
  // 直線と弧の交点（エンドから内側へ）
  const dyTop = yTop - basketY;
  const dxJoin = Math.sqrt(Math.max(0, threeR * threeR - dyTop * dyTop));
  const joinXTop = left ? basketX + dxJoin : basketX - dxJoin;
  const joinXBot = joinXTop;

  ctx.beginPath();
  ctx.moveTo(endX, yTop);
  ctx.lineTo(joinXTop, yTop);
  const aTop = Math.atan2(yTop - basketY, joinXTop - basketX);
  const aBot = Math.atan2(yBot - basketY, joinXBot - basketX);
  if (left) {
    ctx.arc(basketX, basketY, threeR, aTop, aBot, false);
  } else {
    ctx.arc(basketX, basketY, threeR, aTop, aBot, true);
  }
  ctx.lineTo(endX, yBot);
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();

  drawBasketRimAndBoard(ctx, pitch, lw, side, sx, sy, basketX, basketY);
}

/** 俯瞰のリング＋ボード（FIBA: ボード幅 1.80 m、リング直径 0.45 m） */
function drawBasketRimAndBoard(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  lw: number,
  side: "left" | "right",
  sx: number,
  sy: number,
  basketX: number,
  basketY: number,
) {
  const { x, w } = pitch;
  const left = side === "left";
  // ボード面はエンドラインから 1.20 m（リング中心 1.575 m − 0.375 m）
  const boardX = left ? x + 1.2 * sx : x + w - 1.2 * sx;
  const boardHalf = (1.8 / 2) * sy;
  const boardThick = Math.max(lw * 2.5, 0.05 * sx);

  ctx.fillStyle = LINE;
  ctx.fillRect(
    left ? boardX - boardThick : boardX,
    basketY - boardHalf,
    boardThick,
    boardHalf * 2,
  );

  const rimR = Math.max(lw * 2, (0.45 / 2) * sy);
  ctx.beginPath();
  ctx.arc(basketX, basketY, rimR, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1.5, lw * 1.2);
  ctx.strokeStyle = "#c0392b";
  ctx.stroke();

  // ボードとリングを結ぶ短いネック
  ctx.beginPath();
  ctx.moveTo(boardX, basketY);
  ctx.lineTo(basketX, basketY);
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINE;
  ctx.stroke();
}

/** バスケ戦術オーバーレイ（FIBA寸法に合わせる） */
function drawBasketOverlays(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  lw: number,
) {
  const { x, y, w, h } = pitch;
  const half = board.pitchView === "half";
  const flipped = board.pitchFlipped;
  const visibleM = half ? 28 * (1 - BASKET_HALF_START) : 28;
  const sx = w / visibleM;
  const sy = h / 15;
  const keyDepth = 5.8 * sx;
  const keyHalf = (4.9 / 2) * sy;
  const threeR = 6.75 * sy;
  const cornerInset = 0.9 * sy;

  const paintRects = half
    ? [
        {
          px: flipped ? x : x + w - keyDepth,
          py: y + h / 2 - keyHalf,
        },
      ]
    : [
        { px: x, py: y + h / 2 - keyHalf },
        { px: x + w - keyDepth, py: y + h / 2 - keyHalf },
      ];

  if (board.showPaintHighlight) {
    ctx.fillStyle = "rgba(52, 152, 219, 0.12)";
    for (const { px, py } of paintRects) {
      ctx.fillRect(px, py, keyDepth, keyHalf * 2);
    }
  }

  if (board.showThreePointEmphasis) {
    ctx.lineWidth = lw * 2.2;
    ctx.strokeStyle = "rgba(230, 126, 34, 0.85)";
    const sides: ("left" | "right")[] = half
      ? [flipped ? "left" : "right"]
      : ["left", "right"];
    for (const side of sides) {
      const left = side === "left";
      const endX = left ? x : x + w;
      const basketX = left ? x + 1.575 * sx : x + w - 1.575 * sx;
      const basketY = y + h / 2;
      const yTop = y + cornerInset;
      const yBot = y + h - cornerInset;
      const dyTop = yTop - basketY;
      const dxJoin = Math.sqrt(Math.max(0, threeR * threeR - dyTop * dyTop));
      const joinX = left ? basketX + dxJoin : basketX - dxJoin;
      ctx.beginPath();
      ctx.moveTo(endX, yTop);
      ctx.lineTo(joinX, yTop);
      const aTop = Math.atan2(yTop - basketY, joinX - basketX);
      const aBot = Math.atan2(yBot - basketY, joinX - basketX);
      ctx.arc(basketX, basketY, threeR, aTop, aBot, !left);
      ctx.lineTo(endX, yBot);
      ctx.stroke();
    }
    ctx.strokeStyle = LINE;
  }

  if (board.showMiddleLine) {
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "rgba(192, 57, 43, 0.55)";
    ctx.lineWidth = lw * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = LINE;
  }

  if (board.showSlotLines) {
    const edges = half
      ? [flipped ? x + keyDepth : x + w - keyDepth]
      : [x + keyDepth, x + w - keyDepth];
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(41, 128, 185, 0.5)";
    ctx.lineWidth = lw * 0.75;
    for (const ex of edges) {
      ctx.beginPath();
      ctx.moveTo(ex, y);
      ctx.lineTo(ex, y + h);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = LINE;
  }

  if (board.showSpotMarkers) {
    // ハーフ: 右ゴール攻撃側の目安点（FIBAハーフ上の相対位置）
    const spots = half
      ? [
          [0.5, 0.5],
          [0.68, 0.18],
          [0.68, 0.82],
          [0.92, 0.08],
          [0.92, 0.92],
          [0.72, 0.35],
          [0.72, 0.65],
        ]
      : [
          [0.75, 0.5],
          [0.85, 0.18],
          [0.85, 0.82],
          [0.94, 0.08],
          [0.94, 0.92],
          [0.88, 0.35],
          [0.88, 0.65],
          [0.25, 0.5],
          [0.15, 0.18],
          [0.15, 0.82],
          [0.06, 0.08],
          [0.06, 0.92],
          [0.12, 0.35],
          [0.12, 0.65],
        ];
    const r = Math.max(3, lw * 1.6);
    ctx.fillStyle = "rgba(39, 174, 96, 0.85)";
    for (const [nx, ny] of spots) {
      const p = fromNorm(nx, ny, pitch);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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
