/**
 * Shape Integration Group 2 — data contract self-check.
 * Run: npx --yes tsx scripts/shape-model-check.ts
 */
import { migrateBoard } from "../src/models/defaults";
import { createScene, swapSceneEnds } from "../src/models/scene";
import {
  SHAPE_DEFAULT_FILL_COLOR,
  SHAPE_DEFAULT_FILL_OPACITY,
  SHAPE_DEFAULT_SIZE,
  SHAPE_MIN_SIZE,
  clampShapeFillOpacity,
  createShapeObject,
  normalizeShapeRect,
  sanitizeShapeFillColor,
  sanitizeShapeObject,
  sanitizeShapeRotationDeg,
  sanitizeShapeSize,
  swapShapeEndsPosition,
} from "../src/models/shapeSanitize";
import { sanitizeTextObject } from "../src/models/textSanitize";
import type {
  DrawObject,
  LineObject,
  ShapeObject,
  TextObject,
  ZoneObject,
} from "../src/models/types";
import { TEXT_COLOR_PRESETS } from "../src/presets/textStyle";

function assert(c: boolean, m: string): asserts c {
  if (!c) throw new Error(m);
}

function assertClose(a: number, b: number, eps = 1e-9, m = "close") {
  assert(Math.abs(a - b) <= eps, `${m}: ${a} vs ${b}`);
}

console.log("--- 1) Circle / Rect / Triangle happy path ---");
for (const kind of ["circle", "rect", "triangle"] as const) {
  const s = createShapeObject(kind, {
    id: `s-${kind}`,
    x: 0.2,
    y: 0.3,
    w: 0.15,
    h: 0.15,
  });
  assert(s.type === "shape", "type");
  assert(s.kind === kind, `kind ${kind}`);
  assert(s.w > 0 && s.h > 0, "positive size");
  assert(s.fillOpacity === SHAPE_DEFAULT_FILL_OPACITY, "default opacity");
  assert(s.fillColor === SHAPE_DEFAULT_FILL_COLOR, "default fill");
  assert(s.strokeEnabled === undefined, "stroke default omitted (on)");
  assert(
    (TEXT_COLOR_PRESETS as readonly string[]).includes(s.fillColor),
    "fill in text palette",
  );
  const again = sanitizeShapeObject(s);
  assert(again != null && again.kind === kind, "re-sanitize");
}

console.log("--- 2) default fillOpacity ---");
assert(SHAPE_DEFAULT_FILL_OPACITY === 0.45, "0.45");
assert(createShapeObject("circle").fillOpacity === 0.45, "factory");

console.log("--- 3) fillOpacity out of range ---");
assert(clampShapeFillOpacity(-1) === 0, "neg → 0");
assert(clampShapeFillOpacity(2) === 1, "gt1 → 1");
assert(clampShapeFillOpacity(NaN) === SHAPE_DEFAULT_FILL_OPACITY, "NaN → default");
assert(
  clampShapeFillOpacity(Infinity) === SHAPE_DEFAULT_FILL_OPACITY,
  "Inf → default",
)
const op = sanitizeShapeObject({
  type: "shape",
  kind: "rect",
  id: "op",
  x: 0.1,
  y: 0.1,
  w: 0.1,
  h: 0.1,
  fillColor: "#ffffff",
  fillOpacity: 1.5,
});
assert(op != null && op.fillOpacity === 1, "sanitize clamp hi");

console.log("--- 4) invalid ShapeKind (no coerce to rect) ---");
const badKind = sanitizeShapeObject({
  type: "shape",
  kind: "hexagon",
  id: "bk",
  x: 0.4,
  y: 0.4,
  w: 0.1,
  h: 0.1,
  fillColor: "#ffffff",
  fillOpacity: 0.3,
});
assert(badKind === null, "sanitize rejects unknown kind");
const migratedUnknown = migrateBoard({
  id: "bu",
  sport: "soccer",
  title: "u",
  pitchView: "full",
  pitchFlipped: false,
  showLanes5: true,
  showCorridors3: false,
  showPressLines: false,
  pieceScale: 1,
  updatedAt: new Date().toISOString(),
  scenes: [
    createScene("su", "custom", {
      pieces: [],
      ball: { x: 0.5, y: 0.5 },
      objects: [
        {
          id: "future",
          type: "shape",
          kind: "hexagon",
          x: 0.2,
          y: 0.2,
          w: 0.1,
          h: 0.1,
          fillColor: "#ffffff",
          fillOpacity: 0.3,
        } as unknown as ShapeObject,
      ],
    }),
  ],
  activeSceneId: "will-fix",
} as Parameters<typeof migrateBoard>[0]);
const kept = migratedUnknown.scenes[0].objects.find((o) => o.id === "future");
assert(kept != null && (kept as { kind: string }).kind === "hexagon", "passthrough keep kind");

