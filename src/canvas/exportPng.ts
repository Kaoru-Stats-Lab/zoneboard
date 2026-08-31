import { getActiveScene, activeViewport } from "../models/scene";
import type { BoardDocument, WatermarkSettings } from "../models/types";
import { UI_FONT_STACK } from "../models/types";
import type { Viewport } from "../models/types";
import { aspectFor, effectivePitchOrientation } from "../presets/sports";
import {
  DEFAULT_VIEWPORT,
  VIEW_PRESETS,
  type ViewPresetId,
} from "../presets/viewport";
import { drawBoard } from "./drawBoard";
import { outerFillForBoard } from "./drawPitch";
import { fitField } from "./layout";
import { PNG_CREDIT_TEXT } from "../site/shareCopy";

const CREDIT_H = 28;

/** SNS 逆算プリセット（docs/SOCIAL_OUTPUT.md） */
export type ExportPresetId =
  | "native"
  | "x169"
  | "square"
  | "ig45"
  | "story";

/** 投稿時のカメラ（配信の横全体とは別） */
export type ExportFocusId =
  | "current"
  | "full"
  | "final-third-left"
  | "final-third-right";

export type ExportCropAnchor = { x: number; y: number };

export interface ExportOptions {
  preset: ExportPresetId;
  bakeWatermark: boolean;
  /** 試合名・局面名を下部に焼く（単体投稿用） */
  bakeCaption: boolean;
  /**
   * Optional PNG footer credit (`zoneboard.app`). Default off in UI.
   * Outer strip only — never baked into the pitch or live capture.
   */
  bakeCredit?: boolean;
  /** 投稿用の画角フォーカス */
  focus: ExportFocusId;
  selectionColor?: string;
  y2cLabel?: string;
  /** Injured sub suffix on the match banner timeline */
  injLabel?: string;
  /** 画面上のボード面の幅/高さ。プレビュー枠と揃えるときに渡す */
  stageAspect?: number;
  /** プレビュー枠の位置（0–1。0.5 = 中央） */
  cropAnchor?: ExportCropAnchor;
}

export function viewportForFocus(
  board: BoardDocument,
  focus: ExportFocusId,
): Viewport {
  if (focus === "current") return activeViewport(board);
  if (focus === "full") return { ...DEFAULT_VIEWPORT };
  return { ...VIEW_PRESETS[focus as ViewPresetId] };
}

/** PNG キャンバスの幅/高さ比（プレビュー枠用） */
export function exportAspectRatio(
  board: BoardDocument,
  preset: ExportPresetId,
): number {
  if (preset === "native") {
    return aspectFor(
      board.sport,
      board.pitchView,
      effectivePitchOrientation(board.sport, board.pitchOrientation),
    );
  }
  const s = PRESET_SIZE[preset];
  return s.w / s.h;
}

/** ステージ内に収まる画角枠（anchor 0–1） */
export function exportFrameRect(
  stageW: number,
  stageH: number,
  aspect: number,
  anchor: ExportCropAnchor,
): { x: number; y: number; w: number; h: number } {
  let w = stageW;
  let h = w / aspect;
  if (h > stageH) {
    h = stageH;
    w = h * aspect;
  }
  const freeX = Math.max(0, stageW - w);
  const freeY = Math.max(0, stageH - h);
  const ax = Math.min(1, Math.max(0, anchor.x));
  const ay = Math.min(1, Math.max(0, anchor.y));
  return {
    x: freeX * ax,
    y: freeY * ay,
    w,
    h,
  };
}

const PRESET_SIZE: Record<
  Exclude<ExportPresetId, "native">,
  { w: number; h: number }
> = {
  x169: { w: 1920, h: 1080 },
  square: { w: 1080, h: 1080 },
  ig45: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
};

function paintBoardSurface(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  boardView: BoardDocument,
  viewport: Viewport,
  options: {
    ground: string;
    bakeWatermark: boolean;
    watermark: WatermarkSettings;
    watermarkImage: HTMLImageElement | null;
    ballImage: HTMLImageElement | null;
    selectionColor: string;
    y2cLabel?: string;
    injLabel?: string;
    pad?: number;
  },
) {
  ctx.fillStyle = options.ground;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Match banner is for live stream / editor scorebug — not SNS PNG (use bakeCaption footer).
  const bannerH = 0;
  const { outer, pitch } = fitField(
    canvasW,
    canvasH,
    boardView,
    options.pad ?? 24,
    viewport,
    bannerH,
  );
  const scene = getActiveScene(boardView);
  drawBoard(ctx, pitch, boardView, scene, {
    outer,
    background: options.ground,
    selectionColor: options.selectionColor,
    watermark: options.bakeWatermark ? options.watermark : null,
    watermarkImage: options.bakeWatermark ? options.watermarkImage : null,
    ballImage: options.ballImage,
  });
}

