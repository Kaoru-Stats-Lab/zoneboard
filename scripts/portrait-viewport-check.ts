/**
 * Portrait soccer viewport preset sanity checks.
 * Run: npx --yes tsx scripts/portrait-viewport-check.ts
 */
import {
  PORTRAIT_SOCCER_VIEW_PRESETS,
  VIEW_PRESETS,
  resolveViewPreset,
  viewportMatchesPreset,
} from "../src/presets/viewport.ts";

let failed = 0;
function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failed += 1;
}

const ftTop = resolveViewPreset("soccer", "portrait", "final-third-left");
if (ftTop.cy > 0.28 || ftTop.cy < 0.1) {
  fail(`portrait final-third-left cy≈0.17, got cy=${ftTop.cy}`);
}
if (Math.abs(ftTop.cx - 0.5) > 0.02) {
  fail(`portrait final-third-left cx should be centered, got ${ftTop.cx}`);
}

const ftBot = resolveViewPreset("soccer", "portrait", "final-third-right");
if (ftBot.cy < 0.72 || ftBot.cy > 0.9) {
  fail(`portrait final-third-right cy≈0.83, got cy=${ftBot.cy}`);
}

const ckBl = resolveViewPreset("soccer", "portrait", "corner-bl");
if (ckBl.cy > 0.6 || ckBl.cx < 0.35) {
  fail(
    `portrait corner-bl should favor bottom-left, got cx=${ckBl.cx} cy=${ckBl.cy}`,
  );
}

const landFt = resolveViewPreset("soccer", "landscape", "final-third-left");
const landRef = VIEW_PRESETS["final-third-left"];
if (
  Math.abs(landFt.cx - landRef.cx) > 1e-9 ||
  Math.abs(landFt.cy - landRef.cy) > 1e-9
) {
  fail("landscape resolveViewPreset must match VIEW_PRESETS");
}

const bball = resolveViewPreset("basketball", "portrait", "bball-top");
if (bball.cx !== VIEW_PRESETS["bball-top"].cx) {
  fail("non-soccer portrait must use landscape presets unchanged");
}

if (
  !viewportMatchesPreset(
    PORTRAIT_SOCCER_VIEW_PRESETS.full!,
    "full",
    "soccer",
    "portrait",
  )
) {
  fail("viewportMatchesPreset portrait full");
}

if (failed) {
  console.error(`portrait-viewport-check failed (${failed})`);
  process.exit(1);
}
console.log("portrait-viewport-check passed");
