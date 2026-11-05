/**
 * Final QA — real portable JSON files, sizes, abnormal inputs, ID refs.
 * Does NOT touch localStorage / user boards.
 * Run: npx --yes tsx scripts/board-json-final-qa.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PORTABLE_FORMAT_ID,
  PORTABLE_MAX_BYTES,
  PORTABLE_SCHEMA_VERSION,
  PortableImportError,
  parsePortableBoardJson,
  portableBoardFilename,
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { createBoard } from "../src/models/defaults";
import { createBallObject, offsetBallCopy } from "../src/models/ballSanitize";
import { createShapeObject } from "../src/models/shapeSanitize";
import { createScene, swapSceneEnds } from "../src/models/scene";
import { arrangeDrawObject } from "../src/canvas/shapeArrange";
import { uid } from "../src/models/id";
import { HOME_COLOR, AWAY_COLOR } from "../src/models/types";
import type {
  BoardDocument,
  Piece,
  Scene,
  TextObject,
} from "../src/models/types";
import { formationPieces } from "../src/presets/formations";
import { defaultKitPalette } from "../src/models/kits";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "_qa-json-out");
fs.mkdirSync(OUT, { recursive: true });

function writeJson(name: string, board: BoardDocument): { file: string; bytes: number; json: string } {
  const portable = serializeBoardToPortable(board);
  const json = portableToJsonString(portable);
  const file = path.join(OUT, name);
  fs.writeFileSync(file, json, "utf8");
  const bytes = Buffer.byteLength(json, "utf8");
  return { file, bytes, json };
}

function makePiece(
  team: "home" | "away",
  number: string,
  x: number,
  y: number,
): Piece {
  return {
    id: uid(),
    x,
    y,
    number,
    label: team === "home" ? `H${number}` : `A${number}`,
    color: team === "home" ? HOME_COLOR : AWAY_COLOR,
    team,
    facing: team === "home" ? 0 : 180,
    role: "starter",
  };
}

/** Full QA board: 3 scenes, 22 XI, 3 balls, shapes, text, zone, lines, link, match data */
function buildQaBoard(): BoardDocument {
  const board = createBoard("soccer", "QA JSON Roundtrip", "en");
  board.matchLabel = "QA JSON Roundtrip";
  board.homeTeam = "QA Home";
  board.awayTeam = "QA Away";
  board.soccerPitchSurface = "grass";
  board.showLanes5 = true;
  board.showPlayerNames = true;
  board.pieceScale = 1;

  const kits = defaultKitPalette();
  const xi = formationPieces("soccer", true, board.benchCount, kits, "landscape");
  // Prefer 22 field pieces from formation; pad if short
  let pieces = xi.filter((p) => p.role === "starter").slice(0, 22);
  while (pieces.length < 22) {
    const n = String(pieces.length + 1);
    pieces.push(
      makePiece(pieces.length % 2 === 0 ? "home" : "away", n, 0.2 + pieces.length * 0.02, 0.5),
    );
  }

  const host = pieces.find((p) => p.team === "home")!;
  const ballA = createBallObject({ x: 0.35, y: 0.45 });
  const ballB = offsetBallCopy(ballA);
  const ballC = createBallObject({
    x: host.x,
    y: host.y,
    attachedTo: host.id,
  });

  const tri1 = createShapeObject("triangle", {
    x: 0.15,
    y: 0.2,
    w: 0.14,
    h: 0.14,
    fillColor: "#fde047",
    fillOpacity: 0.4,
    rotationDeg: 25,
  });
  const circ = createShapeObject("circle", {
    x: 0.4,
    y: 0.22,
    w: 0.12,
    h: 0.12,
    fillColor: "#93c5fd",
    fillOpacity: 0.55,
  });
  const rect = createShapeObject("rect", {
    x: 0.6,
    y: 0.18,
    w: 0.18,
    h: 0.1,
    fillColor: "#f472b6",
    fillOpacity: 0.35,
    rotationDeg: 10,
  });
  const tri2 = createShapeObject("triangle", {
    x: 0.55,
    y: 0.55,
    w: 0.1,
    h: 0.1,
    fillColor: "#ffffff",
    fillOpacity: 0.3,
    rotationDeg: 180,
  });

  let objects: Scene["objects"] = [
    {
      id: uid(),
      type: "zone",
      x: 0.72,
      y: 0.35,
      w: 0.18,
      h: 0.14,
      color: "rgba(14,165,233,0.08)",
      strokeColor: "#0284c7",
    },
    tri1,
    circ,
    rect,
    tri2,
    {
      id: uid(),
      type: "text",
      x: 0.08,
      y: 0.08,
      text: "ハイプレス\nHigh Press",
      color: "#ffffff",
      fontSize: 0.038,
      width: 0.28,
      rotationDeg: 12,
      align: "center",
    } satisfies TextObject,
    {
      id: uid(),
      type: "text",
      x: 0.7,
      y: 0.75,
      text: "Rotated EN",
      color: "#fde047",
      fontSize: 0.032,
      width: 0.22,
      rotationDeg: 270,
      align: "left",
    } satisfies TextObject,
    {
      id: uid(),
      type: "line",
      kind: "pass",
      points: [
        { x: 0.3, y: 0.5 },
        { x: 0.45, y: 0.4 },
      ],
      color: "#2563eb",
      strokeWidth: 2,
    },
    {
      id: uid(),
      type: "line",
      kind: "run",
      points: [
        { x: 0.5, y: 0.6 },
        { x: 0.62, y: 0.55 },
        { x: 0.7, y: 0.5 },
      ],
      color: "#059669",
      strokeWidth: 2,
    },
    {
      id: uid(),
      type: "line",
      kind: "dribble",
      points: [
        { x: 0.25, y: 0.65 },
        { x: 0.35, y: 0.7 },
      ],
      color: "#ea580c",
      strokeWidth: 2,
    },
    {
      id: uid(),
      type: "link",
      pieceIds: pieces.slice(0, 4).map((p) => p.id),
      color: "#111111",
      strokeWidth: 2,
    },
  ];

  // Arrange: bring last triangle to front (mutate order)
  const arranged = arrangeDrawObject(objects, tri2.id, "front");
  if (arranged) objects = arranged;

  const sceneA: Scene = {
    ...board.scenes[0]!,
    label: "Kickoff",
    phase: "pre",
    pieces,
    balls: [ballA, ballB, ballC],
    objects,
  };

  const sceneB = createScene("Attack", "live", {
    pieces: structuredClone(pieces).map((p) => ({
      ...p,
      x: Math.min(0.95, p.x + 0.05),
    })),
    balls: [createBallObject({ x: 0.7, y: 0.4 })],
    objects: [
      createShapeObject("rect", {
        x: 0.5,
        y: 0.3,
        w: 0.2,
        h: 0.15,
        fillColor: "#fdba74",
        fillOpacity: 0.4,
      }),
    ],
  });

  const sceneC = swapSceneEnds(
    createScene("End-swap check", "custom", {
      pieces: structuredClone(pieces),
      balls: [
        createBallObject({ x: 0.2, y: 0.2 }),
        createBallObject({ x: 0.8, y: 0.8 }),
      ],
      objects: [],
    }),
  );

  board.scenes = [sceneA, sceneB, sceneC];
  board.activeSceneId = sceneA.id;
  board.goals = [
    {
      id: uid(),
      team: "home",
      scorer: "9",
      kind: "normal",
      minute: "23",
    },
  ];
  board.cards = [
    { id: uid(), team: "away", player: "6", kind: "YC", minute: "40" },
  ];
  board.subs = [
    {
      id: uid(),
      team: "home",
      outNumber: "8",
      inNumber: "14",
      minute: "60",
    },
  ];
  board.roster = {
    home: {
      players: pieces
        .filter((p) => p.team === "home")
        .map((p) => ({ number: p.number, label: p.label })),
      starterNumbers: pieces
        .filter((p) => p.team === "home")
        .map((p) => p.number),
    },
    away: {
      players: pieces
        .filter((p) => p.team === "away")
        .map((p) => ({ number: p.number, label: p.label })),
      starterNumbers: pieces
        .filter((p) => p.team === "away")
        .map((p) => p.number),
    },
  };
  board.viewportTemplates = [
    {
      id: uid(),
      label: "QA view",
      viewport: { zoom: 1.4, cx: 0.7, cy: 0.5 },
    },
  ];

  return board;
}

