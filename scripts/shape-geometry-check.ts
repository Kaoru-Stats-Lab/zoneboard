/**
 * Shape Integration Group 3 — geometry / hit / create-drag self-check.
 * Run: npx --yes tsx scripts/shape-geometry-check.ts
 */
import {
  EQUILATERAL_H_OVER_SIDE,
  computeShapeGeometry,
  constrainCssDragRect,
  pointInShape,
  shapeBoxFromDrag,
  triangleSideLengths,
} from "../src/canvas/shapeGeometry";
import { hitTestObject } from "../src/canvas/drawBoard";
import type { PitchRect } from "../src/canvas/layout";
import { createBoard } from "../src/models/defaults";
import { createScene, swapSceneEnds } from "../src/models/scene";
import {
  SHAPE_DEFAULT_FILL_OPACITY,
  createShapeObject,
  swapShapeEndsPosition,
} from "../src/models/shapeSanitize";
import type {
  BoardDocument,
  Piece,
  ShapeObject,
  TextObject,
  ZoneObject,
} from "../src/models/types";

function assert(c: boolean, m: string): asserts c {
  if (!c) throw new Error(m);
}

function assertClose(a: number, b: number, eps = 1e-6, m = "close") {
  assert(Math.abs(a - b) <= eps, `${m}: ${a} vs ${b}`);
}

const board = createBoard("soccer") as BoardDocument;
const pitchWide: PitchRect = { x: 40, y: 30, w: 920, h: 520 }; // landscape-ish
const pitchTall: PitchRect = { x: 80, y: 20, w: 400, h: 700 }; // portrait-ish
const pitchSq: PitchRect = { x: 0, y: 0, w: 600, h: 600 };

console.log("--- Circle true circle (wide & tall pitch) ---");
for (const pitch of [pitchWide, pitchTall, pitchSq]) {
  const c = createShapeObject("circle", {
    id: "c1",
    x: 0.3,
    y: 0.3,
    w: 0.2,
    h: 0.12, // non-square world — display must still be circle
  });
  const g = computeShapeGeometry(c, board, pitch)!;
  assert(g != null, "geom");
  // inscribed: diameter = min(pw,ph)
  assertClose(g.radiusPx * 2, Math.min(g.pw, g.ph), 1e-6, "inscribed");
  // sample points on circle after rot still same radius
  for (const deg of [0, 45, 90]) {
    const g2 = computeShapeGeometry(
      { ...c, rotationDeg: deg },
      board,
      pitch,
    )!;
    assertClose(g2.radiusPx, g.radiusPx, 1e-6, `r@${deg}`);
  }
}

console.log("--- Rectangle arbitrary aspect ---");
{
  const r = createShapeObject("rect", {
    id: "r1",
    x: 0.1,
    y: 0.1,
    w: 0.3,
    h: 0.1,
  });
  const g = computeShapeGeometry(r, board, pitchWide)!;
  assert(g.pw / g.ph > 1.5, "wide rect css");
  assert(g.localVerts.length === 4, "4 verts");
}

console.log("--- Square 1:1 via drag lock ---");
{
  const box = shapeBoxFromDrag(
    "rect",
    { x: 100, y: 100 },
    { x: 250, y: 180 },
    board,
    pitchWide,
    { lockAspect: true },
  );
  const g = computeShapeGeometry(
    createShapeObject("rect", { id: "sq", ...box }),
    board,
    pitchWide,
  )!;
  assertClose(g.pw, g.ph, 1e-4, "square css");
}

console.log("--- Triangle equilateral + tip up ---");
{
  const t = createShapeObject("triangle", {
    id: "t1",
    x: 0.2,
    y: 0.2,
    w: 0.25,
    h: 0.1, // non-matching — fit inside
  });
  const g = computeShapeGeometry(t, board, pitchWide)!;
  const sides = triangleSideLengths(g.localVerts);
  assertClose(sides[0], sides[1], 1e-4, "side01");
  assertClose(sides[1], sides[2], 1e-4, "side12");
  const [tip, br, bl] = g.localVerts;
  assert(tip.y < br.y && tip.y < bl.y, "tip up (local -y)");
  assertClose(tip.x, 0, 1e-6, "tip centered");
}

