/**
 * Portable Board JSON Export / Import round-trip.
 * Run: npx --yes tsx scripts/board-json-roundtrip-check.ts
 */
import {
  PORTABLE_FORMAT_ID,
  PORTABLE_SCHEMA_VERSION,
  PortableImportError,
  parsePortableBoardJson,
  portableBoardFilename,
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { createBoard, migrateBoard } from "../src/models/defaults";
import { createBallObject, offsetBallCopy } from "../src/models/ballSanitize";
import { createShapeObject } from "../src/models/shapeSanitize";
import { createScene, swapSceneEnds } from "../src/models/scene";
import { uid } from "../src/models/id";
import type { BoardDocument, Piece, TextObject } from "../src/models/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function roundTrip(board: BoardDocument): BoardDocument {
  const portable = serializeBoardToPortable(board);
  const json = portableToJsonString(portable);
  return parsePortableBoardJson(json);
}

console.log("--- 1) empty-ish board ---");
{
  const b = createBoard("soccer", "空ボード");
  const r = roundTrip(b);
  assert(r.id !== b.id, "new board id");
  assert(r.title === b.title, "title");
  assert(r.scenes.length === b.scenes.length, "scenes");
  assert(r.scenes[0]!.balls.length >= 1, "≥1 ball");
}

console.log("--- 2) filename UTF-8 ---");
{
  assert(
    portableBoardFilename("High Press vs 4-3-3") ===
      "High Press vs 4-3-3.zoneboard.json",
    "ascii name",
  );
  assert(
    portableBoardFilename("ハイプレス").endsWith(".zoneboard.json"),
    "ja name",
  );
  assert(
    !portableBoardFilename('a<>:"/\\|?*b').includes("<"),
    "sanitize",
  );
}

console.log("--- 3) multi scene + multi ball + attach ---");
{
  const board = createBoard("soccer", "MultiBall RT");
  const pieces = board.scenes[0]!.pieces;
  const host = pieces.find((p) => p.team === "home") ?? pieces[0];
  const ballA = createBallObject({ id: "ba", x: 0.3, y: 0.4 });
  const ballB = offsetBallCopy(ballA);
  const ballC = createBallObject({
    id: "bc",
    x: host?.x ?? 0.5,
    y: host?.y ?? 0.5,
    attachedTo: host?.id ?? null,
  });
  const scene0: typeof board.scenes[0] = {
    ...board.scenes[0]!,
    balls: [ballA, ballB, ballC],
    objects: [
      createShapeObject("triangle", {
        x: 0.2,
        y: 0.2,
        w: 0.15,
        h: 0.15,
        fillColor: "#fde047",
        fillOpacity: 0.45,
        rotationDeg: 30,
      }),
      createShapeObject("triangle", {
        x: 0.4,
        y: 0.25,
        w: 0.12,
        h: 0.12,
        fillColor: "#93c5fd",
        fillOpacity: 0.3,
        rotationDeg: 90,
      }),
      {
        id: uid(),
        type: "zone",
        x: 0.6,
        y: 0.3,
        w: 0.2,
        h: 0.15,
        color: "rgba(14,165,233,0.08)",
        strokeColor: "#0284c7",
      },
      {
        id: uid(),
        type: "text",
        x: 0.1,
        y: 0.1,
        text: "ハイ\nPress",
        color: "#ffffff",
        fontSize: 0.04,
        width: 0.25,
        rotationDeg: 15,
        align: "center",
      } satisfies TextObject,
      {
        id: uid(),
        type: "line",
        kind: "pass",
        points: [
          { x: 0.2, y: 0.5 },
          { x: 0.4, y: 0.4 },
        ],
        color: "#2563eb",
        strokeWidth: 2,
      },
    ],
  };
  const scene1 = createScene("CK右", "setpiece", {
    pieces: structuredClone(scene0.pieces),
    balls: [createBallObject({ x: 0.9, y: 0.1 })],
    objects: [],
  });
  board.scenes = [scene0, scene1];
  board.activeSceneId = scene0.id;
  board.matchLabel = "テスト節";

  const restored = roundTrip(board);
  assert(restored.scenes.length === 2, "2 scenes");
  assert(restored.scenes[0]!.label === scene0.label, "scene label");
  assert(restored.scenes[0]!.balls.length === 3, "3 balls");
  const rBalls = restored.scenes[0]!.balls;
  assert(
    rBalls.every((b) => b.id !== "ba" && b.id !== "bc"),
    "ball ids remapped",
  );
  const attached = rBalls.filter((b) => b.attachedTo);
  assert(attached.length === 1, "one attached");
  const hostIds = new Set(restored.scenes[0]!.pieces.map((p) => p.id));
  assert(
    attached[0]!.attachedTo != null && hostIds.has(attached[0]!.attachedTo),
    "attachedTo remapped to piece",
  );
  const shapes = restored.scenes[0]!.objects.filter((o) => o.type === "shape");
  assert(shapes.length === 2, "2 triangles");
  assert(
    shapes[0]!.type === "shape" &&
      shapes[0]!.kind === "triangle" &&
      shapes[0]!.rotationDeg === 30,
    "triangle attrs",
  );
  const zone = restored.scenes[0]!.objects.find((o) => o.type === "zone");
  assert(zone?.type === "zone" && zone.w === 0.2, "legacy zone");
  const text = restored.scenes[0]!.objects.find((o) => o.type === "text");
  assert(
    text?.type === "text" &&
      text.text.includes("\n") &&
      text.rotationDeg === 15 &&
      text.align === "center",
    "text multiline/rot/align",
  );
  assert(restored.matchLabel === "テスト節", "matchLabel");
}

