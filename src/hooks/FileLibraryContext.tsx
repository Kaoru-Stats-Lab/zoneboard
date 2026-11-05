import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  displayNameFromZoneboardFile,
  PORTABLE_MAX_BYTES,
  PortableImportError,
  parsePortableBoardJsonKeepIdsDetailed,
  type PortableImportErrorCode,
} from "../boardio";
import { clearSceneThumbCacheScope } from "../canvas/sceneThumb";
import {
  contentFingerprintText,
  fileMetaFromFile,
  type FileMetaSnapshot,
} from "../lib/fileSystemAccess";
import type { Locale } from "../i18n/messages";
import { uid } from "../models/id";
import type { BoardDocument } from "../models/types";
import {
  enumerateZoneboardDirectory,
  pickDirectoryHandle,
  refreshDirectoryFile,
  type DirectoryFileEntry,
} from "../storage/directoryEnumerate";
import {
  mergeDirectoryListingIntoEntries,
  type FileLibrarySource,
} from "../storage/fileLibrarySource";

export type { FileLibrarySource };

export type FileLibraryEntryOk = {
  id: string;
  fileName: string;
  byteSize: number;
  addedAt: number;
  status: "ok";
  displayTitle: string;
  sceneCount: number;
  exportedAt: string | null;
  boardUpdatedAt: string | null;
  /** Memory-only UTF-8 body for Open / Import (never persisted). */
  text: string;
  /** Parsed board for Preview / thumbs (memory only; not BoardStore). */
  board: BoardDocument;
  source: FileLibrarySource;
  /** Directory open freshness snapshot (memory only). */
  openSnapshot?: FileMetaSnapshot;
};

export type FileLibraryEntryError = {
  id: string;
  fileName: string;
  byteSize: number;
  addedAt: number;
  status: "error";
  errorCode: PortableImportErrorCode;
  source: FileLibrarySource;
};

export type FileLibraryEntry = FileLibraryEntryOk | FileLibraryEntryError;

export type DirectorySessionInfo = {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
} | null;

export type FileLibraryState = {
  entries: FileLibraryEntry[];
  directorySession: DirectorySessionInfo;
  directoryLoading: boolean;
  addFiles: (files: FileList | File[], locale: Locale) => Promise<void>;
  openDirectory: (locale: Locale) => Promise<"ok" | "cancel" | "unavailable" | "error">;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
  clearSelectedFiles: () => void;
  getEntry: (id: string) => FileLibraryEntry | undefined;
  /** Refresh ok entry after successful Save (keeps same entry id + handle). */
  patchDirectoryEntryAfterSave: (
    entryId: string,
    next: {
      board: BoardDocument;
      text: string;
      byteSize: number;
      openSnapshot: FileMetaSnapshot;
      displayTitle: string;
      sceneCount: number;
      boardUpdatedAt: string | null;
    },
  ) => void;
  refreshDirectoryEntryForOpen: (
    entry: FileLibraryEntryOk,
    locale: Locale,
  ) => Promise<FileLibraryEntryOk | FileLibraryEntryError>;
  /** After Save As: insert or replace a directory-file entry (same fileName). */
  addOrReplaceDirectoryEntry: (entry: FileLibraryEntryOk) => void;
};

const FileLibraryContext = createContext<FileLibraryState | null>(null);

function metaFromOkBoard(
  board: BoardDocument,
  fileName: string,
  exportedAt: string | null,
) {
  return {
    // Local Files Dashboard primary = file stem (not board.title).
    displayTitle: displayNameFromZoneboardFile(fileName),
    sceneCount: board.scenes.length,
    exportedAt,
    boardUpdatedAt:
      typeof board.updatedAt === "string" && board.updatedAt.trim()
        ? board.updatedAt.trim()
        : null,
  };
}