export async function exportBoardPng(
  board: BoardDocument,
  watermark: WatermarkSettings,
  watermarkImage: HTMLImageElement | null,
  options: ExportOptions,
  ballImage: HTMLImageElement | null = null,
): Promise<Blob> {
  const selectionColor = options.selectionColor ?? "#111111";
  const viewport = viewportForFocus(board, options.focus);
  const boardView: BoardDocument = { ...board, viewport };

  const caption = options.bakeCaption
    ? [board.matchLabel, getActiveScene(board).label]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" · ")
    : "";
  const captionH = caption ? 56 : 0;
  const creditH = options.bakeCredit ? CREDIT_H : 0;
  const footerH = captionH + creditH;

  let canvasW: number;
  let canvasH: number;
  if (options.preset === "native") {
    const probe = fitField(1920, 1920, boardView, 0, viewport);
    const aspect = probe.outer.w / probe.outer.h;
    if (aspect >= 1) {
      canvasW = 1920;
      canvasH = Math.round(1920 / aspect) + footerH;
    } else {
      canvasH = 1920 + footerH;
      canvasW = Math.round(1920 * aspect);
    }
  } else {
    const s = PRESET_SIZE[options.preset];
    canvasW = s.w;
    canvasH = s.h;
  }

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const ground = outerFillForBoard(boardView);
  const boardH = canvasH - footerH;
  const paintOpts = {
    ground,
    bakeWatermark: options.bakeWatermark,
    watermark,
    watermarkImage,
    ballImage,
    selectionColor,
    y2cLabel: options.y2cLabel,
    injLabel: options.injLabel,
  };

  const stageAspect = options.stageAspect;
  const cropAnchor = options.cropAnchor ?? { x: 0.5, y: 0.5 };
  const exportAspect = canvasW / Math.max(1, boardH);
  const useCrop =
    options.preset !== "native" &&
    stageAspect != null &&
    stageAspect > 0 &&
    Math.abs(stageAspect - exportAspect) > 0.01;

  if (useCrop && stageAspect) {
    // 画面と同じ比率のステージを描き、プレビュー枠でクロップ（WYSIWYG）
    const STAGE_LONG = 2400;
    let stageW: number;
    let stageH: number;
    if (stageAspect >= 1) {
      stageW = STAGE_LONG;
      stageH = STAGE_LONG / stageAspect;
    } else {
      stageH = STAGE_LONG;
      stageW = STAGE_LONG * stageAspect;
    }
    const stageCanvas = document.createElement("canvas");
    stageCanvas.width = Math.max(1, Math.round(stageW));
    stageCanvas.height = Math.max(1, Math.round(stageH));
    const sctx = stageCanvas.getContext("2d");
    if (!sctx) throw new Error("canvas");
    paintBoardSurface(
      sctx,
      stageCanvas.width,
      stageCanvas.height,
      boardView,
      viewport,
      { ...paintOpts, pad: 4 },
    );
    const frame = exportFrameRect(
      stageCanvas.width,
      stageCanvas.height,
      exportAspect,
      cropAnchor,
    );
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, canvasW, boardH);
    ctx.drawImage(
      stageCanvas,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      0,
      0,
      canvasW,
      boardH,
    );
  } else {
    paintBoardSurface(ctx, canvasW, boardH, boardView, viewport, paintOpts);
  }

  if (footerH > 0) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, boardH, canvasW, footerH);
  }

  if (caption) {
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 22px ${UI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let text = caption;
    const maxW = canvasW - 48;
    while (text.length > 4 && ctx.measureText(text).width > maxW) {
      text = `${text.slice(0, -2)}…`;
    }
    ctx.fillText(text, canvasW / 2, boardH + captionH / 2);
  }

  if (creditH > 0) {
    ctx.fillStyle = "#9a9a9a";
    ctx.font = `500 14px ${UI_FONT_STACK}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(
      PNG_CREDIT_TEXT,
      canvasW - 20,
      boardH + captionH + creditH / 2,
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))),
      "image/png",
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFilename(
  board: BoardDocument,
  preset: ExportPresetId,
): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `zoneboard-${board.sport}-${preset}-${stamp}.png`;
}
