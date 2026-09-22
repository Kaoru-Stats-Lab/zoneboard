/**
 * W08 landmark dst checks.
 * Run: npx --yes tsx scripts/landmark-check.ts
 */
import {
  dst4FromLandmarkIds,
  isLandmarkDstDegenerate,
  landmarkNorm,
  landmarkPresetIds,
  PRESET_FULL_CORNERS,
  PRESET_LEFT_GOAL,
  PRESET_RIGHT_GOAL,
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

// Full corners match PITCH_CORNERS_NORM
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

// Pen depth from SOCCER_NORM
{
  const p = landmarkNorm("pen_l_far_t");
  if (near(p.x, SOCCER_NORM.penDepth) && near(p.y, 0.5 - SOCCER_NORM.penHalfH)) {
    pass("pen_l_far_t from SOCCER_NORM");
  } else fail(`pen_l_far_t got ${JSON.stringify(p)}`);
}

// Arc apex uses length-normalized radius
{
  const arcR = SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.length;
  const p = landmarkNorm("pen_arc_apex_l");
  if (near(p.x, SOCCER_NORM.penSpot + arcR) && near(p.y, 0.5)) {
    pass("pen_arc_apex_l length-norm radius");
  } else fail(`pen_arc_apex_l got ${JSON.stringify(p)}`);
}

// Presets non-degenerate
for (const preset of ["full", "left", "right"] as const) {
  const ids = landmarkPresetIds(preset);
  if (isLandmarkDstDegenerate(ids)) fail(`preset ${preset} degenerate`);
  else pass(`preset ${preset} non-degenerate`);
}

// Left/right mirror on x
{
  for (let i = 0; i < 4; i++) {
    const L = landmarkNorm(PRESET_LEFT_GOAL[i]!);
    const R = landmarkNorm(PRESET_RIGHT_GOAL[i]!);
    if (!near(L.x + R.x, 1) || !near(L.y, R.y)) {
      fail(`mirror ${PRESET_LEFT_GOAL[i]} ↔ ${PRESET_RIGHT_GOAL[i]}`);
    } else {
      pass(`mirror ${i}`);
    }
  }
}

// Regression: full corners H still works
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

// Left-goal landmark H: map image quad → landmark dst
{
  const ids = PRESET_LEFT_GOAL;
  const dst = dst4FromLandmarkIds(ids);
  const src = dst.map((p) => ({ x: p.x * 400 + 50, y: p.y * 300 + 20 }));
  const H = computeHomography(src, dst);
  if (!H) fail("left-goal H");
  else {
    let ok = true;
    for (let i = 0; i < 4; i++) {
      const t = transformPoint(H, src[i]!.x, src[i]!.y);
      if (Math.abs(t.px - dst[i]!.x) > 1e-4 || Math.abs(t.py - dst[i]!.y) > 1e-4) {
        ok = false;
      }
    }
    if (ok) pass("left-goal landmark H round-trip");
    else fail("left-goal landmark H round-trip");
  }
}

if (failed) {
  console.error(`\nlandmark-check failed (${failed})`);
  process.exit(1);
}
console.log("\nlandmark-check passed");
