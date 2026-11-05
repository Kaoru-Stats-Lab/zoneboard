import { TEXT_COLOR_PRESETS } from "../presets/textStyle";
import { uid } from "./id";
import type { ShapeKind, ShapeObject } from "./types";

/** World-norm floor for persisted w/h (geometry group may raise visual mins). */
export const SHAPE_MIN_SIZE = 0.01;

/** Default AABB size when creating a new shape (square-ish seed). */
export const SHAPE_DEFAULT_SIZE = 0.12;

/**
 * Fill alpha default. UI “55% transparent” ↔ fillOpacity 0.45.
 * Named opacity (not transparency) on purpose. Pale yellow @ 0.3 vanished on white pitch.
 */
export const SHAPE_DEFAULT_FILL_OPACITY = 0.45;

/** Default fill — must stay inside TEXT_COLOR_PRESETS (no duplicate palette). */
export const SHAPE_DEFAULT_FILL_COLOR: string = TEXT_COLOR_PRESETS[2]; // #eab308

const SHAPE_KINDS: readonly ShapeKind[] = ["circle", "rect", "triangle"];

export function isShapeKind(v: unknown): v is ShapeKind {
  return typeof v === "string" && (SHAPE_KINDS as readonly string[]).includes(v);
}

/**
 * Normalize to opaque #rrggbb.
 * - #rgb / #rrggbb → expanded #rrggbb
 * - #rrggbbaa → RGB only; hex alpha is discarded (fillOpacity is the sole alpha source)
 * - anything else → fallback
 */
export function sanitizeShapeFillColor(
  v: unknown,
  fallback: string = SHAPE_DEFAULT_FILL_COLOR,
): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim().toLowerCase();
  const m3 = /^#([0-9a-f]{3})$/.exec(s);
  if (m3) {
    const [r, g, b] = m3[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  const m6 = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(s);
  if (m6) {
    return `#${m6[1]}`;
  }
  return fallback;
}

export function clampShapeFillOpacity(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return SHAPE_DEFAULT_FILL_OPACITY;
  return Math.min(1, Math.max(0, n));
}

/** UI Transparency % (0=opaque … 100=clear) ↔ fillOpacity. Default 0.45 → 55%. */
export function opacityToTransparencyPct(opacity: number): number {
  return Math.round((1 - clampShapeFillOpacity(opacity)) * 100);
}

export function transparencyPctToOpacity(pct: number): number {
  const p = Math.min(100, Math.max(0, Math.round(Number(pct) || 0)));
  return clampShapeFillOpacity(1 - p / 100);
}

/**
 * Normalize a possibly signed world AABB so the occupied region is preserved:
 * x=0.5,w=-0.2 → x=0.3,w=0.2. Then enforce positive min size.
 */
export function normalizeShapeRect(
  x: number,
  y: number,
  w: number,
  h: number,
): { x: number; y: number; w: number; h: number } {
  let nx = Number.isFinite(x) ? x : 0.5;
  let ny = Number.isFinite(y) ? y : 0.5;
  let nw = Number.isFinite(w) ? w : SHAPE_DEFAULT_SIZE;
  let nh = Number.isFinite(h) ? h : SHAPE_DEFAULT_SIZE;
  if (nw < 0) {
    nx = nx + nw;
    nw = -nw;
  }
  if (nh < 0) {
    ny = ny + nh;
    nh = -nh;
  }
  if (!(nw > 0)) nw = SHAPE_DEFAULT_SIZE;
  if (!(nh > 0)) nh = SHAPE_DEFAULT_SIZE;
  nw = Math.max(SHAPE_MIN_SIZE, nw);
  nh = Math.max(SHAPE_MIN_SIZE, nh);
  return { x: nx, y: ny, w: nw, h: nh };
}

/** @deprecated Prefer normalizeShapeRect — abs only without origin fix. */
export function sanitizeShapeSize(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n === 0) return Math.max(SHAPE_MIN_SIZE, fallback);
  return Math.max(SHAPE_MIN_SIZE, Math.abs(n));
}

