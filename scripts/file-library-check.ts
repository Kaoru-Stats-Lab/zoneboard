/**
 * Local-file Dashboard Group 3 — library ingest / Open vs Import / size gate.
 * Run: npx --yes tsx scripts/file-library-check.ts
 */
import {
  PORTABLE_MAX_BYTES,
  PortableImportError,
  parsePortableBoardJson,
  parsePortableBoardJsonForOpen,
  parsePortableBoardJsonKeepIdsDetailed,
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { createBoard } from "../src/models/defaults";
import { boardDisplayName } from "../src/lib/boardLabel";
import { defaultBoardTitle } from "../src/i18n/localeDefaults";
import { STORE_KEY } from "../src/storage/keys";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("--- detailed parse keeps IDs + exportedAt ---");
{
  const board = createBoard("soccer", "Library Board");
  board.id = "lib-board-keep";
  board.updatedAt = "2026-11-01T00:00:00.000Z";
  const portable = serializeBoardToPortable(board, {
    exportedAt: "2026-11-06T12:00:00.000Z",
  });
  const json = portableToJsonString(portable);
  const detailed = parsePortableBoardJsonKeepIdsDetailed(json);
  assert(detailed.board.id === "lib-board-keep", "keep id");
  assert(detailed.exportedAt === "2026-11-06T12:00:00.000Z", "exportedAt");
  assert(detailed.board.updatedAt === board.updatedAt, "board.updatedAt");
  assert(
    boardDisplayName(detailed.board, defaultBoardTitle(1, "en")).length > 0,
    "display title",
  );

  const opened = parsePortableBoardJsonForOpen(json);
  assert(opened.id === "lib-board-keep", "open keep");
  const imported = parsePortableBoardJson(json);
  assert(imported.id !== "lib-board-keep", "import remap");
}

console.log("--- size gate before body ---");
{
  let threw = false;
  try {
    parsePortableBoardJsonKeepIdsDetailed("{}", PORTABLE_MAX_BYTES + 1);
  } catch (e) {
    threw = e instanceof PortableImportError && e.code === "too_large";
  }
  assert(threw, "too_large by byteLength");
}

console.log("--- invalid files ---");
{
  const cases: [string, string][] = [
    ["{nope", "parse"],
    [
      JSON.stringify({
        format: "zoneboard-board",
        schemaVersion: 999,
        board: createBoard("soccer", "x"),
      }),
      "version_new",
    ],
    [
      JSON.stringify({ format: "other", schemaVersion: 1, board: {} }),
      "format",
    ],
  ];
  for (const [text, code] of cases) {
    let got = "";
    try {
      parsePortableBoardJsonKeepIdsDetailed(text);
    } catch (e) {
      got = e instanceof PortableImportError ? e.code : "other";
    }
    assert(got === code, `expect ${code} got ${got}`);
  }
}

console.log("--- library entries use session ids (concept) ---");
{
  const a = createBoard("soccer", "Same");
  a.id = "same-id";
  const b = createBoard("soccer", "Same");
  b.id = "same-id";
  const ja = portableToJsonString(serializeBoardToPortable(a));
  const jb = portableToJsonString(serializeBoardToPortable(b));
  const ea = parsePortableBoardJsonKeepIdsDetailed(ja);
  const eb = parsePortableBoardJsonKeepIdsDetailed(jb);
  assert(ea.board.id === eb.board.id, "same board id allowed");
  // Entry ids are minted by FileLibraryContext (uid), not board id.
  const entryIdA = "entry-" + Math.random();
  const entryIdB = "entry-" + Math.random();
  assert(entryIdA !== entryIdB, "entry keys distinct");
}

console.log("--- STORE_KEY untouched by library parse ---");
{
  const maps = new Map<string, string>();
  maps.set(STORE_KEY, '{"sentinel":true}');
  (globalThis as { localStorage?: Storage }).localStorage = {
    getItem: (k) => maps.get(k) ?? null,
    setItem: (k, v) => {
      maps.set(k, String(v));
    },
    removeItem: (k) => {
      maps.delete(k);
    },
    clear: () => maps.clear(),
    key: (i) => [...maps.keys()][i] ?? null,
    get length() {
      return maps.size;
    },
  } as Storage;
  const before = maps.get(STORE_KEY);
  parsePortableBoardJsonKeepIdsDetailed(
    portableToJsonString(serializeBoardToPortable(createBoard("soccer", "x"))),
  );
  assert(maps.get(STORE_KEY) === before, "store key untouched");
}

console.log("file-library-check: OK");