console.log("--- 5) NaN / Infinity ---");
const nanObj = sanitizeShapeObject({
  type: "shape",
  kind: "circle",
  id: "nan",
  x: NaN,
  y: Infinity,
  w: NaN,
  h: -Infinity,
  fillColor: "#93c5fd",
  fillOpacity: NaN,
  rotationDeg: Infinity,
});
assert(nanObj != null, "survives");
assert(nanObj.x === 0.5 && nanObj.y === 0.5, "xy fallback");
assert(nanObj.w === SHAPE_DEFAULT_SIZE && nanObj.h === SHAPE_DEFAULT_SIZE, "size fallback");
assert(
  nanObj.fillOpacity === SHAPE_DEFAULT_FILL_OPACITY,
  "opacity fallback",
);
assert(nanObj.rotationDeg === undefined, "bad rotation omitted");

console.log("--- 6) negative / zero size (origin fix) ---");
assert(sanitizeShapeSize(0, SHAPE_DEFAULT_SIZE) === SHAPE_DEFAULT_SIZE, "zero");
assert(sanitizeShapeSize(-0.2, SHAPE_DEFAULT_SIZE) === 0.2, "abs neg");
assert(sanitizeShapeSize(0.005, SHAPE_DEFAULT_SIZE) === SHAPE_MIN_SIZE, "floor");
const flipped = normalizeShapeRect(0.5, 0.4, -0.2, -0.1);
assertClose(flipped.x, 0.3, 1e-9, "x fix");
assertClose(flipped.y, 0.3, 1e-9, "y fix");
assertClose(flipped.w, 0.2);
assertClose(flipped.h, 0.1);
const neg = sanitizeShapeObject({
  type: "shape",
  kind: "triangle",
  id: "neg",
  x: 0.5,
  y: 0.4,
  w: -0.2,
  h: 0,
  fillColor: "#111111",
  fillOpacity: 0.3,
});
assert(neg != null, "neg ok");
assertClose(neg.x, 0.3, 1e-9, "sanitize x");
assertClose(neg.w, 0.2, 1e-9, "sanitize w");
assert(neg.h === SHAPE_DEFAULT_SIZE, "zero h → default");

console.log("--- 7) rotationDeg normalize ---");
assert(sanitizeShapeRotationDeg(0) === undefined, "0 omitted");
assert(sanitizeShapeRotationDeg(360) === undefined, "360 → omit");
assertClose(sanitizeShapeRotationDeg(-90)!, 270, 1e-9, "-90→270");
assertClose(sanitizeShapeRotationDeg(450)!, 90, 1e-9, "450→90");
assert(sanitizeShapeRotationDeg(NaN) === undefined, "NaN rot");

console.log("--- 8) coexist with legacy Zone ---");
const zone: ZoneObject = {
  id: "z1",
  type: "zone",
  x: 0.1,
  y: 0.2,
  w: -0.25,
  h: 0.15,
  color: "rgba(keep)",
  strokeColor: "#keep-stroke",
};
const shape = createShapeObject("circle", { id: "c1", x: 0.5, y: 0.5 });
const mixed: DrawObject[] = [zone, shape];
const scene = createScene("mix", "custom", {
  pieces: [],
  ball: { x: 0.5, y: 0.5 },
  objects: mixed,
});
assert(scene.objects.length === 2, "both present");
assert(scene.objects[0].type === "zone", "zone first");
assert(scene.objects[1].type === "shape", "shape second");

console.log("--- 9) Zone attrs preserved (no rewrite) ---");
const migrated = migrateBoard({
  id: "b1",
  sport: "soccer",
  title: "t",
  pitchView: "full",
  pitchFlipped: false,
  showLanes5: true,
  showCorridors3: false,
  showPressLines: false,
  pieceScale: 1,
  updatedAt: new Date().toISOString(),
  scenes: [
    {
      ...scene,
      objects: [
        zone,
        shape,
        {
          type: "shape",
          kind: "circle",
          id: "c2",
          x: 0.6,
          y: 0.6,
          w: 0.1,
          h: 0.1,
          fillColor: "#ffffff",
          fillOpacity: 0.3,
        } as ShapeObject,
      ],
    },
  ],
  activeSceneId: scene.id,
} as Parameters<typeof migrateBoard>[0]);
const zAfter = migrated.scenes[0].objects.find((o) => o.id === "z1");
assert(zAfter != null && zAfter.type === "zone", "zone still zone");
if (zAfter && zAfter.type === "zone") {
  assert(zAfter.w === -0.25, "signed w kept");
  assert(zAfter.color === "rgba(keep)", "color kept");
  assert(zAfter.strokeColor === "#keep-stroke", "strokeColor kept");
  assert(zAfter.x === 0.1 && zAfter.y === 0.2, "xy kept");
}

