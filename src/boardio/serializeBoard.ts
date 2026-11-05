import type { BoardDocument } from "../models/types";
import {
  PORTABLE_FORMAT_ID,
  PORTABLE_SCHEMA_VERSION,
  type PortableBoardFile,
} from "./portableFormat";

/**
 * Strip non-finite numbers recursively so JSON.stringify stays valid.
 * Does not mutate the live board — works on a clone.
 */
export function sanitizeForJson(value: unknown): unknown {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeForJson);
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Skip accidental circular / function junk
      if (typeof v === "function" || typeof v === "symbol") continue;
      out[k] = sanitizeForJson(v);
    }
    return out;
  }
  return undefined;
}

/**
 * Board → portable envelope. Does not mutate `board`.
 * Excludes UI / store / watermark / prefs (caller only passes BoardDocument).
 */
export function serializeBoardToPortable(
  board: BoardDocument,
  opts?: { appVersion?: string; exportedAt?: string },
): PortableBoardFile {
  const clone = structuredClone(board) as BoardDocument;
  const boardPayload = sanitizeForJson(clone) as BoardDocument;
  return {
    format: PORTABLE_FORMAT_ID,
    schemaVersion: PORTABLE_SCHEMA_VERSION,
    exportedAt: opts?.exportedAt ?? new Date().toISOString(),
    ...(opts?.appVersion ? { appVersion: opts.appVersion } : {}),
    board: boardPayload,
  };
}

export function portableToJsonString(file: PortableBoardFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}
