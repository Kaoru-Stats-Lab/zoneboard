import { migrateBoard } from "../models/defaults";
import type { BoardDocument, SportId } from "../models/types";
import {
  PORTABLE_FORMAT_ID,
  PORTABLE_MAX_BYTES,
  PORTABLE_SCHEMA_VERSION,
  PORTABLE_SCHEMA_VERSION_MAX,
  PortableImportError,
  type PortableBoardFile,
} from "./portableFormat";
import { remapBoardIds } from "./remapIds";

const PORTABLE_SPORTS: readonly SportId[] = [
  "soccer",
  "futsal",
  "beach_soccer",
  "basketball",
  "volleyball",
];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function isSportId(v: unknown): v is SportId {
  return (
    typeof v === "string" &&
    (PORTABLE_SPORTS as readonly string[]).includes(v)
  );
}

export type PortableKeepIdsResult = {
  board: BoardDocument;
  /** Envelope export timestamp (ISO), if present and valid. */
  exportedAt: string | null;
};

/**
 * Shared envelope validation + migrateBoard.
 * Does **not** remap IDs (Open / preview / library). Import callers remap separately.
 */
export function parsePortableBoardJsonKeepIdsDetailed(
  text: string,
  byteLength?: number,
): PortableKeepIdsResult {
  const size = byteLength ?? new TextEncoder().encode(text).length;
  if (size > PORTABLE_MAX_BYTES) {
    throw new PortableImportError("too_large");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    throw new PortableImportError("parse");
  }

  if (!isPlainObject(raw)) {
    throw new PortableImportError("format");
  }

  if (raw.format !== PORTABLE_FORMAT_ID) {
    throw new PortableImportError("format");
  }

  const ver = raw.schemaVersion;
  if (typeof ver !== "number" || !Number.isFinite(ver) || ver < 1) {
    throw new PortableImportError("version_bad");
  }
  if (ver > PORTABLE_SCHEMA_VERSION_MAX) {
    throw new PortableImportError("version_new");
  }

  if (ver !== PORTABLE_SCHEMA_VERSION && ver < PORTABLE_SCHEMA_VERSION) {
    throw new PortableImportError("version_bad");
  }

  if (!isPlainObject(raw.board)) {
    throw new PortableImportError("structure");
  }

  if (!isSportId(raw.board.sport)) {
    throw new PortableImportError("structure");
  }
  if (raw.board.title != null && typeof raw.board.title !== "string") {
    throw new PortableImportError("structure");
  }

  let migrated: BoardDocument;
  try {
    migrated = migrateBoard(raw.board as Parameters<typeof migrateBoard>[0]);
  } catch {
    throw new PortableImportError("structure");
  }

  if (!isSportId(migrated.sport) || !migrated.scenes?.length) {
    throw new PortableImportError("structure");
  }

  for (const s of migrated.scenes) {
    if (!Array.isArray(s.balls) || s.balls.length < 1) {
      throw new PortableImportError("structure");
    }
  }

  const exportedAt =
    typeof raw.exportedAt === "string" && raw.exportedAt.trim()
      ? raw.exportedAt.trim()
      : null;

  return { board: migrated, exportedAt };
}

export function parsePortableBoardJsonKeepIds(
  text: string,
  byteLength?: number,
): BoardDocument {
  return parsePortableBoardJsonKeepIdsDetailed(text, byteLength).board;
}

/**
 * File Session Open — validate + migrate, **keep** Board / Scene / Piece IDs.
 * Does not touch localStorage / BoardStore.
 */
export function parsePortableBoardJsonForOpen(
  text: string,
  byteLength?: number,
): BoardDocument {
  return parsePortableBoardJsonKeepIds(text, byteLength);
}

/**
 * Parse UTF-8 text into a BoardDocument ready to **Import** into BoardStore
 * (IDs remapped). Does not touch localStorage itself.
 */
export function parsePortableBoardJson(
  text: string,
  byteLength?: number,
): BoardDocument {
  return remapBoardIds(parsePortableBoardJsonKeepIds(text, byteLength));
}

/** Type guard helper for tests / callers */
export function isPortableBoardFile(v: unknown): v is PortableBoardFile {
  return (
    isPlainObject(v) &&
    v.format === PORTABLE_FORMAT_ID &&
    typeof v.schemaVersion === "number" &&
    isPlainObject(v.board)
  );
}
