import type { Piece } from "./types";
import { uid } from "./id";

export function piecesInRect(
  pieces: Piece[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Piece[] {
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  return pieces.filter(
    (p) => p.x >= left && p.x <= right && p.y >= top && p.y <= bottom,
  );
}

function centroid(group: Piece[]): { x: number; y: number } {
  const n = group.length || 1;
  return {
    x: group.reduce((s, p) => s + p.x, 0) / n,
    y: group.reduce((s, p) => s + p.y, 0) / n,
  };
}

function rotateAround(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rad: number,
): { x: number; y: number } {
  const dx = x - cx;
  const dy = y - cy;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

export function nudgePieces(group: Piece[], dx: number, dy: number): Piece[] {
  return group.map((p) => ({
    ...p,
    x: p.x + dx,
    y: p.y + dy,
  }));
}

/** Rotate positions around the group's centroid. Facing stays as-is. */
export function rotateGroupAroundCentroid(group: Piece[], degrees: number): Piece[] {
  if (group.length < 2) return group;
  const c = centroid(group);
  const rad = (degrees * Math.PI) / 180;
  return group.map((p) => {
    const next = rotateAround(p.x, p.y, c.x, c.y, rad);
    return { ...p, x: next.x, y: next.y };
  });
}

/** Scale distance from centroid. <1 packs (compact), >1 spreads. */
export function scaleGroupFromCentroid(group: Piece[], factor: number): Piece[] {
  if (group.length < 2) return group;
  const c = centroid(group);
  const f = Math.max(0.35, Math.min(2.4, factor));
  return group.map((p) => ({
    ...p,
    x: c.x + (p.x - c.x) * f,
    y: c.y + (p.y - c.y) * f,
  }));
}

export function flipGroupHorizontal(group: Piece[]): Piece[] {
  if (group.length === 0) return group;
  const c = centroid(group);
  return group.map((p) => ({
    ...p,
    x: 2 * c.x - p.x,
    facing: (360 - p.facing) % 360,
  }));
}

export function flipGroupVertical(group: Piece[]): Piece[] {
  if (group.length === 0) return group;
  const c = centroid(group);
  return group.map((p) => ({
    ...p,
    y: 2 * c.y - p.y,
    facing: (180 - p.facing + 360) % 360,
  }));
}

export type AlignAxis = "left" | "right" | "top" | "bottom" | "centerX" | "centerY";

export function alignGroup(group: Piece[], axis: AlignAxis): Piece[] {
  if (group.length < 2) return group;
  const xs = group.map((p) => p.x);
  const ys = group.map((p) => p.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  return group.map((p) => {
    if (axis === "left") return { ...p, x: left };
    if (axis === "right") return { ...p, x: right };
    if (axis === "top") return { ...p, y: top };
    if (axis === "bottom") return { ...p, y: bottom };
    if (axis === "centerX") return { ...p, x: cx };
    return { ...p, y: cy };
  });
}

export function distributeGroup(group: Piece[], along: "x" | "y"): Piece[] {
  if (group.length < 3) return group;
  const sorted = [...group].sort((a, b) => (along === "x" ? a.x - b.x : a.y - b.y));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const span = along === "x" ? last.x - first.x : last.y - first.y;
  if (span < 1e-6) return group;
  const step = span / (sorted.length - 1);
  const nextById = new Map<string, Piece>();
  sorted.forEach((p, i) => {
    nextById.set(p.id, {
      ...p,
      x: along === "x" ? first.x + step * i : p.x,
      y: along === "y" ? first.y + step * i : p.y,
    });
  });
  return group.map((p) => nextById.get(p.id) ?? p);
}

export function duplicatePieces(group: Piece[], offset = 0.035): Piece[] {
  return group.map((p) => ({
    ...p,
    id: uid(),
    x: p.x + offset,
    y: p.y + offset,
  }));
}

export function mergePieces(all: Piece[], updated: Piece[]): Piece[] {
  const map = new Map(updated.map((p) => [p.id, p]));
  return all.map((p) => map.get(p.id) ?? p);
}
