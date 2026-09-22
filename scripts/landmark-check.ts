/**
 * W08/W09 landmark dst + preset checks.
 * Run: npx --yes tsx scripts/landmark-check.ts
 */
import {
  dst4FromLandmarkIds,
  initialCalibSrcPoints,
  isLandmarkDstDegenerate,
  landmarkNorm,
  landmarkPresetIds,
  PRESET_FULL_CORNERS,
  PRESET_MIXED_X0,
  PRESET_MIXED_X1,
  PRESET_PENALTY_X0,
  PRESET_PENALTY_X1,
} from "../src/capture/pitchLandmarks.ts";
import {
  computeHomography,
  PITCH_CORNERS_NORM,
  transformPoint,
} from "../src/capture/homography.ts";
import { SOCCER_NORM, SOCCER_PITCH_M } from "../src/presets/soccerPitch.ts";

let failed = 0;

function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failed++;
}

function pass(msg: string) {
  console.log(`PASS: ${msg}`);
}

function near(a: number, b: number, eps = 1e-9) {
  return Math.abs(a - b) < eps;
}

{
  const dst = dst4FromLandmarkIds(PRESET_FULL_CORNERS);
  let ok = true;
  for (let i = 0; i < 4; i++) {
    if (
      !near(dst[i]!.x, PITCH_CORNERS_NORM[i]!.x) ||
      !near(dst[i]!.y, PITCH_CORNERS_NORM[i]!.y)
    ) {
      ok = false;
    }
  }
  if (ok) pass("full corners == PITCH_CORNERS_NORM");
  else fail("full corners mismatch");
}

{
  const p = landmarkNorm("pen_l_far_t");
  if (near(p.x, SOCCER_NORM.penDepth) && near(p.y, 0.5 - SOCCER_NORM.penHalfH)) {
    pass("pen_l_far_t from SOCCER_NORM");
  } else fail(`pen_l_far_t got ${JSON.stringify(p)}`);
}

{
  const arcR = SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.length;
  const p = landmarkNorm("pen_arc_apex_l");
  if (near(p.x, SOCCER_NORM.penSpot + arcR) && near(p.y, 0.5)) {
    pass("pen_arc_apex_l length-norm radius");
  } else fail(`pen_arc_apex_l got ${JSON.stringify(p)}`);
}

for (const [name, ids] of [
  ["full", landmarkPresetIds("full")],
  ["penalty_x0", landmarkPresetIds("penalty", "x0")],
  ["penalty_x1", landmarkPresetIds("penalty", "x1")],
  ["goal_x0", landmarkPresetIds("goal", "x0")],
  ["goal_x1", landmarkPresetIds("goal", "x1")],
  ["mixed_x0", landmarkPresetIds("mixed", "x0")],
  ["mixed_x1", landmarkPresetIds("mixed", "x1")],
] as const) {
  if (!ids) fail(`preset ${name} null`);
  else if (isLandmarkDstDegenerate(ids)) fail(`preset ${name} degenerate`);
  else pass(`preset ${name} non-degenerate`);
}

{
  if (landmarkPresetIds("penalty", null) !== null) {
    fail("penalty without goalSide should be null");
  } else pass("penalty without goalSide is null");
}

{
  for (let i = 0; i < 4; i++) {
    const L = landmarkNorm(PRESET_PENALTY_X0[i]!);
    const R = landmarkNorm(PRESET_PENALTY_X1[i]!);
    if (!near(L.x + R.x, 1) || !near(L.y, R.y)) {
      fail(`penalty mirror ${i}`);
    } else pass(`penalty mirror ${i}`);
  }
  for (let i = 0; i < 4; i++) {
    const L = landmarkNorm(PRESET_MIXED_X0[i]!);
    const R = landmarkNorm(PRESET_MIXED_X1[i]!);
    if (!near(L.x + R.x, 1) || !near(L.y, R.y)) {
      fail(`mixed mirror ${i}`);
    } else pass(`mixed mirror ${i}`);
  }
}

{
  const src = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const H = computeHomography(src, dst4FromLandmarkIds(PRESET_FULL_CORNERS));
  if (!H) fail("full corners H");
  else {
    const t = transformPoint(H, 50, 50);
    if (Math.abs(t.px - 0.5) < 1e-4 && Math.abs(t.py - 0.5) < 1e-4) {
      pass("full corners H center");
    } else fail(`full corners H center ${JSON.stringify(t)}`);
  }
}

{
  const pts = initialCalibSrcPoints(800, 450, "x0");
  const insetCornerish = pts.every(
    (p) =>
      (p.x < 80 || p.x > 720) && (p.y < 45 || p.y > 405),
  );
  if (insetCornerish) fail("initial src still corner-inset-like");
  else pass("initial src centred (not corner inset)");
  const meanX = pts.reduce((s, p) => s + p.x, 0) / 4;
  if (meanX < 400) pass("initial src biased toward x0 half");
  else fail(`initial src meanX ${meanX}`);
}

if (failed) {
  console.error(`\nlandmark-check failed (${failed})`);
  process.exit(1);
}
console.log("\nlandmark-check passed");
