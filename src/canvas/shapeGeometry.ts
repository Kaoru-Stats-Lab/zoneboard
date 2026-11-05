/**
 * Shared shape geometry for draw / hit / create-preview (Shape Integration Group 3).
 *
 * Persist: ShapeObject x/y/w/h = world pitch-norm AABB (positive after sanitize).
 * Geometry math: Canvas CSS px (isotropic). Rotation clockwise, pivot = AABB centre.
 *
 * Display rules when saved w/h are not equilateral in CSS:
 * - rect: use full AABB
 * - circle: inscribed true circle — radius = min(cssW,cssH)/2 at AABB centre
 * - triangle: largest tip-up equilateral that fits in AABB, centred in AABB;
 *   pivot remains AABB centre (not triangle centroid)
 */
import type { BoardDocument, ShapeKind, ShapeObject } from "../models/types";
import {
  SHAPE_DEFAULT_FILL_COLOR,
  SHAPE_DEFAULT_FILL_OPACITY,
  SHAPE_MIN_SIZE,
  isShapeKind,
  normalizeShapeRect,
  sanitizeShapeObject,
  shapeRotationDeg,
} from "../models/shapeSanitize";
import { fromNorm, pointerHitSlop, type PitchRect } from "./layout";
import { pitchToWorld, worldToPitch } from "./pitchCoords";
import {
  normalizeRotationDeg,
  rotatePointCw,
  textResizeCursor,
  unrotatePointCw,
  type TextHandleId,
} from "./textGeometry";

export {
  SHAPE_DEFAULT_FILL_COLOR,
  SHAPE_DEFAULT_FILL_OPACITY,
  SHAPE_MIN_SIZE,
  isShapeKind,
  normalizeShapeRect,
  shapeRotationDeg,
};

export { textResizeCursor as shapeResizeCursor };

/** Same ids as text — resize chrome / cursors share vocabulary. */
export type ShapeHandleId = TextHandleId;
export type ShapeInteractionHandle = ShapeHandleId | "rotate";

