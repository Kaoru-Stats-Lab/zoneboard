/**
 * Text font size UI ↔ TextObject.fontSize.
 *
 * fontSize is a fraction of the pitch short side (stable across zoom / CSS px / DPR).
 * UI shows an integer "size" = fontSize × 1000 so default 0.035 → 35.
 * Not CSS px and not Word/PowerPoint pt — those would drift with canvas scale.
 */

export const TEXT_SIZE_UI_FACTOR = 1000;

/** Inclusive UI bounds (→ fontSize 0.012 … 0.072) */
export const TEXT_SIZE_UI_MIN = 12;
export const TEXT_SIZE_UI_MAX = 72;
export const TEXT_SIZE_UI_STEP = 1;
export const TEXT_SIZE_UI_DEFAULT = 35;

export function fontSizeToUi(fontSize: number): number {
  if (!Number.isFinite(fontSize) || fontSize <= 0) return TEXT_SIZE_UI_DEFAULT;
  return Math.round(fontSize * TEXT_SIZE_UI_FACTOR);
}

export function uiToFontSize(ui: number): number {
  if (!Number.isFinite(ui)) return TEXT_SIZE_UI_DEFAULT / TEXT_SIZE_UI_FACTOR;
  const n = Math.round(ui);
  const clamped = Math.min(TEXT_SIZE_UI_MAX, Math.max(TEXT_SIZE_UI_MIN, n));
  return clamped / TEXT_SIZE_UI_FACTOR;
}

export function clampFontSizeNorm(fontSize: number): number {
  return uiToFontSize(fontSizeToUi(fontSize));
}
