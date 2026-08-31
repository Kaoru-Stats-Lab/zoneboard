import { isPieceDrawn } from "../models/scene";
import { resolveLinkPoints } from "../models/pieceLink";
import { drawCaptureUnderlay } from "../capture/drawCaptureUnderlay";
import type {
  BoardDocument,
  DrawObject,
  LineKind,
  LineObject,
  MatchStatus,
  Piece,
  Scene,
  WatermarkSettings,
} from "../models/types";
import {
  BANNER_FONT_STACK,
  UI_FONT_STACK,
  usesPreferredFoot,
} from "../models/types";
import { truncateByWidth } from "./matchBanner";
import {
  fitNumberFontSize,
  normalizePieceNumber,
  numberFill,
  numberHalo,
  pieceFillColor,
  relativeLuminance,
} from "./pieceInk";
import {
  grassHaloWidth,
  HALO_INK_GRASS,
  lineColorForBoard,
  linkColorForBoard,
  LINK_SHADOW_GRASS,
  penColorForBoard,
  textColorForBoard,
  usesGrassInk,
  zoneColorsForBoard,
} from "./drawingInk";
import {
  drawArrowHeadAt,
  endTangentAngle,
  strokeWavyPath,
  wavyPathFromPolyline,
} from "./wavyPath";
import { textFontStack } from "../presets/textStyle";
import { tracePenBezierPath } from "./smoothPath";
import { pieceDiscipline, drawPieceCardMark } from "./matchCards";
import { BASKET_HALF_START, effectivePitchOrientation } from "../presets/sports";
import {
  drawPitchLanes,
  drawPitchMarkings,
  drawPitchSurface,
  drawShotCorridor,
  outerFillForBoard,
  pitchLineWidth,
} from "./drawPitch";
import { fromNorm, pointerHitSlop, type PitchRect } from "./layout";
import { ZOOM_MAX, ZOOM_MIN } from "../presets/viewport";

type ZoneBounds = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

function zoneNormBounds(zone: {
  x: number;
  y: number;
  w: number;
  h: number;
}): ZoneBounds {
  const x0 = Math.min(zone.x, zone.x + zone.w);
  const x1 = Math.max(zone.x, zone.x + zone.w);
  const y0 = Math.min(zone.y, zone.y + zone.h);
  const y1 = Math.max(zone.y, zone.y + zone.h);
  return {
    x0,
    y0,
    x1,
    y1,
    cx: (x0 + x1) / 2,
    cy: (y0 + y1) / 2,
    rx: (x1 - x0) / 2,
    ry: (y1 - y0) / 2,
  };
}

