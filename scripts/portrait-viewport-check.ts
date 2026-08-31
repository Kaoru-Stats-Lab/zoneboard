/**
 * Portrait soccer viewport preset sanity checks.
 * Run: npx --yes tsx scripts/portrait-viewport-check.ts
 */
import {
  PORTRAIT_SOCCER_VIEW_PRESETS,
  VIEW_PRESETS,
  resolveViewPreset,
  viewportMatchesPreset,
  viewPresetsForSport,
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

const penTop = resolveViewPreset("soccer", "portrait", "pen-left");
if (penTop.cy > 0.2 || penTop.cy < 0.05) {
  fail(`portrait pen-left cy≈0.12, got cy=${penTop.cy}`);
}

const portraitPresets = viewPresetsForSport("soccer", "portrait");
if (portraitPresets.length !== 5) {
  fail(`portrait viewPresetsForSport should list 5, got ${portraitPresets.length}`);
}
const portraitIds = portraitPresets.map((p) => p.id).join(",");
if (
  portraitIds !==
  "full,final-third-left,final-third-right,pen-left,pen-right"
) {
  fail(`unexpected portrait preset ids: ${portraitIds}`);
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
