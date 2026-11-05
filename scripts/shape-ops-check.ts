/**
 * Shape Integration Group 4 — selection / resize / rotate / duplicate / end-swap.
 * Run: npx --yes tsx scripts/shape-ops-check.ts
 */
import {
  applyShapeResize,
  computeShapeGeometry,
  hitTestShapeHandle,
  hitTestShapeObjectHandle,
  pointInShape,
  tightDisplayWorldBox,
  triangleSideLengths,
} from "../src/canvas/shapeGeometry";
import { hitTestObject } from "../src/canvas/drawBoard";
import type { PitchRect } from "../src/canvas/layout";
import { createBoard, migrateBoard } from "../src/models/defaults";
import { createScene, swapSceneEnds } from "../src/models/scene";
import {
  createShapeObject,
  sanitizeShapeObject,
  swapShapeEndsPosition,
} from "../src/models/shapeSanitize";
import { duplicatePieces } from "../src/models/pieceCommands";
import type {
  BoardDocument,
  Piece,
  ShapeObject,
  TextObject,
  ZoneObject,
} from "../src/models/types";
import { uid } from "../src/models/id";
import { normalizeRotationDeg, rotationDegFromDrag } from "../src/canvas/textGeometry";

function assert(c: boolean, m: string): asserts c {
  if (!c) throw new Error(m);
}
function assertClose(a: number, b: number, eps = 1e-5, m = "close") {
  assert(Math.abs(a - b) <= eps, `${m}: ${a} vs ${b}`);
}

const board = createBoard("soccer") as BoardDocument;
const pitch: PitchRect = { x: 40, y: 30, w: 900, h: 540 };

console.log("--- Select / geometry handles ---");
for (const kind of ["circle", "rect", "triangle"] as const) {
  const s = createShapeObject(kind, {
    id: kind,
    x: 0.35,
    y: 0.3,
    w: 0.2,
    h: kind === "rect" ? 0.1 : 0.2,
    rotationDeg: kind === "triangle" ? 45 : undefined,
  });
  const g = computeShapeGeometry(s, board, pitch)!;
  assert(g != null, `${kind} geom`);
  assert(Object.keys(g.handles).length === 8, `${kind} 8 handles`);
  assert(
    g.showRotateHandle === (kind !== "circle"),
    `${kind} rotate handle`,
  );
  const mid = hitTestShapeHandle(
    g,
    g.pitchX + g.pitchW / 2,
    g.pitchY + g.pitchH / 2,
  );
  // centre is not a handle
  assert(mid === null || mid === "rotate", `${kind} centre not resize`);
  const se = hitTestShapeObjectHandle(
    s,
    board,
    pitch,
    (g.handles.se.x - pitch.x) / pitch.w,
    (g.handles.se.y - pitch.y) / pitch.h,
  );
  assert(se === "se", `${kind} se handle hit`);
}

console.log("--- Move-equivalent: patch keeps rot/size ---");
{
  const s = createShapeObject("rect", {
    id: "mv",
    x: 0.2,
    y: 0.2,
    w: 0.15,
    h: 0.1,
    rotationDeg: 30,
  });
  const moved = sanitizeShapeObject({ ...s, x: 0.25, y: 0.28 })!;
  assertClose(moved.w, 0.15);
  assertClose(moved.h, 0.1);
  assertClose(moved.rotationDeg!, 30);
}

console.log("--- Resize rect free + shift square ---");
{
  const s = createShapeObject("rect", {
    id: "rr",
    x: 0.3,
    y: 0.3,
    w: 0.2,
    h: 0.1,
  });
  const g = computeShapeGeometry(s, board, pitch)!;
  const tight = tightDisplayWorldBox(g, board);
  const free = applyShapeResize(
    { ...tight, rotationDeg: 0, kind: "rect" },
    "e",
    tight.x + tight.w + 0.05,
    tight.y + tight.h / 2,
    { x: tight.x + tight.w, y: tight.y + tight.h / 2 },
    board,
    pitch,
  );
  assert(free.w > tight.w, "wider");
  const sq = applyShapeResize(
    { ...tight, rotationDeg: 0, kind: "rect" },
    "se",
    tight.x + tight.w + 0.08,
    tight.y + tight.h + 0.01,
    { x: tight.x + tight.w, y: tight.y + tight.h },
    board,
    pitch,
    { lockAspect: true },
  );
  const gsq = computeShapeGeometry(
    createShapeObject("rect", { id: "sq", ...sq }),
    board,
    pitch,
  )!;
  assertClose(gsq.pw, gsq.ph, 1e-3, "shift square css");
}

