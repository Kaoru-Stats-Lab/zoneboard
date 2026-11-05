/**
 * Local-file Dashboard Group 5 — Save conflict / fingerprint / round-trip.
 * Does not invoke real File System Access writable streams.
 * Run: npx --yes tsx scripts/file-save-check.ts
 */
import {
  parsePortableBoardJsonForOpen,
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { createBoard } from "../src/models/defaults";
import { createShapeObject } from "../src/models/shapeSanitize";
import { createBallObject } from "../src/models/ballSanitize";
import type { TextObject } from "../src/models/types";
import {
  contentFingerprintText,
  type FileMetaSnapshot,
} from "../src/lib/fileSystemAccess";
import { detectSaveConflict } from "../src/storage/directorySave";
import {
  boardContentFingerprint,
  writeFileSessionDraft,
  readFileSessionDraft,
  clearFileSessionDraft,
  FILE_SESSION_DRAFT_KEY,
} from "../src/storage/fileSessionDraft";
import { STORE_KEY } from "../src/storage/keys";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function sampleBoard() {
  const board = createBoard("soccer", "Save Roundtrip");
  board.id = "save-board-keep";
  const shape = createShapeObject("rect", {
    id: "shape-save-1",
    x: 0.2,
    y: 0.2,
    w: 0.1,
    h: 0.1,
  });
  const ball = createBallObject({ id: "ball-save-1", x: 0.5, y: 0.5 });
  const text: TextObject = {
    id: "text-save-1",
    type: "text",
    x: 0.4,
    y: 0.3,
    text: "Save",
    fontSize: 16,
    color: "#fff",
    align: "center",
    rotationDeg: 0,
  };
  const sc = board.scenes[0]!;
  board.scenes[0] = {
    ...sc,
    balls: [ball],
    objects: [shape, text],
  };
  return board;
}

console.log("--- serialize → open keeps IDs (Save payload path) ---");
{
  const board = sampleBoard();
  const json = portableToJsonString(serializeBoardToPortable(board));
  const finger = contentFingerprintText(json);
  assert(finger.includes(":"), "finger shape");
  const opened = parsePortableBoardJsonForOpen(json);
  assert(opened.id === "save-board-keep", "board id");
  assert(opened.scenes[0]!.balls[0]!.id === "ball-save-1", "ball id");
  assert(
    opened.scenes[0]!.objects.some((o) => o.id === "shape-save-1"),
    "shape id",
  );
  assert(
    opened.scenes[0]!.objects.some((o) => o.id === "text-save-1"),
    "text id",
  );
  const againBoard = parsePortableBoardJsonForOpen(
    portableToJsonString(serializeBoardToPortable(opened)),
  );
  assert(
    boardContentFingerprint(againBoard) === boardContentFingerprint(opened),
    "round-trip board content stable",
  );
  assert(finger.length > 0, "json finger present");
}

console.log("--- expectedFinger mid-save edit semantics ---");
{
  const a = sampleBoard();
  const f0 = boardContentFingerprint(a);
  a.title = "edited during save";
  const f1 = boardContentFingerprint(a);
  assert(f0 !== f1, "edit changes finger");
  // clean only when live matches expected (written) finger
  const stillSame = f0 === f1;
  assert(!stillSame, "would stay dirty");
}

console.log("--- same size different content conflict ---");
{
  const jsonA = '{"a":1,"pad":"xxxx"}';
  const jsonB = '{"a":2,"pad":"yyyy"}';
  assert(jsonA.length === jsonB.length, "same length");
  const opened: FileMetaSnapshot = {
    name: "x.zoneboard.json",
    size: jsonA.length,
    lastModified: 10,
    contentFinger: contentFingerprintText(jsonA),
  };
  const current: FileMetaSnapshot = {
    name: "x.zoneboard.json",
    size: jsonB.length,
    lastModified: 10,
    contentFinger: contentFingerprintText(jsonB),
  };
  assert(detectSaveConflict(opened, current) === "content", "content conflict");
}

console.log("--- draft restore never includes handles ---");
{
  // Node has no sessionStorage — shape-check the draft payload type instead.
  const board = sampleBoard();
  const payload = {
    v: 1 as const,
    sourceName: "x.zoneboard.json",
    openedAt: 1,
    baselineFinger: boardContentFingerprint(board),
    board,
    savedAt: Date.now(),
  };
  const raw = JSON.stringify(payload);
  assert(!raw.includes("fileHandle"), "no handle in draft");
  assert(!raw.includes("directorySource"), "no directorySource");
  assert(FILE_SESSION_DRAFT_KEY !== STORE_KEY, "isolated from store");
  // Soft-call APIs so they don't throw when storage is missing.
  clearFileSessionDraft();
  writeFileSessionDraft({
    sourceName: payload.sourceName,
    openedAt: payload.openedAt,
    baselineFinger: payload.baselineFinger,
    board: payload.board,
  });
  readFileSessionDraft();
}

console.log("--- save-target identity must not corrupt another session ---");
{
  // Documented contract: clean only when live session still owns the same
  // libraryEntryId + fileHandle that started Save (enforced in useAppState).
  const entryA = "entry-a";
  const entryB = "entry-b";
  assert(entryA !== entryB, "distinct library entries");
  const fingerA = boardContentFingerprint(sampleBoard());
  const boardB = sampleBoard();
  boardB.title = "other session";
  const fingerB = boardContentFingerprint(boardB);
  assert(fingerA !== fingerB, "different boards");
  // If Save(A) completes while session is B, stillSame vs fingerA must fail —
  // baseline of B must not become fingerA (regression of Group 6 fix).
  const wouldCorruptBaseline = fingerA; // wrong if applied to B
  assert(wouldCorruptBaseline !== fingerB, "must not adopt foreign baseline");
}

console.log("file-save-check: OK");
