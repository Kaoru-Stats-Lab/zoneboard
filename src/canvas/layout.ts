import type { BoardDocument, Viewport } from "../models/types";
import { aspectFor } from "../presets/sports";
import {
  clampViewport,
  DEFAULT_VIEWPORT,
  ZOOM_MAX,
  ZOOM_MIN,
} from "../presets/viewport";

export interface PitchRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FieldLayout {
  /** カメラに映る白バッファ込み領域（キャンバス上） */
  outer: PitchRect;
  /** プレーイングエリア（ライン内） */
  pitch: PitchRect;
  viewport: Viewport;
}

/**
 * ピッチ寸法に対する外周バッファ比。
 * サブ・スローイン・コーナー・ゴール裏を白地で確保。
 */
export const FIELD_BUFFER = 0.14;

/** OBS 配信キャンバス想定（16:9）。ピッチは歪めず contain。 */
export const BROADCAST_FRAME_ASPECT = 16 / 9;

export const BROADCAST_LETTERBOX = "#e8e8e8";

/** キャンバス内に収まる最大の 16:9 矩形（中央配置） */
export function broadcastFrameRect(canvasW: number, canvasH: number): PitchRect {
  let w = canvasW;
  let h = w / BROADCAST_FRAME_ASPECT;
  if (h > canvasH) {
    h = canvasH;
    w = h * BROADCAST_FRAME_ASPECT;
  }
  return {
    x: (canvasW - w) / 2,
    y: (canvasH - h) / 2,
    w,
    h,
  };
}

function offsetRect(r: PitchRect, dx: number, dy: number): PitchRect {
  return { x: r.x + dx, y: r.y + dy, w: r.w, h: r.h };
}

export type SurfaceLayout = FieldLayout & { frame: PitchRect | null };

/**
 * 編集: 従来どおりキャンバス全体にフィット。
 * 配信: 16:9 フレーム内に contain（ピッチ crop なし）。bannerH はフレーム基準。
 */
export function fitSurfaceLayout(
  canvasW: number,
  canvasH: number,
  board: BoardDocument,
  pad: number,
  viewport: Viewport | undefined,
  bannerH: number,
  broadcast: boolean,
): SurfaceLayout {
  if (!broadcast) {
    const layout = fitField(canvasW, canvasH, board, pad, viewport, bannerH);
    return { ...layout, frame: null };
  }

  const frame = broadcastFrameRect(canvasW, canvasH);
  const contentH = Math.max(1, frame.h - bannerH);
  const layout = fitField(frame.w, contentH, board, pad, viewport, 0);
  const dx = frame.x;
  const dy = frame.y + bannerH;
  return {
    outer: offsetRect(layout.outer, dx, dy),
    pitch: offsetRect(layout.pitch, dx, dy),
    viewport: layout.viewport,
    frame,
  };
}

/** バッファ込みフィールドをキャンバスにフィットし、viewport でズーム */
export function fitField(
  canvasW: number,
  canvasH: number,
  board: BoardDocument,
  pad = 4,
  viewport?: Viewport,
  topReserve = 0,
): FieldLayout {
  const aspect = aspectFor(board.sport, board.pitchView);
  const availW = Math.max(1, canvasW - pad * 2);
  const availH = Math.max(1, canvasH - pad * 2 - topReserve);
  let ow = availW;
  let oh = ow / aspect;
  if (oh > availH) {
    oh = availH;
    ow = oh * aspect;
  }
  const ox = (canvasW - ow) / 2;
  const oy = topReserve + pad + (availH - oh) / 2;

  const vp = clampViewport(viewport ?? board.viewport ?? DEFAULT_VIEWPORT);
  const B = FIELD_BUFFER;
  const worldSpan = 1 + 2 * B;
  const camW = worldSpan / vp.zoom;
  const camH = worldSpan / vp.zoom;
  const halfW = camW / 2;
  const halfH = camH / 2;
  const cx = Math.min(1 + B - halfW, Math.max(-B + halfW, vp.cx));
  const cy = Math.min(1 + B - halfH, Math.max(-B + halfH, vp.cy));
  const camLeft = cx - halfW;
  const camTop = cy - halfH;

  const pitch: PitchRect = {
    x: ox + ((0 - camLeft) / camW) * ow,
    y: oy + ((0 - camTop) / camH) * oh,
    w: (1 / camW) * ow,
    h: (1 / camH) * oh,
  };

  return {
    outer: { x: ox, y: oy, w: ow, h: oh },
    pitch,
    viewport: { zoom: vp.zoom, cx, cy },
  };
}

export function fitPitch(
  canvasW: number,
  canvasH: number,
  board: BoardDocument,
  pad = 4,
): PitchRect {
  return fitField(canvasW, canvasH, board, pad).pitch;
}

/** バッファ内も許可。ズーム後の pitch 矩形基準 */
export function toNorm(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  pitch: PitchRect,
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  const px = (clientX - rect.left) * sx;
  const py = (clientY - rect.top) * sy;
  const x = (px - pitch.x) / pitch.w;
  const y = (py - pitch.y) / pitch.h;
  const b = FIELD_BUFFER + 0.02;
  if (x < -b || x > 1 + b || y < -b || y > 1 + b) return null;
  return {
    x: Math.min(1 + FIELD_BUFFER, Math.max(-FIELD_BUFFER, x)),
    y: Math.min(1 + FIELD_BUFFER, Math.max(-FIELD_BUFFER, y)),
  };
}

export function fromNorm(
  x: number,
  y: number,
  pitch: PitchRect,
): { x: number; y: number } {
  return { x: pitch.x + x * pitch.w, y: pitch.y + y * pitch.h };
}

/** カーソル位置を保ったままズーム */
/** タッチパネルでは当たり判定を拡大（ホットキーなしでも掴みやすい） */
export function pointerHitSlop(): number {
  if (typeof window === "undefined") return 1;
  return window.matchMedia("(pointer: coarse)").matches ? 1.75 : 1;
}

export function zoomAt(
  vp: Viewport,
  focusX: number,
  focusY: number,
  factor: number,
): Viewport {
  const nextZoom = Math.min(
    ZOOM_MAX,
    Math.max(ZOOM_MIN, vp.zoom * factor),
  );
  if (nextZoom === vp.zoom) return vp;
  // 注視点を focus に寄せる
  const t = 1 - vp.zoom / nextZoom;
  return clampViewport({
    zoom: nextZoom,
    cx: vp.cx + (focusX - vp.cx) * t,
    cy: vp.cy + (focusY - vp.cy) * t,
  });
}
