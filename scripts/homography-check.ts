/**
 * Homography core verification (W01).
 * Run: npx --yes tsx scripts/homography-check.ts
 */
import {
  computeHomography,
  invertHomography,
  PITCH_CORNERS_NORM,
  transformPoint,
} from "../src/capture/homography.ts";

let failed = 0;

function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failed++;
}

function pass(msg: string) {
  console.log(`PASS: ${msg}`);
}

function near(
  got: { px?: number; py?: number; x?: number; y?: number },
  exp: { x: number; y: number },
  eps = 1e-4,
): boolean {
  const x = got.px ?? got.x ?? NaN;
  const y = got.py ?? got.y ?? NaN;
  return Math.abs(x - exp.x) < eps && Math.abs(y - exp.y) < eps;
}

// 1. Square → unit square (identity-like)
{
  const src = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const H = computeHomography(src, PITCH_CORNERS_NORM);
  if (!H) fail("computeHomography (square)");
  else {
    pass("computeHomography (square)");
    for (const [p, exp] of [
      [src[0], { x: 0, y: 0 }],
      [src[1], { x: 1, y: 0 }],
      [src[2], { x: 1, y: 1 }],
      [src[3], { x: 0, y: 1 }],
    ] as const) {
      const t = transformPoint(H, p!.x, p!.y);
      if (!near(t, exp)) fail(`square corner → ${JSON.stringify(exp)} got ${JSON.stringify(t)}`);
      else pass(`square corner ${JSON.stringify(exp)}`);
    }
    const mid = transformPoint(H, 50, 50);
    if (!near(mid, { x: 0.5, y: 0.5 })) fail(`square center got ${JSON.stringify(mid)}`);
    else pass("square center (0.5,0.5)");
  }
}

// 2. Trapezoid (broadcast camera)
{
  const src = [
    { x: 400, y: 100 },
    { x: 600, y: 100 },
    { x: 900, y: 400 },
    { x: 100, y: 400 },
  ];
  const H = computeHomography(src, PITCH_CORNERS_NORM);
  if (!H) fail("computeHomography (trapezoid)");
  else {
    pass("computeHomography (trapezoid)");
    for (let i = 0; i < 4; i++) {
      const t = transformPoint(H, src[i]!.x, src[i]!.y);
      const exp = PITCH_CORNERS_NORM[i]!;
      if (!near(t, exp)) {
        fail(`trapezoid corner ${i} got ${JSON.stringify(t)} expected ${JSON.stringify(exp)}`);
      } else pass(`trapezoid corner ${i}`);
    }
  }
}

// 3. Inverse round-trip
{
  const src = [
    { x: 123, y: 456 },
    { x: 789, y: 123 },
    { x: 901, y: 800 },
    { x: 100, y: 750 },
  ];
  const H = computeHomography(src, PITCH_CORNERS_NORM);
  if (!H) fail("inverse: computeHomography");
  else {
    const Hi = invertHomography(H);
    if (!Hi) fail("invertHomography");
    else {
      pass("invertHomography");
      const orig = { x: 500, y: 400 };
      const norm = transformPoint(H, orig.x, orig.y);
      const back = transformPoint(Hi, norm.px, norm.py);
      if (!near(back, orig, 1e-3)) {
        fail(`inverse round-trip got ${JSON.stringify(back)} expected ${JSON.stringify(orig)}`);
      } else pass("inverse round-trip");
    }
  }
}

// 4. Degenerate: 3 src points collinear
{
  const src = [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 100, y: 0 },
    { x: 50, y: 50 },
  ];
  const H = computeHomography(src, PITCH_CORNERS_NORM);
  if (H !== null) fail("degenerate (3 collinear) should return null");
  else pass("degenerate (3 collinear) returns null");
}

// 5. Degenerate: all 4 collinear
{
  const src = [
    { x: 0, y: 0 },
    { x: 25, y: 0 },
    { x: 50, y: 0 },
    { x: 75, y: 0 },
  ];
  const H = computeHomography(src, PITCH_CORNERS_NORM);
  if (H !== null) fail("degenerate (4 collinear) should return null");
  else pass("degenerate (4 collinear) returns null");
}

// 6. h22 scaled to 1
{
  const src = [
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 200, y: 100 },
    { x: 0, y: 100 },
  ];
  const H = computeHomography(src, PITCH_CORNERS_NORM);
  if (!H) fail("h22 scale: computeHomography");
  else if (Math.abs(H[8]! - 1) > 1e-9) fail(`h22 should be 1, got ${H[8]}`);
  else pass("h22 normalized to 1");
}

if (failed > 0) {
  console.error(`\nhomography-check failed (${failed})`);
  process.exit(1);
}
console.log("\nhomography-check passed");