export function sanitizeShapeRotationDeg(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  let d = n % 360;
  if (d < 0) d += 360;
  if (Math.abs(d) < 1e-9 || Math.abs(d - 360) < 1e-9) return undefined;
  return d;
}

export function shapeRotationDeg(obj: Pick<ShapeObject, "rotationDeg">): number {
  const d = sanitizeShapeRotationDeg(obj.rotationDeg);
  return d ?? 0;
}

/**
 * Persist-safe ShapeObject for known kinds, or null if not a sanitizable shape.
 *
 * Unknown `kind` → null (caller must pass the row through untouched so future
 * kinds are not rewritten as rect). Wrong `type` → null.
 */
export function sanitizeShapeObject(raw: unknown): ShapeObject | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.type !== "shape") return null;
  if (!isShapeKind(o.kind)) return null;

  const id =
    typeof o.id === "string" && o.id.length > 0 ? o.id : uid();

  const xRaw = typeof o.x === "number" ? o.x : Number(o.x);
  const yRaw = typeof o.y === "number" ? o.y : Number(o.y);
  const wRaw = typeof o.w === "number" ? o.w : Number(o.w);
  const hRaw = typeof o.h === "number" ? o.h : Number(o.h);

  const box = normalizeShapeRect(
    Number.isFinite(xRaw) ? xRaw : 0.5,
    Number.isFinite(yRaw) ? yRaw : 0.5,
    Number.isFinite(wRaw) ? wRaw : SHAPE_DEFAULT_SIZE,
    Number.isFinite(hRaw) ? hRaw : SHAPE_DEFAULT_SIZE,
  );

  const next: ShapeObject = {
    id,
    type: "shape",
    kind: o.kind,
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fillColor: sanitizeShapeFillColor(o.fillColor),
    fillOpacity: clampShapeFillOpacity(o.fillOpacity),
  };

  const rot = sanitizeShapeRotationDeg(o.rotationDeg);
  if (rot != null) next.rotationDeg = rot;

  // Absent → stroke on. Persist only explicit false (lean storage).
  if (o.strokeEnabled === false) next.strokeEnabled = false;

  return next;
}

export type CreateShapeOpts = {
  id?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  rotationDeg?: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeEnabled?: boolean;
};

/** Factory for create-drag (Group 3+). Defaults match appearance contract. */
export function createShapeObject(
  kind: ShapeKind,
  opts: CreateShapeOpts = {},
): ShapeObject {
  const size = SHAPE_DEFAULT_SIZE;
  const draft: ShapeObject = {
    id: opts.id ?? uid(),
    type: "shape",
    kind,
    x: opts.x ?? 0.5 - size / 2,
    y: opts.y ?? 0.5 - size / 2,
    w: opts.w ?? size,
    h: opts.h ?? size,
    fillColor: opts.fillColor ?? SHAPE_DEFAULT_FILL_COLOR,
    fillOpacity:
      opts.fillOpacity != null
        ? opts.fillOpacity
        : SHAPE_DEFAULT_FILL_OPACITY,
  };
  if (opts.rotationDeg != null) draft.rotationDeg = opts.rotationDeg;
  if (opts.strokeEnabled === false) draft.strokeEnabled = false;
  return sanitizeShapeObject(draft)!;
}

/**
 * End-swap method B: flip AABB around pitch centre and add 180° to rotationDeg.
 * Triangle tip orientation flips with the angle. Text keeps its own upright policy.
 */
export function swapShapeEndsPosition(obj: ShapeObject): ShapeObject {
  const next: ShapeObject = {
    ...obj,
    x: 1 - (obj.x + obj.w),
    y: 1 - (obj.y + obj.h),
  };
  const cur = shapeRotationDeg(obj);
  let d = (cur + 180) % 360;
  if (d < 0) d += 360;
  if (Math.abs(d) < 1e-9 || Math.abs(d - 360) < 1e-9) {
    delete next.rotationDeg;
  } else {
    next.rotationDeg = d;
  }
  return next;
}
