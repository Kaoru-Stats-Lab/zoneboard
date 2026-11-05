/**
 * Group 7 / 7.1 — Save As filename + conflict helpers (no real FS picker).
 * Run: npx --yes tsx scripts/file-save-as-check.ts
 */
import {
  displayNameFromZoneboardFile,
  stripToFilenameStem,
  ZONEBOARD_JSON_EXT,
} from "../src/boardio";
import {
  nextAvailableSaveAsName,
  normalizeSaveAsFileName,
  saveAsStemFromFileName,
} from "../src/storage/directorySaveAs";
import { detectHelpOs } from "../src/lib/helpOs";
import { messages, type Locale } from "../src/i18n/messages";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("--- stem + extension lock ---");
{
  assert(ZONEBOARD_JSON_EXT === ".zoneboard.json", "ext constant");
  assert(stripToFilenameStem("High Press") === "High Press", "plain stem");
  assert(
    stripToFilenameStem("High Press.zoneboard.json") === "High Press",
    "strip full",
  );
  assert(
    stripToFilenameStem("High Press.ZONEBOARD.JSON") === "High Press",
    "strip case",
  );
  assert(stripToFilenameStem("a.json") === "a", "strip .json");
  assert(
    stripToFilenameStem("C:\\\\tmp\\\\High Press.zoneboard.json") === "High Press",
    "strip path",
  );
  assert(
    displayNameFromZoneboardFile("High Press.zoneboard.json") === "High Press",
    "display stem",
  );
  assert(
    saveAsStemFromFileName("Press.zoneboard.json") === "Press",
    "dialog stem",
  );
}

console.log("--- normalizeSaveAsFileName ---");
{
  assert(
    normalizeSaveAsFileName("", "My Board", "ZoneBoard") ===
      "My Board.zoneboard.json",
    "from title",
  );
  assert(
    normalizeSaveAsFileName("Press", "X", "ZoneBoard") ===
      "Press.zoneboard.json",
    "add suffix",
  );
  assert(
    normalizeSaveAsFileName("Press.zoneboard.json", "X", "Z") ===
      "Press.zoneboard.json",
    "no double suffix",
  );
  assert(
    normalizeSaveAsFileName("High Press.zoneboard.json", "Board 3", "Z") ===
      "High Press.zoneboard.json",
    "paste full name",
  );
  assert(
    normalizeSaveAsFileName("a.json", "X", "Z") === "a.zoneboard.json",
    "upgrade .json",
  );
  assert(
    normalizeSaveAsFileName("  ハイプレス  ", "X", "Z") ===
      "ハイプレス.zoneboard.json",
    "unicode trim",
  );
  assert(
    normalizeSaveAsFileName("Board/evil", "X", "Z") === "evil.zoneboard.json",
    "path stem only",
  );
  const n = normalizeSaveAsFileName("High Press.zoneboard.json", "X", "Z")!;
  assert(n.endsWith(ZONEBOARD_JSON_EXT), "always zoneboard.json");
  assert(!n.toLowerCase().includes(".zoneboard.zoneboard"), "no double ext");
}

console.log("--- nextAvailableSaveAsName / case conflict ---");
{
  const taken = new Set(["board.zoneboard.json"]);
  assert(
    nextAvailableSaveAsName("board.zoneboard.json", taken) ===
      "board (2).zoneboard.json",
    "suffix 2",
  );
  const takenCase = new Set(["press.zoneboard.json"]);
  assert(
    nextAvailableSaveAsName("Press.zoneboard.json", takenCase) ===
      "Press (2).zoneboard.json",
    "case-insensitive taken",
  );
}

console.log("--- detectHelpOs in node ---");
{
  const os = detectHelpOs();
  assert(os === null || ["windows", "macos", "linux"].includes(os), "os shape");
}

console.log("--- i18n Save As 7.1 keys ---");
{
  const keys = [
    "filesSaveAsTitle",
    "filesSaveAsFolderLabel",
    "filesSaveAsFileName",
    "filesSaveAsExtHint",
    "filesSaveAsConfirmShort",
    "filesSaveAsShort",
    "filesSaveAsConflict",
    "filesSaveAsConflictHint",
    "filesSaveAsWaitingPermission",
    "filesSaveAsVerifying",
    "filesSaveAsSuccess",
    "filesSaveAsEmptyCtaShort",
    "filesBoardNameLabel",
    "filesSaving",
  ] as const;
  for (const loc of Object.keys(messages) as Locale[]) {
    for (const k of keys) {
      const v = messages[loc][k];
      assert(typeof v === "string" && v.length > 0, `${loc}.${k}`);
    }
    assert(
      !messages[loc].filesSaveAsConflict.toLowerCase().includes("overwrite") &&
        !messages[loc].filesSaveAsConflict.includes("上書き") &&
        !messages[loc].filesSaveAsConflict.includes("sobrescrib") &&
        !messages[loc].filesSaveAsConflict.includes("überschreib") &&
        !messages[loc].filesSaveAsConflict.includes("écraser") &&
        !messages[loc].filesSaveAsConflict.includes("nadpis"),
      `${loc} conflict should not push overwrite`,
    );
  }
  assert(messages.en.filesSaveAsTitle === "Save to folder", "en title");
  assert(
    messages.en.filesSaveAsWaitingPermission === "Waiting for permission",
    "en waiting",
  );
  assert(messages.en.filesBoardNameLabel === "Board name", "en board name");
}

console.log("file-save-as-check: OK");