/** AABB に内接する軸平行楕円（描画・ヒット共通） */
function fillStrokeZoneEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: boolean,
  stroke: boolean,
) {
  const rx = Math.abs(w) / 2;
  const ry = Math.abs(h) / 2;
  if (rx < 0.5 || ry < 0.5) return;
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function normPointInZoneEllipse(
  normX: number,
  normY: number,
  zone: { x: number; y: number; w: number; h: number },
  slop: number,
): boolean {
  const { cx, cy, rx, ry } = zoneNormBounds(zone);
  if (rx <= 0 || ry <= 0) return false;
  const erx = rx + slop;
  const ery = ry + slop;
  const dx = (normX - cx) / erx;
  const dy = (normY - cy) / ery;
  return dx * dx + dy * dy <= 1;
}

export function worldToPitch(
  x: number,
  y: number,
  board: BoardDocument,
): { x: number; y: number } | null {
  // バッファ（サブ・ゴール裏・タッチ外）は常に表示
  if (y < 0 || y > 1 || x < 0 || x > 1) return { x, y };
  if (board.pitchView !== "half") {
    return { x, y };
  }
  if (board.sport === "basketball") {
    const start = BASKET_HALF_START;
    const end = 1 - BASKET_HALF_START;
    if (board.pitchFlipped) {
      if (x < -0.02 || x > end + 0.02) return null;
      return { x: Math.min(1, Math.max(0, x / end)), y };
    }
    if (x < start - 0.02 || x > 1.02) return null;
    return {
      x: Math.min(1, Math.max(0, (x - start) / (1 - start))),
      y,
    };
  }
  if (board.sport !== "soccer") {
    return { x, y };
  }
  // 縦: 長さ＝y。ハーフは下半分（flip 時は上）
  if (effectivePitchOrientation(board.sport, board.pitchOrientation) === "portrait") {
    const visY = board.pitchFlipped ? (0.5 - y) * 2 : (y - 0.5) * 2;
    if (visY < -0.02 || visY > 1.02) return null;
    return { x, y: Math.min(1, Math.max(0, visY)) };
  }
  const visX = board.pitchFlipped ? (0.5 - x) * 2 : (x - 0.5) * 2;
  if (visX < -0.02 || visX > 1.02) return null;
  return { x: Math.min(1, Math.max(0, visX)), y };
}

export function pitchToWorld(
  x: number,
  y: number,
  board: BoardDocument,
): { x: number; y: number } {
  if (y < 0 || y > 1 || x < 0 || x > 1) return { x, y };
  if (board.pitchView !== "half") {
    return { x, y };
  }
  if (board.sport === "basketball") {
    const start = BASKET_HALF_START;
    const end = 1 - BASKET_HALF_START;
    if (board.pitchFlipped) {
      return { x: x * end, y };
    }
    return { x: start + x * (1 - start), y };
  }
  if (board.sport !== "soccer") {
    return { x, y };
  }
  if (effectivePitchOrientation(board.sport, board.pitchOrientation) === "portrait") {
    if (board.pitchFlipped) {
      return { x, y: 0.5 - y / 2 };
    }
    return { x, y: 0.5 + y / 2 };
  }
  if (board.pitchFlipped) {
    return { x: 0.5 - x / 2, y };
  }
  return { x: 0.5 + x / 2, y };
}

/**
 * Match Piece Size は触らず、ズームで半径だけ抑える。
 * 画面上はフル画角と同程度の大きさ（ピッチ線だけ寄る）。
 */
function densityZoom(board: BoardDocument): number {
  const z = board.viewport?.zoom ?? 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
}

function pieceRadius(
  pitch: PitchRect,
  board: BoardDocument,
  role: "starter" | "bench" = "starter",
): number {
  const scale = board.pieceScale ?? 1;
  const base =
    (Math.min(pitch.w, pitch.h) * 0.028 * scale) / densityZoom(board);
  return role === "bench" ? base * 0.48 : base;
}

function ballRadius(pitch: PitchRect, board: BoardDocument): number {
  const scale = board.pieceScale ?? 1;
  return (
    (Math.min(pitch.w, pitch.h) * 0.016 * Math.min(1.1, scale)) /
    densityZoom(board)
  );
}

/** Pen は駒と同じ密度補正。芝ハローなし前提の細めマーカー。 */
function penStrokeWidth(
  pitch: PitchRect,
  board: BoardDocument,
  strokeWidth: number,
): number {
  return Math.max(
    1.25,
    (Math.min(pitch.w, pitch.h) * 0.002 * strokeWidth) / densityZoom(board),
  );
}

/** 構成線はピッチ白線より一段太い注釈レイヤー（Pen と同幅だと差が消える）。 */
function linkStrokeWidth(
  pitch: PitchRect,
  board: BoardDocument,
  strokeWidth: number,
): number {
  const pen = penStrokeWidth(pitch, board, strokeWidth);
  const pitchLw = pitchLineWidth(pitch);
  return Math.max(pen * 1.75, pitchLw * 1.5);
}

export type DragVisual = {
  pieceId?: string;
  ball?: boolean;
  /** 1 = 通常、ドラッグ中は 1.12〜1.2 */
  boost: number;
};

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  scene: Scene,
  opts: {
    selectedPieceId?: string | null;
    selectedPieceIds?: string[] | null;
    selectedObjectId?: string | null;
    selectedBall?: boolean;
    selectionColor?: string;
    watermark?: WatermarkSettings | null;
    watermarkImage?: HTMLImageElement | null;
    outer?: PitchRect;
    background?: string;
    dragVisual?: DragVisual | null;
    /** 描画中の自由曲線プレビュー */
    previewLine?: { kind: LineKind; points: { x: number; y: number }[] } | null;
    /** ゾーン矩形ドラッグ中のプレビュー（x0,y0=起点） */
    previewZone?: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    } | null;
    /** セレクトツールの範囲選択 */
    previewMarquee?: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    } | null;
    /** ペンドラッグ中のプレビュー */
    previewPen?: { x: number; y: number }[] | null;
    /** 構成線クリック連鎖中のプレビュー（世界座標） */
    previewLink?: { x: number; y: number }[] | null;
    /** インライン編集中のテキスト（二重表示防止） */
    editingTextId?: string | null;
    /** 競技ボール画像。未ロード時は幾何フォールバック */
    ballImage?: HTMLImageElement | null;
    /** 局面取込 W04: ワープ済み実写下敷き（pitch ローカルサイズ） */
    captureUnderlay?: {
      canvas: HTMLCanvasElement;
      opacity: number;
    } | null;
    /** 局面取込 W05: 確定前ゴースト駒 */
    draftPieces?: Piece[];
    draftBall?: { x: number; y: number } | null;
    selectedDraftPieceId?: string | null;
    draftDragPieceId?: string | null;
    draftDragBall?: boolean;
  } = {},
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = opts.background ?? outerFillForBoard(board);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const outer =
    opts.outer ??
    ({
      x: pitch.x - pitch.w * 0.14,
      y: pitch.y - pitch.h * 0.14,
      w: pitch.w * 1.28,
      h: pitch.h * 1.28,
    } satisfies PitchRect);

  ctx.fillStyle = outerFillForBoard(board);
  ctx.fillRect(outer.x, outer.y, outer.w, outer.h);

  const sel = opts.selectionColor ?? "#111111";

  // 下から: 実写下敷き → 面 → 5レーン → ロゴ → ピッチ線 → 描画 → 駒 → ボール
  if (opts.captureUnderlay) {
    drawCaptureUnderlay(
      ctx,
      pitch.x,
      pitch.y,
      pitch.w,
      pitch.h,
      opts.captureUnderlay.canvas,
      opts.captureUnderlay.opacity,
    );
  }

  drawPitchSurface(ctx, pitch, board);
  drawPitchLanes(ctx, pitch, board);

  if (
    opts.watermark?.enabled &&
    opts.watermark.imageDataUrl &&
    opts.watermarkImage
  ) {
    drawWatermark(ctx, pitch, opts.watermark, opts.watermarkImage);
  }

  drawPitchMarkings(ctx, pitch, board);

  if (board.sport === "beach_soccer" && board.showShotCorridor) {
    drawShotCorridor(ctx, pitch, scene.ball);
  }

  for (const obj of scene.objects) {
    if (obj.type === "text" && obj.id === opts.editingTextId) continue;
    drawObject(
      ctx,
      pitch,
      board,
      scene,
      obj,
      obj.id === opts.selectedObjectId,
      sel,
    );
  }

  if (opts.previewLine && opts.previewLine.points.length >= 2) {
    const kind = opts.previewLine.kind;
    drawObject(
      ctx,
      pitch,
      board,
      scene,
      {
        id: "__preview__",
        type: "line",
        kind,
        points: opts.previewLine.points,
        color: lineColorForBoard(board, kind),
        strokeWidth: 2,
      },
      false,
      sel,
    );
  }

  if (opts.previewZone) {
    drawZonePreview(ctx, pitch, board, opts.previewZone);
  }

  if (opts.previewPen && opts.previewPen.length >= 1) {
    drawPenPreview(ctx, pitch, board, opts.previewPen);
  }
  if (opts.previewLink && opts.previewLink.length >= 1) {
    drawLinkPreview(ctx, pitch, board, opts.previewLink);
  }

  const selectedIds = new Set(opts.selectedPieceIds ?? []);
  if (opts.selectedPieceId) selectedIds.add(opts.selectedPieceId);
  for (const piece of scene.pieces) {
    if (!isPieceDrawn(piece, scene)) continue;
    const boost =
      opts.dragVisual?.pieceId === piece.id ? opts.dragVisual.boost : 1;
    const r = pieceRadius(pitch, board, piece.role) * boost;
    drawPiece(
      ctx,
      pitch,
      board,
      piece,
      r,
      selectedIds.has(piece.id),
      boost > 1,
      sel,
    );
  }

  if (scene.ball) {
    const ballBoost = opts.dragVisual?.ball ? opts.dragVisual.boost : 1;
    drawBall(
      ctx,
      pitch,
      board,
      scene.ball,
      ballRadius(pitch, board) * ballBoost,
      !!opts.selectedBall || !!opts.dragVisual?.ball,
      ballBoost > 1,
      opts.ballImage ?? null,
    );
  }

  if (opts.draftPieces && opts.draftPieces.length > 0) {
    for (const piece of opts.draftPieces) {
      const dragging = opts.draftDragPieceId === piece.id;
      const boost = dragging ? 1.18 : 1;
      const r = pieceRadius(pitch, board, piece.role) * boost;
      drawPiece(
        ctx,
        pitch,
        board,
        piece,
        r,
        piece.id === opts.selectedDraftPieceId,
        dragging,
        sel,
        true,
      );
    }
  }

  if (opts.draftBall) {
    const dragging = !!opts.draftDragBall;
    const boost = dragging ? 1.2 : 1;
    ctx.save();
    ctx.globalAlpha = 0.45;
    drawBall(
      ctx,
      pitch,
      board,
      opts.draftBall,
      ballRadius(pitch, board) * boost,
      false,
      dragging,
      opts.ballImage ?? null,
    );
    ctx.restore();
  }

  if (opts.previewMarquee) {
    drawMarqueePreview(ctx, pitch, board, opts.previewMarquee, sel);
  }
}

function drawPieceNumberLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  fillColor: string,
  r: number,
) {
  const ink = numberFill(fillColor);
  const halo = numberHalo(fillColor);
  const fs = fitNumberFontSize(ctx, text, r, UI_FONT_STACK);
  ctx.font = `700 ${fs}px ${UI_FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(1, fs * 0.09);
  ctx.strokeStyle = halo;
  ctx.lineJoin = "round";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = ink;
  ctx.fillText(text, x, y);
}

/** OUT / INJ / IN — 帯内記号。色は第4審判ボード（赤=出・緑=入）。docs/BROADCAST_SUBS.md §5b */
function drawMatchStatusMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  status: MatchStatus | undefined,
) {
  if (!status || status === "on") return;
  const badgeR = Math.max(5, r * 0.38);
  const bx = x + r * 0.72;
  const by = y - r * 0.72;

  if (status === "out") {
    ctx.beginPath();
    ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(40,12,14,0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(229,57,53,0.95)";
    ctx.lineWidth = 1.15;
    ctx.stroke();
    // ↓ — leaving the pitch (fourth-official red)
    const s = badgeR * 0.42;
    ctx.beginPath();
    ctx.moveTo(bx, by - s * 0.85);
    ctx.lineTo(bx, by + s * 0.35);
    ctx.moveTo(bx - s * 0.55, by - s * 0.05);
    ctx.lineTo(bx, by + s * 0.55);
    ctx.lineTo(bx + s * 0.55, by - s * 0.05);
    ctx.strokeStyle = "rgba(255,235,235,0.98)";
    ctx.lineWidth = Math.max(1.25, badgeR * 0.28);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    return;
  }

  if (status === "injured") {
    ctx.beginPath();
    ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(40,12,14,0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(229,57,53,0.95)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Medical cross (not UI “add”)
    const arm = badgeR * 0.48;
    const thick = Math.max(1.4, badgeR * 0.32);
    ctx.fillStyle = "rgba(255,240,240,0.98)";
    ctx.fillRect(bx - thick / 2, by - arm, thick, arm * 2);
    ctx.fillRect(bx - arm, by - thick / 2, arm * 2, thick);
    return;
  }

  if (status === "in") {
    ctx.beginPath();
    ctx.arc(bx, by, badgeR * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(12,28,18,0.88)";
    ctx.fill();
    ctx.strokeStyle = "rgba(76,175,120,0.98)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // ↑ — entering (fourth-official green)
    const s = badgeR * 0.42;
    ctx.beginPath();
    ctx.moveTo(bx, by + s * 0.85);
    ctx.lineTo(bx, by - s * 0.35);
    ctx.moveTo(bx - s * 0.55, by + s * 0.05);
    ctx.lineTo(bx, by - s * 0.55);
    ctx.lineTo(bx + s * 0.55, by + s * 0.05);
    ctx.strokeStyle = "rgba(220,255,230,0.98)";
    ctx.lineWidth = Math.max(1.25, badgeR * 0.28);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
  }
}

function drawPiece(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  piece: Piece,
  r: number,
  selected: boolean,
  dragging: boolean,
  _selectionColor: string,
  ghost = false,
) {
  const mapped = worldToPitch(piece.x, piece.y, board);
  if (!mapped) return;
  const { x, y } = fromNorm(mapped.x, mapped.y, pitch);
  const discipline = pieceDiscipline(board, piece);
  const fillColor = pieceFillColor(piece);
  const darkFill = relativeLuminance(fillColor) < 0.15;
  const idleEdgeW = darkFill ? 2 : 1.5;

  if (dragging) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = r * 0.8;
    ctx.shadowOffsetY = r * 0.15;
  }

  if (ghost) {
    ctx.save();
    ctx.globalAlpha = 0.45;
  }

  if (discipline.sentOff) {
    ctx.save();
    ctx.globalAlpha = 0.45;
  }

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  // 選択縁は芝生でも読める白＋暗ハロー（設定の黒選択色は使わない）
  if (selected || dragging) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.lineWidth = 2.25;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  } else {
    ctx.lineWidth = idleEdgeW;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  }

  if (piece.role === "bench") {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.92, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawMatchStatusMark(ctx, x, y, r, piece.matchStatus);

  const rad = (piece.facing * Math.PI) / 180;
  const fx = x + Math.cos(rad) * r;
  const fy = y + Math.sin(rad) * r;
  const tx = x + Math.cos(rad) * (r + r * 0.45);
  const ty = y + Math.sin(rad) * (r + r * 0.45);
  const ox = Math.cos(rad + Math.PI / 2) * r * 0.35;
  const oy = Math.sin(rad + Math.PI / 2) * r * 0.35;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(fx - ox, fy - oy);
  ctx.lineTo(fx + ox, fy + oy);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();
  // 向きは二次情報。キットの番号インクに追従させない（黄GKだけ黒三角になる）
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = Math.max(0.7, Math.min(1.05, r * 0.048));
  ctx.stroke();
  ctx.lineJoin = "miter";
  ctx.lineCap = "butt";

  if (discipline.sentOff) ctx.restore();
  if (ghost) ctx.restore();
  if (dragging) ctx.restore();

  // カード形は番号と同様フル不透明（「提示された」が一見で読める）
  if (!ghost && discipline.cardMark) {
    drawPieceCardMark(ctx, x, y, r, discipline.cardMark);
  }

  // 押した瞬間からリング。ドラッグ中に消すと「1テンポ遅れてアクティブ」に見える
  if (selected) {
    drawPieceSelectionRing(ctx, x, y, r * 1.72);
  }

  if (ghost) return;

  const displayNumber = normalizePieceNumber(piece.number);
  if (displayNumber) {
    drawPieceNumberLabel(ctx, x, y, displayNumber, fillColor, r);
  }

  if (piece.role === "bench" || board.showPlayerNames) {
    drawPlayerNameChip(ctx, pitch, x, y, r, piece, board, selected);
  }

  // 利き足（サカ系のみ）。向きに対して L=左 / R=右。両利きは両方出す（B 一文字にしない）
  const foot = usesPreferredFoot(board.sport) ? piece.preferredFoot : null;
  if (foot === "L" || foot === "R" || foot === "B") {
    const marks: ("L" | "R")[] =
      foot === "B" ? ["L", "R"] : [foot];
    for (const mark of marks) {
      const footRad = rad + (mark === "L" ? -Math.PI / 2 : Math.PI / 2);
      const footDist = r * 0.9;
      const mx = x + Math.cos(footRad) * footDist;
      const my = y + Math.sin(footRad) * footDist;
      const fs = r * 0.42;
      ctx.beginPath();
      ctx.arc(mx, my, fs * 0.72, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `700 ${fs}px ${UI_FONT_STACK}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mark, mx, my);
    }
  }
}

function captionNameForPiece(piece: Piece, board: BoardDocument): string {
  const own = piece.label.trim();
  if (own) return own;
  const num = normalizePieceNumber(piece.number);
  if (!num) return "";
  return (
    board.roster[piece.team].players
      .find((p) => normalizePieceNumber(p.number) === num)
      ?.label.trim() ?? ""
  );
}

/** スペース区切りなら末尾（姓）。単一語・日本語はそのまま */
function shortPlayerName(full: string): string {
  const t = full.trim();
  if (!t) return "";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1]!;
  return t;
}

/**
 * 円下の暗チップ（控え常時 · 芝上は showPlayerNames 時）。
 * 通常は短い姓、選択時はフル寄り。
 */
