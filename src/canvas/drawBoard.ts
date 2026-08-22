import { isPieceDrawn } from "../models/scene";
import type {
  BoardDocument,
  DrawObject,
  LineKind,
  LineObject,
  Piece,
  Scene,
  WatermarkSettings,
} from "../models/types";
import { LINE_COLORS, UI_FONT_STACK, usesPreferredFoot } from "../models/types";
import { BASKET_HALF_START } from "../presets/sports";
import {
  drawPitchLanes,
  drawPitchMarkings,
  drawPitchSurface,
  drawShotCorridor,
  outerFillForBoard,
} from "./drawPitch";
import { fromNorm, pointerHitSlop, type PitchRect } from "./layout";

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
  if (board.pitchFlipped) {
    return { x: 0.5 - x / 2, y };
  }
  return { x: 0.5 + x / 2, y };
}

function pieceRadius(
  pitch: PitchRect,
  scale: number,
  role: "starter" | "bench" = "starter",
): number {
  const base = Math.min(pitch.w, pitch.h) * 0.028 * scale;
  return role === "bench" ? base * 0.48 : base;
}

function ballRadius(pitch: PitchRect, scale: number): number {
  return Math.min(pitch.w, pitch.h) * 0.016 * Math.min(1.1, scale);
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
    /** 競技ボール画像。未ロード時は幾何フォールバック */
    ballImage?: HTMLImageElement | null;
  } = {},
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = opts.background ?? "#e8e8e8";
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

  // 下から: 面 → 5レーン → ロゴ → ピッチ線 → 描画 → 駒 → ボール
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
    drawObject(
      ctx,
      pitch,
      board,
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
      {
        id: "__preview__",
        type: "line",
        kind,
        points: opts.previewLine.points,
        color: LINE_COLORS[kind],
        strokeWidth: 2,
      },
      false,
      sel,
    );
  }

  const scale = board.pieceScale ?? 1;
  for (const piece of scene.pieces) {
    if (!isPieceDrawn(piece, scene.hideHalf)) continue;
    const boost =
      opts.dragVisual?.pieceId === piece.id ? opts.dragVisual.boost : 1;
    const r = pieceRadius(pitch, scale, piece.role) * boost;
    drawPiece(
      ctx,
      pitch,
      board,
      piece,
      r,
      piece.id === opts.selectedPieceId,
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
      ballRadius(pitch, scale) * ballBoost,
      !!opts.selectedBall || !!opts.dragVisual?.ball,
      ballBoost > 1,
      sel,
      opts.ballImage ?? null,
    );
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
  selectionColor: string,
) {
  const mapped = worldToPitch(piece.x, piece.y, board);
  if (!mapped) return;
  const { x, y } = fromNorm(mapped.x, mapped.y, pitch);

  if (dragging) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = r * 0.8;
    ctx.shadowOffsetY = r * 0.15;
  }

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = piece.color;
  ctx.fill();
  ctx.lineWidth = selected || dragging ? 3 : 1.5;
  ctx.strokeStyle = selected || dragging ? selectionColor : "#fff";
  ctx.stroke();

  if (piece.role === "bench") {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.92, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 選択時: 駒との隙間を空けたリング（アクティブ認識＋回転ハンドル）
  if (selected && !dragging) {
    ctx.beginPath();
    ctx.arc(x, y, r * 1.72, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = 1.75;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

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
  ctx.fillStyle = piece.color;
  ctx.fill();
  ctx.strokeStyle = selected ? selectionColor : "#fff";
  ctx.lineWidth = selected ? 2 : 1;
  ctx.stroke();

  if (dragging) ctx.restore();

  // 背番号のみ（ボード装飾テキストは置かない）
  if (piece.number) {
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.max(8, r * 0.9)}px ${UI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(piece.number, x, y);
  }

  // 利き足（サカ系のみ・解説向け）。向きに対して L=左足側 / R=右足側に小さく表示
  const foot = usesPreferredFoot(board.sport) ? piece.preferredFoot : null;
  if (foot === "L" || foot === "R" || foot === "B") {
    const mark = foot === "B" ? "B" : foot;
    const footRad =
      foot === "B" ? rad + Math.PI : rad + (foot === "L" ? -Math.PI / 2 : Math.PI / 2);
    const mx = x + Math.cos(footRad) * r * 0.72;
    const my = y + Math.sin(footRad) * r * 0.72;
    const fs = Math.max(7, r * 0.42);
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

function drawBall(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  ball: { x: number; y: number },
  r: number,
  selected: boolean,
  dragging: boolean,
  selectionColor: string,
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

  if (ballImage && ballImage.complete && ballImage.naturalWidth > 0) {
    // 画像の透明ギャップからピッチが透けないよう、不透明な下地円を先に塗る
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = ballUnderlayColor(board.sport);
    ctx.fill();
    const d = r * 2;
    ctx.drawImage(ballImage, x - r, y - r, d, d);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.lineWidth = selected ? 2.5 : 1.2;
    ctx.strokeStyle = selected ? selectionColor : "#1a1a1a";
    ctx.stroke();
  } else if (board.sport === "basketball") {
    drawBasketballBall(ctx, x, y, r, selected, selectionColor);
  } else if (board.sport === "volleyball") {
    drawVolleyballBall(ctx, x, y, r, selected, selectionColor);
  } else {
    drawSoccerBallFallback(ctx, x, y, r, selected, selectionColor);
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
  selectionColor: string,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.lineWidth = selected ? 2.5 : 1.4;
  ctx.strokeStyle = selected ? selectionColor : "#1a1a1a";
  ctx.stroke();

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
}

function drawBasketballBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  selected: boolean,
  selectionColor: string,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#e67e22";
  ctx.fill();
  ctx.lineWidth = selected ? 2.5 : 1.4;
  ctx.strokeStyle = selected ? selectionColor : "#5d3a1a";
  ctx.stroke();
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
}

function drawVolleyballBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  selected: boolean,
  selectionColor: string,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#f8f8f8";
  ctx.fill();
  ctx.lineWidth = selected ? 2.5 : 1.4;
  ctx.strokeStyle = selected ? selectionColor : "#1a1a1a";
  ctx.stroke();
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
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = selected ? selectionColor : "#1a1a1a";
  ctx.lineWidth = selected ? 2.5 : 1.4;
  ctx.stroke();
  ctx.restore();
}

function drawObject(
  ctx: CanvasRenderingContext2D,
  pitch: PitchRect,
  board: BoardDocument,
  obj: DrawObject,
  selected: boolean,
  selectionColor: string,
) {
  if (obj.type === "line") {
    const pts = linePointsToPixels(obj.points, board, pitch);
    if (pts.length < 2) return;
    const lw = Math.max(
      1.5,
      Math.min(pitch.w, pitch.h) * 0.004 * obj.strokeWidth,
    );
    if (selected) {
      ctx.strokeStyle = selectionColor;
      ctx.lineWidth = lw + 4;
      ctx.globalAlpha = 0.35;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      strokePolyline(ctx, pts);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";

    if (obj.kind === "run") {
      // ギャップを線分より広く。round cap だと隙間が潰れるので butt
      const dash = Math.max(7, lw * 2.2);
      const gap = Math.max(14, lw * 4.5);
      ctx.setLineDash([dash, gap]);
      ctx.lineCap = "butt";
      strokePolyline(ctx, pts);
      ctx.setLineDash([]);
      ctx.lineCap = "round";
      drawArrowHead(ctx, pts, lw);
    } else if (obj.kind === "dribble") {
      // 自由曲線そのものがドリブル軌道（ユーザが弧・ジグザグを描く）
      ctx.lineCap = "round";
      strokePolyline(ctx, pts);
      drawArrowHead(ctx, pts, lw);
    } else if (obj.kind === "screen") {
      ctx.setLineDash([]);
      ctx.lineCap = "round";
      strokePolyline(ctx, pts);
      drawScreenBar(ctx, pts, lw);
    } else {
      ctx.setLineDash([]);
      ctx.lineCap = "round";
      strokePolyline(ctx, pts);
      drawArrowHead(ctx, pts, lw);
    }
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
    ctx.fillStyle = obj.color;
    ctx.strokeStyle = selected ? selectionColor : obj.strokeColor;
    ctx.lineWidth = selected ? 3 : 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    return;
  }

  if (obj.type === "pen") {
    if (obj.points.length < 2) return;
    const lw = Math.max(
      1.5,
      Math.min(pitch.w, pitch.h) * 0.003 * obj.strokeWidth,
    );
    if (selected) {
      ctx.beginPath();
      ctx.strokeStyle = selectionColor;
      ctx.lineWidth = lw + 4;
      ctx.globalAlpha = 0.35;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      let started = false;
      for (const pt of obj.points) {
        const m = worldToPitch(pt.x, pt.y, board);
        if (!m) continue;
        const p = fromNorm(m.x, m.y, pitch);
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    let started = false;
    for (const pt of obj.points) {
      const m = worldToPitch(pt.x, pt.y, board);
      if (!m) continue;
      const p = fromNorm(m.x, m.y, pitch);
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
    return;
  }

  if (obj.type === "text") {
    const m = worldToPitch(obj.x, obj.y, board);
    if (!m) return;
    const p = fromNorm(m.x, m.y, pitch);
    const size = Math.max(10, Math.min(pitch.w, pitch.h) * obj.fontSize);
    ctx.font = `600 ${size}px ${UI_FONT_STACK}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    if (selected) {
      const tw = ctx.measureText(obj.text).width || size * obj.text.length * 0.6;
      ctx.strokeStyle = selectionColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 2, p.y - 2, tw + 4, size + 4);
    }
    ctx.fillStyle = obj.color;
    ctx.fillText(obj.text, p.x, p.y);
  }
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
      const x0 = Math.min(obj.x, obj.x + obj.w);
      const x1 = Math.max(obj.x, obj.x + obj.w);
      const y0 = Math.min(obj.y, obj.y + obj.h);
      const y1 = Math.max(obj.y, obj.y + obj.h);
      if (normX >= x0 && normX <= x1 && normY >= y0 && normY <= y1) return obj;
    } else if (obj.type === "pen") {
      for (let j = 1; j < obj.points.length; j++) {
        const a = obj.points[j - 1];
        const b = obj.points[j];
        if (distToSegment(normX, normY, a.x, a.y, b.x, b.y) <= threshold) {
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

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  lw: number,
) {
  if (pts.length < 2) return;
  const p2 = pts[pts.length - 1];
  const p1 = pts[pts.length - 2];
  const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const head = 8 + lw * 2;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(
    p2.x - head * Math.cos(ang - Math.PI / 7),
    p2.y - head * Math.sin(ang - Math.PI / 7),
  );
  ctx.lineTo(
    p2.x - head * Math.cos(ang + Math.PI / 7),
    p2.y - head * Math.sin(ang + Math.PI / 7),
  );
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle as string;
  ctx.fill();
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

export function hitTestPiece(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
  excludeId?: string | null,
): Piece | null {
  const scale = board.pieceScale ?? 1;
  let best: Piece | null = null;
  let bestD = Infinity;
  for (let i = scene.pieces.length - 1; i >= 0; i--) {
    const p = scene.pieces[i];
    if (excludeId && p.id === excludeId) continue;
    if (!isPieceDrawn(p, scene.hideHalf)) continue;
    const m = worldToPitch(p.x, p.y, board);
    if (!m) continue;
    // ドロップ先はベンチ駒も拾いやすいよう少し広め
    const r = pieceRadius(pitch, scale, p.role);
    const rn = (r / Math.min(pitch.w, pitch.h)) * 1.45 * pointerHitSlop();
    const d = Math.hypot(m.x - normX, m.y - normY);
    if (d <= rn && d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/**
 * 向き三角〜外周リングのヒット（その場回転用）。
 * 本体より外側を優先して拾う。
 */
export function hitTestPieceFacing(
  board: BoardDocument,
  scene: Scene,
  pitch: PitchRect,
  normX: number,
  normY: number,
): Piece | null {
  const scale = board.pieceScale ?? 1;
  const minSide = Math.min(pitch.w, pitch.h);
  let best: Piece | null = null;
  let bestD = Infinity;
  for (let i = scene.pieces.length - 1; i >= 0; i--) {
    const p = scene.pieces[i];
    if (!isPieceDrawn(p, scene.hideHalf)) continue;
    const m = worldToPitch(p.x, p.y, board);
    if (!m) continue;
    const r = pieceRadius(pitch, scale, p.role);
    const rn = (r / minSide) * pointerHitSlop();
    const d = Math.hypot(m.x - normX, m.y - normY);
    // 外周リング（本体との隙間〜選択リング外側）
    const inner = rn * 1.05;
    const outer = rn * 2.05;
    if (d < inner || d > outer) continue;
    const rad = (p.facing * Math.PI) / 180;
    const tipX = m.x + Math.cos(rad) * rn * 1.4;
    const tipY = m.y + Math.sin(rad) * rn * 1.4;
    const tipD = Math.hypot(normX - tipX, normY - tipY);
    // 三角付近を優先、リング上なら次点
    const score = tipD <= rn * 0.65 ? tipD : d + rn;
    if (score < bestD) {
      bestD = score;
      best = p;
    }
  }
  return best;
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
  const r = ballRadius(pitch, board.pieceScale ?? 1);
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
