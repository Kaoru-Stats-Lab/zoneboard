import {
  displayNameFromZoneboardFile,
  PORTABLE_MAX_BYTES,
  PortableImportError,
  parsePortableBoardJsonKeepIdsDetailed,
  type PortableImportErrorCode,
} from "../boardio";
import {
  contentFingerprintText,
  fileMetaFromFile,
  isZoneboardJsonName,
  type FileMetaSnapshot,
} from "../lib/fileSystemAccess";
import type { Locale } from "../i18n/messages";
import { uid } from "../models/id";
import type { BoardDocument } from "../models/types";

export type DirectoryFileOk = {
  id: string;
  fileName: string;
  byteSize: number;
  addedAt: number;
  status: "ok";
  displayTitle: string;
  sceneCount: number;
  exportedAt: string | null;
  boardUpdatedAt: string | null;
  text: string;
  board: BoardDocument;
  fileHandle: FileSystemFileHandle;
  openSnapshot: FileMetaSnapshot;
};

export type DirectoryFileError = {
  id: string;
  fileName: string;
  byteSize: number;
  addedAt: number;
  status: "error";
  errorCode: PortableImportErrorCode;
  fileHandle?: FileSystemFileHandle;
};

export type DirectoryFileEntry = DirectoryFileOk | DirectoryFileError;

export type DirectoryEnumerateResult = {
  directoryName: string;
  directoryHandle: FileSystemDirectoryHandle;
  entries: DirectoryFileEntry[];
};

/**
 * Pick a folder (must be called directly from a user gesture).
 * Requests read mode only.
 */
export async function pickDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  if (typeof showDirectoryPicker !== "function") {
    throw new Error("directory_picker_unavailable");
  }
  return showDirectoryPicker({ mode: "read" });
}

async function ingestHandle(
  handle: FileSystemFileHandle,
  _locale: Locale,
  addedAt: number,
): Promise<DirectoryFileEntry> {
  const id = uid();
  const base = {
    id,
    fileName: handle.name || "board.zoneboard.json",
    byteSize: 0,
    addedAt,
    fileHandle: handle,
  };

  let file: File;
  try {
    file = await handle.getFile();
  } catch {
    return { ...base, status: "error", errorCode: "unknown" };
  }

  base.byteSize = file.size;
  if (file.size > PORTABLE_MAX_BYTES) {
    return { ...base, status: "error", errorCode: "too_large" };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ...base, status: "error", errorCode: "unknown" };
  }

  try {
    const { board, exportedAt } = parsePortableBoardJsonKeepIdsDetailed(
      text,
      file.size,
    );
    const openSnapshot = fileMetaFromFile(file, contentFingerprintText(text));
    return {
      ...base,
      status: "ok",
      // Local Files Dashboard primary = file stem (board.title stays in JSON).
      displayTitle: displayNameFromZoneboardFile(base.fileName),
      sceneCount: board.scenes.length,
      exportedAt,
      boardUpdatedAt:
        typeof board.updatedAt === "string" && board.updatedAt.trim()
          ? board.updatedAt.trim()
          : null,
      text,
      board,
      openSnapshot,
    };
  } catch (e) {
    const code =
      e instanceof PortableImportError ? e.code : ("unknown" as const);
    return { ...base, status: "error", errorCode: code };
  }
}

/**
 * Enumerate `.zoneboard.json` files in the directory root (non-recursive).
 * Caller should pass `isCancelled` so a newer folder pick aborts mid-scan.
 */
export async function enumerateZoneboardDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  locale: Locale,
  opts?: { isCancelled?: () => boolean },
): Promise<DirectoryFileEntry[]> {
  const cancelled = () => opts?.isCancelled?.() === true;
  const found: FileSystemFileHandle[] = [];
  for await (const handle of directoryHandle.values()) {
    if (cancelled()) return [];
    if (handle.kind !== "file") continue;
    if (!isZoneboardJsonName(handle.name)) continue;
    found.push(handle as FileSystemFileHandle);
  }

  // Stable order by name (case-insensitive).
  found.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  const baseTime = Date.now();
  const out: DirectoryFileEntry[] = [];
  for (let i = 0; i < found.length; i++) {
    if (cancelled()) return [];
    out.push(await ingestHandle(found[i]!, locale, baseTime + i));
    // Yield so the UI can paint between files on large folders.
    await new Promise<void>((r) => setTimeout(r, 0));
  }
  return out;
}

/** Re-read a directory file handle for Open freshness. */
export async function refreshDirectoryFile(
  handle: FileSystemFileHandle,
  locale: Locale,
): Promise<DirectoryFileOk | DirectoryFileError> {
  return ingestHandle(handle, locale, Date.now());
}
