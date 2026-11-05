/**
 * File Library preview / thumb helpers (Group 4).
 * Run: npx --yes tsx scripts/file-preview-check.ts
 *
 * Canvas paint needs a browser; this script covers pure helpers + revision
 * collision rules used by Dashboard thumbs.
 */
import {
  clearSceneThumbCache,
  clearSceneThumbCacheScope,
  resolvePreviewScene,
  sceneThumbRevision,
} from "../src/canvas/sceneThumb";
import { createBoard } from "../src/models/defaults";
import { createScene } from "../src/models/scene";
import { createShapeObject } from "../src/models/shapeSanitize";
import { createBallObject } from "../src/models/ballSanitize";
import type { BoardDocument, Scene } from "../src/models/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("--- resolvePreviewScene ---");
{
  const board = createBoard("soccer", "Preview");
  board.id = "same-id";
  const s0 = board.scenes[0]!;
  s0.id = "sc-0";
  s0.label = "A";
  const s1 = createScene("B", "custom", {
    pieces: s0.pieces,
    balls: s0.balls,
    objects: [],
  });
  s1.id = "sc-1";
  board.scenes = [s0, s1];
  board.activeSceneId = "sc-1";
  assert(resolvePreviewScene(board)?.id === "sc-1", "active");
  assert(resolvePreviewScene(board, "sc-0")?.id === "sc-0", "explicit");
  board.activeSceneId = "missing";
  assert(resolvePreviewScene(board)?.id === "sc-0", "fallback first");
}

console.log("--- revision distinguishes same board.id different shapes ---");
{
  const base = createBoard("soccer", "Twin");
  base.id = "twin-id";
  const sceneA: Scene = {
    ...base.scenes[0]!,
    id: "sc-shared",
    objects: [
      createShapeObject("rect", {
        id: "sh1",
        x: 0.2,
        y: 0.2,
        w: 0.1,
        h: 0.1,
        fillColor: "#fde047",
        fillOpacity: 0.4,
      }),
    ],
    balls: [
      createBallObject({ id: "b1", x: 0.4, y: 0.5 }),
      createBallObject({ id: "b2", x: 0.5, y: 0.5 }),
      createBallObject({ id: "b3", x: 0.6, y: 0.5 }),
    ],
  };
  const sceneB: Scene = {
    ...sceneA,
    objects: [
      createShapeObject("rect", {
        id: "sh1",
        x: 0.2,
        y: 0.2,
        w: 0.1,
        h: 0.1,
        fillColor: "#93c5fd",
        fillOpacity: 0.4,
      }),
    ],
  };
  const boardA: BoardDocument = { ...base, scenes: [sceneA], activeSceneId: "sc-shared" };
  const boardB: BoardDocument = { ...base, scenes: [sceneB], activeSceneId: "sc-shared" };
  assert(boardA.id === boardB.id, "same board id");
  assert(sceneA.id === sceneB.id, "same scene id");
  assert(
    sceneThumbRevision(boardA, sceneA) !== sceneThumbRevision(boardB, sceneB),
    "revision differs by fillColor",
  );
}

console.log("--- cache scope eviction API ---");
{
  clearSceneThumbCache();
  clearSceneThumbCacheScope("entry-a");
  clearSceneThumbCacheScope("");
}

console.log("file-preview-check: OK");