export const SHAPE_HANDLES: ShapeHandleId[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

export const SHAPE_HANDLE_VISUAL_PX = 5;
export const SHAPE_ROTATE_HANDLE_VISUAL_PX = 6;
export const SHAPE_ROTATE_HANDLE_OFFSET_PX = 22;

/** √3/2 — equilateral height / side */
export const EQUILATERAL_H_OVER_SIDE = Math.sqrt(3) / 2;

export type ShapePoint = { x: number; y: number };

export type ShapeGeom = {
  kind: ShapeKind;
  rotationDeg: number;
  /** Saved / display AABB top-left + size in CSS px (unrotated) */
  px: number;
  py: number;
  pw: number;
  ph: number;
  /** Pivot = AABB centre (CSS px) */
  cx: number;
  cy: number;
  /** World AABB (positive) */
  worldX: number;
  worldY: number;
  worldW: number;
  worldH: number;
  /** Pitch-norm AABB (unrotated) */
  pitchX: number;
  pitchY: number;
  pitchW: number;
  pitchH: number;
  /** Circle: CSS radius of the inscribed circle */
  radiusPx: number;
  /**
   * Local (unrotated, origin = centre) vertices for drawing.
   * rect: 4 corners; triangle: 3 tip-up; circle: unused (use radiusPx)
   */
  localVerts: ShapePoint[];
  /** World-screen CSS vertices after rotation (for AABB / debug) */
  rotatedVerts: ShapePoint[];
  /** Axis-aligned bounds of rotated figure in pitch-norm (broad phase) */
  aabbPitch: { x: number; y: number; w: number; h: number };
  pitchRect: PitchRect;
  fillColor: string;
  fillOpacity: number;
  strokeEnabled: boolean;
  /**
   * CSS box used for selection chrome / handles (tight display bounds).
   * For circle/triangle this may be smaller than the stored AABB when letterboxed.
   */
  framePx: number;
  framePy: number;
  framePw: number;
  framePh: number;
  /** Rotated resize handles (CSS px) on the frame */
  handles: Record<ShapeHandleId, ShapePoint>;
  /** Unrotated top-mid of frame (stem attach) */
  topMid: ShapePoint;
  /** Rotate handle (CSS). Absent meaning for callers: circle skips rotate UI. */
  rotateHandle: ShapePoint;
  showRotateHandle: boolean;
};

function worldAabbToPitchBox(
  x: number,
  y: number,
  w: number,
  h: number,
  board: BoardDocument,
): { x: number; y: number; w: number; h: number } | null {
  const a = worldToPitch(x, y, board);
  const b = worldToPitch(x + w, y + h, board);
  if (!a || !b) return null;
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

/** Largest tip-up equilateral triangle that fits in CSS AABB, centred. */
export function equilateralLocalVerts(pw: number, ph: number): ShapePoint[] {
  const side = Math.min(pw, ph / EQUILATERAL_H_OVER_SIDE);
  const triH = side * EQUILATERAL_H_OVER_SIDE;
  // Centred in AABB → local coords relative to AABB centre
  const top = -triH / 2;
  const bot = triH / 2;
  return [
    { x: 0, y: top }, // tip up
    { x: side / 2, y: bot },
    { x: -side / 2, y: bot },
  ];
}

export function rectLocalVerts(pw: number, ph: number): ShapePoint[] {
  const hx = pw / 2;
  const hy = ph / 2;
  return [
    { x: -hx, y: -hy },
    { x: hx, y: -hy },
    { x: hx, y: hy },
    { x: -hx, y: hy },
  ];
}

/**
 * CSS AABB forced to the drawn shape’s tight box (centred).
 * Circle → square (inscribed). Triangle → equilateral tip-up box.
 * Rect → unchanged. Snaps when already within 1% to avoid float jitter.
 */
export function authoritativeCssBox(
  kind: ShapeKind,
  px: number,
  py: number,
  pw: number,
  ph: number,
): { px: number; py: number; pw: number; ph: number } {
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  if (kind === "rect") return { px, py, pw, ph };
  if (kind === "circle") {
    const near = Math.abs(pw - ph) <= Math.max(pw, ph) * 0.01;
    const s = near ? (pw + ph) / 2 : Math.min(pw, ph);
    return { px: cx - s / 2, py: cy - s / 2, pw: s, ph: s };
  }
  // triangle
  const target = EQUILATERAL_H_OVER_SIDE;
  const ratio = ph / Math.max(1e-9, pw);
  const near = Math.abs(ratio - target) <= target * 0.01;
  let side: number;
  let triH: number;
  if (near) {
    side = pw;
    triH = ph;
  } else {
    side = Math.min(pw, ph / target);
    triH = side * target;
  }
  return {
    px: cx - side / 2,
    py: cy - triH / 2,
    pw: side,
    ph: triH,
  };
}

/**
 * Re-project world AABB so the CSS display box is exactly constrained.
 * Stops circle/triangle resize↔redraw jumps on non-square pitches.
 */
export function canonicalizeShapeWorldBox(
  kind: ShapeKind,
  box: { x: number; y: number; w: number; h: number },
  board: BoardDocument,
  pitch: PitchRect,
): { x: number; y: number; w: number; h: number } {
  const norm = normalizeShapeRect(box.x, box.y, box.w, box.h);
  if (kind === "rect") return norm;
  const pitchBox = worldAabbToPitchBox(norm.x, norm.y, norm.w, norm.h, board);
  if (!pitchBox || pitchBox.w <= 0 || pitchBox.h <= 0) return norm;
  const topLeft = fromNorm(pitchBox.x, pitchBox.y, pitch);
  const pw = pitchBox.w * pitch.w;
  const ph = pitchBox.h * pitch.h;
  const auth = authoritativeCssBox(kind, topLeft.x, topLeft.y, pw, ph);
  return cssRectToWorldShapeBox(
    { x: auth.px, y: auth.py, w: auth.pw, h: auth.ph },
    board,
    pitch,
  );
}

/**
 * Shared geometry. Returns null if half-view hides the object or kind unknown.
 */
export function computeShapeGeometry(
  obj: ShapeObject,
  board: BoardDocument,
  pitch: PitchRect,
): ShapeGeom | null {
  if (!isShapeKind(obj.kind)) return null;
  const box = normalizeShapeRect(obj.x, obj.y, obj.w, obj.h);
  const pitchBox = worldAabbToPitchBox(box.x, box.y, box.w, box.h, board);
  if (!pitchBox || pitchBox.w <= 0 || pitchBox.h <= 0) return null;

  const rawTopLeft = fromNorm(pitchBox.x, pitchBox.y, pitch);
  const rawPw = pitchBox.w * pitch.w;
  const rawPh = pitchBox.h * pitch.h;
  if (!(rawPw > 0) || !(rawPh > 0)) return null;

  // Display AABB = constrained box (handles ≡ drawn figure). No letterbox gap.
  const auth = authoritativeCssBox(
    obj.kind,
    rawTopLeft.x,
    rawTopLeft.y,
    rawPw,
    rawPh,
  );
  const topLeft = { x: auth.px, y: auth.py };
  const pw = auth.pw;
  const ph = auth.ph;

  const cx = topLeft.x + pw / 2;
  const cy = topLeft.y + ph / 2;
  const rotationDeg = normalizeRotationDeg(shapeRotationDeg(obj));
  const radiusPx = Math.min(pw, ph) / 2;

  let localVerts: ShapePoint[];
  if (obj.kind === "triangle") {
    // Auth box is already equilateral → verts fill the frame (no inset).
    localVerts = equilateralLocalVerts(pw, ph);
  } else if (obj.kind === "rect") {
    localVerts = rectLocalVerts(pw, ph);
  } else {
    // circle — sample 0 verts; use radius
    localVerts = [];
  }

  const rotatedVerts =
    obj.kind === "circle"
      ? [] // circle unchanged by rotation visually; AABB uses circle extents
      : localVerts.map((v) =>
          rotatePointCw(cx + v.x, cy + v.y, cx, cy, rotationDeg),
        );

  const cssToPitch = (cssX: number, cssY: number) => ({
    x: (cssX - pitch.x) / pitch.w,
    y: (cssY - pitch.y) / pitch.h,
  });

  let aabbPitch: { x: number; y: number; w: number; h: number };
  if (obj.kind === "circle") {
    // Rotation-invariant
    const left = cx - radiusPx;
    const top = cy - radiusPx;
    const p0 = cssToPitch(left, top);
    const p1 = cssToPitch(left + radiusPx * 2, top + radiusPx * 2);
    aabbPitch = {
      x: Math.min(p0.x, p1.x),
      y: Math.min(p0.y, p1.y),
      w: Math.abs(p1.x - p0.x),
      h: Math.abs(p1.y - p0.y),
    };
  } else {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const c of rotatedVerts) {
      const p = cssToPitch(c.x, c.y);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    aabbPitch = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  const frame = tightDisplayCssBoxFromParts(
    obj.kind,
    topLeft.x,
    topLeft.y,
    pw,
    ph,
    cx,
    cy,
    radiusPx,
    localVerts,
  );
  const localHandles = handleMap(frame.px, frame.py, frame.pw, frame.ph);
  const handles = mapHandlesRotated(localHandles, cx, cy, rotationDeg);
  const rotateOffsetPx = Math.max(
    SHAPE_ROTATE_HANDLE_OFFSET_PX,
    Math.min(frame.pw, frame.ph) * 0.12,
  );
  const topMid = rotatePointCw(cx, frame.py, cx, cy, rotationDeg);
  const rotateHandle = rotatePointCw(
    cx,
    frame.py - rotateOffsetPx,
    cx,
    cy,
    rotationDeg,
  );

  return {
    kind: obj.kind,
    rotationDeg,
    px: topLeft.x,
    py: topLeft.y,
    pw,
    ph,
    cx,
    cy,
    worldX: box.x,
    worldY: box.y,
    worldW: box.w,
    worldH: box.h,
    pitchX: pitchBox.x,
    pitchY: pitchBox.y,
    pitchW: pitchBox.w,
    pitchH: pitchBox.h,
    radiusPx,
    localVerts,
    rotatedVerts,
    aabbPitch,
    pitchRect: pitch,
    fillColor: obj.fillColor,
    fillOpacity: obj.fillOpacity,
    strokeEnabled: obj.strokeEnabled !== false,
    framePx: frame.px,
    framePy: frame.py,
    framePw: frame.pw,
    framePh: frame.ph,
    handles,
    topMid,
    rotateHandle,
    showRotateHandle: obj.kind !== "circle",
  };
}

function handleMap(
  left: number,
  top: number,
  w: number,
  h: number,
): Record<ShapeHandleId, ShapePoint> {
  const mx = left + w / 2;
  const my = top + h / 2;
  const right = left + w;
  const bottom = top + h;
  return {
    nw: { x: left, y: top },
    n: { x: mx, y: top },
    ne: { x: right, y: top },
    e: { x: right, y: my },
    se: { x: right, y: bottom },
    s: { x: mx, y: bottom },
    sw: { x: left, y: bottom },
    w: { x: left, y: my },
  };
}

function mapHandlesRotated(
  map: Record<ShapeHandleId, ShapePoint>,
  cx: number,
  cy: number,
  deg: number,
): Record<ShapeHandleId, ShapePoint> {
  if (!deg) return map;
  const out = {} as Record<ShapeHandleId, ShapePoint>;
  for (const id of SHAPE_HANDLES) {
    out[id] = rotatePointCw(map[id]!.x, map[id]!.y, cx, cy, deg);
  }
  return out;
}

/** Tight CSS frame for chrome / first-resize normalization. */
export function tightDisplayCssBox(geom: ShapeGeom): {
  px: number;
  py: number;
  pw: number;
  ph: number;
} {
  return tightDisplayCssBoxFromParts(
    geom.kind,
    geom.px,
    geom.py,
    geom.pw,
    geom.ph,
    geom.cx,
    geom.cy,
    geom.radiusPx,
    geom.localVerts,
  );
}

function tightDisplayCssBoxFromParts(
  kind: ShapeKind,
  px: number,
  py: number,
  pw: number,
  ph: number,
  cx: number,
  cy: number,
  radiusPx: number,
  localVerts: ShapePoint[],
): { px: number; py: number; pw: number; ph: number } {
  if (kind === "circle") {
    const d = Math.max(1, radiusPx * 2);
    return { px: cx - d / 2, py: cy - d / 2, pw: d, ph: d };
  }
  if (kind === "triangle" && localVerts.length >= 3) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const v of localVerts) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
    return {
      px: cx + minX,
      py: cy + minY,
      pw: Math.max(1, maxX - minX),
      ph: Math.max(1, maxY - minY),
    };
  }
  return { px, py, pw, ph };
}

/** World box of the displayed frame (for resize start without letterbox jump). */
export function tightDisplayWorldBox(
  geom: ShapeGeom,
  board: BoardDocument,
): { x: number; y: number; w: number; h: number } {
  const frame = tightDisplayCssBox(geom);
  return cssRectToWorldShapeBox(
    { x: frame.px, y: frame.py, w: frame.pw, h: frame.ph },
    board,
    geom.pitchRect,
  );
}

/** Point-in-triangle (barycentric), inclusive edges. */
export function pointInTriangle(
  px: number,
  py: number,
  a: ShapePoint,
  b: ShapePoint,
  c: ShapePoint,
): boolean {
  const v0x = c.x - a.x;
  const v0y = c.y - a.y;
  const v1x = b.x - a.x;
  const v1y = b.y - a.y;
  const v2x = px - a.x;
  const v2y = py - a.y;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const denom = dot00 * dot11 - dot01 * dot01;
  if (Math.abs(denom) < 1e-18) return false;
  const u = (dot11 * dot02 - dot01 * dot12) / denom;
  const v = (dot00 * dot12 - dot01 * dot02) / denom;
  return u >= -1e-9 && v >= -1e-9 && u + v <= 1 + 1e-9;
}

/**
 * Hit-test using the same geometry as draw.
 * `normX/normY` = pitch-norm (same as hitTestObject).
 */
export function pointInShape(
  geom: ShapeGeom,
  normX: number,
  normY: number,
): boolean {
  const pitch = geom.pitchRect;
  const cssX = pitch.x + normX * pitch.w;
  const cssY = pitch.y + normY * pitch.h;
  const local = unrotatePointCw(cssX, cssY, geom.cx, geom.cy, geom.rotationDeg);
  const lx = local.x - geom.cx;
  const ly = local.y - geom.cy;

  if (geom.kind === "circle") {
    return lx * lx + ly * ly <= geom.radiusPx * geom.radiusPx + 1e-6;
  }
  if (geom.kind === "rect") {
    return Math.abs(lx) <= geom.pw / 2 + 1e-6 && Math.abs(ly) <= geom.ph / 2 + 1e-6;
  }
  // triangle
  const [a, b, c] = geom.localVerts;
  if (!a || !b || !c) return false;
  return pointInTriangle(lx, ly, a, b, c);
}

export type ShapeDragConstraint = {
  /** Shift: lock rect to square. Circle/triangle always locked. */
  lockAspect?: boolean;
};

/**
 * Axis-align CSS rect from two drag corners (any quadrant).
 */
export function cssRectFromDrag(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { x: number; y: number; w: number; h: number } {
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const w = Math.abs(x1 - x0);
  const h = Math.abs(y1 - y0);
  return { x, y, w, h };
}

/**
 * Apply square / equilateral-box constraints in CSS px.
 * Anchor = drag start corner; grows with end position signs.
 */
export function constrainCssDragRect(
  kind: ShapeKind,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  opts: ShapeDragConstraint = {},
): { x: number; y: number; w: number; h: number } {
  let dx = endX - startX;
  let dy = endY - startY;
  const lock =
    opts.lockAspect === true || kind === "circle" || kind === "triangle";

  if (kind === "triangle" || (kind === "circle" && lock) || (kind === "rect" && lock)) {
    if (kind === "triangle") {
      // Equilateral tip-up: height = side * √3/2. Use |dx| as side when |dx| dominates
      // width→height mapping, else derive side from height.
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      let side: number;
      let triH: number;
      if (absDx * EQUILATERAL_H_OVER_SIDE >= absDy) {
        side = absDx;
        triH = side * EQUILATERAL_H_OVER_SIDE;
      } else {
        triH = absDy;
        side = triH / EQUILATERAL_H_OVER_SIDE;
      }
      dx = Math.sign(dx || 1) * side;
      dy = Math.sign(dy || 1) * triH;
    } else {
      // Square AABB (circle inscribed / square rect)
      const s = Math.max(Math.abs(dx), Math.abs(dy));
      dx = Math.sign(dx || 1) * s;
      dy = Math.sign(dy || 1) * s;
    }
  }

  const x1 = startX + dx;
  const y1 = startY + dy;
  return cssRectFromDrag(startX, startY, x1, y1);
}

/** CSS AABB → world pitch-norm AABB (positive). */
export function cssRectToWorldShapeBox(
  css: { x: number; y: number; w: number; h: number },
  board: BoardDocument,
  pitch: PitchRect,
): { x: number; y: number; w: number; h: number } {
  const n0x = (css.x - pitch.x) / pitch.w;
  const n0y = (css.y - pitch.y) / pitch.h;
  const n1x = (css.x + css.w - pitch.x) / pitch.w;
  const n1y = (css.y + css.h - pitch.y) / pitch.h;
  const w0 = pitchToWorld(n0x, n0y, board);
  const w1 = pitchToWorld(n1x, n1y, board);
  return normalizeShapeRect(
    Math.min(w0.x, w1.x),
    Math.min(w0.y, w1.y),
    Math.abs(w1.x - w0.x),
    Math.abs(w1.y - w0.y),
  );
}

/**
 * Pure create-drag helper: CSS start/end → world x/y/w/h for a ShapeObject.
 */
export function shapeBoxFromDrag(
  kind: ShapeKind,
  startCss: ShapePoint,
  endCss: ShapePoint,
  board: BoardDocument,
  pitch: PitchRect,
  opts: ShapeDragConstraint = {},
): { x: number; y: number; w: number; h: number } {
  const css = constrainCssDragRect(
    kind,
    startCss.x,
    startCss.y,
    endCss.x,
    endCss.y,
    opts,
  );
  // Tiny drags → still emit min box in world (via normalize)
  if (css.w < 1e-6 && css.h < 1e-6) {
    const mid = cssRectToWorldShapeBox(
      { x: startCss.x, y: startCss.y, w: 1, h: 1 },
      board,
      pitch,
    );
    return canonicalizeShapeWorldBox(
      kind,
      normalizeShapeRect(mid.x, mid.y, SHAPE_MIN_SIZE, SHAPE_MIN_SIZE),
      board,
      pitch,
    );
  }
  return canonicalizeShapeWorldBox(
    kind,
    cssRectToWorldShapeBox(css, board, pitch),
    board,
    pitch,
  );
}

/** Preview object for drawBoard (not persisted). */
export function previewShapeFromDrag(
  kind: ShapeKind,
  startCss: ShapePoint,
  endCss: ShapePoint,
  board: BoardDocument,
  pitch: PitchRect,
  opts: ShapeDragConstraint = {},
): ShapeObject {
  const box = shapeBoxFromDrag(kind, startCss, endCss, board, pitch, opts);
  return (
    sanitizeShapeObject({
      id: "__preview__",
      type: "shape",
      kind,
      ...box,
      fillColor: SHAPE_DEFAULT_FILL_COLOR,
      fillOpacity: SHAPE_DEFAULT_FILL_OPACITY,
    }) ?? {
      id: "__preview__",
      type: "shape",
      kind,
      ...box,
      fillColor: SHAPE_DEFAULT_FILL_COLOR,
      fillOpacity: SHAPE_DEFAULT_FILL_OPACITY,
    }
  );
}

/** Edge lengths of triangle local verts (CSS). */
export function triangleSideLengths(verts: ShapePoint[]): [number, number, number] {
  const d = (a: ShapePoint, b: ShapePoint) =>
    Math.hypot(a.x - b.x, a.y - b.y);
  const [a, b, c] = verts;
  return [d(a, b), d(b, c), d(c, a)];
}

function worldToCssPx(
  wx: number,
  wy: number,
  board: BoardDocument,
  pitch: PitchRect,
): ShapePoint | null {
  const p = worldToPitch(wx, wy, board);
  if (!p) return null;
  return fromNorm(p.x, p.y, pitch);
}

function cssPxToWorld(
  cssX: number,
  cssY: number,
  board: BoardDocument,
  pitch: PitchRect,
): ShapePoint {
  const nx = (cssX - pitch.x) / pitch.w;
  const ny = (cssY - pitch.y) / pitch.h;
  return pitchToWorld(nx, ny, board);
}

export function hitTestShapeHandle(
  geom: ShapeGeom,
  pitchX: number,
  pitchY: number,
): ShapeInteractionHandle | null {
  const pitch = geom.pitchRect;
  const css = {
    x: pitch.x + pitchX * pitch.w,
    y: pitch.y + pitchY * pitch.h,
  };
  const resizeR = Math.max(
    8 * pointerHitSlop(),
    SHAPE_HANDLE_VISUAL_PX * 2.2 * pointerHitSlop(),
  );
  const rotateR = Math.max(
    resizeR * 1.2,
    SHAPE_ROTATE_HANDLE_VISUAL_PX * 2.6 * pointerHitSlop(),
  );

  if (geom.showRotateHandle) {
    const rd = Math.hypot(
      css.x - geom.rotateHandle.x,
      css.y - geom.rotateHandle.y,
    );
    if (rd <= rotateR) return "rotate";
  }

  let best: ShapeHandleId | null = null;
  let bestD = resizeR;
  for (const id of SHAPE_HANDLES) {
    const h = geom.handles[id];
    const d = Math.hypot(css.x - h.x, css.y - h.y);
    if (d <= bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

export function hitTestShapeObjectHandle(
  obj: ShapeObject,
  board: BoardDocument,
  pitch: PitchRect,
  pitchX: number,
  pitchY: number,
): ShapeInteractionHandle | null {
  const geom = computeShapeGeometry(obj, board, pitch);
  if (!geom) return null;
  return hitTestShapeHandle(geom, pitchX, pitchY);
}

/**
 * Resize in local CSS (isotropic), opposite edge/corner anchored.
 * Circle → square AABB; triangle → equilateral box; rect+Shift → square.
 * `start` should be the tight display world box (see tightDisplayWorldBox).
 */
export function applyShapeResize(
  start: {
    x: number;
    y: number;
    w: number;
    h: number;
    rotationDeg?: number;
    kind: ShapeKind;
  },
  handle: ShapeHandleId,
  worldX: number,
  worldY: number,
  startPointer: { x: number; y: number },
  board: BoardDocument,
  pitch: PitchRect,
  opts: { lockAspect?: boolean } = {},
): { x: number; y: number; w: number; h: number } {
  const rot =
    start.rotationDeg != null && Number.isFinite(start.rotationDeg)
      ? start.rotationDeg
      : 0;
  const cx0 = start.x + start.w / 2;
  const cy0 = start.y + start.h / 2;
  const cCss = worldToCssPx(cx0, cy0, board, pitch);
  const tlCss = worldToCssPx(start.x, start.y, board, pitch);
  const brCss = worldToCssPx(start.x + start.w, start.y + start.h, board, pitch);
  const ptrCss = worldToCssPx(worldX, worldY, board, pitch);
  const startCss = worldToCssPx(startPointer.x, startPointer.y, board, pitch);
  if (!cCss || !tlCss || !brCss || !ptrCss || !startCss) {
    return { x: start.x, y: start.y, w: start.w, h: start.h };
  }

  const localPtr = unrotatePointCw(ptrCss.x, ptrCss.y, cCss.x, cCss.y, rot);
  const localStart = unrotatePointCw(
    startCss.x,
    startCss.y,
    cCss.x,
    cCss.y,
    rot,
  );
  const dx = localPtr.x - localStart.x;
  const dy = localPtr.y - localStart.y;

  let x = tlCss.x;
  let y = tlCss.y;
  let w = Math.max(1, brCss.x - tlCss.x);
  let h = Math.max(1, brCss.y - tlCss.y);
  const minCss = Math.max(2, SHAPE_MIN_SIZE * Math.min(pitch.w, pitch.h));

  const left = handle === "w" || handle === "nw" || handle === "sw";
  const right = handle === "e" || handle === "ne" || handle === "se";
  const top = handle === "n" || handle === "nw" || handle === "ne";
  const bottom = handle === "s" || handle === "sw" || handle === "se";

  const startLeft = x;
  const startTop = y;
  const startRight = x + w;
  const startBottom = y + h;
  const startCx = x + w / 2;
  const startCy = y + h / 2;

  if (right) w = Math.max(minCss, w + dx);
  else if (left) {
    const nw = Math.max(minCss, w - dx);
    x = x + (w - nw);
    w = nw;
  }
  if (bottom) h = Math.max(minCss, h + dy);
  else if (top) {
    const nh = Math.max(minCss, h - dy);
    y = y + (h - nh);
    h = nh;
  }

  const lockSquare =
    start.kind === "circle" ||
    (start.kind === "rect" && opts.lockAspect === true);
  const lockTri = start.kind === "triangle";

  if (lockSquare || lockTri) {
    let tw = w;
    let th = h;
    if (lockTri) {
      if (w * EQUILATERAL_H_OVER_SIDE >= h) {
        tw = Math.max(minCss, w);
        th = tw * EQUILATERAL_H_OVER_SIDE;
      } else {
        th = Math.max(minCss, h);
        tw = th / EQUILATERAL_H_OVER_SIDE;
      }
    } else {
      const s = Math.max(minCss, w, h);
      tw = s;
      th = s;
    }

    // Opposite edge/corner stays fixed (PP / Slides). Match the *dragged*
    // handle — previous code inverted these branches so circle/triangle grew
    // away from the pointer.
    if (right && bottom) {
      // SE → fix NW
      x = startLeft;
      y = startTop;
    } else if (left && bottom) {
      // SW → fix NE
      x = startRight - tw;
      y = startTop;
    } else if (right && top) {
      // NE → fix SW
      x = startLeft;
      y = startBottom - th;
    } else if (left && top) {
      // NW → fix SE
      x = startRight - tw;
      y = startBottom - th;
    } else if (right) {
      // E → fix left edge (vertically centre for aspect lock)
      x = startLeft;
      y = startCy - th / 2;
    } else if (left) {
      // W → fix right edge
      x = startRight - tw;
      y = startCy - th / 2;
    } else if (bottom) {
      // S → fix top edge
      x = startCx - tw / 2;
      y = startTop;
    } else if (top) {
      // N → fix bottom edge
      x = startCx - tw / 2;
      y = startBottom - th;
    }
    w = tw;
    h = th;
  }

  const tlW = cssPxToWorld(x, y, board, pitch);
  const brW = cssPxToWorld(x + w, y + h, board, pitch);
  const raw = normalizeShapeRect(
    Math.min(tlW.x, brW.x),
    Math.min(tlW.y, brW.y),
    Math.abs(brW.x - tlW.x),
    Math.abs(brW.y - tlW.y),
  );
  return canonicalizeShapeWorldBox(start.kind, raw, board, pitch);
}

/** True when the shape should not steal pointer hits (fully invisible). */
export function shapeStealsHits(obj: ShapeObject): boolean {
  if (!isShapeKind(obj.kind)) return false;
  const opacity = Number.isFinite(obj.fillOpacity)
    ? obj.fillOpacity
    : SHAPE_DEFAULT_FILL_OPACITY;
  if (opacity > 0) return true;
  return obj.strokeEnabled !== false;
}
