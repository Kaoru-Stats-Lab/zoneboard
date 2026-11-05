/**
 * Shared text-box geometry for draw / hit / resize / wrap / rotate (Group 2–4).
 * Units: TextObject.x/y/width/height = world pitch-norm (same as pieces).
 * Pointer hit uses pitch-norm (toNorm); convert via worldToPitch / pitchToWorld.
 *
 * width absent → legacy single-line (no wrap).
 * width set → wrap + contentHeight; display H = max(contentH, height ?? 0).
 * rotationDeg → clockwise degrees in screen space (Canvas/CSS, y-down); pivot = box centre.
 */
import type { BoardDocument, TextAlign, TextObject } from "../models/types";
import { textFontStack } from "../presets/textStyle";
import { fromNorm, pointerHitSlop, type PitchRect } from "./layout";
import { pitchToWorld, worldToPitch } from "./pitchCoords";

import {
  TEXT_BOX_MIN_H,
  TEXT_BOX_MIN_W,
  sanitizeTextBoxNumber,
  sanitizeTextObject,
} from "../models/textSanitize";

export { TEXT_BOX_MIN_H, TEXT_BOX_MIN_W, sanitizeTextObject, sanitizeTextBoxNumber };

/** Selection handle half-size in CSS px (visual) */
export const TEXT_HANDLE_VISUAL_PX = 5;

/** Rotate handle visual radius (CSS px) */
export const TEXT_ROTATE_HANDLE_VISUAL_PX = 6;

/**
 * Distance from unrotated top-mid to rotate handle, along local -Y (CSS px).
 * Scales slightly with box size so it stays reachable on tiny boxes.
 */
export const TEXT_ROTATE_HANDLE_OFFSET_PX = 22;

/** Shift+rotate snap step */
export const TEXT_ROTATE_SNAP_DEG = 15;

/** Line box as multiple of fontPx — match Canvas + textarea */
export const TEXT_LINE_HEIGHT_RATIO = 1.25;

/**
 * Default explicit width for newly created text (world pitch-norm).
 * ~28% of pitch length — enough for a short caption without dominating the board.
 */
export const TEXT_DEFAULT_WIDTH = 0.28;

/** Keep new boxes inside the pitch with a small margin */
export const TEXT_PLACE_MARGIN = 0.02;

export const TEXT_DEFAULT_FONT_SIZE = 0.035;

export type TextHandleId =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

/** Resize handles + rotate handle (hit-test / drag). */
export type TextInteractionHandle = TextHandleId | "rotate";

export const TEXT_HANDLES: TextHandleId[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

export type TextLineLayout = {
  text: string;
  /** Canvas CSS px — absolute draw origin of the *unrotated* box (top of glyph box) */
  x: number;
  y: number;
};

export type TextBoxGeom = {
  worldX: number;
  worldY: number;
  worldW: number;
  worldH: number;
  /** World-norm height needed by wrapped content */
  contentH: number;
  contentHeightPx: number;
  hasExplicitWidth: boolean;
  hasExplicitHeight: boolean;
  align: TextAlign;
  /** Clockwise degrees (screen y-down). Always finite; missing obj → 0. */
  rotationDeg: number;
  fontPx: number;
  lineHeightPx: number;
  lines: TextLineLayout[];
  /** Unrotated AABB in pitch-norm */
  pitchX: number;
  pitchY: number;
  pitchW: number;
  pitchH: number;
  /** Unrotated top-left in Canvas CSS px */
  px: number;
  py: number;
  pw: number;
  ph: number;
  /** Box centre (rotation pivot) — CSS px / pitch-norm */
  cx: number;
  cy: number;
  centerPitch: { x: number; y: number };
  /** Rotated resize handles (CSS px / pitch-norm) */
  handles: Record<TextHandleId, { x: number; y: number }>;
  handlesPitch: Record<TextHandleId, { x: number; y: number }>;
  /** Rotated top-edge mid (connection point for rotate stem) */
  topMid: { x: number; y: number };
  topMidPitch: { x: number; y: number };
  /** Rotate handle (CSS px / pitch-norm) */
  rotateHandle: { x: number; y: number };
  rotateHandlePitch: { x: number; y: number };
  /** Axis-aligned bounding box of the rotated rect (pitch-norm) — broad phase only */
  aabbPitch: { x: number; y: number; w: number; h: number };
  /** PitchRect used for CSS↔pitch (rotation math is isotropic in CSS px) */
  pitchRect: PitchRect;
};

let measureCtx: CanvasRenderingContext2D | null | undefined;
let graphemeSegmenter: Intl.Segmenter | null | undefined;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (measureCtx !== undefined) return measureCtx;
  if (typeof document === "undefined") {
    measureCtx = null;
    return null;
  }
  const c = document.createElement("canvas");
  measureCtx = c.getContext("2d");
  return measureCtx;
}

