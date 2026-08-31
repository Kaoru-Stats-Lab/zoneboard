/**
 * FIFA 105×68 比率が SOCCER_NORM と一致するか（描画・座標の正本）。
 * Run: npx --yes tsx scripts/soccer-pitch-norm-check.ts
 */
import {
  SOCCER_NORM,
  SOCCER_PITCH_AUDIT,
  SOCCER_PITCH_M,
} from "../src/presets/soccerPitch.ts";

let failed = 0;
function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failed += 1;
}

const tol = 1e-6;
function near(a: number, b: number, label: string) {
  if (Math.abs(a - b) > tol) fail(`${label}: expected ${b}, got ${a}`);
}

near(
  SOCCER_NORM.centerR,
  SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.width,
  "centerR",
);
near(
  SOCCER_NORM.penDepth,
  SOCCER_PITCH_M.penaltyAreaDepth / SOCCER_PITCH_M.length,
  "penDepth",
);

/** 等尺表示時: cr = centerR×幅px → 長さ方向にも 9.15m（円の半径） */
const centerReachLengthM = SOCCER_NORM.centerR * SOCCER_PITCH_M.width;
near(centerReachLengthM, SOCCER_PITCH_M.centerCircleR, "centerReachLengthM");

const halfLineToPenM =
  SOCCER_PITCH_M.length / 2 - SOCCER_PITCH_M.penaltyAreaDepth;
near(
  centerReachLengthM / halfLineToPenM,
  SOCCER_PITCH_M.centerCircleR / halfLineToPenM,
  "centerR reach / halfLine-to-pen",
);

if (Math.abs(SOCCER_PITCH_AUDIT.laneSumM - SOCCER_PITCH_M.width) > 0.02) {
  fail(`5-lane sum should match pitch width 68m, got ${SOCCER_PITCH_AUDIT.laneSumM}`);
}

if (failed) {
  console.error(`soccer-pitch-norm-check failed (${failed})`);
  process.exit(1);
}
console.log("soccer-pitch-norm-check passed");
