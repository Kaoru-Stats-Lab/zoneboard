import { getActiveScene } from "../models/scene";
import type { BoardDocument, WatermarkSettings } from "../models/types";
import { UI_FONT_STACK } from "../models/types";
import type { Viewport } from "../models/types";
import { aspectFor } from "../presets/sports";
import {
  DEFAULT_VIEWPORT,
  VIEW_PRESETS,
  type ViewPresetId,
} from "../presets/viewport";
import { drawBoard } from "./drawBoard";
import { outerFillForBoard } from "./drawPitch";
import { fitField } from "./layout";
import { drawMatchBanner, matchBannerHeight } from "./matchBanner";

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

export interface ExportOptions {
  preset: ExportPresetId;
  bakeWatermark: boolean;
  /** 試合名・局面名を下部に焼く（単体投稿用） */
  bakeCaption: boolean;
  /** 投稿用の画角フォーカス */
  focus: ExportFocusId;
  selectionColor?: string;
  y2cLabel?: string;
}

export function viewportForFocus(
  board: BoardDocument,
  focus: ExportFocusId,
): Viewport {
  if (focus === "current") return board.viewport;
  if (focus === "full") return { ...DEFAULT_VIEWPORT };
  return { ...VIEW_PRESETS[focus as ViewPresetId] };
}

/** PNG キャンバスの幅/高さ比（プレビュー枠用） */
export function exportAspectRatio(
  board: BoardDocument,
  preset: ExportPresetId,
): number {
  if (preset === "native") {
    return aspectFor(board.sport, board.pitchView);
  }
  const s = PRESET_SIZE[preset];
  return s.w / s.h;
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

export async function exportBoardPng(
  board: BoardDocument,
  watermark: WatermarkSettings,
  watermarkImage: HTMLImageElement | null,
  options: ExportOptions,
  ballImage: HTMLImageElement | null = null,
): Promise<Blob> {
  const selectionColor = options.selectionColor ?? "#111111";
  const viewport = viewportForFocus(board, options.focus);

  const caption = options.bakeCaption
    ? [board.matchLabel, getActiveScene(board).label]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" · ")
    : "";
  const captionH = caption ? 56 : 0;

  let canvasW: number;
  let canvasH: number;
  if (options.preset === "native") {
    const probe = fitField(1920, 1920, board, 0, viewport);
    const aspect = probe.outer.w / probe.outer.h;
    if (aspect >= 1) {
      canvasW = 1920;
      canvasH = Math.round(1920 / aspect) + captionH;
    } else {
      canvasH = 1920 + captionH;
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

  const ground = outerFillForBoard(board);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const boardH = canvasH - captionH;
  const bannerH = matchBannerHeight(canvasW, boardH, board);
  const { outer, pitch } = fitField(
    canvasW,
    boardH,
    board,
    24,
    viewport,
    bannerH,
  );
  // fitField は y=0 基準なので、キャプション分は下に残すだけ（上から配置）
  const scene = getActiveScene(board);
  drawBoard(ctx, pitch, board, scene, {
    outer,
    background: ground,
    selectionColor,
    watermark: options.bakeWatermark ? watermark : null,
    watermarkImage: options.bakeWatermark ? watermarkImage : null,
    ballImage,
  });
  if (bannerH > 0) {
    drawMatchBanner(ctx, canvasW, bannerH, board, options.y2cLabel);
  }

  if (caption) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, boardH, canvasW, captionH);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 22px ${UI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 長すぎる場合は省略
    let text = caption;
    const maxW = canvasW - 48;
    while (text.length > 4 && ctx.measureText(text).width > maxW) {
      text = `${text.slice(0, -2)}…`;
    }
    ctx.fillText(text, canvasW / 2, boardH + captionH / 2);
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