function drawPlayerNameChip(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  x: number,
  y: number,
  r: number,
  piece: Piece,
  board: BoardDocument,
  selected: boolean,
) {
  const full = captionNameForPiece(piece, board);
  if (!full) return;
  const prefer = selected ? full : shortPlayerName(full);
  const fs = Math.max(10, Math.min(selected ? 13 : 12, r * 1.05));
  ctx.font = `700 ${fs}px ${BANNER_FONT_STACK}`;
  const maxW = selected
    ? Math.max(r * 10, pitch.w * 0.14)
    : Math.max(r * 7.5, pitch.w * 0.078);
  const shown = truncateByWidth(ctx, prefer, maxW);
  const textW = ctx.measureText(shown).width;
  const padX = Math.max(5, fs * 0.4);
  const padY = Math.max(2.5, fs * 0.22);
  const chipW = textW + padX * 2;
  const chipH = fs + padY * 2;
  const top = y + r + Math.max(3, r * 0.28);
  const left = x - chipW / 2;
  const radius = Math.min(3, chipH / 2);

  ctx.beginPath();
  ctx.moveTo(left + radius, top);
  ctx.arcTo(left + chipW, top, left + chipW, top + chipH, radius);
  ctx.arcTo(left + chipW, top + chipH, left, top + chipH, radius);
  ctx.arcTo(left, top + chipH, left, top, radius);
  ctx.arcTo(left, top, left + chipW, top, radius);
  ctx.closePath();
  ctx.fillStyle = selected ? "rgba(12,13,14,0.92)" : "rgba(12,13,14,0.78)";
  ctx.fill();
  if (selected) {
    ctx.strokeStyle = "rgba(243,243,241,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.fillStyle = "#f3f3f1";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(shown, x, top + chipH / 2);
}

/** 芝上でも読める選択リング（暗ハロー＋白〜淡黄破線） */
function drawPieceSelectionRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ringR: number,
) {
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = "#FEF9C3";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** 芝上のアクティブ縁。ボールはキットではないので設定の選択色は使わない。 */
function strokeBallRim(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  selected: boolean,
  idleColor: string,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (selected) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.lineWidth = 2.25;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  } else {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = idleColor;
    ctx.stroke();
  }
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  ball: { x: number; y: number },
  r: number,
  selected: boolean,
  dragging: boolean,
  ballImage: HTMLImageElement | null,
) {
  const mapped = worldToPitch(ball.x, ball.y, board);
  if (!mapped) return;
  const { x, y } = fromNorm(mapped.x, mapped.y, pitch);

  if (dragging) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = r * 0.9;
    ctx.shadowOffsetY = r * 0.2;
  }

  const idleRim =
    board.sport === "basketball" ? "#5d3a1a" : "#1a1a1a";

  if (ballImage && ballImage.complete && ballImage.naturalWidth > 0) {
    // 画像の透明ギャップからピッチが透けないよう、不透明な下地円を先に塗る
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = ballUnderlayColor(board.sport);
    ctx.fill();
    const d = r * 2;
    ctx.drawImage(ballImage, x - r, y - r, d, d);
    strokeBallRim(ctx, x, y, r, selected, idleRim);
  } else if (board.sport === "basketball") {
    drawBasketballBall(ctx, x, y, r, selected);
  } else if (board.sport === "volleyball") {
    drawVolleyballBall(ctx, x, y, r, selected);
  } else {
    drawSoccerBallFallback(ctx, x, y, r, selected);
  }

  if (dragging) ctx.restore();
}

function ballUnderlayColor(sport: BoardDocument["sport"]): string {
  if (sport === "basketball") return "#C65102";
  if (sport === "volleyball") return "#ffffff";
  // サッカー: 白パネルが欠けていてもピッチが透けない
  return "#ffffff";
}

function drawSoccerBallFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  selected: boolean,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const px = Math.cos(a) * r * 0.28;
    const py = Math.sin(a) * r * 0.28;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.lineJoin = "round";
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const a2 = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
    const ix = Math.cos(a) * r * 0.28;
    const iy = Math.sin(a) * r * 0.28;
    const mx = Math.cos(a2) * r * 0.55;
    const my = Math.sin(a2) * r * 0.55;
    const ox = Math.cos(a2) * r * 0.92;
    const oy = Math.sin(a2) * r * 0.92;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.quadraticCurveTo(mx, my, ox, oy);
    ctx.stroke();
  }
  ctx.restore();
  strokeBallRim(ctx, x, y, r, selected, "#1a1a1a");
}

function drawBasketballBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  selected: boolean,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#e67e22";
  ctx.fill();
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#5d3a1a";
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(0, r);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r, 0);
  ctx.lineTo(r, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, Math.PI / 2, -Math.PI / 2);
  ctx.stroke();
  ctx.restore();
  strokeBallRim(ctx, x, y, r, selected, "#5d3a1a");
}

function drawVolleyballBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  selected: boolean,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#f8f8f8";
  ctx.fill();
  ctx.save();
  ctx.translate(x, y);
  const colors = ["#2980b9", "#e74c3c", "#f8f8f8"];
  for (let i = 0; i < 3; i++) {
    const a0 = (i * Math.PI * 2) / 3 - Math.PI / 2;
    const a1 = ((i + 1) * Math.PI * 2) / 3 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 0.92, a0, a1);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
  }
  ctx.restore();
  strokeBallRim(ctx, x, y, r, selected, "#1a1a1a");
}

