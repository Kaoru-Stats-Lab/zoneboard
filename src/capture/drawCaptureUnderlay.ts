/**
 * Warp capture image onto pitch rect via inverse homography (grid + triangles).
 * Cached by caller; rebuild only when key changes.
 */
import {
  invertHomography,
  transformPoint,
  type HomographyMatrix,
} from "./homography";

const SUBDIV = 24;

type Pt = { x: number; y: number };

function pitchNormToImage(
  Hinv: HomographyMatrix,
  px: number,
  py: number,
): Pt | null {
  const t = transformPoint(Hinv, px, py);
  if (!Number.isFinite(t.px) || !Number.isFinite(t.py)) return null;
  return { x: t.px, y: t.py };
}

/** Affine map of source triangle → dest triangle, then drawImage. */
function drawImageTriangle(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  s0: Pt,
  s1: Pt,
  s2: Pt,
  d0: Pt,
  d1: Pt,
  d2: Pt,
) {
  const denom =
    s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(denom) < 1e-8) return;

  const m11 =
    (d0.x * (s1.y - s2.y) +
      d1.x * (s2.y - s0.y) +
      d2.x * (s0.y - s1.y)) /
    denom;
  const m12 =
    (d0.y * (s1.y - s2.y) +
      d1.y * (s2.y - s0.y) +
      d2.y * (s0.y - s1.y)) /
    denom;
  const m21 =
    (d0.x * (s2.x - s1.x) +
      d1.x * (s0.x - s2.x) +
      d2.x * (s1.x - s0.x)) /
    denom;
  const m22 =
    (d0.y * (s2.x - s1.x) +
      d1.y * (s0.x - s2.x) +
      d2.y * (s1.x - s0.x)) /
    denom;
  const dx =
    (d0.x * (s1.x * s2.y - s2.x * s1.y) +
      d1.x * (s2.x * s0.y - s0.x * s2.y) +
      d2.x * (s0.x * s1.y - s1.x * s0.y)) /
    denom;
  const dy =
    (d0.y * (s1.x * s2.y - s2.x * s1.y) +
      d1.y * (s2.x * s0.y - s0.x * s2.y) +
      d2.y * (s0.x * s1.y - s1.x * s0.y)) /
    denom;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(m11, m12, m21, m22, dx, dy);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function drawImageQuad(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  s00: Pt,
  s10: Pt,
  s11: Pt,
  s01: Pt,
  d00: Pt,
  d10: Pt,
  d11: Pt,
  d01: Pt,
) {
  drawImageTriangle(ctx, img, s00, s10, s11, d00, d10, d11);
  drawImageTriangle(ctx, img, s00, s11, s01, d00, d11, d01);
}

/**
 * Build warped underlay bitmap (pitch-local 0..width × 0..height).
 * Returns null if H is singular.
 */
export function buildCaptureUnderlayCanvas(
  img: CanvasImageSource,
  H: HomographyMatrix,
  width: number,
  height: number,
): HTMLCanvasElement | null {
  const Hinv = invertHomography(H);
  if (!Hinv) return null;

  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  for (let iy = 0; iy < SUBDIV; iy++) {
    for (let ix = 0; ix < SUBDIV; ix++) {
      const u0 = ix / SUBDIV;
      const u1 = (ix + 1) / SUBDIV;
      const v0 = iy / SUBDIV;
      const v1 = (iy + 1) / SUBDIV;

      const d00 = { x: u0 * w, y: v0 * h };
      const d10 = { x: u1 * w, y: v0 * h };
      const d11 = { x: u1 * w, y: v1 * h };
      const d01 = { x: u0 * w, y: v1 * h };

      const s00 = pitchNormToImage(Hinv, u0, v0);
      const s10 = pitchNormToImage(Hinv, u1, v0);
      const s11 = pitchNormToImage(Hinv, u1, v1);
      const s01 = pitchNormToImage(Hinv, u0, v1);
      if (!s00 || !s10 || !s11 || !s01) continue;

      drawImageQuad(ctx, img, s00, s10, s11, s01, d00, d10, d11, d01);
    }
  }

  return canvas;
}

export function captureUnderlayCacheKey(
  imageUrl: string,
  H: HomographyMatrix,
  pitchW: number,
  pitchH: number,
): string {
  return `${imageUrl}|${H.map((v) => v.toFixed(6)).join(",")}|${pitchW.toFixed(1)}|${pitchH.toFixed(1)}`;
}

/** Draw cached underlay into main board ctx (pitch rect). */
export function drawCaptureUnderlay(
  ctx: CanvasRenderingContext2D,
  pitchX: number,
  pitchY: number,
  pitchW: number,
  pitchH: number,
  canvas: HTMLCanvasElement,
  opacity: number,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(canvas, pitchX, pitchY, pitchW, pitchH);
  ctx.restore();
}

export const DEFAULT_UNDERLAY_OPACITY = 0.55;
export const UNDERLAY_OPACITY_MIN = 0.3;
export const UNDERLAY_OPACITY_MAX = 0.8;

export function clampUnderlayOpacity(value: number): number {
  return Math.min(
    UNDERLAY_OPACITY_MAX,
    Math.max(UNDERLAY_OPACITY_MIN, value),
  );
}