/** Drawable semantic fingerprint (ignore ids / timestamps) */
function fingerprint(board: BoardDocument): string {
  const scenes = board.scenes.map((s) => ({
    label: s.label,
    phase: s.phase,
    hideHalf: s.hideHalf,
    pieces: s.pieces.map((p) =>
      [p.team, p.number, p.x.toFixed(4), p.y.toFixed(4), p.facing, p.role].join(
        ":",
      ),
    ),
    balls: s.balls.map((b) => {
      const host = b.attachedTo
        ? s.pieces.find((p) => p.id === b.attachedTo)
        : null;
      return [
        b.x.toFixed(4),
        b.y.toFixed(4),
        host ? `${host.team}${host.number}` : "-",
      ].join(":");
    }),
    objects: s.objects.map((o) => {
      if (o.type === "shape") {
        return [
          "shape",
          o.kind,
          o.x.toFixed(4),
          o.y.toFixed(4),
          o.w.toFixed(4),
          o.h.toFixed(4),
          String(o.rotationDeg ?? 0),
          o.fillColor,
          o.fillOpacity,
          String(o.strokeEnabled !== false),
        ].join(":");
      }
      if (o.type === "text") {
        return [
          "text",
          o.text,
          o.x.toFixed(4),
          o.y.toFixed(4),
          String(o.width ?? ""),
          String(o.rotationDeg ?? 0),
          o.align ?? "left",
          o.color,
        ].join(":");
      }
      if (o.type === "zone") {
        return ["zone", o.x, o.y, o.w, o.h].join(":");
      }
      if (o.type === "line") {
        return [
          "line",
          o.kind,
          o.points.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(";"),
        ].join(":");
      }
      if (o.type === "link") {
        const nums = o.pieceIds
          .map((id) => s.pieces.find((p) => p.id === id))
          .filter(Boolean)
          .map((p) => `${p!.team}${p!.number}`)
          .join(",");
        return `link:${nums}`;
      }
      return o.type;
    }),
  }));
  return JSON.stringify({
    title: board.title,
    matchLabel: board.matchLabel,
    surface: board.soccerPitchSurface,
    lanes: board.showLanes5,
    goals: board.goals.map((g) => [g.team, g.scorer, g.kind, g.minute]),
    cards: board.cards.map((c) => [c.team, c.player, c.kind]),
    subs: board.subs.map((s) => [s.team, s.outNumber, s.inNumber]),
    rosterHome: board.roster.home.starterNumbers,
    scenes,
  });
}

