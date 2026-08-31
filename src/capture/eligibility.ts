import type { BoardDocument } from "../models/types";
import { effectivePitchOrientation } from "../presets/sports";

export type CaptureImportBlockReason = "unsupportedSport" | "unsupportedPitch";

/** Phase 1: soccer landscape full only. */
export function captureImportEligibility(
  board: BoardDocument | null,
): CaptureImportBlockReason | null {
  if (!board || board.sport !== "soccer") return "unsupportedSport";
  if (
    effectivePitchOrientation(board.sport, board.pitchOrientation) ===
    "portrait"
  ) {
    return "unsupportedPitch";
  }
  if (board.pitchView === "half") return "unsupportedPitch";
  return null;
}