console.log("--- 4) unknown shape kind passthrough ---");
{
  const board = createBoard("soccer");
  board.scenes[0]!.objects = [
    {
      id: "hex",
      type: "shape",
      kind: "hexagon",
      x: 0.1,
      y: 0.1,
      w: 0.1,
      h: 0.1,
      fillColor: "#ffffff",
      fillOpacity: 0.3,
    } as unknown as BoardDocument["scenes"][0]["objects"][0],
  ];
  const r = roundTrip(board);
  const hex = r.scenes[0]!.objects.find((o) => o.id !== undefined);
  // id remapped — find by kind
  const kept = r.scenes[0]!.objects.find(
    (o) => o.type === "shape" && (o as { kind: string }).kind === "hexagon",
  );
  assert(kept != null, "unknown kind kept");
}

console.log("--- 5) reject bad files ---");
{
  const expect = (fn: () => void, code: string) => {
    try {
      fn();
      throw new Error(`expected ${code}`);
    } catch (e) {
      assert(e instanceof PortableImportError && e.code === code, code);
    }
  };
  expect(() => parsePortableBoardJson("{"), "parse");
  expect(
    () => parsePortableBoardJson(JSON.stringify({ format: "nope", schemaVersion: 1, board: {} })),
    "format",
  );
  expect(
    () =>
      parsePortableBoardJson(
        JSON.stringify({
          format: PORTABLE_FORMAT_ID,
          schemaVersion: 99,
          board: createBoard("soccer"),
        }),
      ),
    "version_new",
  );
  expect(
    () => parsePortableBoardJson("x".repeat(5 * 1024 * 1024)),
    "too_large",
  );
}

console.log("--- 6) double import = two boards (id) ---");
{
  const b = createBoard("soccer", "Dup");
  const j = portableToJsonString(serializeBoardToPortable(b));
  const a = parsePortableBoardJson(j);
  const c = parsePortableBoardJson(j);
  assert(a.id !== c.id, "distinct imports");
}

console.log("--- 7) end-swap then export ---");
{
  const b = createBoard("soccer");
  b.scenes[0] = swapSceneEnds(b.scenes[0]!);
  const r = roundTrip(b);
  assert(r.scenes[0]!.balls.length >= 1, "balls after swap");
}

console.log("--- 8) legacy localStorage-style board via migrate in envelope ---");
{
  const legacy = {
    format: PORTABLE_FORMAT_ID,
    schemaVersion: PORTABLE_SCHEMA_VERSION,
    board: {
      id: "old",
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
          id: "s",
          label: "A",
          phase: "custom",
          pieces: [] as Piece[],
          ball: { x: 0.33, y: 0.66 },
          objects: [],
          hideHalf: "none",
        },
      ],
      activeSceneId: "s",
    },
  };
  const r = parsePortableBoardJson(JSON.stringify(legacy));
  assert(r.scenes[0]!.balls.length === 1, "legacy ball→balls");
  assert(Math.abs(r.scenes[0]!.balls[0]!.x - 0.33) < 1e-9, "legacy xy");
}

console.log("--- 9) re-export after import ---");
{
  const b = createBoard("soccer", "再出力");
  const once = roundTrip(b);
  const twice = roundTrip(once);
  assert(twice.title === b.title, "title stable");
  assert(twice.scenes[0]!.balls.length === once.scenes[0]!.balls.length, "balls");
}

console.log("--- 10) envelope metadata ---");
{
  const p = serializeBoardToPortable(createBoard("soccer"));
  assert(p.format === PORTABLE_FORMAT_ID, "format");
  assert(p.schemaVersion === PORTABLE_SCHEMA_VERSION, "ver");
  assert(typeof p.exportedAt === "string", "exportedAt");
}

// silence unused
void migrateBoard;

console.log("board-json-roundtrip-check: OK");
