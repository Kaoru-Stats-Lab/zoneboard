/**
 * Group 6 — write test-only Portable JSON fixtures (never production user files).
 * Run: npx --yes tsx scripts/qa-group6-fixtures.ts
 */
import { mkdirSync, writeFileSync, cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { createBoard } from "../src/models/defaults";
import { createScene } from "../src/models/scene";
import { createBallObject, offsetBallCopy } from "../src/models/ballSanitize";
import { createShapeObject } from "../src/models/shapeSanitize";
import type { BoardDocument, TextObject, DrawObject } from "../src/models/types";

const ROOT = join(process.cwd(), "tmp", "qa-group6");
const BACKUP = join(process.cwd(), "tmp", "qa-group6-backup");

function padTo22(pieces: BoardDocument["scenes"][0]["pieces"], boardId: string) {
  const out = [...pieces];
  let n = 0;
  while (out.length < 22) {
    const team = out.length % 2 === 0 ? "home" : "away";
    const base = pieces[out.length % Math.max(pieces.length, 1)] ?? pieces[0]!;
    out.push({
      ...structuredClone(base),
      id: `${boardId}-pad-${n++}`,
      x: 0.08 + (out.length % 11) * 0.08,
      y: team === "home" ? 0.22 : 0.78,
      number: String((out.length % 11) + 1),
      team,
      kit: out.length % 11 === 0 ? "gk" : "outfield",
    });
  }
  return out;
}

function richBoard(title: string, boardId: string): BoardDocument {
  const board = createBoard("soccer", title, "en");
  const pieces = padTo22(board.scenes[0]!.pieces, boardId);
  if (pieces.length < 22) {
    throw new Error(`expected ≥22 pieces, got ${pieces.length}`);
  }
  const host = pieces.find((p) => p.team === "home") ?? pieces[0]!;
  const ballA = createBallObject({ id: `${boardId}-ball-a`, x: 0.32, y: 0.41 });
  const ballB = offsetBallCopy(ballA);
  ballB.id = `${boardId}-ball-b`;
  const ballC = createBallObject({
    id: `${boardId}-ball-c`,
    x: host.x,
    y: host.y,
    attachedTo: host.id,
  });
  const rect = createShapeObject("rect", {
    id: `${boardId}-shape-rect`,
    x: 0.18,
    y: 0.2,
    w: 0.14,
    h: 0.1,
    fillColor: "#ef4444",
  });
  const circle = createShapeObject("circle", {
    id: `${boardId}-shape-circle`,
    x: 0.45,
    y: 0.55,
    w: 0.1,
    h: 0.1,
    fillColor: "#22c55e",
  });
  const tri = createShapeObject("triangle", {
    id: `${boardId}-shape-tri`,
    x: 0.7,
    y: 0.25,
    w: 0.12,
    h: 0.12,
    fillColor: "#3b82f6",
    rotationDeg: 25,
  });
  const text: TextObject = {
    id: `${boardId}-text-1`,
    type: "text",
    x: 0.52,
    y: 0.18,
    text: "QA Press",
    fontSize: 18,
    color: "#ffffff",
    align: "center",
    rotationDeg: 18,
  };
  const zone: DrawObject = {
    id: `${boardId}-zone-1`,
    type: "zone",
    x: 0.62,
    y: 0.42,
    w: 0.18,
    h: 0.14,
    color: "rgba(14,165,233,0.12)",
    strokeColor: "rgba(14,165,233,0.45)",
  };
  const line: DrawObject = {
    id: `${boardId}-line-1`,
    type: "line",
    kind: "pass",
    points: [
      { x: 0.2, y: 0.7 },
      { x: 0.4, y: 0.75 },
    ],
    color: "#f8fafc",
    strokeWidth: 2,
  };
  const arrow: DrawObject = {
    id: `${boardId}-arrow-1`,
    type: "line",
    kind: "run",
    points: [
      { x: 0.55, y: 0.7 },
      { x: 0.75, y: 0.65 },
    ],
    color: "#fbbf24",
    strokeWidth: 2,
  };
  const scene0 = {
    ...board.scenes[0]!,
    id: `${boardId}-scene-0`,
    name: "Build-up",
    pieces,
    balls: [ballA, ballB, ballC],
    objects: [rect, circle, tri, text, zone, line, arrow],
  };
  const scene1 = createScene("Final third", "custom", {
    pieces: scene0.pieces,
    balls: [createBallObject({ id: `${boardId}-ball-s1`, x: 0.6, y: 0.35 })],
    objects: [
      createShapeObject("circle", {
        id: `${boardId}-s1-circle`,
        x: 0.6,
        y: 0.4,
        w: 0.08,
        h: 0.08,
        fillColor: "#a855f7",
      }),
    ],
  });
  scene1.id = `${boardId}-scene-1`;
  return {
    ...board,
    id: boardId,
    title,
    scenes: [scene0, scene1],
    activeSceneId: scene0.id,
    updatedAt: "2026-11-06T00:00:00.000Z",
  };
}

function writeJson(dir: string, name: string, board: BoardDocument) {
  const json = portableToJsonString(
    serializeBoardToPortable(board, {
      exportedAt: "2026-11-06T00:00:00.000Z",
    }),
  );
  writeFileSync(join(dir, name), json, "utf8");
}

if (existsSync(ROOT)) rmSync(ROOT, { recursive: true, force: true });
if (existsSync(BACKUP)) rmSync(BACKUP, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });
mkdirSync(BACKUP, { recursive: true });

writeJson(ROOT, "board-alpha.zoneboard.json", richBoard("QA Alpha", "qa-board-alpha"));
writeJson(ROOT, "board-beta.zoneboard.json", richBoard("QA Beta", "qa-board-beta"));
// Same board id, different content / shape color — identity must not collide.
writeJson(
  ROOT,
  "board-alpha-copy.zoneboard.json",
  (() => {
    const b = richBoard("QA Alpha Copy", "qa-board-alpha");
    const shape = b.scenes[0]!.objects.find((o) => o.type === "shape");
    if (shape && shape.type === "shape") shape.fillColor = "#f97316";
    return b;
  })(),
);
writeFileSync(join(ROOT, "notes.txt"), "ignore me", "utf8");
writeFileSync(join(ROOT, "plain.json"), '{"not":"zoneboard"}', "utf8");
writeFileSync(join(ROOT, "bad.zoneboard.json"), "{not-json", "utf8");

cpSync(ROOT, BACKUP, { recursive: true });

console.log(`fixtures → ${ROOT}`);
console.log(`backup   → ${BACKUP}`);
console.log("qa-group6-fixtures: OK");