async function ingestSelectedFile(
  file: File,
  _locale: Locale,
  addedAt: number,
): Promise<FileLibraryEntry> {
  const id = uid();
  const base = {
    id,
    fileName: file.name || "board.zoneboard.json",
    byteSize: file.size,
    addedAt,
    source: { kind: "selected-file" as const },
  };

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
    return {
      ...base,
      status: "ok",
      ...metaFromOkBoard(board, base.fileName, exportedAt),
      text,
      board,
    };
  } catch (e) {
    const code =
      e instanceof PortableImportError ? e.code : ("unknown" as const);
    return { ...base, status: "error", errorCode: code };
  }
}

function mapDirectoryEntry(
  e: DirectoryFileEntry,
  directorySessionId: string,
): FileLibraryEntry {
  if (e.status === "ok") {
    return {
      id: e.id,
      fileName: e.fileName,
      byteSize: e.byteSize,
      addedAt: e.addedAt,
      status: "ok",
      displayTitle: e.displayTitle,
      sceneCount: e.sceneCount,
      exportedAt: e.exportedAt,
      boardUpdatedAt: e.boardUpdatedAt,
      text: e.text,
      board: e.board,
      source: {
        kind: "directory-file",
        fileHandle: e.fileHandle,
        directorySessionId,
      },
      openSnapshot: e.openSnapshot,
    };
  }
  return {
    id: e.id,
    fileName: e.fileName,
    byteSize: e.byteSize,
    addedAt: e.addedAt,
    status: "error",
    errorCode: e.errorCode,
    source:
      e.fileHandle != null
        ? {
            kind: "directory-file",
            fileHandle: e.fileHandle,
            directorySessionId,
          }
        : { kind: "selected-file" },
  };
}

