import {
  portableToJsonString,
  serializeBoardToPortable,
} from "../boardio";
import type { BoardDocument } from "../models/types";
import {
  contentFingerprintText,
  fileMetaFromFile,
  type FileMetaSnapshot,
} from "../lib/fileSystemAccess";

export type SaveConflictKind = "none" | "metadata" | "content" | "missing";

export type SaveToSourceResult =
  | { ok: true; snapshot: FileMetaSnapshot }
  | {
      ok: false;
      reason:
        | "permission_denied"
        | "conflict"
        | "missing"
        | "write_failed"
        | "close_failed"
        | "verify_failed"
        | "busy"
        | "no_handle";
      conflict?: SaveConflictKind;
      current?: FileMetaSnapshot | null;
    };

export async function queryReadwritePermission(
  handle: FileSystemHandle,
): Promise<PermissionState> {
  try {
    return await handle.queryPermission({ mode: "readwrite" });
  } catch {
    return "denied";
  }
}

/** Must stay close to a user gesture when state is "prompt". */
export async function ensureReadwritePermission(
  handle: FileSystemHandle,
): Promise<PermissionState> {
  try {
    const q = await handle.queryPermission({ mode: "readwrite" });
    if (q === "granted") return q;
    return await handle.requestPermission({ mode: "readwrite" });
  } catch {
    return "denied";
  }
}

export async function readFileSnapshot(
  handle: FileSystemFileHandle,
): Promise<FileMetaSnapshot | null> {
  try {
    const file = await handle.getFile();
    const text = await file.text();
    return fileMetaFromFile(file, contentFingerprintText(text));
  } catch {
    return null;
  }
}

/**
 * Compare Open-time snapshot to current file.
 * Size+mtime mismatch → metadata conflict.
 * Same size+mtime but different content finger → content conflict.
 * Missing file → missing.
 */
export function detectSaveConflict(
  opened: FileMetaSnapshot,
  current: FileMetaSnapshot | null,
): SaveConflictKind {
  if (!current) return "missing";
  if (
    current.size !== opened.size ||
    current.lastModified !== opened.lastModified ||
    current.name !== opened.name
  ) {
    // Also check content when metadata differs (may still be same bytes).
    if (
      current.contentFinger &&
      opened.contentFinger &&
      current.contentFinger === opened.contentFinger
    ) {
      return "none";
    }
    return "metadata";
  }
  if (
    current.contentFinger &&
    opened.contentFinger &&
    current.contentFinger !== opened.contentFinger
  ) {
    return "content";
  }
  return "none";
}

/**
 * Write Portable JSON to the source FileHandle.
 * Completes only after `close()` succeeds. Does not mark session clean.
 */
export async function writeBoardToFileHandle(
  handle: FileSystemFileHandle,
  board: BoardDocument,
  opts?: {
    allowOverwriteConflict?: boolean;
    openedSnapshot?: FileMetaSnapshot;
    /** When directory already granted write, skip a second file-handle prompt. */
    skipPermissionRequest?: boolean;
  },
): Promise<SaveToSourceResult> {
  if (!opts?.skipPermissionRequest) {
    const perm = await ensureReadwritePermission(handle);
    if (perm !== "granted") {
      return { ok: false, reason: "permission_denied" };
    }
  }

  const current = await readFileSnapshot(handle);
  if (opts?.openedSnapshot) {
    const conflict = detectSaveConflict(opts.openedSnapshot, current);
    if (conflict === "missing") {
      return { ok: false, reason: "missing", conflict, current };
    }
    if (conflict !== "none" && !opts.allowOverwriteConflict) {
      return { ok: false, reason: "conflict", conflict, current };
    }
  }

  const portable = serializeBoardToPortable(board);
  const json = portableToJsonString(portable);

  let writable: FileSystemWritableFileStream | null = null;
  try {
    writable = await handle.createWritable();
  } catch {
    return { ok: false, reason: "write_failed", current };
  }

  try {
    await writable.write(json);
  } catch {
    try {
      await writable.abort();
    } catch {
      /* ignore */
    }
    return { ok: false, reason: "write_failed", current };
  }

  try {
    await writable.close();
  } catch {
    try {
      await writable.abort();
    } catch {
      /* ignore */
    }
    return { ok: false, reason: "close_failed", current };
  }

  const after = await readFileSnapshot(handle);
  if (!after) {
    return { ok: false, reason: "verify_failed", current };
  }
  const expectedFinger = contentFingerprintText(json);
  if (after.contentFinger !== expectedFinger) {
    return { ok: false, reason: "verify_failed", current: after };
  }

  return { ok: true, snapshot: after };
}
