/**
 * Multi Ball Group 1 — ops / hit self-check.
 * Run: npx --yes tsx scripts/ball-ops-check.ts
 */
import { createBoard } from "../src/models/defaults";
import {
  BALL_DUP_OFFSET,
  createBallObject,
  normalizeSceneBalls,
  offsetBallCopy,
  ballsAfterPieceDelete,
} from "../src/models/ballSanitize";
import { createScene, swapSceneEnds } from "../src/models/scene";
import { hitTestBall } from "../src/canvas/drawBoard";
import { fitField } from "../src/canvas/layout";
import { boardWithActiveViewport } from "../src/models/scene";
import type { BallObject, Scene } from "../src/models/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("--- 1) Duplicate offset ---");
const src = createBallObject({ id: "src", x: 0.4, y: 0.5 });
const copy = offsetBallCopy(src);
assert(copy.id !== src.id, "new id");
assert(
  Math.abs(copy.x - (src.x + BALL_DUP_OFFSET)) < 1e-9 &&
    Math.abs(copy.y - (src.y + BALL_DUP_OFFSET)) < 1e-9,
  "offset",
);
assert(copy.attachedTo == null || copy.attachedTo === null, "detach");

console.log("--- 2) Delete guard (count == 1) ---");
function tryDelete(
  balls: BallObject[],
  selectedId: string | null,
): BallObject[] {
  if (!selectedId || balls.length <= 1) return balls; // no-op
  const next = balls.filter((b) => b.id !== selectedId);
  return next.length === 0 ? balls : next;
}
const one = [createBallObject({ id: "only", x: 0.5, y: 0.5 })];
assert(tryDelete(one, "only") === one || tryDelete(one, "only").length === 1, "noop last");
assert(tryDelete(one, "only").length === 1, "still one");

console.log("--- 3) Delete when count > 1 ---");
const two = [
  createBallObject({ id: "a", x: 0.2, y: 0.2 }),
  createBallObject({ id: "b", x: 0.8, y: 0.8 }),
];
const afterDel = tryDelete(two, "a");
assert(afterDel.length === 1 && afterDel[0]!.id === "b", "deleted a");

console.log("--- 4) Piece delete clears attach ---");
const attached = [
  createBallObject({ id: "ba", x: 0.3, y: 0.3, attachedTo: "p1" }),
  createBallObject({ id: "bb", x: 0.6, y: 0.6, attachedTo: "p2" }),
];
const cleared = ballsAfterPieceDelete(attached, new Set(["p1"]));
assert(cleared[0]!.attachedTo === null, "cleared p1");
assert(cleared[1]!.attachedTo === "p2", "kept p2");

console.log("--- 5) End swap ×2 ---");
const scene = createScene("ops", "custom", {
  pieces: [],
  balls: [
    createBallObject({ id: "s1", x: 0.25, y: 0.35 }),
    createBallObject({ id: "s2", x: 0.75, y: 0.65 }),
  ],
  objects: [],
});
const back = swapSceneEnds(swapSceneEnds(scene));
assert(
  Math.abs(back.balls[0]!.x - 0.25) < 1e-9 &&
    Math.abs(back.balls[1]!.x - 0.75) < 1e-9,
  "swap restore",
);

console.log("--- 6) hitTestBall prefers array end ---");
const board = createBoard("soccer");
const hitScene: Scene = {
  ...board.scenes[0]!,
  balls: [
    createBallObject({ id: "bottom", x: 0.5, y: 0.5 }),
    createBallObject({ id: "top", x: 0.5, y: 0.5 }),
  ],
};
const view = boardWithActiveViewport({
  ...board,
  scenes: [hitScene],
  activeSceneId: hitScene.id,
});
const { pitch } = fitField(800, 520, view, 24, view.viewport);
const m = { x: 0.5, y: 0.5 }; // pitch-norm centre-ish when full view
// world ≈ pitch for full soccer landscape
const hit = hitTestBall(view, hitScene, pitch, m.x, m.y);
assert(hit != null && hit.id === "top", `overlap prefers end, got ${hit?.id}`);

console.log("--- 7) hitTestBall distinct positions ---");
const apart: Scene = {
  ...hitScene,
  balls: [
    createBallObject({ id: "left", x: 0.3, y: 0.5 }),
    createBallObject({ id: "right", x: 0.7, y: 0.5 }),
  ],
};
const hitL = hitTestBall(view, apart, pitch, 0.3, 0.5);
const hitR = hitTestBall(view, apart, pitch, 0.7, 0.5);
assert(hitL?.id === "left", "left");
assert(hitR?.id === "right", "right");

console.log("--- 8) normalize empty balls ---");
assert(normalizeSceneBalls([], undefined).length === 1, "empty→1");

console.log("ball-ops-check: OK");
