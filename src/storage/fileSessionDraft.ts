import type { BoardDocument } from "../models/types";
import { sanitizeForJson } from "../boardio/serializeBoard";
import { PORTABLE_MAX_BYTES } from "../boardio/portableFormat";

/** Separate from BoardStore (`zoneboard:v1:store`). Session-only, not cloud. */
export const FILE_SESSION_DRAFT_KEY = "zoneboard:v1:fileSessionDraft";

/** Soft cap for sessionStorage payload (UTF-16-ish estimate via TextEncoder). */
export const FILE_SESSION_DRAFT_MAX_BYTES = Math.min(
  PORTABLE_MAX_BYTES,
  3 * 1024 * 1024,
);

export type FileSessionDraftV1 = {
  v: 1;
  sourceName: string;
  openedAt: number;
  baselineFinger: string;
  board: BoardDocument;
  savedAt: number;
  /**
   * True when the board was created via New local board and has never been
   * written to a source file (Directory Save / Save As). Optional for older drafts.
   */
  neverSavedToFile?: boolean;
};

/** Content fingerprint for dirty detection (stable; ignores wall-clock export). */
export function boardContentFingerprint(board: BoardDocument): string {
  return JSON.stringify(sanitizeForJson(structuredClone(board)));
}

/**
 * Unsaved new boards stay dirty even if Undo restores the creation fingerprint.
 * Opened files use baseline comparison only.
 */
export function isFileSessionContentDirty(
  board: BoardDocument,
  baselineFinger: string,
  neverSavedToFile: boolean,
): boolean {
  if (neverSavedToFile) return true;
  return boardContentFingerprint(board) !== baselineFinger;
}

export function clearFileSessionDraft(): void {
  try {
    sessionStorage.removeItem(FILE_SESSION_DRAFT_KEY);
  } catch {
    /* private mode etc. */
  }
}

export function readFileSessionDraft(): FileSessionDraftV1 | null {
  try {
    const raw = sessionStorage.getItem(FILE_SESSION_DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (
      data == null ||
      typeof data !== "object" ||
      (data as FileSessionDraftV1).v !== 1 ||
      typeof (data as FileSessionDraftV1).sourceName !== "string" ||
      typeof (data as FileSessionDraftV1).baselineFinger !== "string" ||
      !(data as FileSessionDraftV1).board ||
      typeof (data as FileSessionDraftV1).board !== "object"
    ) {
      return null;
    }
    return data as FileSessionDraftV1;
  } catch {
    return null;
  }
}

/**
 * Persist draft. Returns false on quota / unavailable — never throws into callers
 * that might then touch BoardStore.
 */
export function writeFileSessionDraft(
  draft: Omit<FileSessionDraftV1, "v" | "savedAt">,
): boolean {
  const payload: FileSessionDraftV1 = {
    v: 1,
    ...draft,
    savedAt: Date.now(),
  };
  try {
    const text = JSON.stringify(payload);
    if (new TextEncoder().encode(text).length > FILE_SESSION_DRAFT_MAX_BYTES) {
      return false;
    }
    sessionStorage.setItem(FILE_SESSION_DRAFT_KEY, text);
    return true;
  } catch {
    return false;
  }
}
