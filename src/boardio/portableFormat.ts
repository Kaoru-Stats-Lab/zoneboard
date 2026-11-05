/**
 * Portable Board file contract (JSON Export / Import).
 * Independent of localStorage store key (`zoneboard:v1:store`) and
 * BoardDocument.schemaVersion (internal board evolve).
 */

/** Envelope format id — reject files without this exact string. */
export const PORTABLE_FORMAT_ID = "zoneboard-board" as const;

/**
 * Portable file schema version (envelope).
 * Bump when the *file contract* changes incompatibly.
 * BoardDocument.schemaVersion stays on the board payload.
 */
export const PORTABLE_SCHEMA_VERSION = 1 as const;

/** Reject Import when file claims a newer portable schema. */
export const PORTABLE_SCHEMA_VERSION_MAX = PORTABLE_SCHEMA_VERSION;

/** Soft cap — protect memory / localStorage (bytes of UTF-8 text). */
export const PORTABLE_MAX_BYTES = 4 * 1024 * 1024; // 4 MiB

export type PortableBoardFile = {
  format: typeof PORTABLE_FORMAT_ID;
  schemaVersion: number;
  /** ISO-8601; optional for Dashboard listing later */
  exportedAt?: string;
  /** package version hint only — never required for Import */
  appVersion?: string;
  board: unknown;
};

export type PortableImportErrorCode =
  | "too_large"
  | "parse"
  | "format"
  | "version_new"
  | "version_bad"
  | "structure"
  | "limit"
  | "quota"
  | "unknown";

export class PortableImportError extends Error {
  readonly code: PortableImportErrorCode;
  constructor(code: PortableImportErrorCode, message?: string) {
    super(message ?? code);
    this.name = "PortableImportError";
    this.code = code;
  }
}
