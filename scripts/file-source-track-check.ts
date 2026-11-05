/**
 * Group 6 add-on — Directory source tracking through Open → Save eligibility.
 * Run: npx --yes tsx scripts/file-source-track-check.ts
 */
import {
  buildDirectorySourceForOpen,
  mergeDirectoryListingIntoEntries,
  sourceLabelKind,
  type FileLibrarySource,
} from "../src/storage/fileLibrarySource";
import { contentFingerprintText } from "../src/lib/fileSystemAccess";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const fakeHandle = { name: "a.zoneboard.json" } as FileSystemFileHandle;

console.log("--- sourceLabelKind ---");
{
  assert(
    sourceLabelKind({ kind: "selected-file" }) === "selected-file",
    "selected",
  );
  assert(
    sourceLabelKind({
      kind: "directory-file",
      fileHandle: fakeHandle,
      directorySessionId: "dir-1",
    }) === "directory-file",
    "directory",
  );
}

console.log("--- buildDirectorySourceForOpen ---");
{
  const selected = buildDirectorySourceForOpen({
    id: "sel-1",
    fileName: "a.zoneboard.json",
    byteSize: 10,
    source: { kind: "selected-file" },
  });
  assert(selected === null, "selected → no directorySource (no Save)");

  const snap = {
    name: "a.zoneboard.json",
    size: 10,
    lastModified: 99,
    contentFinger: contentFingerprintText("{}"),
  };
  const dirSrc: FileLibrarySource = {
    kind: "directory-file",
    fileHandle: fakeHandle,
    directorySessionId: "dir-1",
  };
  const wired = buildDirectorySourceForOpen({
    id: "lib-1",
    fileName: "a.zoneboard.json",
    byteSize: 10,
    source: dirSrc,
    openSnapshot: snap,
  });
  assert(wired != null, "directory → wire");
  assert(wired!.fileHandle === fakeHandle, "same handle");
  assert(wired!.libraryEntryId === "lib-1", "entry id");
  assert(wired!.directorySessionId === "dir-1", "session id");
  assert(wired!.openSnapshot === snap, "snapshot kept");
  // FileSessionBar canSave ≡ directorySource != null
  assert(wired != null, "Save eligible");
}

console.log("--- mergeDirectoryListing: drop same-name selected ---");
{
  const prev = [
    {
      id: "sel-same",
      fileName: "Board.zoneboard.json",
      source: { kind: "selected-file" as const },
    },
    {
      id: "sel-other",
      fileName: "other.zoneboard.json",
      source: { kind: "selected-file" as const },
    },
    {
      id: "old-dir",
      fileName: "gone.zoneboard.json",
      source: {
        kind: "directory-file" as const,
        fileHandle: fakeHandle,
        directorySessionId: "old",
      },
    },
  ];
  const mapped = [
    {
      id: "new-dir",
      fileName: "board.zoneboard.json", // case-insensitive match to sel-same
      source: {
        kind: "directory-file" as const,
        fileHandle: fakeHandle,
        directorySessionId: "new",
      },
    },
  ];
  const { next, droppedSelectedIds } = mergeDirectoryListingIntoEntries(
    prev,
    mapped,
  );
  assert(droppedSelectedIds.includes("sel-same"), "dropped twin selected");
  assert(!next.some((e) => e.id === "sel-same"), "twin gone");
  assert(next.some((e) => e.id === "sel-other"), "unrelated selected kept");
  assert(!next.some((e) => e.id === "old-dir"), "old directory replaced");
  assert(next.some((e) => e.id === "new-dir"), "new directory present");
  assert(
    next.find((e) => e.id === "new-dir")!.source.kind === "directory-file",
    "new is directory-file",
  );
}

console.log("--- Open path: selected twin would hide Save ---");
{
  // Repro of reported UX: opening selected twin → directorySource null → no Save.
  const twin = buildDirectorySourceForOpen({
    id: "sel-twin",
    fileName: "a.zoneboard.json",
    byteSize: 1,
    source: { kind: "selected-file" },
  });
  assert(twin === null, "opening Selected file card → no Save (expected)");
  const fromFolder = buildDirectorySourceForOpen({
    id: "dir-card",
    fileName: "a.zoneboard.json",
    byteSize: 1,
    source: {
      kind: "directory-file",
      fileHandle: fakeHandle,
      directorySessionId: "d",
    },
    openSnapshot: {
      name: "a.zoneboard.json",
      size: 1,
      lastModified: 1,
      contentFinger: "1:0",
    },
  });
  assert(fromFolder != null, "opening Local folder card → Save eligible");
}

console.log("file-source-track-check: OK");
