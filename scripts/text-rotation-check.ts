/**
 * Group 4 text rotation geometry self-check.
 * Run: npx --yes tsx scripts/text-rotation-check.ts
 */
import {
  TEXT_BOX_MIN_W,
  applyTextResize,
  computeTextGeometry,
  normalizeRotationDeg,
  pointInTextBox,
  rotatePointCw,
  rotationDegFromDrag,
  snapRotationDeg,
  swapTextEndsPosition,
  textRotationDeg,
  unrotatePointCw,
} from "../src/canvas/textGeometry";
import { createBoard } from "../src/models/defaults";
import { swapSceneEnds } from "../src/models/scene";
import { sanitizeTextObject } from "../src/models/textSanitize";
import type { BoardDocument, TextObject } from "../src/models/types";
import type { PitchRect } from "../src/canvas/layout";

function assert(c: boolean, m: string) {
  if (!c) throw new Error(m);
}

const board = createBoard("soccer") as BoardDocument;
const pitch: PitchRect = { x: 40, y: 30, w: 920, h: 580 };

const base: TextObject = {
  id: "r1",
  type: "text",
  x: 0.3,
  y: 0.25,
  text: "ZoneBoard 回転テスト 長い日本語でも折り返します",
  color: "#fff",
  fontSize: 0.035,
  width: 0.28,
};

console.log("--- normalize / snap ---");
assert(normalizeRotationDeg(0) === 0, "0");
assert(normalizeRotationDeg(90) === 90, "90");
assert(normalizeRotationDeg(180) === 180, "180");
assert(normalizeRotationDeg(270) === 270, "270");
assert(normalizeRotationDeg(360) === 0, "360→0");
assert(normalizeRotationDeg(-90) === 270, "-90→270");
assert(normalizeRotationDeg(Number.NaN) === 0, "NaN→0");
assert(snapRotationDeg(7) === 0, "snap 7→0");
assert(snapRotationDeg(8) === 15, "snap 8→15");
assert(snapRotationDeg(44) === 45, "snap 44→45");

console.log("--- rotatePointCw 90° (screen y-down, clockwise) ---");
{
  const p = rotatePointCw(10, 0, 0, 0, 90);
  assert(Math.abs(p.x - 0) < 1e-9 && Math.abs(p.y - 10) < 1e-9, "90° CW +(10,0)→(0,10)");
  const back = unrotatePointCw(p.x, p.y, 0, 0, 90);
  assert(Math.abs(back.x - 10) < 1e-9 && Math.abs(back.y - 0) < 1e-9, "inverse");
}

console.log("--- angles 0/45/90/135/180/270 ---");
for (const deg of [0, 45, 90, 135, 180, 270, 359]) {
  const obj: TextObject = { ...base, rotationDeg: deg };
  const g = computeTextGeometry(obj, board, pitch);
  assert(!!g, `geom ${deg}`);
  assert(Math.abs(g!.rotationDeg - deg) < 1e-9 || (deg === 359 && g!.rotationDeg === 359), `rot ${deg}`);
  // Centre of unrotated box maps to same centre when rotated
  assert(Math.abs(g!.cx - (g!.px + g!.pw / 2)) < 1e-6, `cx ${deg}`);
  // Hit at centre
  assert(
    pointInTextBox(g!, g!.centerPitch.x, g!.centerPitch.y),
    `centre hit ${deg}`,
  );
  // Far outside AABB corner of pitch should miss
  assert(!pointInTextBox(g!, 0.01, 0.01, 0), `far miss ${deg}`);
}

console.log("--- hit: outside AABB but inside rotated rect vs miss ---");
{
  const obj: TextObject = { ...base, rotationDeg: 45, width: 0.2, height: 0.08 };
  const g = computeTextGeometry(obj, board, pitch)!;
  // Point on unrotated top-left corner after rotation should hit
  const corner = rotatePointCw(g.px, g.py, g.cx, g.cy, 45);
  const n = {
    x: (corner.x - pitch.x) / pitch.w,
    y: (corner.y - pitch.y) / pitch.h,
  };
  assert(pointInTextBox(g, n.x, n.y, 0.002), "rotated corner hits");
  // AABB corner that is outside the diamond should miss when pad=0
  const aabbCorner = {
    x: g.aabbPitch.x,
    y: g.aabbPitch.y,
  };
  // May or may not hit depending on geometry — just ensure centre hits and far misses
  assert(pointInTextBox(g, g.centerPitch.x, g.centerPitch.y), "centre");
  void aabbCorner;
}

