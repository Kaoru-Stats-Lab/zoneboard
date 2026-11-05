/**
 * Save As — create a new .zoneboard.json in a connected directory.
 * Does not persist handles. Caller attaches File Session / library entry.
 */
import {
  portableBoardFilename,
  stripToFilenameStem,
  ZONEBOARD_JSON_EXT,
} from "../boardio";

export { ZONEBOARD_JSON_EXT };
import type { BoardDocument } from "../models/types";
import type { FileMetaSnapshot } from "../lib/fileSystemAccess";
import {
  ensureReadwritePermission,
  writeBoardToFileHandle,
  type SaveToSourceResult,
} from "./directorySave";

export type SaveAsPhase =
  | "idle"
  | "checking"
  | "waiting_permission"
  | "saving"
  | "verifying";

export type SaveAsToFolderResult =
  | {
      ok: true;
      fileName: string;
      fileHandle: FileSystemFileHandle;
      snapshot: FileMetaSnapshot;
      overwritten: boolean;
    }
  | {
      ok: false;
      reason:
        | "permission_denied"
        | "name_conflict"
        | "invalid_name"
        | "write_failed"
        | "close_failed"
        | "verify_failed"
        | "no_directory";
      /** Full `.zoneboard.json` name that collided (name_conflict). */
      fileName?: string;
      suggestedName?: string;
    };

export async function directoryHasFile(
  directory: FileSystemDirectoryHandle,
  fileName: string,
): Promise<boolean> {
  try {
    await directory.getFileHandle(fileName);
    return true;
  } catch (e) {
    const name = e instanceof DOMException ? e.name : "";
    if (name !== "NotFoundError") {
      // Treat unexpected errors as "exists" to avoid silent overwrite.
      return true;
    }
  }
  // Case-insensitive twin (Windows / some hosts): exact miss ≠ free name.
  const target = fileName.toLowerCase();
  try {
    for await (const [entryName, handle] of directory.entries()) {
      if (handle.kind === "file" && entryName.toLowerCase() === target) {
        return true;
      }
    }
  } catch {
    return true;
  }
  return false;
}

/**
 * Build final `.zoneboard.json` name from stem-only or pasted full name.
 * Always ends with ZONEBOARD_JSON_EXT (never invents other extensions).
 */
export function normalizeSaveAsFileName(
  raw: string,
  boardTitle: string,
  fallbackTitle: string,
): string | null {
  const stemRaw = stripToFilenameStem(raw);
  const from =
    stemRaw.trim().length > 0
      ? stemRaw
      : stripToFilenameStem(boardTitle) || fallbackTitle;
  const out = portableBoardFilename(from, fallbackTitle);
  if (!out.toLowerCase().endsWith(ZONEBOARD_JSON_EXT)) return null;
  return out;
}

/** Stem only for the Save As input field. */
export function saveAsStemFromFileName(fileName: string): string {
  return stripToFilenameStem(fileName);
}

export function nextAvailableSaveAsName(
  preferred: string,
  takenLower: Set<string>,
): string {
  const preferredFull = preferred.toLowerCase().endsWith(ZONEBOARD_JSON_EXT)
    ? preferred
    : portableBoardFilename(preferred, "ZoneBoard");
  if (!takenLower.has(preferredFull.toLowerCase())) return preferredFull;
  const stem = stripToFilenameStem(preferredFull);
  for (let i = 2; i < 1000; i++) {
    const candidate = `${stem} (${i})${ZONEBOARD_JSON_EXT}`;
    if (!takenLower.has(candidate.toLowerCase())) return candidate;
  }
  return `${stem}-${Date.now()}${ZONEBOARD_JSON_EXT}`;
}

/** Read-only name check (no write permission prompt). */
export async function checkSaveAsNameAvailable(
  directory: FileSystemDirectoryHandle,
  fileName: string,
): Promise<{ available: true } | { available: false; suggestedName: string }> {
  const exists = await directoryHasFile(directory, fileName);
  if (!exists) return { available: true };
  return {
    available: false,
    suggestedName: nextAvailableSaveAsName(
      fileName,
      new Set([fileName.toLowerCase()]),
    ),
  };
}

/**
 * Create a board JSON in the directory root.
 * Call `checkSaveAsNameAvailable` first. On conflict, UI asks for another name
 * (no silent overwrite). `allowOverwrite` remains for rare explicit API use.
 *
 * Phases: waiting_permission → saving → verifying (never claim Saving during prompt).
 */
export async function saveBoardAsNewInDirectory(
  directory: FileSystemDirectoryHandle,
  board: BoardDocument,
  fileName: string,
  opts?: {
    allowOverwrite?: boolean;
    onPhase?: (phase: SaveAsPhase) => void;
  },
): Promise<SaveAsToFolderResult> {
  const name = fileName.trim();
  if (!name.toLowerCase().endsWith(ZONEBOARD_JSON_EXT)) {
    return { ok: false, reason: "invalid_name" };
  }
  // Final boundary: reject path segments / wrong extension shapes.
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return { ok: false, reason: "invalid_name" };
  }

  const exists = await directoryHasFile(directory, name);
  if (exists && !opts?.allowOverwrite) {
    return {
      ok: false,
      reason: "name_conflict",
      fileName: name,
      suggestedName: nextAvailableSaveAsName(
        name,
        new Set([name.toLowerCase()]),
      ),
    };
  }

  opts?.onPhase?.("waiting_permission");
  const dirPerm = await ensureReadwritePermission(directory);
  if (dirPerm !== "granted") {
    opts?.onPhase?.("idle");
    return { ok: false, reason: "permission_denied" };
  }

  opts?.onPhase?.("saving");
  let fileHandle: FileSystemFileHandle;
  try {
    fileHandle = await directory.getFileHandle(name, { create: true });
  } catch {
    opts?.onPhase?.("idle");
    return { ok: false, reason: "write_failed" };
  }

  opts?.onPhase?.("verifying");
  // Permission already granted on the directory; skip a second prompt on the file.
  const written: SaveToSourceResult = await writeBoardToFileHandle(
    fileHandle,
    board,
    {
      allowOverwriteConflict: true,
      skipPermissionRequest: true,
    },
  );

  if (!written.ok) {
    opts?.onPhase?.("idle");
    return {
      ok: false,
      reason:
        written.reason === "permission_denied"
          ? "permission_denied"
          : written.reason === "close_failed"
            ? "close_failed"
            : written.reason === "verify_failed"
              ? "verify_failed"
              : "write_failed",
    };
  }

  opts?.onPhase?.("idle");
  return {
    ok: true,
    fileName: name,
    fileHandle,
    snapshot: written.snapshot,
    overwritten: exists,
  };
}
