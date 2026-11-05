import type { TextObject } from "./types";

/** World-norm floors — keep in sync with canvas/textGeometry.ts */
export const TEXT_BOX_MIN_W = 0.04;
export const TEXT_BOX_MIN_H = 0.028;

/** Match TEXT_LINE_HEIGHT_RATIO in textGeometry (end-swap height fallback). */
const TEXT_LINE_HEIGHT_RATIO = 1.25;

export function sanitizeTextBoxNumber(
  v: unknown,
  min: number,
): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.max(min, n);
}

/** Persist-safe text object. Does not invent width/height for legacy rows. */
export function sanitizeTextObject(obj: TextObject): TextObject {
  const next: TextObject = { ...obj };
  const w = sanitizeTextBoxNumber(obj.width, TEXT_BOX_MIN_W);
  const h = sanitizeTextBoxNumber(obj.height, TEXT_BOX_MIN_H);
  if (w == null) delete next.width;
  else next.width = w;
  if (h == null) delete next.height;
  else next.height = h;
  if (
    obj.align !== "left" &&
    obj.align !== "center" &&
    obj.align !== "right"
  ) {
    delete next.align;
  }
  if (obj.rotationDeg != null) {
    if (!Number.isFinite(obj.rotationDeg)) delete next.rotationDeg;
    else {
      // Keep exact cardinals; normalize into [0, 360)
      let d = obj.rotationDeg % 360;
      if (d < 0) d += 360;
      // Collapse near-zero float noise to 0, then omit (legacy = absent)
      if (Math.abs(d) < 1e-9 || Math.abs(d - 360) < 1e-9) delete next.rotationDeg;
      else next.rotationDeg = d;
    }
  }
  if (!Number.isFinite(next.x)) next.x = 0.5;
  if (!Number.isFinite(next.y)) next.y = 0.5;
  if (!Number.isFinite(next.fontSize) || next.fontSize <= 0) {
    next.fontSize = 0.035;
  }
  return next;
}

/**
 * End-swap: boxed text moves by centre; rotationDeg unchanged (stay upright).
 * Legacy (no width): flip top-left like other point anchors.
 */
export function swapTextEndsPosition(obj: TextObject): TextObject {
  const w =
    obj.width != null && Number.isFinite(obj.width) && obj.width > 0
      ? obj.width
      : null;
  if (w == null) {
    return {
      ...obj,
      x: 1 - obj.x,
      y: 1 - obj.y,
    };
  }
  const h =
    obj.height != null && Number.isFinite(obj.height) && obj.height > 0
      ? obj.height
      : Math.max(TEXT_BOX_MIN_H, obj.fontSize * TEXT_LINE_HEIGHT_RATIO);
  const cx = obj.x + w / 2;
  const cy = obj.y + h / 2;
  return {
    ...obj,
    x: 1 - cx - w / 2,
    y: 1 - cy - h / 2,
  };
}