function getGraphemeSegmenter(): Intl.Segmenter | null {
  if (graphemeSegmenter !== undefined) return graphemeSegmenter;
  try {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      graphemeSegmenter = new Intl.Segmenter(undefined, {
        granularity: "grapheme",
      });
      return graphemeSegmenter;
    }
  } catch {
    /* fall through */
  }
  graphemeSegmenter = null;
  return null;
}

export function segmentGraphemes(text: string): string[] {
  const seg = getGraphemeSegmenter();
  if (seg) {
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Soft-break opportunity after this grapheme (CJK / space). */
function isSoftBreakAfter(g: string): boolean {
  if (/\s/.test(g)) return true;
  // CJK Unified Ideographs + kana (simplified; not full kinsoku)
  const cp = g.codePointAt(0) ?? 0;
  return (
    (cp >= 0x3040 && cp <= 0x30ff) ||
    (cp >= 0x3400 && cp <= 0x9fff) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xff66 && cp <= 0xff9d)
  );
}

export function measureStringPx(
  text: string,
  fontPx: number,
  fontFamily: TextObject["fontFamily"],
): number {
  const stack = textFontStack(fontFamily);
  const ctx = getMeasureCtx();
  if (ctx) {
    ctx.font = `600 ${fontPx}px ${stack}`;
    return ctx.measureText(text || "").width;
  }
  return Math.max(0, (text || "").length * fontPx * 0.55);
}

/**
 * Wrap a single paragraph (no \\n) to maxWidthPx.
 * Prefers breaks after spaces / CJK; forces mid-token break if needed.
 */
export function wrapParagraph(
  para: string,
  maxWidthPx: number,
  fontPx: number,
  fontFamily: TextObject["fontFamily"],
): string[] {
  if (para === "") return [""];
  const measure = (s: string) => measureStringPx(s, fontPx, fontFamily);
  if (measure(para) <= maxWidthPx) return [para];

  const gs = segmentGraphemes(para);
  const lines: string[] = [];
  let line = "";
  let lastBreak = 0; // exclusive end index in `line` for preferred break

  const flushAt = (end: number, nextStart: string) => {
    let chunk = line.slice(0, end);
    // Drop trailing spaces on the broken line (standard wrap)
    chunk = chunk.replace(/\s+$/u, "");
    lines.push(chunk);
    line = nextStart.replace(/^\s+/u, "");
    lastBreak = 0;
    for (let j = 0; j < line.length; ) {
      const g = segmentGraphemes(line.slice(j))[0] ?? line[j]!;
      j += g.length;
      if (isSoftBreakAfter(g)) lastBreak = j;
    }
  };

  for (const g of gs) {
    const trial = line + g;
    if (measure(trial) <= maxWidthPx || line.length === 0) {
      line = trial;
      if (isSoftBreakAfter(g)) lastBreak = line.length;
      continue;
    }
    if (lastBreak > 0 && lastBreak < line.length) {
      const rest = line.slice(lastBreak) + g;
      flushAt(lastBreak, rest);
      if (measure(line) > maxWidthPx && line.length > 0) {
        // rest itself too long — force-break below on next iterations
        const forced = line;
        lines.push(forced);
        line = "";
        lastBreak = 0;
      }
    } else if (line.length > 0) {
      lines.push(line);
      line = /\s/u.test(g) ? "" : g;
      lastBreak = line.length > 0 && isSoftBreakAfter(g) ? line.length : 0;
    } else {
      lines.push(g);
      line = "";
      lastBreak = 0;
    }
  }
  if (line.length > 0 || lines.length === 0) lines.push(line);
  return lines;
}

/** Full text → display lines. Respects explicit \\n; does not mutate source. */
export function layoutTextLines(
  text: string,
  maxWidthPx: number | null,
  fontPx: number,
  fontFamily: TextObject["fontFamily"],
): string[] {
  if (maxWidthPx == null || !(maxWidthPx > 0)) {
    // Legacy: one canvas line (\\n not rendered as break)
    return [text];
  }
  const paras = text.split("\n");
  const out: string[] = [];
  for (const para of paras) {
    out.push(...wrapParagraph(para, maxWidthPx, fontPx, fontFamily));
  }
  return out.length ? out : [""];
}

/**
 * Exact pitch-scaled font — no absolute px floor.
 * A floor (e.g. 10) breaks wrap parity between small editor canvases and PNG export.
 */
export function fontPxForText(obj: TextObject, pitch: PitchRect): number {
  return Math.max(1e-3, Math.min(pitch.w, pitch.h) * obj.fontSize);
}

function worldRectToPitch(
  x: number,
  y: number,
  w: number,
  h: number,
  board: BoardDocument,
): { x: number; y: number; w: number; h: number } | null {
  const tl = worldToPitch(x, y, board);
  const br = worldToPitch(x + w, y + h, board);
  if (!tl || !br) return null;
  const px = Math.min(tl.x, br.x);
  const py = Math.min(tl.y, br.y);
  return {
    x: px,
    y: py,
    w: Math.abs(br.x - tl.x),
    h: Math.abs(br.y - tl.y),
  };
}

export function pitchRectToWorld(
  x: number,
  y: number,
  w: number,
  h: number,
  board: BoardDocument,
): { x: number; y: number; w: number; h: number } {
  const tl = pitchToWorld(x, y, board);
  const br = pitchToWorld(x + w, y + h, board);
  return {
    x: Math.min(tl.x, br.x),
    y: Math.min(tl.y, br.y),
    w: Math.abs(br.x - tl.x),
    h: Math.abs(br.y - tl.y),
  };
}

function handleMap(
  left: number,
  top: number,
  w: number,
  h: number,
): Record<TextHandleId, { x: number; y: number }> {
  const cx = left + w / 2;
  const cy = top + h / 2;
  const right = left + w;
  const bottom = top + h;
  return {
    nw: { x: left, y: top },
    n: { x: cx, y: top },
    ne: { x: right, y: top },
    e: { x: right, y: cy },
    se: { x: right, y: bottom },
    s: { x: cx, y: bottom },
    sw: { x: left, y: bottom },
    w: { x: left, y: cy },
  };
}

/** Treat missing / non-finite as 0. */
export function textRotationDeg(obj: Pick<TextObject, "rotationDeg">): number {
  const d = obj.rotationDeg;
  return d != null && Number.isFinite(d) ? d : 0;
}

/**
 * Normalize to [0, 360). Preserves exact 0/90/180/270 after snap.
 * Rejects NaN/Infinity → 0.
 */
export function normalizeRotationDeg(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  let d = deg % 360;
  if (d < 0) d += 360;
  if (d >= 360 - 1e-9) d = 0;
  // Snap tiny noise onto cardinals when already very close
  for (const c of [0, 90, 180, 270]) {
    if (Math.abs(d - c) < 1e-6) return c;
  }
  return d;
}

export function snapRotationDeg(deg: number, step = TEXT_ROTATE_SNAP_DEG): number {
  if (!Number.isFinite(deg) || !(step > 0)) return normalizeRotationDeg(deg);
  return normalizeRotationDeg(Math.round(deg / step) * step);
}

/**
 * Rotate a point clockwise around (cx,cy) in screen space (y-down).
 * Matches Canvas `ctx.rotate(rad)` and CSS `transform: rotate()`:
 *   x' = cx + dx·cos − dy·sin
 *   y' = cy + dx·sin + dy·cos
 */
export function rotatePointCw(
  x: number,
  y: number,
  cx: number,
  cy: number,
  deg: number,
): { x: number; y: number } {
  if (!deg) return { x, y };
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

/** Inverse of rotatePointCw (counter-clockwise by deg). */
export function unrotatePointCw(
  x: number,
  y: number,
  cx: number,
  cy: number,
  deg: number,
): { x: number; y: number } {
  return rotatePointCw(x, y, cx, cy, -deg);
}

function mapRecordRotated(
  map: Record<TextHandleId, { x: number; y: number }>,
  cx: number,
  cy: number,
  deg: number,
): Record<TextHandleId, { x: number; y: number }> {
  if (!deg) return map;
  const out = {} as Record<TextHandleId, { x: number; y: number }>;
  for (const id of TEXT_HANDLES) {
    out[id] = rotatePointCw(map[id]!.x, map[id]!.y, cx, cy, deg);
  }
  return out;
}

/**
 * Angle of vector centre→pointer in screen degrees (atan2, y-down → clockwise from +X).
 */
export function pointerAngleDeg(
  center: { x: number; y: number },
  pointer: { x: number; y: number },
): number {
  return (Math.atan2(pointer.y - center.y, pointer.x - center.x) * 180) / Math.PI;
}

/**
 * Live rotation from drag: startRotation + (angleNow - angleStart).
 * Does not normalize mid-drag so 359→0 does not jump; call normalizeRotationDeg on commit.
 */
export function rotationDegFromDrag(
  center: { x: number; y: number },
  startPointer: { x: number; y: number },
  currentPointer: { x: number; y: number },
  startRotationDeg: number,
  snap15: boolean,
): number {
  const a0 = pointerAngleDeg(center, startPointer);
  const a1 = pointerAngleDeg(center, currentPointer);
  let next = startRotationDeg + (a1 - a0);
  if (snap15) next = Math.round(next / TEXT_ROTATE_SNAP_DEG) * TEXT_ROTATE_SNAP_DEG;
  return next;
}

/**
 * Place a new text box near a click so it stays on-pitch.
 * Returns world x/y/width (never invents height).
 */
export function placeNewTextBox(
  clickX: number,
  clickY: number,
  preferredWidth = TEXT_DEFAULT_WIDTH,
): { x: number; y: number; width: number } {
  const margin = TEXT_PLACE_MARGIN;
  let width = Math.max(TEXT_BOX_MIN_W, preferredWidth);
  const maxSpan = 1 - margin * 2;
  width = Math.min(width, maxSpan);
  let x = clickX;
  let y = Math.min(1 - margin, Math.max(margin, clickY));
  if (x + width > 1 - margin) {
    x = 1 - margin - width;
  }
  if (x < margin) {
    x = margin;
    width = Math.min(width, 1 - margin - x);
  }
  return { x, y, width: Math.max(TEXT_BOX_MIN_W, width) };
}

/**
 * Compute shared geometry for a text object.
 * When `width` is absent, box width follows single-line content (legacy, no wrap).
 */
export function computeTextGeometry(
  obj: TextObject,
  board: BoardDocument,
  pitch: PitchRect,
): TextBoxGeom | null {
  const fontPx = fontPxForText(obj, pitch);
  const lineHeightPx = fontPx * TEXT_LINE_HEIGHT_RATIO;
  const hasExplicitWidth =
    obj.width != null && Number.isFinite(obj.width) && obj.width > 0;
  const hasExplicitHeight =
    obj.height != null && Number.isFinite(obj.height) && obj.height > 0;

  const origin = worldToPitch(obj.x, obj.y, board);
  if (!origin) return null;

  let worldW: number;
  let maxWidthPx: number | null;

  if (hasExplicitWidth) {
    worldW = Math.max(TEXT_BOX_MIN_W, obj.width!);
    const pitchWBox = worldRectToPitch(obj.x, obj.y, worldW, 0.01, board);
    maxWidthPx = pitchWBox ? pitchWBox.w * pitch.w : worldW * pitch.w;
  } else {
    const oneLineW = Math.max(
      1,
      measureStringPx(obj.text || " ", fontPx, obj.fontFamily),
    );
    const contentPitchW = oneLineW / pitch.w;
    const contentWorld = pitchRectToWorld(
      origin.x,
      origin.y,
      contentPitchW,
      lineHeightPx / pitch.h,
      board,
    );
    worldW = Math.max(TEXT_BOX_MIN_W * 0.5, contentWorld.w);
    maxWidthPx = null;
  }

  const lineStrings = layoutTextLines(
    obj.text,
    maxWidthPx,
    fontPx,
    obj.fontFamily,
  );
  const contentHeightPx = Math.max(lineHeightPx, lineStrings.length * lineHeightPx);
  const contentPitchH = contentHeightPx / pitch.h;
  const contentWorldH = pitchRectToWorld(
    origin.x,
    origin.y,
    0.01,
    contentPitchH,
    board,
  ).h;
  const contentH = Math.max(TEXT_BOX_MIN_H * 0.5, contentWorldH);

  const worldH = Math.max(
    contentH,
    hasExplicitHeight ? Math.max(TEXT_BOX_MIN_H, obj.height!) : contentH,
  );

  const pitchBox = worldRectToPitch(obj.x, obj.y, worldW, worldH, board);
  if (!pitchBox || pitchBox.w <= 0 || pitchBox.h <= 0) return null;

  const topLeft = fromNorm(pitchBox.x, pitchBox.y, pitch);
  const pw = pitchBox.w * pitch.w;
  const ph = pitchBox.h * pitch.h;
  const align = obj.align ?? "left";
  const rotationDeg = textRotationDeg(obj);

  const lines: TextLineLayout[] = lineStrings.map((text, i) => {
    let x = topLeft.x;
    if (align === "center") x = topLeft.x + pw / 2;
    else if (align === "right") x = topLeft.x + pw;
    return {
      text,
      x,
      y: topLeft.y + i * lineHeightPx,
    };
  });

  const cx = topLeft.x + pw / 2;
  const cy = topLeft.y + ph / 2;
  const centerPitch = {
    x: pitchBox.x + pitchBox.w / 2,
    y: pitchBox.y + pitchBox.h / 2,
  };

  const localHandles = handleMap(topLeft.x, topLeft.y, pw, ph);
  const localHandlesPitch = handleMap(
    pitchBox.x,
    pitchBox.y,
    pitchBox.w,
    pitchBox.h,
  );
  const handles = mapRecordRotated(localHandles, cx, cy, rotationDeg);

  const rotateOffsetPx = Math.max(
    TEXT_ROTATE_HANDLE_OFFSET_PX,
    Math.min(pw, ph) * 0.12,
  );
  const topMid = rotatePointCw(cx, topLeft.y, cx, cy, rotationDeg);
  const rotateHandle = rotatePointCw(
    cx,
    topLeft.y - rotateOffsetPx,
    cx,
    cy,
    rotationDeg,
  );

  /** CSS px → pitch-norm (0–1 of pitch rect) */
  const cssToPitch = (cssX: number, cssY: number) => ({
    x: (cssX - pitch.x) / pitch.w,
    y: (cssY - pitch.y) / pitch.h,
  });

  const handlesPitch = {} as Record<TextHandleId, { x: number; y: number }>;
  for (const id of TEXT_HANDLES) {
    const h = handles[id]!;
    handlesPitch[id] = cssToPitch(h.x, h.y);
  }
  const topMidPitch = cssToPitch(topMid.x, topMid.y);
  const rotateHandlePitch = cssToPitch(rotateHandle.x, rotateHandle.y);
  // silence unused localHandlesPitch (kept for clarity of unrotated pitch map)
  void localHandlesPitch;

  // Rotated corners in CSS → AABB in pitch-norm
  const cornersCss = [
    rotatePointCw(topLeft.x, topLeft.y, cx, cy, rotationDeg),
    rotatePointCw(topLeft.x + pw, topLeft.y, cx, cy, rotationDeg),
    rotatePointCw(topLeft.x + pw, topLeft.y + ph, cx, cy, rotationDeg),
    rotatePointCw(topLeft.x, topLeft.y + ph, cx, cy, rotationDeg),
  ];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of cornersCss) {
    const p = cssToPitch(c.x, c.y);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  return {
    worldX: obj.x,
    worldY: obj.y,
    worldW,
    worldH,
    contentH,
    contentHeightPx,
    hasExplicitWidth,
    hasExplicitHeight,
    align,
    rotationDeg,
    fontPx,
    lineHeightPx,
    lines,
    pitchX: pitchBox.x,
    pitchY: pitchBox.y,
    pitchW: pitchBox.w,
    pitchH: pitchBox.h,
    px: topLeft.x,
    py: topLeft.y,
    pw,
    ph,
    cx,
    cy,
    centerPitch,
    handles,
    handlesPitch,
    topMid,
    topMidPitch,
    rotateHandle,
    rotateHandlePitch,
    aabbPitch: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
    pitchRect: { x: pitch.x, y: pitch.y, w: pitch.w, h: pitch.h },
  };
}

function pitchNormToCss(
  geom: TextBoxGeom,
  pitchX: number,
  pitchY: number,
): { x: number; y: number } {
  return {
    x: geom.pitchRect.x + pitchX * geom.pitchRect.w,
    y: geom.pitchRect.y + pitchY * geom.pitchRect.h,
  };
}

/**
 * Precise hit: inverse-rotate pointer (CSS px) into the unrotated local box.
 * Do not use the outer AABB alone for selection.
 */
export function pointInTextBox(
  geom: TextBoxGeom,
  pitchX: number,
  pitchY: number,
  padPitch = 0,
): boolean {
  const css = pitchNormToCss(geom, pitchX, pitchY);
  const local = unrotatePointCw(
    css.x,
    css.y,
    geom.cx,
    geom.cy,
    geom.rotationDeg,
  );
  const padX = padPitch * geom.pitchRect.w;
  const padY = padPitch * geom.pitchRect.h;
  return (
    local.x >= geom.px - padX &&
    local.x <= geom.px + geom.pw + padX &&
    local.y >= geom.py - padY &&
    local.y <= geom.py + geom.ph + padY
  );
}

export function hitTestTextHandle(
  geom: TextBoxGeom,
  pitchX: number,
  pitchY: number,
): TextInteractionHandle | null {
  const css = pitchNormToCss(geom, pitchX, pitchY);
  const resizeR = Math.max(
    8 * pointerHitSlop(),
    TEXT_HANDLE_VISUAL_PX * 2.2 * pointerHitSlop(),
  );
  const rotateR = Math.max(
    resizeR * 1.2,
    TEXT_ROTATE_HANDLE_VISUAL_PX * 2.6 * pointerHitSlop(),
  );

  const rd = Math.hypot(
    css.x - geom.rotateHandle.x,
    css.y - geom.rotateHandle.y,
  );
  if (rd <= rotateR) return "rotate";

  let best: TextHandleId | null = null;
  let bestD = resizeR;
  for (const id of TEXT_HANDLES) {
    const h = geom.handles[id];
    const d = Math.hypot(css.x - h.x, css.y - h.y);
    if (d <= bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

export function hitTestTextObjectHandle(
  obj: TextObject,
  board: BoardDocument,
  pitch: PitchRect,
  pitchX: number,
  pitchY: number,
): TextInteractionHandle | null {
  const geom = computeTextGeometry(obj, board, pitch);
  if (!geom) return null;
  return hitTestTextHandle(geom, pitchX, pitchY);
}

function worldToCssPx(
  wx: number,
  wy: number,
  board: BoardDocument,
  pitch: PitchRect,
): { x: number; y: number } | null {
  const p = worldToPitch(wx, wy, board);
  if (!p) return null;
  return fromNorm(p.x, p.y, pitch);
}

function cssPxToWorld(
  cssX: number,
  cssY: number,
  board: BoardDocument,
  pitch: PitchRect,
): { x: number; y: number } {
  const nx = (cssX - pitch.x) / pitch.w;
  const ny = (cssY - pitch.y) / pitch.h;
  return pitchToWorld(nx, ny, board);
}

/**
 * Apply a resize from pointer positions.
 * Deltas are interpreted in the box's local frame in *CSS px* (isotropic),
 * so opposite edges stay fixed on the rotated visual. rotationDeg unchanged.
 *
 * When `pitch` is omitted, falls back to world-norm deltas (rotation=0 path).
 */
export function applyTextResize(
  start: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotationDeg?: number;
  },
  handle: TextHandleId,
  worldX: number,
  worldY: number,
  startPointer: { x: number; y: number },
  board?: BoardDocument,
  pitch?: PitchRect,
): { x: number; y: number; width: number; height: number } {
  const rot =
    start.rotationDeg != null && Number.isFinite(start.rotationDeg)
      ? start.rotationDeg
      : 0;

  if (!board || !pitch || !rot) {
    const dx = worldX - startPointer.x;
    const dy = worldY - startPointer.y;
    let { x, y } = start;
    let w = start.width;
    let h = start.height;
    const left = handle === "w" || handle === "nw" || handle === "sw";
    const right = handle === "e" || handle === "ne" || handle === "se";
    const top = handle === "n" || handle === "nw" || handle === "ne";
    const bottom = handle === "s" || handle === "sw" || handle === "se";
    if (right) w = Math.max(TEXT_BOX_MIN_W, start.width + dx);
    else if (left) {
      w = Math.max(TEXT_BOX_MIN_W, start.width - dx);
      x = start.x + (start.width - w);
    }
    if (bottom) h = Math.max(TEXT_BOX_MIN_H, start.height + dy);
    else if (top) {
      h = Math.max(TEXT_BOX_MIN_H, start.height - dy);
      y = start.y + (start.height - h);
    }
    return { x, y, width: w, height: h };
  }

  const cx0 = start.x + start.width / 2;
  const cy0 = start.y + start.height / 2;
  const cCss = worldToCssPx(cx0, cy0, board, pitch);
  const tlCss = worldToCssPx(start.x, start.y, board, pitch);
  const brCss = worldToCssPx(
    start.x + start.width,
    start.y + start.height,
    board,
    pitch,
  );
  const ptrCss = worldToCssPx(worldX, worldY, board, pitch);
  const startCss = worldToCssPx(startPointer.x, startPointer.y, board, pitch);
  if (!cCss || !tlCss || !brCss || !ptrCss || !startCss) {
    return {
      x: start.x,
      y: start.y,
      width: start.width,
      height: start.height,
    };
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
  const minWcss = TEXT_BOX_MIN_W * pitch.w;
  const minHcss = TEXT_BOX_MIN_H * pitch.h;

  const left = handle === "w" || handle === "nw" || handle === "sw";
  const right = handle === "e" || handle === "ne" || handle === "se";
  const top = handle === "n" || handle === "nw" || handle === "ne";
  const bottom = handle === "s" || handle === "sw" || handle === "se";

  if (right) {
    w = Math.max(minWcss, w + dx);
  } else if (left) {
    const nw = Math.max(minWcss, w - dx);
    x = x + (w - nw);
    w = nw;
  }
  if (bottom) {
    h = Math.max(minHcss, h + dy);
  } else if (top) {
    const nh = Math.max(minHcss, h - dy);
    y = y + (h - nh);
    h = nh;
  }

  const tlW = cssPxToWorld(x, y, board, pitch);
  const brW = cssPxToWorld(x + w, y + h, board, pitch);
  return {
    x: tlW.x,
    y: tlW.y,
    width: Math.max(TEXT_BOX_MIN_W, brW.x - tlW.x),
    height: Math.max(TEXT_BOX_MIN_H, brW.y - tlW.y),
  };
}

export { swapTextEndsPosition } from "../models/textSanitize";

/** CSS resize cursor for a handle, adjusted by box rotation (nearest 45°). */
export function textResizeCursor(
  handle: TextHandleId,
  rotationDeg: number,
): string {
  const base: Record<TextHandleId, number> = {
    e: 0,
    se: 45,
    s: 90,
    sw: 135,
    w: 180,
    nw: 225,
    n: 270,
    ne: 315,
  };
  let deg = (base[handle] + (rotationDeg || 0)) % 360;
  if (deg < 0) deg += 360;
  const step = Math.round(deg / 45) % 8;
  const cursors = [
    "e-resize",
    "se-resize",
    "s-resize",
    "sw-resize",
    "w-resize",
    "nw-resize",
    "n-resize",
    "ne-resize",
  ] as const;
  return cursors[step]!;
}
