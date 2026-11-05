/**
 * Multi Ball Group 1 — model / migrate self-check.
 * Run: npx --yes tsx scripts/ball-model-check.ts
 */
import { migrateBoard, createBoard } from "../src/models/defaults";
import {
  createBallObject,
  normalizeSceneBalls,
  rotateBallObject180,
} from "../src/models/ballSanitize";
import { createScene, swapSceneEnds } from "../src/models/scene";
import type { BallObject, Scene } from "../src/models/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("--- 1) createBallObject ---");
const b0 = createBallObject({ x: 0.3, y: 0.4 });
assert(typeof b0.id === "string" && b0.id.length > 0, "id");
assert(b0.x === 0.3 && b0.y === 0.4, "xy");

console.log("--- 2) normalize: legacy single ball ---");
const fromLegacy = normalizeSceneBalls(undefined, { x: 0.2, y: 0.8, attachedTo: "p1" });
assert(fromLegacy.length === 1, "legacy len");
assert(fromLegacy[0]!.x === 0.2 && fromLegacy[0]!.attachedTo === "p1", "legacy fields");

console.log("--- 3) normalize: balls[] preferred ---");
const multi = normalizeSceneBalls(
  [
    { id: "a", x: 0.1, y: 0.1 },
    { id: "b", x: 0.9, y: 0.9 },
  ],
  { x: 0.5, y: 0.5 },
);
assert(multi.length === 2, "prefer balls");
assert(multi[0]!.id === "a" && multi[1]!.id === "b", "ids");

console.log("--- 4) normalize: corrupt → default one ---");
const broken = normalizeSceneBalls([{ x: NaN, y: Infinity }], undefined);
assert(broken.length === 1, "corrupt fallback");
assert(Number.isFinite(broken[0]!.x), "finite");

console.log("--- 5) migrateBoard legacy scene.ball ---");
const migrated = migrateBoard({
  id: "board-legacy",
  sport: "soccer",
  title: "legacy",
  pitchView: "full",
  pitchFlipped: false,
  showLanes5: true,
  showCorridors3: false,
  showPressLines: false,
  pieceScale: 1,
  updatedAt: new Date().toISOString(),
  scenes: [
    {
      id: "sc1",
      label: "A",
      phase: "custom",
      pieces: [],
      ball: { x: 0.4, y: 0.6, attachedTo: null },
      objects: [],
      hideHalf: "none",
    } as unknown as Scene,
  ],
  activeSceneId: "sc1",
} as Parameters<typeof migrateBoard>[0]);
assert(migrated.scenes[0]!.balls.length === 1, "migrate balls");
assert(migrated.scenes[0]!.balls[0]!.x === 0.4, "migrate x");
assert(!("ball" in migrated.scenes[0]! && (migrated.scenes[0] as { ball?: unknown }).ball), "no legacy ball field");

console.log("--- 6) migrateBoard already has balls ---");
const migrated2 = migrateBoard({
  id: "board2",
  sport: "soccer",
  title: "b2",
  pitchView: "full",
  pitchFlipped: false,
  showLanes5: true,
  showCorridors3: false,
  showPressLines: false,
  pieceScale: 1,
  updatedAt: new Date().toISOString(),
  scenes: [
    {
      id: "sc2",
      label: "B",
      phase: "custom",
      pieces: [],
      balls: [
        { id: "b1", x: 0.2, y: 0.2 },
        { id: "b2", x: 0.7, y: 0.7 },
      ],
      ball: { x: 0.99, y: 0.99 },
      objects: [],
      hideHalf: "none",
    } as unknown as Scene,
  ],
  activeSceneId: "sc2",
} as Parameters<typeof migrateBoard>[0]);
assert(migrated2.scenes[0]!.balls.length === 2, "balls preferred over ball");
assert(migrated2.scenes[0]!.balls[0]!.id === "b1", "keep id");

console.log("--- 7) createBoard / createScene have balls ---");
const fresh = createBoard("soccer");
assert(fresh.scenes[0]!.balls.length >= 1, "fresh board balls");
const seeded = createScene("t", "custom", {
  pieces: [],
  ball: { x: 0.55, y: 0.45 },
  objects: [],
});
assert(seeded.balls.length === 1 && seeded.balls[0]!.x === 0.55, "seed ball→balls");

console.log("--- 8) end swap ×2 ---");
const balls: BallObject[] = [
  createBallObject({ id: "e1", x: 0.2, y: 0.3 }),
  createBallObject({ id: "e2", x: 0.8, y: 0.9 }),
];
const sceneSwap = createScene("swap", "custom", {
  pieces: [],
  balls,
  objects: [],
});
const once = swapSceneEnds(sceneSwap);
const twice = swapSceneEnds(once);
assert(
  Math.abs(twice.balls[0]!.x - 0.2) < 1e-9 &&
    Math.abs(twice.balls[0]!.y - 0.3) < 1e-9,
  "swap×2 ball0",
);
assert(
  Math.abs(twice.balls[1]!.x - 0.8) < 1e-9 &&
    Math.abs(twice.balls[1]!.y - 0.9) < 1e-9,
  "swap×2 ball1",
);
const flipped = rotateBallObject180(balls[0]!);
assert(Math.abs(flipped.x - 0.8) < 1e-9 && Math.abs(flipped.y - 0.7) < 1e-9, "rotate180");

console.log("ball-model-check: OK");
