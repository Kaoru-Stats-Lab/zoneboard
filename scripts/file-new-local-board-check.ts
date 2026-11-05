/**
 * Group 8 — New local board: factory, neverSaved dirty, draft flag, Store isolation.
 * Run: npx --yes tsx scripts/file-new-local-board-check.ts
 */
import {
  portableToJsonString,
  serializeBoardToPortable,
  parsePortableBoardJsonForOpen,
} from "../src/boardio";
import { createBoard } from "../src/models/defaults";
import { messages, type Locale } from "../src/i18n/messages";
import { defaultBoardTitle } from "../src/i18n/localeDefaults";
import { STORE_KEY } from "../src/storage/keys";
import {
  FILE_SESSION_DRAFT_KEY,
  boardContentFingerprint,
  clearFileSessionDraft,
  isFileSessionContentDirty,
  readFileSessionDraft,
  writeFileSessionDraft,
} from "../src/storage/fileSessionDraft";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

/** Minimal sessionStorage stub for Node. */
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
}

installStorageStub();

console.log("--- createBoard factory (not a Store clone) ---");
{
  const a = createBoard("soccer", defaultBoardTitle(1, "en"), "en");
  const b = createBoard("soccer", defaultBoardTitle(1, "en"), "en");
  assert(a.id !== b.id, "unique ids");
  assert(a.scenes.length >= 1, "has scene");
  assert(a.scenes[0]!.balls.length >= 1 || a.scenes[0]!.pieces.length >= 0, "scene body");
  assert(typeof a.title === "string" && a.title.length > 0, "title");
  const json = portableToJsonString(serializeBoardToPortable(a));
  const reopened = parsePortableBoardJsonForOpen(json);
  assert(reopened.id === a.id, "round-trip keeps id");
}

console.log("--- neverSaved dirty semantics ---");
{
  const board = createBoard("soccer", "Board 1", "en");
  const baseline = boardContentFingerprint(board);
  assert(
    isFileSessionContentDirty(board, baseline, true) === true,
    "neverSaved stays dirty at baseline",
  );
  assert(
    isFileSessionContentDirty(board, baseline, false) === false,
    "opened clean at baseline",
  );
  const edited = {
    ...board,
    title: "Edited",
  };
  assert(
    isFileSessionContentDirty(edited, baseline, false) === true,
    "opened dirty when edited",
  );
  assert(
    isFileSessionContentDirty(edited, baseline, true) === true,
    "neverSaved dirty when edited",
  );
  // Undo back to baseline while neverSaved
  assert(
    isFileSessionContentDirty(board, baseline, true) === true,
    "undo to initial still unsaved",
  );
}

console.log("--- draft persists neverSavedToFile ---");
{
  clearFileSessionDraft();
  const board = createBoard("soccer", "DraftNew", "ja");
  const baseline = boardContentFingerprint(board);
  const ok = writeFileSessionDraft({
    sourceName: "untitled.zoneboard.json",
    openedAt: 1,
    baselineFinger: baseline,
    board,
    neverSavedToFile: true,
  });
  assert(ok, "write draft");
  const draft = readFileSessionDraft();
  assert(draft != null, "read draft");
  assert(draft!.neverSavedToFile === true, "flag round-trip");
  assert(
    isFileSessionContentDirty(
      draft!.board,
      draft!.baselineFinger,
      draft!.neverSavedToFile === true,
    ),
    "restore stays unsaved",
  );
  clearFileSessionDraft();
  assert(readFileSessionDraft() == null, "cleared");
}

console.log("--- Store key isolation ---");
{
  assert(
    FILE_SESSION_DRAFT_KEY !== STORE_KEY,
    "draft key ≠ store key",
  );
}

console.log("--- i18n New board keys ---");
{
  const keys = [
    "filesNewBoardShort",
    "filesNewBoardHint",
    "filesNewLocalBoard",
    "filesNotSavedYet",
    "filesSaveToFolderShort",
    "filesSaveToFolderHint",
  ] as const;
  for (const loc of Object.keys(messages) as Locale[]) {
    for (const k of keys) {
      const v = messages[loc][k];
      assert(typeof v === "string" && v.length > 0, `${loc}.${k}`);
    }
  }
  assert(messages.en.filesNewBoardShort === "New board", "en New board");
  assert(messages.en.filesNotSavedYet === "Not saved yet", "en not saved");
  assert(
    messages.en.filesSaveToFolderShort === "Save to folder",
    "en save to folder",
  );
  assert(messages.ja.filesNewLocalBoard.includes("ローカル"), "ja local");
}

console.log("file-new-local-board-check: OK");
