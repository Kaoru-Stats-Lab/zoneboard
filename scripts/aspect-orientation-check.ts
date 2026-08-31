/**
 * Minimal: aspectFor portrait + migrate default landscape.
 * Run: npx --yes tsx scripts/aspect-orientation-check.ts
 */
import { createBoard, migrateBoard } from "../src/models/defaults.ts";
import { aspectFor, effectivePitchOrientation } from "../src/presets/sports.ts";

let failed = 0;
function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failed += 1;
}

const landFull = aspectFor("soccer", "full");
const landHalf = aspectFor("soccer", "half");
const portFull = aspectFor("soccer", "full", "portrait");
const portHalf = aspectFor("soccer", "half", "portrait");

if (Math.abs(landFull - 105 / 68) > 1e-9) {
  fail(`landscape full expected 105/68 got ${landFull}`);
}
if (Math.abs(landHalf - 52.5 / 68) > 1e-9) {
  fail(`landscape half expected 52.5/68 got ${landHalf}`);
}
if (Math.abs(portFull - 68 / 105) > 1e-9) {
  fail(`portrait full expected 68/105 got ${portFull}`);
}
if (Math.abs(portHalf - 68 / 52.5) > 1e-9) {
  fail(`portrait half expected 68/52.5 got ${portHalf}`);
}
if (aspectFor("soccer", "full") !== aspectFor("soccer", "full", "landscape")) {
  fail("omitted orientation must match landscape");
}
if (aspectFor("futsal", "full", "portrait") !== aspectFor("futsal", "full")) {
  fail("non-soccer portrait must ignore orientation");
}

const board = createBoard("soccer");
if (board.pitchOrientation !== "landscape") {
  fail(`createBoard default orientation ${board.pitchOrientation}`);
}

const portrait = createBoard("soccer", "P", "ja", {
  pitchOrientation: "portrait",
});
if (portrait.pitchOrientation !== "portrait") {
  fail("createBoard portrait option");
}
if (portrait.scenes[0]?.pieces.length !== 0) {
  fail("portrait board should start empty");
}
if (portrait.showMatchBanner) {
  fail("portrait createBoard should not enable match banner");
}

const migrated = migrateBoard({
  id: "legacy",
  sport: "soccer",
  title: "old",
  updatedAt: new Date().toISOString(),
} as Parameters<typeof migrateBoard>[0]);
if (migrated.pitchOrientation !== "landscape") {
  fail(`migrate missing key → landscape, got ${migrated.pitchOrientation}`);
}
if (effectivePitchOrientation("futsal", "portrait") !== "landscape") {
  fail("effectivePitchOrientation must clamp non-soccer");
}

if (failed) {
  console.error(`aspect-orientation-check failed (${failed})`);
  process.exit(1);
}
console.log("aspect-orientation-check passed");
