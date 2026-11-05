/**
 * File Library source helpers — Directory vs Select JSON tracking.
 * Pure functions for Open → File Session wiring (no React).
 */
import type { FileMetaSnapshot } from "../lib/fileSystemAccess";

export type FileLibrarySource =
  | { kind: "selected-file" }
  | {
      kind: "directory-file";
      fileHandle: FileSystemFileHandle;
      directorySessionId: string;
    };

export type FileSessionDirectorySourceWire = {
  fileHandle: FileSystemFileHandle;
  directorySessionId: string;
  libraryEntryId: string;
  openSnapshot: FileMetaSnapshot;
};

type EntryForMerge = {
  id: string;
  fileName: string;
  source: FileLibrarySource;
};

type EntryOkForOpen = {
  id: string;
  fileName: string;
  byteSize: number;
  source: FileLibrarySource;
  openSnapshot?: FileMetaSnapshot;
};

/** Label key role: directory-file → folder, else selected. */
export function sourceLabelKind(
  source: FileLibrarySource,
): "directory-file" | "selected-file" {
  return source.kind === "directory-file" ? "directory-file" : "selected-file";
}

/**
 * Build File Session directorySource from a library entry.
 * Returns null for selected-file (Download-only; no Save to source).
 */
export function buildDirectorySourceForOpen(
  entry: EntryOkForOpen,
): FileSessionDirectorySourceWire | null {
  if (entry.source.kind !== "directory-file") return null;
  return {
    fileHandle: entry.source.fileHandle,
    directorySessionId: entry.source.directorySessionId,
    libraryEntryId: entry.id,
    openSnapshot: entry.openSnapshot ?? {
      name: entry.fileName,
      size: entry.byteSize,
      lastModified: 0,
      contentFinger: "",
    },
  };
}

/**
 * After Open folder: replace prior directory-file entries, and drop
 * selected-file entries that share a fileName with the new listing
 * (case-insensitive) so the user does not Open a Download-only twin.
 */
export function mergeDirectoryListingIntoEntries<T extends EntryForMerge>(
  prev: T[],
  mapped: T[],
): { next: T[]; droppedSelectedIds: string[] } {
  const dirNames = new Set(
    mapped.map((e) => e.fileName.trim().toLowerCase()).filter(Boolean),
  );
  const droppedSelectedIds: string[] = [];
  const kept: T[] = [];
  for (const e of prev) {
    if (e.source.kind === "directory-file") continue;
    const key = e.fileName.trim().toLowerCase();
    if (dirNames.has(key)) {
      droppedSelectedIds.push(e.id);
      continue;
    }
    kept.push(e);
  }
  return { next: [...kept, ...mapped], droppedSelectedIds };
}