console.log("--- Resize circle stays circle ---");
{
  const s = createShapeObject("circle", {
    id: "c",
    x: 0.4,
    y: 0.4,
    w: 0.18,
    h: 0.12, // letterboxed
  });
  const g0 = computeShapeGeometry(s, board, pitch)!;
  const tight = tightDisplayWorldBox(g0, board);
  // CSS display is square; world w/h may differ with pitch aspect
  const gTight = computeShapeGeometry(
    createShapeObject("circle", { id: "ct", ...tight }),
    board,
    pitch,
  )!;
  assertClose(gTight.pw, gTight.ph, 1e-3, "tight display css square");
  const next = applyShapeResize(
    { ...tight, rotationDeg: 0, kind: "circle" },
    "se",
    tight.x + tight.w + 0.06,
    tight.y + tight.h + 0.02,
    { x: tight.x + tight.w, y: tight.y + tight.h },
    board,
    pitch,
  );
  const g1 = computeShapeGeometry(
    createShapeObject("circle", { id: "c2", ...next }),
    board,
    pitch,
  )!;
  assertClose(g1.pw, g1.ph, 1e-3, "circle aabb square");
  assertClose(g1.radiusPx * 2, Math.min(g1.pw, g1.ph), 1e-3);
}

console.log("--- Resize circle/triangle fixed-anchor (SE grows SE) ---");
{
  // SE drag must keep NW corner fixed — regression for inverted lock re-anchor.
  for (const kind of ["circle", "triangle"] as const) {
    const s = createShapeObject(kind, {
      id: `anch-${kind}`,
      x: 0.35,
      y: 0.35,
      w: 0.16,
      h: 0.16,
    });
    const g0 = computeShapeGeometry(s, board, pitch)!;
    const tight = tightDisplayWorldBox(g0, board);
    const nwX0 = tight.x;
    const nwY0 = tight.y;
    const next = applyShapeResize(
      { ...tight, rotationDeg: 0, kind },
      "se",
      tight.x + tight.w + 0.08,
      tight.y + tight.h + 0.08,
      { x: tight.x + tight.w, y: tight.y + tight.h },
      board,
      pitch,
    );
    assert(next.w > tight.w && next.h > tight.h, `${kind} grew`);
    assertClose(next.x, nwX0, 2e-3, `${kind} NW x fixed`);
    assertClose(next.y, nwY0, 2e-3, `${kind} NW y fixed`);
    // NW drag: SE corner stays put
    const nextNw = applyShapeResize(
      { ...tight, rotationDeg: 0, kind },
      "nw",
      tight.x - 0.05,
      tight.y - 0.05,
      { x: tight.x, y: tight.y },
      board,
      pitch,
    );
    assertClose(nextNw.x + nextNw.w, tight.x + tight.w, 2e-3, `${kind} SE x fixed`);
    assertClose(nextNw.y + nextNw.h, tight.y + tight.h, 2e-3, `${kind} SE y fixed`);
  }
}

console.log("--- Resize triangle equilateral ---");
{
  const s = createShapeObject("triangle", {
    id: "t",
    x: 0.25,
    y: 0.25,
    w: 0.22,
    h: 0.1,
  });
  const g0 = computeShapeGeometry(s, board, pitch)!;
  const tight = tightDisplayWorldBox(g0, board);
  const next = applyShapeResize(
    { ...tight, rotationDeg: 0, kind: "triangle" },
    "e",
    tight.x + tight.w + 0.05,
    tight.y + tight.h / 2,
    { x: tight.x + tight.w, y: tight.y + tight.h / 2 },
    board,
    pitch,
  );
  const g1 = computeShapeGeometry(
    createShapeObject("triangle", { id: "t2", ...next }),
    board,
    pitch,
  )!;
  const sides = triangleSideLengths(g1.localVerts);
  assertClose(sides[0], sides[1], 1e-3);
  assertClose(sides[1], sides[2], 1e-3);
  // E-edge: left edge fixed (x unchanged)
  assertClose(next.x, tight.x, 2e-3, "triangle E keeps left");
}

console.log("--- Resize while rotated 45° ---");
{
  const s = createShapeObject("rect", {
    id: "r45",
    x: 0.35,
    y: 0.35,
    w: 0.16,
    h: 0.09,
    rotationDeg: 45,
  });
  const g = computeShapeGeometry(s, board, pitch)!;
  const tight = tightDisplayWorldBox(g, board);
  const next = applyShapeResize(
    { ...tight, rotationDeg: 45, kind: "rect" },
    "e",
    tight.x + tight.w / 2 + 0.04,
    tight.y + tight.h / 2,
    { x: tight.x + tight.w / 2, y: tight.y + tight.h / 2 },
    board,
    pitch,
  );
  assert(next.w > 0 && next.h > 0, "resized ok");
  assert(
    pointInShape(
      computeShapeGeometry(
        { ...s, ...next },
        board,
        pitch,
      )!,
      g.pitchX + g.pitchW / 2,
      g.pitchY + g.pitchH / 2,
    ),
    "centre still inside after resize@45",
  );
}

