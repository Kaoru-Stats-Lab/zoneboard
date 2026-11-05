import type { BoardDocument } from "../models/types";
import { downloadBlob } from "../canvas/exportPng";
import { portableBoardFilename } from "./filename";
import {
  portableToJsonString,
  serializeBoardToPortable,
} from "./serializeBoard";

export function exportBoardJsonDownload(
  board: BoardDocument,
  opts?: { appVersion?: string; fallbackTitle?: string },
): { filename: string } {
  const file = serializeBoardToPortable(board, {
    appVersion: opts?.appVersion,
  });
  const json = portableToJsonString(file);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const title =
    board.matchLabel?.trim() ||
    board.title?.trim() ||
    opts?.fallbackTitle ||
    "ZoneBoard";
  const filename = portableBoardFilename(title, opts?.fallbackTitle ?? "ZoneBoard");
  downloadBlob(blob, filename);
  return { filename };
}
