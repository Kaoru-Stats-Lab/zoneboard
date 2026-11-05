/**
 * Group 6 Gate A (partial) — exercise writeBoardToFileHandle against a real OS
 * file via a Node-backed FileSystemFileHandle mock. Proves write→close→verify
 * updates disk bytes. Does NOT replace Chromium showDirectoryPicker UX.
 *
 * Run: npx --yes tsx scripts/qa-group6-os-save-check.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import {
  parsePortableBoardJsonForOpen,
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { contentFingerprintText } from "../src/lib/fileSystemAccess";
import {
  detectSaveConflict,
  writeBoardToFileHandle,
} from "../src/storage/directorySave";
import { boardContentFingerprint } from "../src/storage/fileSessionDraft";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const DIR = join(process.cwd(), "tmp", "qa-group6-os-save");
mkdirSync(DIR, { recursive: true });
const TARGET = join(DIR, "gate-a.zoneboard.json");
const BEFORE = join(DIR, "gate-a.before.zoneboard.json");

function makeHandle(path: string): FileSystemFileHandle {
  let aborted = false;
  return {
    kind: "file",
    name: "gate-a.zoneboard.json",
    async isSameEntry() {
      return false;
    },
    async queryPermission() {
      return "granted";
    },
    async requestPermission() {
      return "granted";
    },
    async getFile() {
      const buf = readFileSync(path);
      return new File([buf], "gate-a.zoneboard.json", {
        type: "application/json",
        lastModified: Date.now(),
      });
    },
    async createWritable() {
      aborted = false;
      const chunks: string[] = [];
      const stream = {
        async write(data: string | BufferSource | Blob | { type?: string; data?: unknown }) {
          if (aborted) throw new Error("aborted");
          if (typeof data === "string") chunks.push(data);
          else if (data instanceof Blob) chunks.push(await data.text());
          else if (data && typeof data === "object" && "data" in data && typeof data.data === "string") {
            chunks.push(data.data);
          } else {
            throw new Error("unsupported chunk");
          }
        },
        async close() {
          if (aborted) throw new Error("aborted");
          writeFileSync(path, chunks.join(""), "utf8");
        },
        async abort() {
          aborted = true;
        },
        async seek() {},
        async truncate() {},
        locked: false,
        getWriter() {
          throw new Error("unused");
        },
        abort: async () => {
          aborted = true;
        },
      };
      return stream as unknown as FileSystemWritableFileStream;
    },
  } as unknown as FileSystemFileHandle;
}

// Seed from fixture if present, else minimal.
const fixture = join(process.cwd(), "tmp", "qa-group6", "board-alpha.zoneboard.json");
let seedText: string;
if (existsSync(fixture)) {
  seedText = readFileSync(fixture, "utf8");
} else {
  throw new Error("run qa-group6-fixtures.ts first");
}
writeFileSync(TARGET, seedText, "utf8");
writeFileSync(BEFORE, seedText, "utf8");

const opened = parsePortableBoardJsonForOpen(seedText);
const openSnap = {
  name: "gate-a.zoneboard.json",
  size: Buffer.byteLength(seedText, "utf8"),
  lastModified: Date.now(),
  contentFinger: contentFingerprintText(seedText),
};

// Edit board (simulate File Session dirty)
opened.title = "QA Alpha SAVED";
const textObj = opened.scenes[0]!.objects.find((o) => o.type === "text");
if (textObj && textObj.type === "text") textObj.text = "SAVED ON DISK";
const shape = opened.scenes[0]!.objects.find(
  (o) => o.type === "shape" && o.id.includes("rect"),
);
if (shape && shape.type === "shape") shape.fillColor = "#111111";

const handle = makeHandle(TARGET);
const result = await writeBoardToFileHandle(handle, opened, {
  openedSnapshot: openSnap,
});
assert(result.ok === true, "save ok");

const afterText = readFileSync(TARGET, "utf8");
const beforeText = readFileSync(BEFORE, "utf8");
assert(afterText !== beforeText, "OS file bytes changed");
const reopened = parsePortableBoardJsonForOpen(afterText);
assert(reopened.title === "QA Alpha SAVED", "title persisted");
assert(
  reopened.scenes[0]!.objects.some(
    (o) => o.type === "text" && o.text === "SAVED ON DISK",
  ),
  "text persisted",
);
assert(
  reopened.scenes[0]!.objects.some(
    (o) => o.type === "shape" && o.fillColor === "#111111",
  ),
  "shape fillColor persisted",
);
assert(reopened.id === opened.id, "board id kept");
assert(
  boardContentFingerprint(reopened) === boardContentFingerprint(opened),
  "content finger match",
);

// Conflict: same size different content
{
  const a = '{"pad":"aaaa","v":1}';
  const b = '{"pad":"bbbb","v":2}';
  assert(a.length === b.length, "same length");
  const kind = detectSaveConflict(
    {
      name: "x",
      size: a.length,
      lastModified: 1,
      contentFinger: contentFingerprintText(a),
    },
    {
      name: "x",
      size: b.length,
      lastModified: 1,
      contentFinger: contentFingerprintText(b),
    },
  );
  assert(kind === "content", "same-size content conflict");
}

// Permission denied path
{
  const denied = {
    ...makeHandle(TARGET),
    async queryPermission() {
      return "denied" as PermissionState;
    },
    async requestPermission() {
      return "denied" as PermissionState;
    },
  } as FileSystemFileHandle;
  const r = await writeBoardToFileHandle(denied, opened, {
    openedSnapshot: openSnap,
    allowOverwriteConflict: true,
  });
  assert(r.ok === false && r.reason === "permission_denied", "permission denied");
}

// Cleanup target optional — keep for manual inspect
console.log(`updated OS file: ${TARGET}`);
console.log("qa-group6-os-save-check: OK");