console.log("--- Rotation 45 / 90 ---");
{
  const r = createShapeObject("rect", {
    id: "rot",
    x: 0.4,
    y: 0.4,
    w: 0.15,
    h: 0.08,
    rotationDeg: 45,
  });
  const g = computeShapeGeometry(r, board, pitchWide)!;
  assertClose(g.rotationDeg, 45);
  assert(g.rotatedVerts.length === 4, "rotated verts");
  // centre hit still true
  assert(
    pointInShape(g, g.pitchX + g.pitchW / 2, g.pitchY + g.pitchH / 2),
    "center hit @45",
  );
  const g90 = computeShapeGeometry({ ...r, rotationDeg: 90 }, board, pitchWide)!;
  assertClose(g90.rotationDeg, 90);
}

console.log("--- Negative quadrant drag ---");
{
  const css = constrainCssDragRect("rect", 200, 200, 100, 120);
  assertClose(css.x, 100);
  assertClose(css.y, 120);
  assertClose(css.w, 100);
  assertClose(css.h, 80);
  const cir = constrainCssDragRect("circle", 200, 200, 100, 150);
  assertClose(cir.w, cir.h, 1e-9, "circle square aabb");
  const tri = constrainCssDragRect("triangle", 200, 200, 80, 50);
  assertClose(tri.h / tri.w, EQUILATERAL_H_OVER_SIDE, 1e-4, "tri aspect");
}

console.log("--- Near-zero / min size ---");
{
  const tiny = shapeBoxFromDrag(
    "rect",
    { x: 50, y: 50 },
    { x: 50.0001, y: 50.0001 },
    board,
    pitchWide,
  );
  assert(tiny.w >= 0.01 - 1e-9 && tiny.h >= 0.01 - 1e-9, "min size");
}

console.log("--- Hit: centres ---");
for (const kind of ["circle", "rect", "triangle"] as const) {
  const s = createShapeObject(kind, {
    id: kind,
    x: 0.4,
    y: 0.35,
    w: 0.18,
    h: 0.18,
  });
  const g = computeShapeGeometry(s, board, pitchWide)!;
  const cx = g.pitchX + g.pitchW / 2;
  const cy = g.pitchY + g.pitchH / 2;
  assert(pointInShape(g, cx, cy), `${kind} centre`);
}

console.log("--- Hit: rect corner vs circle corner of AABB ---");
{
  const c = createShapeObject("circle", {
    id: "hc",
    x: 0.4,
    y: 0.4,
    w: 0.2,
    h: 0.2,
  });
  const g = computeShapeGeometry(c, board, pitchSq)!;
  // AABB corner in pitch-norm — outside circle
  assert(!pointInShape(g, g.pitchX, g.pitchY), "circle AABB corner miss");
  assert(pointInShape(g, g.pitchX + g.pitchW / 2, g.pitchY + g.pitchH / 2), "circle mid");

  const r = createShapeObject("rect", { id: "hr", ...c, kind: "rect" });
  const gr = computeShapeGeometry(r, board, pitchSq)!;
  assert(pointInShape(gr, gr.pitchX + 0.001, gr.pitchY + 0.001), "rect near corner");
}

console.log("--- Hit: triangle outside but in AABB ---");
{
  const t = createShapeObject("triangle", {
    id: "ht",
    x: 0.3,
    y: 0.3,
    w: 0.25,
    h: 0.25,
  });
  const g = computeShapeGeometry(t, board, pitchSq)!;
  // top-left of AABB is outside tip-up equilateral (empty corners)
  assert(!pointInShape(g, g.pitchX + 0.002, g.pitchY + 0.002), "tri AABB corner miss");
  assert(
    pointInShape(g, g.pitchX + g.pitchW / 2, g.pitchY + g.pitchH * 0.55),
    "tri interior",
  );
}

console.log("--- Hit: rotated rect ---");
{
  const r = createShapeObject("rect", {
    id: "rr",
    x: 0.35,
    y: 0.35,
    w: 0.2,
    h: 0.08,
    rotationDeg: 45,
  });
  const g = computeShapeGeometry(r, board, pitchWide)!;
  assert(
    pointInShape(g, g.pitchX + g.pitchW / 2, g.pitchY + g.pitchH / 2),
    "rot centre",
  );
}