function drawObject(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  scene: Scene,
  obj: DrawObject,
  selected: boolean,
  selectionColor: string,
) {
  if (obj.type === "line") {
    const raw = linePointsToPixels(obj.points, board, pitch);
    if (raw.length < 2) return;
    const lw = Math.max(
      1.5,
      Math.min(pitch.w, pitch.h) * 0.004 * obj.strokeWidth,
    );
    const ink = lineColorForBoard(board, obj.kind);
    const laid = layoutLineForArrow(raw, board, pitch, scene, lw);
    if (selected && obj.kind !== "pass") {
      ctx.strokeStyle = selectionColor;
      ctx.lineWidth = lw + 4;
      ctx.globalAlpha = 0.35;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      strokePolyline(ctx, laid.pts);
      ctx.globalAlpha = 1;
    }
    if (selected && obj.kind === "pass") {
      strokePassLine(ctx, laid, lw + 1.5, selectionColor, board, { alpha: 0.4 });
    }
    strokeLineByKind(ctx, laid, lw, ink, obj.kind, board);
    return;
  }

  if (obj.type === "zone") {
    const a = worldToPitch(obj.x, obj.y, board);
    const b = worldToPitch(obj.x + obj.w, obj.y + obj.h, board);
    if (!a || !b) return;
    const p1 = fromNorm(a.x, a.y, pitch);
    const p2 = fromNorm(b.x, b.y, pitch);
    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const w = Math.abs(p2.x - p1.x);
    const h = Math.abs(p2.y - p1.y);
    const zoneInk = zoneColorsForBoard(board);
    ctx.fillStyle = zoneInk.fill;
    ctx.strokeStyle = selected ? selectionColor : zoneInk.stroke;
    ctx.lineWidth = selected ? 3 : Math.max(1.5, lwOnPitch(pitch, 1.5));
    fillStrokeZoneEllipse(ctx, x, y, w, h, true, true);
    return;
  }

  if (obj.type === "pen") {
    if (obj.points.length < 2) return;
    // 芝の白ハローは不要（白インク自体が読める。ハローは太く見えてホバーっぽい）
    const lw = penStrokeWidth(pitch, board, obj.strokeWidth);
    const ink = penColorForBoard(board);
    if (selected && !usesGrassInk(board)) {
      strokePenPath(ctx, board, pitch, obj.points, lw + 4, selectionColor, 0.35);
    }
    strokePenPath(ctx, board, pitch, obj.points, lw, ink, 1, false);
    return;
  }

  if (obj.type === "link") {
    const pts = resolveLinkPoints(scene.pieces, obj.pieceIds);
    if (pts.length < 2) return;
    const lw = linkStrokeWidth(pitch, board, obj.strokeWidth);
    const ink = linkColorForBoard(board);
    if (selected && !usesGrassInk(board)) {
      strokeStraightWorldPath(
        ctx,
        board,
        pitch,
        pts,
        lw + 4,
        selectionColor,
        0.35,
      );
    }
    strokeLinkWorldPath(ctx, board, pitch, pts, lw, ink, 1);
    return;
  }

  if (obj.type === "text") {
    const m = worldToPitch(obj.x, obj.y, board);
    if (!m) return;
    const p = fromNorm(m.x, m.y, pitch);
    const size = Math.max(10, Math.min(pitch.w, pitch.h) * obj.fontSize);
    const stack = textFontStack(obj.fontFamily);
    ctx.font = `600 ${size}px ${stack}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const tw = ctx.measureText(obj.text).width || size * obj.text.length * 0.6;
    if (selected) {
      ctx.strokeStyle = selectionColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(p.x - 3, p.y - 3, tw + 6, size + 6);
      ctx.setLineDash([]);
    }
    const ink = obj.color || textColorForBoard(board);
    const needsShadow =
      usesGrassInk(board) && ink.toLowerCase() !== "#111111";
    if (needsShadow) {
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = Math.max(2, size * 0.08);
      ctx.shadowOffsetY = Math.max(1, size * 0.04);
    }
    ctx.fillStyle = ink;
    ctx.fillText(obj.text, p.x, p.y);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}

/** ゾーン作成中: シード楕円 / ラバーバンド楕円 + 起点ドット（Pen 同型） */
function drawMarqueePreview(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  z: { x0: number; y0: number; x1: number; y1: number },
  color: string,
) {
  const a = worldToPitch(z.x0, z.y0, board);
  const b = worldToPitch(z.x1, z.y1, board);
  if (!a || !b) return;
  const p0 = fromNorm(a.x, a.y, pitch);
  const p1 = fromNorm(b.x, b.y, pitch);
  const x = Math.min(p0.x, p1.x);
  const y = Math.min(p0.y, p1.y);
  const w = Math.abs(p1.x - p0.x);
  const h = Math.abs(p1.y - p0.y);
  if (w < 2 && h < 2) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, lwOnPitch(pitch, 1.5));
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function drawZonePreview(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  z: { x0: number; y0: number; x1: number; y1: number },
) {
  const a = worldToPitch(z.x0, z.y0, board);
  const b = worldToPitch(z.x1, z.y1, board);
  if (!a || !b) return;
  const p0 = fromNorm(a.x, a.y, pitch);
  const p1 = fromNorm(b.x, b.y, pitch);
  const x = Math.min(p0.x, p1.x);
  const y = Math.min(p0.y, p1.y);
  const w = Math.abs(p1.x - p0.x);
  const h = Math.abs(p1.y - p0.y);
  const ink = zoneColorsForBoard(board);
  const stroke = ink.stroke;
  const scale = Math.min(pitch.w, pitch.h);
  const handleR = Math.max(5, scale * 0.012);
  const lw = Math.max(2, lwOnPitch(pitch, 2));

  // ドラッグ中の楕円。未移動時は小さなシード枠で「開始済み」を示す
  const showShape = w >= 2 || h >= 2;
  ctx.save();
  ctx.fillStyle = ink.fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.setLineDash([6, 4]);
  if (showShape) {
    fillStrokeZoneEllipse(
      ctx,
      x,
      y,
      Math.max(w, 1),
      Math.max(h, 1),
      true,
      true,
    );
  } else {
    const seed = Math.max(18, scale * 0.04);
    ctx.globalAlpha = 0.85;
    fillStrokeZoneEllipse(ctx, p0.x - seed / 2, p0.y - seed / 2, seed, seed, true, true);
    ctx.globalAlpha = 1;
  }
  ctx.setLineDash([]);
  ctx.restore();

  // 起点: Pen と同型の小ドット（ドラッグ中のみ · 未移動時はシード楕円で足りる）
  if (showShape) {
    const dotR = Math.max(3.5, lw * 0.75);
    ctx.save();
    if (usesGrassInk(board)) {
      ctx.shadowColor = "rgba(0,0,0,0.42)";
      ctx.shadowBlur = Math.max(1.5, lw * 0.55);
    }
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = stroke;
    ctx.fill();
    ctx.strokeStyle = usesGrassInk(board) ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.restore();
  }

  // 対角角: ドラッグ先ハンドル（動いたときだけ）
  if (Math.hypot(p1.x - p0.x, p1.y - p0.y) > handleR * 2) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, handleR * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = stroke;
    ctx.fill();
    ctx.strokeStyle = usesGrassInk(board) ? "rgba(0,0,0,0.55)" : "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

/** ペン描画中: 起点ドット → ドラッグ中は実線プレビュー */
function drawPenPreview(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  points: { x: number; y: number }[],
) {
  const lw = penStrokeWidth(pitch, board, 2);
  const ink = penColorForBoard(board);

  if (points.length === 1) {
    const m = worldToPitch(points[0].x, points[0].y, board);
    if (!m) return;
    const p = fromNorm(m.x, m.y, pitch);
    const dotR = Math.max(3.5, lw * 0.75);
    ctx.save();
    if (usesGrassInk(board)) {
      ctx.shadowColor = "rgba(0,0,0,0.42)";
      ctx.shadowBlur = Math.max(1.5, lw * 0.55);
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.strokeStyle = usesGrassInk(board) ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.restore();
    return;
  }

  strokePenPath(ctx, board, pitch, points, lw, ink, 1, false);
}

function lwOnPitch(pitch: PitchRect, base: number): number {
  return Math.max(base, Math.min(pitch.w, pitch.h) * 0.0035);
}

function strokeLineByKind(
  ctx: CanvasRenderingContext2D,
  laid: LaidArrowLine,
  lw: number,
  ink: string,
  kind: LineKind,
  board: BoardDocument,
) {
  if (kind === "dribble") {
    strokeDribbleLine(ctx, laid, lw, ink, board);
    return;
  }

  if (kind === "pass") {
    strokePassLine(ctx, laid, lw, ink, board);
    return;
  }

  const pts = laid.pts;
  const draw = (color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    if (kind === "run") {
      // 欧米標準: 実線 = ボールなしの走り
      ctx.setLineDash([]);
      ctx.lineCap = "round";
      strokePolyline(ctx, pts);
      if (color === ink) {
        drawArrowHeadAt(ctx, laid.tip, laid.ang, lw, ink, laid.head);
      }
    } else if (kind === "screen") {
      ctx.setLineDash([]);
      ctx.lineCap = "round";
      strokePolyline(ctx, pts);
      if (color === ink) drawScreenBar(ctx, pts, width);
    }
  };

  // Run の黄は芝と十分差がある。白ハローはステッカーに見えるので付けない。
  // パス／ドリブルと同じ薄い影だけ残す。
  if (usesGrassInk(board) && kind === "run") {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
    ctx.shadowBlur = Math.max(1.5, lw * 0.55);
    draw(ink, lw);
    ctx.restore();
    return;
  }
  if (usesGrassInk(board)) {
    draw(HALO_INK_GRASS, grassHaloWidth(lw));
  }
  draw(ink, lw);
}

/** 欧米標準: 破線 = パス。芝生では白ハロー不可（隙間から白矩形が見える）→ 影のみ */
function strokePassLine(
  ctx: CanvasRenderingContext2D,
  laid: LaidArrowLine,
  lw: number,
  ink: string,
  board: BoardDocument,
  opts?: { alpha?: number },
) {
  const pts = laid.pts;
  const dash = Math.max(8, lw * 2.4);
  const gap = Math.max(10, lw * 3);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.setLineDash([dash, gap]);
  ctx.strokeStyle = ink;
  ctx.lineWidth = lw;
  if (opts?.alpha != null) ctx.globalAlpha = opts.alpha;
  if (usesGrassInk(board)) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
    ctx.shadowBlur = Math.max(1.5, lw * 0.55);
  }
  strokePolyline(ctx, pts);
  ctx.restore();
  drawArrowHeadAt(ctx, laid.tip, laid.ang, lw, ink, laid.head);
}

/** ドリブル波線: 白ハロー二重描画はモアレになるので影のみ */
function strokeDribbleLine(
  ctx: CanvasRenderingContext2D,
  laid: LaidArrowLine,
  lw: number,
  ink: string,
  board: BoardDocument,
) {
  const pts = laid.pts;
  const amp = Math.max(2.2, lw * 0.72);
  const wavy = wavyPathFromPolyline(pts, amp);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.strokeStyle = ink;
  ctx.lineWidth = lw;

  if (usesGrassInk(board)) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
    ctx.shadowBlur = Math.max(1.5, lw * 0.55);
    strokeWavyPath(ctx, wavy);
    ctx.restore();
  } else {
    strokeWavyPath(ctx, wavy);
  }

  // 波の先端ではなく、駒クリア後の tip／接線を使う
  drawArrowHeadAt(ctx, laid.tip, laid.ang, lw, ink, laid.head);
}

function strokePenPath(
  ctx: CanvasRenderingContext2D,
  board: BoardDocument,
  pitch: PitchRect,
  points: { x: number; y: number }[],
  lw: number,
  color: string,
  alpha = 1,
  withHalo = false,
) {
  const pts: { x: number; y: number }[] = [];
  for (const pt of points) {
    const m = worldToPitch(pt.x, pt.y, board);
    if (!m) continue;
    pts.push(fromNorm(m.x, m.y, pitch));
  }
  if (pts.length === 0) return;

  ctx.beginPath();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (!tracePenBezierPath(ctx, pts)) return;

  const apply = (strokeColor: string, strokeWidth: number) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  if (withHalo) {
    apply(HALO_INK_GRASS, grassHaloWidth(lw));
  }
  apply(color, lw);
}

/** True straight segments in world space (structure links — no pen bezier). */
function strokeStraightWorldPath(
  ctx: CanvasRenderingContext2D,
  board: BoardDocument,
  pitch: PitchRect,
  points: { x: number; y: number }[],
  lw: number,
  color: string,
  alpha = 1,
) {
  const pts = linkPathPoints(board, pitch, points);
  if (!pts || pts.length < 2) return;
  ctx.beginPath();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function linkPathPoints(
  board: BoardDocument,
  pitch: PitchRect,
  points: { x: number; y: number }[],
): { x: number; y: number }[] | null {
  const pts: { x: number; y: number }[] = [];
  for (const pt of points) {
    const m = worldToPitch(pt.x, pt.y, board);
    if (!m) continue;
    pts.push(fromNorm(m.x, m.y, pitch));
  }
  return pts.length >= 2 ? pts : null;
}

/** 芝生: 薄い下描き + グレー実線。白地: 単色実線。 */
function strokeLinkWorldPath(
  ctx: CanvasRenderingContext2D,
  board: BoardDocument,
  pitch: PitchRect,
  points: { x: number; y: number }[],
  lw: number,
  color: string,
  alpha = 1,
) {
  if (!usesGrassInk(board)) {
    strokeStraightWorldPath(ctx, board, pitch, points, lw, color, alpha);
    return;
  }
  strokeStraightWorldPath(
    ctx,
    board,
    pitch,
    points,
    lw * 1.12,
    LINK_SHADOW_GRASS,
    alpha,
  );
  strokeStraightWorldPath(ctx, board, pitch, points, lw, color, alpha);
}

/** 構成線クリック連鎖: 確定点＋ラバーバンド */
function drawLinkPreview(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  points: { x: number; y: number }[],
) {
  const lw = linkStrokeWidth(pitch, board, 2);
  const ink = linkColorForBoard(board);
  if (points.length === 1) {
    drawPenPreview(ctx, pitch, board, points);
    return;
  }
  strokeLinkWorldPath(ctx, board, pitch, points, lw, ink, 1);
}

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** 描画オブジェクトのヒット（後から描いたもの優先） */
export function hitTestObject(
  _board: BoardDocument,
  scene: Scene,
  normX: number,
  normY: number,
): DrawObject | null {
  const threshold = 0.025 * pointerHitSlop();
  for (let i = scene.objects.length - 1; i >= 0; i--) {
    const obj = scene.objects[i];
    if (obj.type === "line") {
      const pts = obj.points?.length
        ? obj.points
        : legacyLinePoints(obj);
      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1];
        const b = pts[j];
        if (distToSegment(normX, normY, a.x, a.y, b.x, b.y) <= threshold) {
          return obj;
        }
      }
    } else if (obj.type === "zone") {
      const threshold = 0.025 * pointerHitSlop();
      if (normPointInZoneEllipse(normX, normY, obj, threshold)) return obj;
    } else if (obj.type === "pen") {
      const penThreshold = threshold * 1.2;
      for (let j = 1; j < obj.points.length; j++) {
        const a = obj.points[j - 1];
        const b = obj.points[j];
        if (distToSegment(normX, normY, a.x, a.y, b.x, b.y) <= penThreshold) {
          return obj;
        }
      }
    } else if (obj.type === "link") {
      const pts = resolveLinkPoints(scene.pieces, obj.pieceIds);
      const linkThreshold = threshold * 1.2;
      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1];
        const b = pts[j];
        if (
          distToSegment(normX, normY, a.x, a.y, b.x, b.y) <= linkThreshold
        ) {
          return obj;
        }
      }
    } else if (obj.type === "text") {
      const w = Math.max(0.06, obj.text.length * 0.02);
      const h = Math.max(0.04, obj.fontSize * 1.2);
      if (
        normX >= obj.x &&
        normX <= obj.x + w &&
        normY >= obj.y &&
        normY <= obj.y + h
      ) {
        return obj;
      }
    }
  }
  return null;
}

function legacyLinePoints(obj: DrawObject): { x: number; y: number }[] {
  if (obj.type !== "line") return [];
  const leg = obj as LineObject & {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  };
  if (leg.points?.length) return leg.points;
  if (leg.x1 != null && leg.y1 != null && leg.x2 != null && leg.y2 != null) {
    return [
      { x: leg.x1, y: leg.y1 },
      { x: leg.x2, y: leg.y2 },
    ];
  }
  return [];
}

function linePointsToPixels(
  points: { x: number; y: number }[] | undefined,
  board: BoardDocument,
  pitch: PitchRect,
): { x: number; y: number }[] {
  const src = points?.length ? points : [];
  const out: { x: number; y: number }[] = [];
  for (const pt of src) {
    const m = worldToPitch(pt.x, pt.y, board);
    if (!m) continue;
    out.push(fromNorm(m.x, m.y, pitch));
  }
  return out;
}

type LaidArrowLine = {
  pts: { x: number; y: number }[];
  tip: { x: number; y: number };
  ang: number;
  head: number;
};

/** 終点が駒上なら、駒半径＋余白ぶん線を手前で止め矢印を駒の外に置く。 */
function layoutLineForArrow(
  pts: { x: number; y: number }[],
  board: BoardDocument,
  pitch: PitchRect,
  scene: Scene,
  lw: number,
): LaidArrowLine {
  const fallbackAng = endTangentAngle(pts);
  const fallbackHead = arrowHeadLen(lw, null);
  if (pts.length < 2) {
    const tip = pts[pts.length - 1] ?? { x: 0, y: 0 };
    return { pts, tip, ang: fallbackAng, head: fallbackHead };
  }

  const end = pts[pts.length - 1];
  const host = pieceNearPixel(scene, board, pitch, end.x, end.y);
  const head = arrowHeadLen(lw, host?.r ?? null);
  if (!host) {
    return { pts, tip: end, ang: fallbackAng, head };
  }

  // 先端が駒縁の外側に来るよう、半径＋ギャップ＋矢印の厚み分を手前に下げる
  const inset = host.r + Math.max(2, lw * 0.85) + head * 0.12;
  const trimmed = trimPolylineEnd(pts, inset);
  if (trimmed.length < 2) {
    return { pts, tip: end, ang: fallbackAng, head };
  }
  const tip = trimmed[trimmed.length - 1];
  return {
    pts: trimmed,
    tip,
    ang: endTangentAngle(trimmed),
    head,
  };
}

function arrowHeadLen(lw: number, pieceR: number | null): number {
  const byStroke = 8 + lw * 2;
  if (pieceR == null) return byStroke;
  return Math.max(byStroke, pieceR * 0.55);
}

function pieceNearPixel(
  scene: Scene,
  board: BoardDocument,
  pitch: PitchRect,
  px: number,
  py: number,
): { piece: Piece; r: number; cx: number; cy: number } | null {
  let best: { piece: Piece; r: number; cx: number; cy: number; d: number } | null =
    null;
  for (const piece of scene.pieces) {
    if (!isPieceDrawn(piece, scene)) continue;
    const mapped = worldToPitch(piece.x, piece.y, board);
    if (!mapped) continue;
    const { x: cx, y: cy } = fromNorm(mapped.x, mapped.y, pitch);
    const r = pieceRadius(pitch, board, piece.role);
    const d = Math.hypot(px - cx, py - cy);
    if (d > r * 1.45) continue;
    if (!best || d < best.d) best = { piece, r, cx, cy, d };
  }
  return best;
}

/** パス終点から inset px 手前で切る（短すぎるときは全長の 45% まで）。 */
function trimPolylineEnd(
  pts: { x: number; y: number }[],
  inset: number,
): { x: number; y: number }[] {
  if (pts.length < 2 || inset <= 0) return pts.map((p) => ({ ...p }));
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  const cut = Math.min(inset, total * 0.45);
  if (cut <= 0) return pts.map((p) => ({ ...p }));

  let remaining = cut;
  const out = pts.map((p) => ({ ...p }));
  while (out.length >= 2 && remaining > 0) {
    const a = out[out.length - 2];
    const b = out[out.length - 1];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg <= 1e-6) {
      out.pop();
      continue;
    }
    if (seg <= remaining) {
      remaining -= seg;
      out.pop();
      continue;
    }
    const t = 1 - remaining / seg;
    out[out.length - 1] = {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
    remaining = 0;
  }
  return out.length >= 2 ? out : pts.map((p) => ({ ...p }));
}

/** 中点を通る二次曲線でなめらかに（制御点操作なし） */
function strokePolyline(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
  }
  ctx.stroke();
}

/** スクリーン（T字）— 線先端に走行方向へ垂直なバー */
function drawScreenBar(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  lw: number,
) {
  if (pts.length < 2) return;
  const p2 = pts[pts.length - 1];
  const p1 = pts[pts.length - 2];
  const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const barLen = 10 + lw * 3;
  const perp = ang + Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(
    p2.x + barLen * Math.cos(perp),
    p2.y + barLen * Math.sin(perp),
  );
  ctx.lineTo(
    p2.x - barLen * Math.cos(perp),
    p2.y - barLen * Math.sin(perp),
  );
  ctx.lineWidth = lw;
  ctx.lineCap = "butt";
  ctx.stroke();
}

/** 白背景 PNG の白を透過扱いにしたキャンバス／画素をキャッシュ */
const knockoutCache = new WeakMap<HTMLImageElement, HTMLCanvasElement>();
const knockoutPixels = new WeakMap<HTMLImageElement, ImageData>();

function knockoutWhiteCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const cached = knockoutCache.get(img);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ictx = c.getContext("2d");
  if (!ictx || c.width === 0 || c.height === 0) return c;
  ictx.drawImage(img, 0, 0);
  const data = ictx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    // ほぼ白は透明（白背景 PNG 対策）
    if (d[i] > 248 && d[i + 1] > 248 && d[i + 2] > 248) {
      d[i + 3] = 0;
    }
  }
  ictx.putImageData(data, 0, 0);
  knockoutCache.set(img, c);
  knockoutPixels.set(img, data);
  return c;
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  wm: WatermarkSettings,
  img: HTMLImageElement,
) {
  // sizePercent はピッチ短辺に対するロゴの高さ比（配信向けに最大55%）
  const size = (Math.min(pitch.w, pitch.h) * wm.sizePercent) / 100;
  const src = knockoutWhiteCanvas(img);
  const aspect =
    (src.width || img.naturalWidth) / (src.height || img.naturalHeight || 1);
  const w = size * aspect;
  const h = size;
  const cx = pitch.x + wm.x * pitch.w;
  const cy = pitch.y + wm.y * pitch.h;
  ctx.save();
  ctx.globalAlpha = wm.opacity;
  ctx.drawImage(src, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function pieceHitRadiusNorm(
  board: BoardDocument,
  pitch: PitchRect,
  piece: Piece,
): number {
  const r = pieceRadius(pitch, board, piece.role);
  return (r / Math.min(pitch.w, pitch.h)) * pointerHitSlop();
}

function pieceCenterNorm(
  board: BoardDocument,
  piece: Piece,
): { x: number; y: number } | null {
  return worldToPitch(piece.x, piece.y, board);
}

/** 描画と同じ向き三角付近か（本体円の外側） */
function hitsPieceFacing(
  board: BoardDocument,
  piece: Piece,
  pitch: PitchRect,
  normX: number,
  normY: number,
): boolean {
  const m = pieceCenterNorm(board, piece);
  if (!m) return false;
  const rn = pieceHitRadiusNorm(board, pitch, piece);
  const d = Math.hypot(m.x - normX, m.y - normY);
  if (d <= rn * 1.05) return false;
  const rad = (piece.facing * Math.PI) / 180;
  const tipX = m.x + Math.cos(rad) * rn * 1.4;
  const tipY = m.y + Math.sin(rad) * rn * 1.4;
  const tipD = Math.hypot(normX - tipX, normY - tipY);
  return tipD <= rn * 0.7;
}

/**
 * 重なりは描画順の上（配列末尾）を優先。
 * 「中心が近い下の駒」を拾わない。
 */
export function hitTestPiece(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
  excludeId?: string | null,
): Piece | null {
  const disc = hitTestPieceFromTop(board, scene, pitch, normX, normY, excludeId, 1.05);
  if (disc) return disc;
  // 空き地の掴みやすさ用。下の駒の中心に吸い寄せない
  return hitTestPieceFromTop(board, scene, pitch, normX, normY, excludeId, 1.45);
}

/** ドロップ入れ替え: 掴み(1.45)より厳格。接触プレーでは誤爆しない */
const SWAP_DROP_PAD = 1.0;
const SWAP_OVERLAP_FACTOR = 0.7;

/**
 * 別駒へのドロップ入れ替え用。hitTestPiece より厳格:
 * - 第二パス(1.45)なし
 * - 中心間距離が (rA+rB)×0.7 未満＝円がかなり重なったときだけ
 */
export function hitTestPieceForSwap(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
  draggedId: string,
): Piece | null {
  const dragged = scene.pieces.find((p) => p.id === draggedId);
  if (!dragged) return null;
  const dm = pieceCenterNorm(board, dragged);
  if (!dm) return null;
  const dr = pieceHitRadiusNorm(board, pitch, dragged);

  for (let i = scene.pieces.length - 1; i >= 0; i--) {
    const p = scene.pieces[i];
    if (p.id === draggedId) continue;
    if (!isPieceDrawn(p, scene)) continue;
    const m = pieceCenterNorm(board, p);
    if (!m) continue;
    const rn = pieceHitRadiusNorm(board, pitch, p);
    if (Math.hypot(m.x - normX, m.y - normY) > rn * SWAP_DROP_PAD) continue;
    const centerD = Math.hypot(dm.x - m.x, dm.y - m.y);
    if (centerD < (dr + rn) * SWAP_OVERLAP_FACTOR) return p;
  }
  return null;
}

function hitTestPieceFromTop(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
  excludeId: string | null | undefined,
  pad: number,
): Piece | null {
  for (let i = scene.pieces.length - 1; i >= 0; i--) {
    const p = scene.pieces[i];
    if (excludeId && p.id === excludeId) continue;
    if (!isPieceDrawn(p, scene)) continue;
    const m = pieceCenterNorm(board, p);
    if (!m) continue;
    const rn = pieceHitRadiusNorm(board, pitch, p) * pad;
    const d = Math.hypot(m.x - normX, m.y - normY);
    if (d <= rn) return p;
  }
  return null;
}

export type PiecePointerHit = { piece: Piece; action: "move" | "rotate" };

/**
 * クリック1回分。上に見えている駒から:
 * 本体 → 移動、向き三角 → 回転。下の駒のリングに奪われない。
 */
export function hitTestPiecePointer(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
): PiecePointerHit | null {
  for (let i = scene.pieces.length - 1; i >= 0; i--) {
    const p = scene.pieces[i];
    if (!isPieceDrawn(p, scene)) continue;
    const m = pieceCenterNorm(board, p);
    if (!m) continue;
    const rn = pieceHitRadiusNorm(board, pitch, p);
    const d = Math.hypot(m.x - normX, m.y - normY);
    if (d <= rn * 1.05) return { piece: p, action: "move" };
    if (hitsPieceFacing(board, p, pitch, normX, normY)) {
      return { piece: p, action: "rotate" };
    }
  }
  const grab = hitTestPieceFromTop(board, scene, pitch, normX, normY, null, 1.45);
  if (grab) return { piece: grab, action: "move" };
  return null;
}

/**
 * 向き三角〜外周リングのヒット（その場回転用）。
 * 上の駒の本体に乗っている点は、下の駒のリングに取られない。
 */
export function hitTestPieceFacing(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
): Piece | null {
  const hit = hitTestPiecePointer(board, scene, pitch, normX, normY);
  return hit?.action === "rotate" ? hit.piece : null;
}

export function hitTestBall(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
): boolean {
  if (!scene.ball) return false;
  const m = worldToPitch(scene.ball.x, scene.ball.y, board);
  if (!m) return false;
  const r = ballRadius(pitch, board);
  const rn = (r / Math.min(pitch.w, pitch.h)) * 1.4 * pointerHitSlop();
  return Math.hypot(m.x - normX, m.y - normY) <= rn;
}

export function hitTestWatermark(
  pitch: PitchRect,
  wm: WatermarkSettings,
  normX: number,
  normY: number,
  img: HTMLImageElement | null,
): boolean {
  if (!wm.enabled || !wm.imageDataUrl || !img) return false;
  const size = (Math.min(pitch.w, pitch.h) * wm.sizePercent) / 100;
  const src = knockoutWhiteCanvas(img);
  const aspect = (src.width || 1) / (src.height || 1);
  const nw = (size * aspect) / pitch.w;
  const nh = size / pitch.h;
  const left = wm.x - nw / 2;
  const top = wm.y - nh / 2;
  if (normX < left || normX > left + nw || normY < top || normY > top + nh) {
    return false;
  }
  // 透明部分はクリック透過（大きなロゴでも駒を掴める）
  const pixels = knockoutPixels.get(img);
  if (!pixels || src.width === 0 || src.height === 0) return true;
  const px = Math.min(
    src.width - 1,
    Math.max(0, Math.floor(((normX - left) / nw) * src.width)),
  );
  const py = Math.min(
    src.height - 1,
    Math.max(0, Math.floor(((normY - top) / nh) * src.height)),
  );
  const alpha = pixels.data[(py * src.width + px) * 4 + 3];
  return alpha > 16;
}
