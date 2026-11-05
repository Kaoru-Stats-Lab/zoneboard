/**
 * Group 6 — File Session draft restore shape + store isolation.
 * Run: npx --yes tsx scripts/qa-group6-draft-restore-check.ts
 */
import { createBoard } from "../src/models/defaults";
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

const maps = {
  local: new Map<string, string>(),
  session: new Map<string, string>(),
};
function install(bucket: "local" | "session") {
  return {
    getItem: (k: string) => maps[bucket].get(k) ?? null,
    setItem: (k: string, v: string) => maps[bucket].set(k, String(v)),
    removeItem: (k: string) => maps[bucket].delete(k),
    clear: () => maps[bucket].clear(),
    key: (i: number) => [...maps[bucket].keys()][i] ?? null,
    get length() {
      return maps[bucket].size;
    },
  } as Storage;
}
(globalThis as { localStorage?: Storage }).localStorage = install("local");
(globalThis as { sessionStorage?: Storage }).sessionStorage = install("session");

const board = createBoard("soccer", "Draft QA", "en");
board.title = "edited draft";
const baseline = boardContentFingerprint(createBoard("soccer", "Draft QA", "en"));
assert(
  writeFileSessionDraft({
    sourceName: "x.zoneboard.json",
    openedAt: 1,
    baselineFinger: baseline,
    board,
  }),
  "draft write",
);
assert(maps.local.size === 0, "localStorage untouched");
assert(maps.session.has(FILE_SESSION_DRAFT_KEY), "session draft present");
assert(!maps.session.has(STORE_KEY), "store key not in session");
const draft = readFileSessionDraft();
assert(draft != null, "read draft");
assert(draft!.sourceName === "x.zoneboard.json", "name");
assert(!JSON.stringify(draft).includes("fileHandle"), "no handle");
assert(!JSON.stringify(draft).includes("directorySource"), "no dir source");
clearFileSessionDraft();
assert(readFileSessionDraft() == null, "discard");

console.log("qa-group6-draft-restore-check: OK");