export function FileLibraryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FileLibraryEntry[]>([]);
  const [directorySession, setDirectorySession] =
    useState<DirectorySessionInfo>(null);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const enumerateGen = useRef(0);

  const addFiles = useCallback(async (files: FileList | File[], locale: Locale) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    const baseTime = Date.now();
    const next = await Promise.all(
      list.map((f, i) => ingestSelectedFile(f, locale, baseTime + i)),
    );
    setEntries((prev) => [...prev, ...next]);
  }, []);

  /**
   * Open folder: replaces **directory-file** entries only.
   * Selected-file entries are kept. Does not touch File Session / BoardStore.
   */
  const openDirectory = useCallback(
    async (
      locale: Locale,
    ): Promise<"ok" | "cancel" | "unavailable" | "error"> => {
      let handle: FileSystemDirectoryHandle;
      try {
        handle = await pickDirectoryHandle();
      } catch (e) {
        const name = e instanceof DOMException ? e.name : "";
        if (name === "AbortError") return "cancel";
        if (name === "SecurityError" || name === "NotAllowedError") {
          return "unavailable";
        }
        return "error";
      }

      const gen = ++enumerateGen.current;
      const sessionId = uid();
      setDirectoryLoading(true);
      try {
        const listed = await enumerateZoneboardDirectory(handle, locale, {
          isCancelled: () => gen !== enumerateGen.current,
        });
        if (gen !== enumerateGen.current) {
          return "cancel";
        }
        const mapped = listed.map((e) => mapDirectoryEntry(e, sessionId));
        setEntries((prev) => {
          const { next, droppedSelectedIds } = mergeDirectoryListingIntoEntries(
            prev,
            mapped,
          );
          for (const e of prev) {
            if (e.source.kind === "directory-file") {
              clearSceneThumbCacheScope(e.id);
            }
          }
          for (const id of droppedSelectedIds) {
            clearSceneThumbCacheScope(id);
          }
          return next;
        });
        setDirectorySession({
          id: sessionId,
          name: handle.name || "Folder",
          handle,
        });
        return "ok";
      } catch {
        return "error";
      } finally {
        if (gen === enumerateGen.current) setDirectoryLoading(false);
      }
    },
    [],
  );

  const removeEntry = useCallback((id: string) => {
    clearSceneThumbCacheScope(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearEntries = useCallback(() => {
    setEntries((prev) => {
      for (const e of prev) clearSceneThumbCacheScope(e.id);
      return [];
    });
    setDirectorySession(null);
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setEntries((prev) => {
      const next: FileLibraryEntry[] = [];
      for (const e of prev) {
        if (e.source.kind === "selected-file") {
          clearSceneThumbCacheScope(e.id);
        } else {
          next.push(e);
        }
      }
      return next;
    });
  }, []);

  const getEntry = useCallback(
    (id: string) => entries.find((e) => e.id === id),
    [entries],
  );

  const patchDirectoryEntryAfterSave = useCallback(
    (
      entryId: string,
      next: {
        board: BoardDocument;
        text: string;
        byteSize: number;
        openSnapshot: FileMetaSnapshot;
        displayTitle: string;
        sceneCount: number;
        boardUpdatedAt: string | null;
      },
    ) => {
      clearSceneThumbCacheScope(entryId);
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId || e.status !== "ok") return e;
          return {
            ...e,
            board: next.board,
            text: next.text,
            byteSize: next.byteSize,
            openSnapshot: next.openSnapshot,
            displayTitle: next.displayTitle,
            sceneCount: next.sceneCount,
            boardUpdatedAt: next.boardUpdatedAt,
          };
        }),
      );
    },
    [],
  );

  const refreshDirectoryEntryForOpen = useCallback(
    async (
      entry: FileLibraryEntryOk,
      locale: Locale,
    ): Promise<FileLibraryEntryOk | FileLibraryEntryError> => {
      if (entry.source.kind !== "directory-file") return entry;
      const refreshed = await refreshDirectoryFile(
        entry.source.fileHandle,
        locale,
      );
      const mapped = mapDirectoryEntry(
        refreshed,
        entry.source.directorySessionId,
      );
      // Keep the same library entry id so cacheScope / UI identity stay stable.
      const withId =
        mapped.status === "ok"
          ? { ...mapped, id: entry.id }
          : { ...mapped, id: entry.id };
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? withId : e)),
      );
      if (withId.status === "ok") clearSceneThumbCacheScope(entry.id);
      return withId;
    },
    [],
  );

  const addOrReplaceDirectoryEntry = useCallback(
    (entry: FileLibraryEntryOk) => {
      if (entry.source.kind !== "directory-file") return;
      const key = entry.fileName.trim().toLowerCase();
      setEntries((prev) => {
        const next: FileLibraryEntry[] = [];
        for (const e of prev) {
          if (
            e.source.kind === "directory-file" &&
            e.fileName.trim().toLowerCase() === key
          ) {
            clearSceneThumbCacheScope(e.id);
            continue;
          }
          next.push(e);
        }
        next.push(entry);
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      entries,
      directorySession,
      directoryLoading,
      addFiles,
      openDirectory,
      removeEntry,
      clearEntries,
      clearSelectedFiles,
      getEntry,
      patchDirectoryEntryAfterSave,
      refreshDirectoryEntryForOpen,
      addOrReplaceDirectoryEntry,
    }),
    [
      entries,
      directorySession,
      directoryLoading,
      addFiles,
      openDirectory,
      removeEntry,
      clearEntries,
      clearSelectedFiles,
      getEntry,
      patchDirectoryEntryAfterSave,
      refreshDirectoryEntryForOpen,
      addOrReplaceDirectoryEntry,
    ],
  );

  return (
    <FileLibraryContext.Provider value={value}>
      {children}
    </FileLibraryContext.Provider>
  );
}

export function useFileLibrary(): FileLibraryState {
  const ctx = useContext(FileLibraryContext);
  if (!ctx) {
    throw new Error("useFileLibrary must be used within FileLibraryProvider");
  }
  return ctx;
}

/** Helper for callers that need a File snapshot after save. */
export { contentFingerprintText, fileMetaFromFile };