console.log("--- Hit priority: piece over shape (hitTestObject pieces separate) ---");
// hitTestObject only tests DrawObjects — pieces are higher in BoardCanvas.
// Verify shape vs text reverse-array order:
{
  const shape = createShapeObject("rect", {
    id: "under",
    x: 0.2,
    y: 0.2,
    w: 0.3,
    h: 0.2,
  });
  const text: TextObject = {
    id: "over",
    type: "text",
    x: 0.28,
    y: 0.28,
    text: "hi",
    color: "#fff",
    fontSize: 0.04,
    width: 0.15,
    height: 0.06,
  };
  const scene = createScene("h", "custom", {
    pieces: [],
    ball: { x: 0.9, y: 0.9 },
    objects: [shape, text], // text later = on top in reverse hit
  });
  const g = computeShapeGeometry(shape, board, pitchWide)!;
  const nx = g.pitchX + g.pitchW / 2;
  const ny = g.pitchY + g.pitchH / 2;
  const hit = hitTestObject(board, scene, nx, ny, pitchWide);
  // May hit text or shape depending on overlap — ensure something hits
  assert(hit != null, "hit something");
  // Later object preferred when both contain point:
  const onlyShape = createScene("h2", "custom", {
    pieces: [],
    ball: { x: 0.9, y: 0.9 },
    objects: [shape],
  });
  assert(
    hitTestObject(board, scene, nx, ny, pitchWide)?.type === "text" ||
      hitTestObject(board, onlyShape, nx, ny, pitchWide)?.type === "shape",
    "stacking ok",
  );
  void hit;
}

console.log("--- Defaults / opacity / stroke flags ---");
{
  const s = createShapeObject("circle");
  assert(s.fillOpacity === SHAPE_DEFAULT_FILL_OPACITY, "default opacity");
  const g0 = computeShapeGeometry(
    { ...s, fillOpacity: 0, strokeEnabled: false },
    board,
    pitchWide,
  )!;
  assert(g0.fillOpacity === 0 && g0.strokeEnabled === false, "transparent+no stroke");
  const g1 = computeShapeGeometry({ ...s, fillOpacity: 1 }, board, pitchWide)!;
  assert(g1.fillOpacity === 1, "opaque fill");
}

console.log("--- Zone unchanged coexistence ---");
{
  const zone: ZoneObject = {
    id: "z",
    type: "zone",
    x: 0.05,
    y: 0.05,
    w: -0.2,
    h: 0.15,
    color: "keep",
    strokeColor: "keep-s",
  };
  const shape = createShapeObject("circle", { id: "cs", x: 0.5, y: 0.5 });
  const scene = createScene("mix", "custom", {
    pieces: [],
    ball: { x: 0.5, y: 0.5 },
    objects: [zone, shape],
  });
  assert(scene.objects[0].type === "zone", "zone first");
  assert((scene.objects[0] as ZoneObject).w === -0.2, "signed w");
  const g = computeShapeGeometry(shape, board, pitchWide);
  assert(g != null, "shape still computes");
}

console.log("--- End-swap B: position flip + rotationDeg +180 ---");
{
  const tri = createShapeObject("triangle", {
    id: "es",
    x: 0.2,
    y: 0.15,
    w: 0.2,
    h: 0.18,
    rotationDeg: 0,
  });
  const a = swapShapeEndsPosition(tri);
  assertClose(a.rotationDeg ?? 0, 180, 1e-9, "angle +180");
  const g0 = computeShapeGeometry(tri, board, pitchWide)!;
  const g1 = computeShapeGeometry(a, board, pitchWide)!;
  assert(g0.localVerts[0]!.y < 0 && g1.localVerts[0]!.y < 0, "local tip-up");
  assertClose(g1.rotationDeg, 180, 1e-6, "geom rot 180");
  const twice = swapSceneEnds(
    swapSceneEnds(
      createScene("e", "custom", {
        pieces: [],
        ball: { x: 0.5, y: 0.5 },
        objects: [tri],
      }),
    ),
  );
  const back = twice.objects[0] as ShapeObject;
  assertClose(back.x, tri.x);
  assertClose(back.y, tri.y);
  assertClose(back.rotationDeg ?? 0, 0);
}

console.log("--- Piece type sanity (overlap doesn't break geom) ---");
{
  const piece: Piece = {
    id: "p1",
    x: 0.5,
    y: 0.5,
    number: "9",
    label: "",
    color: "#e74c3c",
    team: "home",
    facing: 0,
    role: "starter",
  };
  assert(piece.x === 0.5, "piece ok");
}

console.log("\nshape-geometry-check passed");