const results: Record<string, string> = {};

console.log("=== Final QA: Portable Board JSON ===\n");

// --- sizes ---
const empty = createBoard("soccer", "Empty-ish");
empty.scenes = [
  createScene("only", "custom", {
    pieces: [],
    balls: [createBallObject()],
    objects: [],
  }),
];
empty.activeSceneId = empty.scenes[0]!.id;
const emptyW = writeJson("01-empty.zoneboard.json", empty);

const mid = createBoard("soccer", "Typical XI");
const midW = writeJson("02-typical.zoneboard.json", mid);

const qa = buildQaBoard();
const expectedName = portableBoardFilename(qa.matchLabel);
assert(expectedName === "QA JSON Roundtrip.zoneboard.json", "filename");
const qaW = writeJson(expectedName, qa);

results.sizes = JSON.stringify(
  {
    emptyBytes: emptyW.bytes,
    typicalBytes: midW.bytes,
    qaBytes: qaW.bytes,
    limit: PORTABLE_MAX_BYTES,
    emptyOk: emptyW.bytes < PORTABLE_MAX_BYTES,
    typicalOk: midW.bytes < PORTABLE_MAX_BYTES,
    qaOk: qaW.bytes < PORTABLE_MAX_BYTES,
  },
  null,
  2,
);
console.log("--- File sizes ---");
console.log(results.sizes);

// --- envelope ---
const parsedEnv = JSON.parse(qaW.json);
assert(parsedEnv.format === PORTABLE_FORMAT_ID, "format");
assert(parsedEnv.schemaVersion === PORTABLE_SCHEMA_VERSION, "schema");
assert(Array.isArray(parsedEnv.board.scenes) && parsedEnv.board.scenes.length === 3, "3 scenes");
assert(
  parsedEnv.board.scenes[0].balls.length === 3,
  "balls[] in file",
);
assert(!("tool" in parsedEnv.board), "no tool");
assert(!("history" in parsedEnv), "no history");
console.log("--- Envelope / content: OK ---");

// --- round-trip semantic ---
const restored = parsePortableBoardJson(qaW.json);
assert(restored.id !== qa.id, "new board id");
assert(fingerprint(qa) === fingerprint(restored), "drawable fingerprint");
assert(restored.scenes[0]!.balls.length === 3, "3 balls restored");
const att = restored.scenes[0]!.balls.filter((b) => b.attachedTo);
assert(att.length === 1, "1 attached");
const hostOk = restored.scenes[0]!.pieces.some((p) => p.id === att[0]!.attachedTo);
assert(hostOk, "attachedTo valid piece");
const link = restored.scenes[0]!.objects.find((o) => o.type === "link");
assert(link?.type === "link" && link.pieceIds.length === 4, "link remapped");
assert(
  link!.pieceIds.every((id) =>
    restored.scenes[0]!.pieces.some((p) => p.id === id),
  ),
  "link pieceIds exist",
);
assert(restored.viewportTemplates?.length === 1, "viewportTemplates");
assert(restored.goals[0]?.scorer === "9", "goal scorer string");
console.log("--- Round-trip semantic: OK ---");