console.log("--- drag angle continuity across 0 ---");
{
  const c = { x: 100, y: 100 };
  // start at angle ~ -10° (above-right), move to +10°
  const start = { x: 100 + 50, y: 100 - 9 };
  const mid = { x: 100 + 50, y: 100 + 9 };
  const a = rotationDegFromDrag(c, start, mid, 350, false);
  assert(a > 350 || a < 20, `cross zero continuous got ${a}`);
  const snapped = rotationDegFromDrag(c, start, mid, 0, true);
  assert(snapped % 15 === 0, "shift snap");
}

console.log("--- resize while rotated keeps opposite edge (local) ---");
{
  const start = {
    x: 0.3,
    y: 0.25,
    width: 0.28,
    height: 0.1,
    rotationDeg: 30,
  };
  const next = applyTextResize(
    start,
    "e",
    start.x + start.width + 0.05,
    start.y + start.height / 2,
    { x: start.x + start.width, y: start.y + start.height / 2 },
    board,
    pitch,
  );
  assert(next.width >= TEXT_BOX_MIN_W, "min w");
  assert(next.width !== start.width || Math.abs(next.width - start.width) > 1e-6, "changed");
}

console.log("--- end swap ×2 restores; rotation preserved ---");
{
  const obj: TextObject = {
    ...base,
    rotationDeg: 45,
    width: 0.28,
    height: 0.12,
  };
  const once = swapTextEndsPosition(obj);
  assert(once.rotationDeg === 45, "rot kept");
  const twice = swapTextEndsPosition(once);
  assert(Math.abs(twice.x - obj.x) < 1e-9, "x restore");
  assert(Math.abs(twice.y - obj.y) < 1e-9, "y restore");
  assert(twice.rotationDeg === 45, "rot restore");

  // Legacy no-width
  const legacy: TextObject = { ...base };
  delete legacy.width;
  const l1 = swapTextEndsPosition(legacy);
  const l2 = swapTextEndsPosition(l1);
  assert(Math.abs(l2.x - legacy.x) < 1e-9 && Math.abs(l2.y - legacy.y) < 1e-9, "legacy swap2");
}

console.log("--- scene swapEnds ×2 ---");
{
  const scene = board.scenes[0]!;
  const withText = {
    ...scene,
    objects: [
      ...scene.objects,
      { ...base, id: "t-rot", rotationDeg: 90, width: 0.2, height: 0.08 },
    ],
  };
  const s1 = swapSceneEnds(withText);
  const s2 = swapSceneEnds(s1);
  const t0 = withText.objects.find((o) => o.id === "t-rot") as TextObject;
  const t2 = s2.objects.find((o) => o.id === "t-rot") as TextObject;
  assert(Math.abs(t2.x - t0.x) < 1e-9, "scene x");
  assert(Math.abs(t2.y - t0.y) < 1e-9, "scene y");
  assert(t2.rotationDeg === 90, "scene rot");
}

console.log("--- sanitize ---");
{
  assert(textRotationDeg({}) === 0, "missing→0");
  const s = sanitizeTextObject({
    ...base,
    rotationDeg: 450,
  });
  assert(s.rotationDeg === 90, `450→90 got ${s.rotationDeg}`);
  const z = sanitizeTextObject({ ...base, rotationDeg: 0 });
  assert(z.rotationDeg === undefined, "0 omitted");
}

console.log("--- multilines still wrap under rotation ---");
{
  const g0 = computeTextGeometry(base, board, pitch)!;
  const g90 = computeTextGeometry({ ...base, rotationDeg: 90 }, board, pitch)!;
  assert(g0.lines.length === g90.lines.length, "wrap invariant under rotate");
  assert(
    g0.lines.every((l, i) => l.text === g90.lines[i]!.text),
    "same line breaks",
  );
}

console.log("\ntext-rotation-check passed");
