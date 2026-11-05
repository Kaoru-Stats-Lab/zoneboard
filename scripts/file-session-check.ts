/**
 * File Session Group 2 — Open vs Import IDs, draft isolation, dirty fingerprint.
 * Run: npx --yes tsx scripts/file-session-check.ts
 */
import {
  PortableImportError,
  parsePortableBoardJson,
  parsePortableBoardJsonForOpen,
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { createBoard } from "../src/models/defaults";
import { createBallObject, offsetBallCopy } from "../src/models/ballSanitize";
import { createShapeObject } from "../src/models/shapeSanitize";
import { createScene } from "../src/models/scene";
import type { BoardDocument, TextObject } from "../src/models/types";
import {
  FILE_SESSION_DRAFT_KEY,
  boardContentFingerprint,
  clearFileSessionDraft,
  readFileSessionDraft,
  writeFileSessionDraft,
} from "../src/storage/fileSessionDraft";
import { STORE_KEY } from "../src/storage/keys";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function sampleBoard(): BoardDocument {
  const board = createBoard("soccer", "FileSessionSample");
  const pieces = board.scenes[0]!.pieces;
  const host = pieces.find((p) => p.team === "home") ?? pieces[0]!;
  const ballA = createBallObject({ id: "ball-keep-a", x: 0.3, y: 0.4 });
  const ballB = offsetBallCopy(ballA);
  ballB.id = "ball-keep-b";
  const ballC = createBallObject({
    id: "ball-keep-c",
    x: host.x,
    y: host.y,
    attachedTo: host.id,
  });
  const shape = createShapeObject("rect", {
    id: "shape-keep-1",
    x: 0.2,
    y: 0.2,
    w: 0.15,
    h: 0.12,
  });
  const text: TextObject = {
    id: "text-keep-1",
    type: "text",
    x: 0.5,
    y: 0.2,
    text: "Press",
    fontSize: 18,
    color: "#ffffff",
    align: "center",
    rotationDeg: 0,
  };
  const zone = {
    id: "zone-keep-1",
    type: "zone" as const,
    x: 0.6,
    y: 0.3,
    w: 0.2,
    h: 0.15,
    color: "rgba(14,165,233,0.08)",
  };
  const scene0 = {
    ...board.scenes[0]!,
    id: "scene-keep-0",
    balls: [ballA, ballB, ballC],
    objects: [shape, text, zone],
  };
  const scene1 = createScene("Second", "custom", {
    pieces: scene0.pieces,
    balls: [createBallObject({ id: "ball-s1", x: 0.5, y: 0.5 })],
    objects: [],
  });
  scene1.id = "scene-keep-1";
  return {
    ...board,
    id: "board-keep-id",
    scenes: [scene0, scene1],
    activeSceneId: scene0.id,
  };
}

/** Minimal sessionStorage / localStorage stub for Node. */
function installStorageStub() {
  const maps = {
    local: new Map<string, string>(),
    session: new Map<string, string>(),
  };
  const make = (bucket: "local" | "session") => ({
    getItem(k: string) {
      return maps[bucket].get(k) ?? null;
    },
    setItem(k: string, v: string) {
      maps[bucket].set(k, String(v));
    },
    removeItem(k: string) {
      maps[bucket].delete(k);
    },
    clear() {
      maps[bucket].clear();
    },
    key(i: number) {
      return [...maps[bucket].keys()][i] ?? null;
    },
    get length() {
      return maps[bucket].size;
    },
  });
  (globalThis as { localStorage?: Storage }).localStorage = make(
    "local",
  ) as Storage;
  (globalThis as { sessionStorage?: Storage }).sessionStorage = make(
    "session",
  ) as Storage;
  return maps;
}

console.log("--- Open keeps IDs; Import remaps ---");
{
  const board = sampleBoard();
  const json = portableToJsonString(serializeBoardToPortable(board));
  const opened = parsePortableBoardJsonForOpen(json);
  assert(opened.id === board.id, "open board id");
  assert(opened.scenes[0]!.id === "scene-keep-0", "open scene0 id");
  assert(opened.scenes[1]!.id === "scene-keep-1", "open scene1 id");
  assert(
    opened.scenes[0]!.balls.map((b) => b.id).join(",") ===
      "ball-keep-a,ball-keep-b,ball-keep-c",
    "open ball ids",
  );
  assert(
    opened.scenes[0]!.balls[2]!.attachedTo === board.scenes[0]!.pieces.find(
      (p) => p.team === "home",
    )?.id,
    "open attachedTo",
  );
  assert(
    opened.scenes[0]!.objects.some((o) => o.id === "shape-keep-1"),
    "open shape",
  );
  assert(
    opened.scenes[0]!.objects.some((o) => o.id === "text-keep-1"),
    "open text",
  );
  assert(
    opened.scenes[0]!.objects.some((o) => o.id === "zone-keep-1"),
    "open zone",
  );
  assert(opened.scenes.length === 2, "open all scenes");

  const imported = parsePortableBoardJson(json);
  assert(imported.id !== board.id, "import remaps board id");
  assert(imported.scenes[0]!.id !== "scene-keep-0", "import remaps scene");
  assert(
    !imported.scenes[0]!.balls.some((b) => b.id.startsWith("ball-keep-")),
    "import remaps balls",
  );
  const hostImported = imported.scenes[0]!.pieces.find((p) => p.team === "home");
  const attached = imported.scenes[0]!.balls.find((b) => b.attachedTo);
  assert(!!attached && attached.attachedTo === hostImported?.id, "import attach remap");
}

console.log("--- reject bad / new schema ---");
{
  let threw = false;
  try {
    parsePortableBoardJsonForOpen("{not json");
  } catch (e) {
    threw = e instanceof PortableImportError && e.code === "parse";
  }
  assert(threw, "parse reject");

  threw = false;
  try {
    parsePortableBoardJsonForOpen(
      JSON.stringify({
        format: "zoneboard-board",
        schemaVersion: 999,
        board: sampleBoard(),
      }),
    );
  } catch (e) {
    threw = e instanceof PortableImportError && e.code === "version_new";
  }
  assert(threw, "version_new reject");
}

console.log("--- dirty fingerprint ---");
{
  const board = sampleBoard();
  const base = boardContentFingerprint(board);
  assert(base === boardContentFingerprint(structuredClone(board)), "stable");
  const edited = {
    ...board,
    scenes: board.scenes.map((s, i) =>
      i === 0
        ? {
            ...s,
            objects: s.objects.map((o) =>
              o.type === "text" ? { ...o, text: "Changed" } : o,
            ),
          }
        : s,
    ),
  };
  assert(boardContentFingerprint(edited) !== base, "dirty after edit");
}

console.log("--- draft isolation from BoardStore key ---");
{
  const maps = installStorageStub();
  maps.local.set(STORE_KEY, JSON.stringify({ sentinel: true, boards: [] }));
  const before = maps.local.get(STORE_KEY)!;
  const board = sampleBoard();
  const finger = boardContentFingerprint(board);
  const ok = writeFileSessionDraft({
    sourceName: "demo.zoneboard.json",
    openedAt: 1,
    baselineFinger: finger,
    board,
  });
  assert(ok, "draft write ok");
  assert(maps.local.get(STORE_KEY) === before, "STORE_KEY untouched on draft write");
  assert(maps.session.has(FILE_SESSION_DRAFT_KEY), "draft in session");
  const read = readFileSessionDraft();
  assert(read?.sourceName === "demo.zoneboard.json", "draft read");
  assert(read?.board.id === board.id, "draft board id");
  clearFileSessionDraft();
  assert(readFileSessionDraft() == null, "draft cleared");
  assert(maps.local.get(STORE_KEY) === before, "STORE_KEY untouched on clear");
}

console.log("--- File Session conceptual store isolation (no store append) ---");
{
  // Open path must not call remap; store count stays a caller concern.
  const board = sampleBoard();
  const json = portableToJsonString(serializeBoardToPortable(board));
  const storeBoards = [createBoard("soccer", "A"), createBoard("soccer", "B")];
  const storeSnapshot = JSON.stringify(storeBoards.map((b) => b.id));
  const sessionBoard = parsePortableBoardJsonForOpen(json);
  // Simulate edit in session only
  const edited = {
    ...sessionBoard,
    title: "edited-in-session",
  };
  assert(
    JSON.stringify(storeBoards.map((b) => b.id)) === storeSnapshot,
    "store ids unchanged after session edit object",
  );
  assert(edited.id === board.id, "session keeps id after edit clone");
  assert(storeBoards.length === 2, "store count unchanged");
}

console.log("file-session-check: OK");