// --- double import ---
const again = parsePortableBoardJson(qaW.json);
assert(again.id !== restored.id, "second import distinct");
assert(fingerprint(again) === fingerprint(restored), "same semantics");
console.log("--- Double import: OK ---");

// --- original unchanged ---
const origAttach = qa.scenes[0]!.balls.find((b) => b.attachedTo)?.attachedTo;
assert(!!origAttach, "qa has attached ball");
assert(
  qa.scenes[0]!.pieces.some((p) => p.id === origAttach),
  "original attach intact",
);
const qaJson2 = portableToJsonString(serializeBoardToPortable(qa));
assert(qaJson2.includes(origAttach!), "re-export still has original piece id");
assert(fingerprint(qa) === fingerprint(parsePortableBoardJson(qaW.json)), "src unchanged vs first restore semantics");
console.log("--- Export non-mutating: OK ---");

// --- dangling attachedTo ---
{
  const b = createBoard("soccer");
  b.scenes[0]!.balls = [
    createBallObject({ x: 0.5, y: 0.5, attachedTo: "missing-piece" }),
  ];
  const r = parsePortableBoardJson(
    portableToJsonString(serializeBoardToPortable(b)),
  );
  assert(r.scenes[0]!.balls[0]!.attachedTo === null, "dangling → null");
  console.log("--- Dangling attachedTo: OK ---");
}

// --- duplicate ids in source ---
{
  const b = createBoard("soccer");
  const p = b.scenes[0]!.pieces[0];
  if (p) {
    b.scenes[0]!.pieces.push({ ...p }); // same id twice — remap should uniquify
  }
  const r = parsePortableBoardJson(
    portableToJsonString(serializeBoardToPortable(b)),
  );
  const ids = r.scenes[0]!.pieces.map((x) => x.id);
  assert(new Set(ids).size === ids.length, "piece ids unique after remap");
  console.log("--- Duplicate piece ids: OK ---");
}

// --- abnormal files ---
const abnormal: string[] = [];
function expectErr(label: string, fn: () => void, code: string) {
  try {
    fn();
    throw new Error(`${label}: expected ${code}`);
  } catch (e) {
    assert(
      e instanceof PortableImportError && e.code === code,
      `${label}: got ${(e as Error).message}`,
    );
    abnormal.push(`${label}=${code}`);
  }
}
expectErr("not-json", () => parsePortableBoardJson("hello"), "parse");
expectErr("broken", () => parsePortableBoardJson('{"format":'), "parse");
expectErr(
  "format",
  () =>
    parsePortableBoardJson(
      JSON.stringify({ format: "x", schemaVersion: 1, board: {} }),
    ),
  "format",
);
expectErr(
  "version",
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
expectErr(
  "structure",
  () =>
    parsePortableBoardJson(
      JSON.stringify({
        format: PORTABLE_FORMAT_ID,
        schemaVersion: 1,
        board: { not: "a board" },
      }),
    ),
  "structure",
);
expectErr(
  "size",
  () => parsePortableBoardJson("x".repeat(PORTABLE_MAX_BYTES + 10)),
  "too_large",
);
console.log("--- Abnormal:", abnormal.join(", "), "---");

// --- unknown shape kind ---
{
  const b = createBoard("soccer");
  b.scenes[0]!.objects = [
    {
      id: "hex",
      type: "shape",
      kind: "hexagon",
      x: 0.1,
      y: 0.1,
      w: 0.1,
      h: 0.1,
      fillColor: "#fff",
      fillOpacity: 0.3,
    } as never,
  ];
  const r = parsePortableBoardJson(
    portableToJsonString(serializeBoardToPortable(b)),
  );
  const hex = r.scenes[0]!.objects.find(
    (o) => o.type === "shape" && (o as { kind: string }).kind === "hexagon",
  );
  assert(!!hex, "unknown kind kept");
  console.log("--- Unknown ShapeKind: OK ---");
}

// summary file
fs.writeFileSync(
  path.join(OUT, "QA-SUMMARY.json"),
  JSON.stringify(
    {
      outDir: OUT,
      files: fs.readdirSync(OUT),
      sizes: JSON.parse(results.sizes),
      fingerprintMatch: true,
      expectedFilename: expectedName,
    },
    null,
    2,
  ),
  "utf8",
);

console.log("\nArtifacts:", OUT);
console.log("board-json-final-qa: OK");
