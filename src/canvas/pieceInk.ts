import { AWAY_COLOR, HOME_COLOR } from "../models/types";

/** Luminance above this → dark ink (#111). Tuned so bright kits (e.g. #fde047) stay readable on grass in 1080p capture. */
export const INK_LUMINANCE_THRESHOLD = 0.45;

/** Minimum RGB distance between home/away kit colors for teamPairOk (future picker). */
export const TEAM_PAIR_MIN_RGB_DIST = 60;

function rgbDistance(a: string, b: string): number {
  const ha = parseHexRgb(normalizePieceColor(a, HOME_COLOR));
  const aa = parseHexRgb(normalizePieceColor(b, AWAY_COLOR));
  if (!ha || !aa) return TEAM_PAIR_MIN_RGB_DIST;
  const dr = ha.r - aa.r;
  const dg = ha.g - aa.g;
  const db = ha.b - aa.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** True when home/away kit colors are distinguishable enough (future picker). */
export function teamPairOk(home: string, away: string): boolean {
  return rgbDistance(home, away) >= TEAM_PAIR_MIN_RGB_DIST;
}

const NAMED_COLORS: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  gray: "#808080",
  grey: "#808080",
  orange: "#ffa500",
  purple: "#800080",
};

const NUMBER_MAX_LEN = 4;

function srgbChannelToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace(/^#/, "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0]! + h[0], 16),
      g: parseInt(h[1]! + h[1], 16),
      b: parseInt(h[2]! + h[2], 16),
    };
  }
  if (h.length === 6 || h.length === 8) {
    const rgb = h.slice(0, 6);
    return {
      r: parseInt(rgb.slice(0, 2), 16),
      g: parseInt(rgb.slice(2, 4), 16),
      b: parseInt(rgb.slice(4, 6), 16),
    };
  }
  return null;
}

function clampByte(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${clampByte(r).toString(16).padStart(2, "0")}${clampByte(g).toString(16).padStart(2, "0")}${clampByte(b).toString(16).padStart(2, "0")}`;
}

/** Parse and normalize to opaque #rrggbb; invalid input → fallback. */
export function normalizePieceColor(input: string, fallback: string): string {
  const raw = input.trim().toLowerCase();
  if (!raw) return normalizePieceColor(fallback, HOME_COLOR);

  if (raw.startsWith("#") || /^[0-9a-f]{3}$/.test(raw) || /^[0-9a-f]{6}$/.test(raw)) {
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    const rgb = parseHexRgb(hex);
    if (rgb && [rgb.r, rgb.g, rgb.b].every((c) => Number.isFinite(c))) {
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    return normalizePieceColor(fallback, HOME_COLOR);
  }

  const rgbFn = raw.match(
    /^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)/,
  );
  if (rgbFn) {
    const parseCh = (s: string) =>
      s.endsWith("%") ? (parseFloat(s) / 100) * 255 : parseFloat(s);
    const r = parseCh(rgbFn[1]!);
    const g = parseCh(rgbFn[2]!);
    const b = parseCh(rgbFn[3]!);
    if ([r, g, b].every((c) => Number.isFinite(c))) {
      return rgbToHex(r, g, b);
    }
  }

  const named = NAMED_COLORS[raw];
  if (named) return named;

  return normalizePieceColor(fallback, HOME_COLOR);
}

export function relativeLuminance(hex: string): number {
  const rgb = parseHexRgb(normalizePieceColor(hex, "#808080"));
  if (!rgb) return 0;
  const r = srgbChannelToLinear(rgb.r);
  const g = srgbChannelToLinear(rgb.g);
  const b = srgbChannelToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function numberFill(bg: string): "#fff" | "#111" {
  return relativeLuminance(bg) > INK_LUMINANCE_THRESHOLD ? "#111" : "#fff";
}

export function numberHalo(bg: string): "#fff" | "#111" {
  return numberFill(bg) === "#fff" ? "#111" : "#fff";
}

/** Trim, NFKC, digits + one optional letter; max 4 chars. Empty allowed. */
export function normalizePieceNumber(raw: string): string {
  let s = raw.normalize("NFKC").trim();
  s = s.replace(/[^\dA-Za-z]/g, "");
  if (s.length > NUMBER_MAX_LEN) s = s.slice(0, NUMBER_MAX_LEN);
  return s;
}

export function fitNumberFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  r: number,
  fontStack: string,
): number {
  const maxW = r * 1.6;
  let fs = r * 0.9;
  const minFs = r * 0.45;
  while (fs >= minFs) {
    ctx.font = `700 ${fs}px ${fontStack}`;
    if (ctx.measureText(text).width <= maxW) return fs;
    fs -= Math.max(0.5, fs * 0.08);
  }
  return minFs;
}

export function pieceFillColor(piece: {
  color: string;
  team: "home" | "away";
}): string {
  return normalizePieceColor(
    piece.color,
    piece.team === "home" ? HOME_COLOR : AWAY_COLOR,
  );
}

/** Self-check for manual / CI-less runs: `npx --yes tsx scripts/pieceInk-check.ts` */
export function pieceInkSelfTest(): void {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(msg);
  };
  assert(numberFill("#fde047") === "#111", "yellow → dark ink");
  assert(numberFill("#e74c3c") === "#fff", "red → light ink");
  assert(numberFill("#ffffff") === "#111", "white → dark ink");
  assert(numberFill("#111111") === "#fff", "near-black → light ink");
  assert(
    normalizePieceColor("nope", HOME_COLOR) === HOME_COLOR,
    "invalid → fallback",
  );
  assert(normalizePieceColor("#fff", HOME_COLOR) === "#ffffff", "short hex");
  assert(
    normalizePieceColor("c8102e", HOME_COLOR) === "#c8102e",
    "bare hex",
  );
  assert(
    normalizePieceColor("rgb(200, 16, 46)", HOME_COLOR) === "#c8102e",
    "rgb()",
  );
  assert(normalizePieceNumber("１０") === "10", "fullwidth digits");
  assert(normalizePieceNumber("  7  ") === "7", "trim");
  assert(normalizePieceNumber("10001").length === 4, "max len 4");
  assert(teamPairOk(HOME_COLOR, AWAY_COLOR), "default pair ok");
}
