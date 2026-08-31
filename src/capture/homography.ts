/**
 * Homography core (capture import W01).
 *
 * H is 3×3 row-major: [h00,h01,h02, h10,h11,h12, h20,h21,h22].
 * Maps image pixels (x,y) → pitch norm (px,py) in 0..1.
 */

export type Point = { x: number; y: number };
export type PitchPoint = { px: number; py: number };
/** 9 elements, row-major */
export type HomographyMatrix = number[];

const EPS = 1e-10;

/** Default dst corners: TL, TR, BR, BL (landscape full soccer). */
export const PITCH_CORNERS_NORM: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

/**
 * 4-point homography (DLT + Hartley normalization).
 * src[i] and dst[i] must correspond. Returns null if degenerate or singular.
 */
export function computeHomography(
  src: Point[],
  dst: Point[],
): HomographyMatrix | null {
  if (src.length !== 4 || dst.length !== 4) return null;
  if (hasThreeCollinear(src) || hasThreeCollinear(dst)) return null;
  if (quadArea(src) < 1e-6 || quadArea(dst) < 1e-6) return null;

  const ns = normalizePoints(src);
  const nd = normalizePoints(dst);
  if (!ns || !nd) return null;

  const h8 = solveHomography8(ns.points, nd.points);
  if (!h8) return null;

  const Hn: HomographyMatrix = [...h8, 1];
  const H = multiply3x3(nd.Tinv, multiply3x3(Hn, ns.T));
  return scaleHomography(H);
}

/** Image pixel → pitch normalized coords. */
export function transformPoint(
  H: HomographyMatrix,
  x: number,
  y: number,
): PitchPoint {
  const w = H[6] * x + H[7] * y + H[8];
  if (Math.abs(w) < EPS) return { px: NaN, py: NaN };
  return {
    px: (H[0] * x + H[1] * y + H[2]) / w,
    py: (H[3] * x + H[4] * y + H[5]) / w,
  };
}

/** Inverse homography; null if singular. */
export function invertHomography(H: HomographyMatrix): HomographyMatrix | null {
  const [a, b, c, d, e, f, g, h, i] = H;
  const det =
    a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < EPS) return null;
  const invDet = 1 / det;
  return [
    (e * i - f * h) * invDet,
    (c * h - b * i) * invDet,
    (b * f - c * e) * invDet,
    (f * g - d * i) * invDet,
    (a * i - c * g) * invDet,
    (c * d - a * f) * invDet,
    (d * h - e * g) * invDet,
    (b * g - a * h) * invDet,
    (a * e - b * d) * invDet,
  ];
}

/** W01: landscape full soccer — pitch norm equals world 0..1. */
export function pitchNormToWorld(px: number, py: number): Point {
  return { x: px, y: py };
}

// --- internal ---

type NormPack = {
  points: Point[];
  T: HomographyMatrix;
  Tinv: HomographyMatrix;
};

/** Hartley: centroid at origin, mean distance √2. */
function normalizePoints(pts: Point[]): NormPack | null {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  cx /= pts.length;
  cy /= pts.length;

  let meanDist = 0;
  for (const p of pts) {
    meanDist += Math.hypot(p.x - cx, p.y - cy);
  }
  meanDist /= pts.length;
  if (meanDist < EPS) return null;

  const s = Math.sqrt(2) / meanDist;
  const T: HomographyMatrix = [s, 0, -s * cx, 0, s, -s * cy, 0, 0, 1];
  const Tinv: HomographyMatrix = [1 / s, 0, cx, 0, 1 / s, cy, 0, 0, 1];
  const points = pts.map((p) => ({
    x: s * (p.x - cx),
    y: s * (p.y - cy),
  }));
  return { points, T, Tinv };
}

/**
 * DLT with h22 = 1. Unknowns: h00..h21 (8).
 * u = (h00*x+h01*y+h02)/(h20*x+h21*y+1)
 */
function solveHomography8(src: Point[], dst: Point[]): number[] | null {
  const M: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    M.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    M.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  return gaussianElim8(M, b);
}

function gaussianElim8(A: number[][], b: number[]): number[] | null {
  const n = 8;
  const aug = A.map((row, i) => [...row, b[i]!]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row]![col]!) > Math.abs(aug[pivot]![col]!)) pivot = row;
    }
    [aug[col], aug[pivot]] = [aug[pivot]!, aug[col]!];
    const div = aug[col]![col]!;
    if (Math.abs(div) < EPS) return null;

    for (let row = col + 1; row < n; row++) {
      const factor = aug[row]![col]! / div;
      for (let k = col; k <= n; k++) {
        aug[row]![k]! -= factor * aug[col]![k]!;
      }
    }
  }

  const x = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = aug[row]![n]!;
    for (let col = row + 1; col < n; col++) {
      sum -= aug[row]![col]! * x[col]!;
    }
    x[row] = sum / aug[row]![row]!;
  }
  return x;
}

function multiply3x3(A: HomographyMatrix, B: HomographyMatrix): HomographyMatrix {
  const C = new Array<number>(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      for (let k = 0; k < 3; k++) {
        C[r * 3 + c]! += A[r * 3 + k]! * B[k * 3 + c]!;
      }
    }
  }
  return C;
}

/** Scale H to h22 = 1 when possible; otherwise scale by largest coefficient. */
function scaleHomography(H: HomographyMatrix): HomographyMatrix | null {
  if (Math.abs(H[8]!) >= EPS) {
    const s = H[8]!;
    return H.map((v) => v / s);
  }
  let maxAbs = 0;
  for (const v of H) maxAbs = Math.max(maxAbs, Math.abs(v));
  if (maxAbs < EPS) return null;
  return H.map((v) => v / maxAbs);
}

/** Shoelace area of quad (src order TL,TR,BR,BL or any consistent winding). */
function quadArea(pts: Point[]): number {
  let area = 0;
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    area += pts[i]!.x * pts[j]!.y - pts[j]!.x * pts[i]!.y;
  }
  return Math.abs(area) / 2;
}

/** True if any 3 of 4 points are collinear. */
function hasThreeCollinear(pts: Point[]): boolean {
  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (let c = b + 1; c < 4; c++) {
        const area =
          Math.abs(
            pts[a]!.x * (pts[b]!.y - pts[c]!.y) +
              pts[b]!.x * (pts[c]!.y - pts[a]!.y) +
              pts[c]!.x * (pts[a]!.y - pts[b]!.y),
          ) / 2;
        if (area < 1e-6) return true;
      }
    }
  }
  return false;
}