console.log("--- 10) Text / Line untouched ---");
const text: TextObject = {
  id: "t1",
  type: "text",
  x: 0.2,
  y: 0.2,
  text: "hello",
  color: "#ffffff",
  fontSize: 0.035,
};
const line: LineObject = {
  id: "l1",
  type: "line",
  kind: "pass",
  points: [
    { x: 0.1, y: 0.1 },
    { x: 0.2, y: 0.2 },
  ],
  color: "#fff",
  strokeWidth: 2,
};
const textSan = sanitizeTextObject(text);
assert(textSan.text === "hello" && textSan.width === undefined, "text legacy");
assert(sanitizeShapeObject(text) === null, "shape sanitize ignores text");
assert(sanitizeShapeObject(line) === null, "shape sanitize ignores line");
assert(sanitizeShapeObject(zone) === null, "shape sanitize ignores zone");

console.log("--- 11) structuredClone ---");
const clone = structuredClone(shape);
assert(clone.type === "shape" && clone.kind === shape.kind, "clone kind");
assert(clone.fillOpacity === shape.fillOpacity, "clone opacity");
assert(clone !== shape, "new ref");

console.log("--- 12) persist / reload attribute keep ---");
const rich = createShapeObject("triangle", {
  id: "tri",
  x: 0.33,
  y: 0.44,
  w: 0.18,
  h: 0.16,
  rotationDeg: 45,
  fillColor: "#f472b6",
  fillOpacity: 0.45,
  strokeEnabled: false,
});
const json = JSON.stringify(rich);
const parsed = sanitizeShapeObject(JSON.parse(json));
assert(parsed != null, "parse");
assert(parsed.id === "tri" && parsed.kind === "triangle", "id/kind");
assertClose(parsed.x, 0.33);
assertClose(parsed.y, 0.44);
assertClose(parsed.w, 0.18);
assertClose(parsed.h, 0.16);
assertClose(parsed.rotationDeg!, 45);
assert(parsed.fillColor === "#f472b6", "color");
assertClose(parsed.fillOpacity, 0.45);
assert(parsed.strokeEnabled === false, "stroke off kept");

const boardRoundTrip = migrateBoard({
  id: "b2",
  sport: "soccer",
  title: "rt",
  pitchView: "full",
  pitchFlipped: false,
  showLanes5: true,
  showCorridors3: false,
  showPressLines: false,
  pieceScale: 1,
  updatedAt: new Date().toISOString(),
  scenes: [
    createScene("s", "custom", {
      pieces: [],
      ball: { x: 0.5, y: 0.5 },
      objects: [zone, rich, text, line],
    }),
  ],
  activeSceneId: "will-fix",
} as Parameters<typeof migrateBoard>[0]);
const objs = boardRoundTrip.scenes[0].objects;
assert(objs.some((o) => o.type === "zone"), "zone survived migrate");
assert(objs.some((o) => o.type === "shape" && o.id === "tri"), "shape survived");
assert(objs.some((o) => o.type === "text"), "text survived");
assert(objs.some((o) => o.type === "line"), "line survived");
const tri = objs.find((o) => o.id === "tri");
assert(tri != null && tri.type === "shape", "tri shape");
if (tri && tri.type === "shape") {
  assertClose(tri.rotationDeg!, 45);
  assert(tri.strokeEnabled === false, "stroke after migrate");
  assertClose(tri.fillOpacity, 0.45);
}

console.log("--- color reject / 8-digit / end-swap ---");
assert(sanitizeShapeFillColor("not-a-color") === SHAPE_DEFAULT_FILL_COLOR, "bad color");
assert(sanitizeShapeFillColor("#Abc") === "#aabbcc", "short hex expand");
assert(sanitizeShapeFillColor("#fde04780") === "#fde047", "strip alpha");
assert(sanitizeShapeFillColor("#FDE047") === "#fde047", "6 digit");
const beforeSwap = createShapeObject("rect", {
  id: "sw",
  x: 0.1,
  y: 0.2,
  w: 0.2,
  h: 0.1,
  rotationDeg: 30,
});
const swapped = swapShapeEndsPosition(beforeSwap);
assertClose(swapped.x, 1 - (0.1 + 0.2));
assertClose(swapped.y, 1 - (0.2 + 0.1));
assertClose(swapped.rotationDeg!, 210, 1e-9, "rot +180 (method B)");
const twice = swapSceneEnds(
  createScene("e", "custom", {
    pieces: [],
    ball: { x: 0.5, y: 0.5 },
    objects: [beforeSwap],
  }),
);
const twice2 = swapSceneEnds(twice);
const back = twice2.objects[0];
assert(back.type === "shape", "still shape");
if (back.type === "shape") {
  assertClose(back.x, beforeSwap.x);
  assertClose(back.y, beforeSwap.y);
  assertClose(back.rotationDeg!, 30);
}

console.log("\nshape-model-check passed");