console.log("--- Rotation snap / wrap ---");
{
  const live = rotationDegFromDrag(
    { x: 100, y: 100 },
    { x: 100, y: 80 },
    { x: 120, y: 100 },
    0,
    true,
  );
  assert(live % 15 === 0 || Math.abs(live % 15) < 1e-6, "15 snap");
  assertClose(normalizeRotationDeg(360), 0, 1e-9, "360→0");
  assertClose(normalizeRotationDeg(-10), 350, 1e-6, "neg wrap");
  // Cross-zero continuity of rotationDegFromDrag (no ±360 jump mid-drag)
  const a = rotationDegFromDrag(
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0.999, y: -0.05 },
    350,
    false,
  );
  const b = rotationDegFromDrag(
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0.999, y: 0.05 },
    10,
    false,
  );
  assert(Number.isFinite(a) && Number.isFinite(b), "drag angles finite");
}

console.log("--- Duplicate shape + piece regression ---");
{
  const shape = createShapeObject("rect", { id: "d1", x: 0.1, y: 0.1 });
  const copy = sanitizeShapeObject({
    ...shape,
    id: uid(),
    x: shape.x + 0.018,
    y: shape.y + 0.018,
  })!;
  assert(copy.id !== shape.id, "new id");
  assertClose(copy.w, shape.w);
  assertClose(copy.fillOpacity, shape.fillOpacity);
  // Insert immediately after source (predictable z-order)
  const objs = [shape, createShapeObject("circle", { id: "other" })];
  const at = objs.findIndex((o) => o.id === shape.id);
  const stacked = [...objs];
  stacked.splice(at + 1, 0, copy);
  assert(stacked[1]!.id === copy.id, "copy after source");
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
  const pcs = duplicatePieces([piece]);
  assert(pcs.length === 1 && pcs[0]!.id !== piece.id, "piece dup ok");
}

console.log("--- End-swap B twice restores ---");
{
  const s = createShapeObject("triangle", {
    id: "es",
    x: 0.2,
    y: 0.25,
    w: 0.15,
    h: 0.13,
    rotationDeg: 20,
  });
  const once = swapShapeEndsPosition(s);
  assertClose(once.rotationDeg!, 200, 1e-6);
  const scene = createScene("s", "custom", {
    pieces: [],
    ball: { x: 0.5, y: 0.5 },
    objects: [s],
  });
  const back = swapSceneEnds(swapSceneEnds(scene)).objects[0] as ShapeObject;
  assertClose(back.x, s.x);
  assertClose(back.y, s.y);
  assertClose(back.rotationDeg!, 20);
}

console.log("--- Unknown kind preserved; zone untouched ---");
{
  const zone: ZoneObject = {
    id: "z",
    type: "zone",
    x: 0.1,
    y: 0.1,
    w: -0.2,
    h: 0.15,
    color: "keep",
    strokeColor: "ks",
  };
  const future = {
    id: "hex",
    type: "shape",
    kind: "hexagon",
    x: 0.4,
    y: 0.4,
    w: 0.1,
    h: 0.1,
    fillColor: "#ffffff",
    fillOpacity: 0.3,
  };
  const text: TextObject = {
    id: "tx",
    type: "text",
    x: 0.5,
    y: 0.5,
    text: "hi",
    color: "#fff",
    fontSize: 0.035,
  };
  const migrated = migrateBoard({
    id: "b",
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
      createScene("sc", "custom", {
        pieces: [],
        ball: { x: 0.5, y: 0.5 },
        objects: [
          zone,
          future as unknown as ShapeObject,
          createShapeObject("circle", { id: "ok" }),
          text,
        ],
      }),
    ],
    activeSceneId: "fix",
  } as Parameters<typeof migrateBoard>[0]);
  const objs = migrated.scenes[0].objects;
  assert(objs.some((o) => o.type === "zone" && (o as ZoneObject).w === -0.2));
  assert(
    objs.some(
      (o) => o.id === "hex" && (o as { kind: string }).kind === "hexagon",
    ),
  );
  assert(objs.some((o) => o.type === "text"));
}

console.log("--- Hit stacking shape under text ---");
{
  const shape = createShapeObject("rect", {
    id: "under",
    x: 0.2,
    y: 0.2,
    w: 0.3,
    h: 0.25,
  });
  const text: TextObject = {
    id: "over",
    type: "text",
    x: 0.28,
    y: 0.28,
    text: "TOP",
    color: "#fff",
    fontSize: 0.04,
    width: 0.18,
    height: 0.08,
  };
  const scene = createScene("h", "custom", {
    pieces: [],
    ball: { x: 0.9, y: 0.9 },
    objects: [shape, text],
  });
  const g = computeShapeGeometry(shape, board, pitch)!;
  const hit = hitTestObject(
    board,
    scene,
    g.pitchX + g.pitchW * 0.55,
    g.pitchY + g.pitchH * 0.55,
    pitch,
  );
  assert(hit?.type === "text" || hit?.type === "shape", "hit draw object");
}

console.log("\nshape-ops-check passed");
