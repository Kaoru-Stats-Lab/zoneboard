/**
 * Local-file Dashboard Group 5 — Directory mode helpers (no real FS picker).
 * Run: npx --yes tsx scripts/file-directory-check.ts
 */
import {
  PORTABLE_MAX_BYTES,
  PortableImportError,
  parsePortableBoardJsonForOpen,
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio";
import { createBoard } from "../src/models/defaults";
import {
  contentFingerprintText,
  isDirectoryModeAvailable,
  isZoneboardJsonName,
  fileMetaFromFile,
} from "../src/lib/fileSystemAccess";
import {
  detectSaveConflict,
  type SaveConflictKind,
} from "../src/storage/directorySave";
import { FILE_SESSION_DRAFT_KEY } from "../src/storage/fileSessionDraft";
import { STORE_KEY } from "../src/storage/keys";
import { messages, type Locale } from "../src/i18n/messages";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("--- zoneboard name filter ---");
{
  assert(isZoneboardJsonName("a.zoneboard.json"), "lower");
  assert(isZoneboardJsonName("A.ZONEBOARD.JSON"), "upper");
  assert(isZoneboardJsonName("board.ZoneBoard.JSON"), "mixed");
  assert(!isZoneboardJsonName("board.json"), "plain json");
  assert(!isZoneboardJsonName("notes.txt"), "txt");
  assert(!isZoneboardJsonName("zoneboard.json.bak"), "bak");
}

console.log("--- capability gate is not UA-based ---");
{
  // Node has no showDirectoryPicker → false without throwing.
  assert(
    typeof isDirectoryModeAvailable() === "boolean",
    "boolean result",
  );
  assert(isDirectoryModeAvailable() === false, "node unavailable");
}

console.log("--- conflict detection ---");
{
  const base = {
    name: "a.zoneboard.json",
    size: 100,
    lastModified: 1000,
    contentFinger: contentFingerprintText('{"a":1}'),
  };
  assert(detectSaveConflict(base, null) === "missing", "missing");
  assert(
    detectSaveConflict(base, { ...base }) === "none",
    "identical meta+finger",
  );
  assert(
    detectSaveConflict(base, {
      ...base,
      lastModified: 2000,
      contentFinger: contentFingerprintText('{"a":2}'),
    }) === "metadata",
    "mtime+content",
  );
  // Same size/mtime/name but different content → content conflict
  const sameMetaDiffBody: SaveConflictKind = detectSaveConflict(base, {
    ...base,
    contentFinger: contentFingerprintText('{"a":2}'),
  });
  assert(sameMetaDiffBody === "content", "content-only conflict");
  // Metadata differs but content finger matches → treat as none (same bytes)
  assert(
    detectSaveConflict(base, {
      ...base,
      lastModified: 9999,
      contentFinger: base.contentFinger,
    }) === "none",
    "mtime drift same content",
  );
}

console.log("--- fileMetaFromFile ---");
{
  const blob = new File(['{"x":1}'], "t.zoneboard.json", {
    type: "application/json",
    lastModified: 42,
  });
  const meta = fileMetaFromFile(blob, contentFingerprintText('{"x":1}'));
  assert(meta.name === "t.zoneboard.json", "name");
  assert(meta.size === blob.size, "size");
  assert(meta.lastModified === 42, "mtime");
  assert(meta.contentFinger.length > 0, "finger");
}

console.log("--- open parse keeps ids (directory open path) ---");
{
  const board = createBoard("soccer", "Dir Board");
  board.id = "dir-keep-id";
  const json = portableToJsonString(serializeBoardToPortable(board));
  const opened = parsePortableBoardJsonForOpen(json);
  assert(opened.id === "dir-keep-id", "keep id");
}

console.log("--- size gate ---");
{
  let threw = false;
  try {
    parsePortableBoardJsonForOpen("{}", PORTABLE_MAX_BYTES + 1);
  } catch (e) {
    threw = e instanceof PortableImportError && e.code === "too_large";
  }
  assert(threw, "too_large");
}

console.log("--- draft / store keys never hold handles ---");
{
  assert(FILE_SESSION_DRAFT_KEY !== STORE_KEY, "separate keys");
  assert(!FILE_SESSION_DRAFT_KEY.includes("handle"), "draft key name");
}

console.log("--- i18n directory/save keys in all locales ---");
{
  const keys = [
    "filesOpenFolder",
    "filesOpenFolderShort",
    "filesOpenFolderHint",
    "filesChooseFolder",
    "filesChooseFolderShort",
    "filesChooseFolderHint",
    "filesOnboardTitle",
    "filesOnboardBody",
    "filesOnboardAlt",
    "filesOnboardSessionNote",
    "filesFolder",
    "filesFolderOpened",
    "filesFolderUnavailable",
    "filesFolderError",
    "filesFolderLoadingShort",
    "filesFolderEmpty",
    "filesFolderBadge",
    "filesSourceFolder",
    "filesSourceSelected",
    "filesSave",
    "filesSaveShort",
    "filesSaveHint",
    "filesSaving",
    "filesSavingShort",
    "filesSavedToSource",
    "filesSaveFailed",
    "filesPermissionDenied",
    "filesPermissionDeniedHint",
    "filesExternalChanged",
    "filesSourceMissing",
    "filesSaveNeedsFolder",
    "filesNoChanges",
    "filesRestoreNoHandleHint",
    "filesConflictTitle",
    "filesConflictBody",
    "filesConflictHint",
    "filesConflictCancel",
    "filesConflictOverwrite",
    "filesConflictOverwriteHint",
  ] as const;
  const locales = Object.keys(messages) as Locale[];
  for (const loc of locales) {
    for (const k of keys) {
      const v = messages[loc][k];
      assert(typeof v === "string" && v.length > 0, `${loc}.${k}`);
    }
  }
}

console.log("file-directory-check: OK");
