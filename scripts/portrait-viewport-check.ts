/**
 * Portrait soccer viewport preset sanity checks.
 * Run: npx --yes tsx scripts/portrait-viewport-check.ts
 */
import {
  PORTRAIT_SOCCER_VIEW_PRESETS,
  VIEW_PRESETS,
  cameraNormRect,
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
const ftTopCam = cameraNormRect(ftTop);
if (ftTop.cy > 0.22 || ftTop.cy < 0.1) {
  fail(`portrait final-third-left cy≈0.15, got cy=${ftTop.cy}`);
}
if (Math.abs(ftTop.cx - 0.5) > 0.02) {
  fail(`portrait final-third-left cx should be centered, got ${ftTop.cx}`);
}
if (ftTopCam.y > 0.02 || ftTopCam.y + ftTopCam.h < 0.28) {
  fail(`portrait final-third-left should cover top third, got y=${ftTopCam.y} h=${ftTopCam.h}`);
}

const ftBot = resolveViewPreset("soccer", "portrait", "final-third-right");
const ftBotCam = cameraNormRect(ftBot);
if (ftBot.cy < 0.78 || ftBot.cy > 0.92) {
  fail(`portrait final-third-right cy≈0.85, got cy=${ftBot.cy}`);
}
if (ftBotCam.y > 0.72 || ftBotCam.y + ftBotCam.h < 0.98) {
  fail(`portrait final-third-right should cover bottom third, got y=${ftBotCam.y} h=${ftBotCam.h}`);
}

const portraitPresets = viewPresetsForSport("soccer", "portrait");
if (portraitPresets.length !== 3) {
  fail(`portrait viewPresetsForSport should list 3, got ${portraitPresets.length}`);
}
const portraitIds = portraitPresets.map((p) => p.id).join(",");
if (portraitIds !== "full,final-third-left,final-third-right") {
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
