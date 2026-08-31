import type { HomographyMatrix, Point } from "./homography";
import type { BallState, Piece, ToolId } from "../models/types";

/** W02–W05 capture-import flow (React state only — never persisted). */
export type CaptureImportPhase =
  | "idle"
  | "image"
  | "calib"
  | "place"
  | "confirm";

export type CaptureImportImage = {
  width: number;
  height: number;
  url: string;
};

export type CaptureImportSession = {
  phase: CaptureImportPhase;
  /** object URL — revoked on clear / tab close */
  image: CaptureImportImage | null;
  /** W03+ image pixels TL,TR,BR,BL */
  calibSrc4: Point[] | null;
  /** W03+ */
  homography: HomographyMatrix | null;
  /** W05 — 確定まで scene.pieces と別配列 */
  draftPieces: Piece[];
  /** W05 */
  draftBall: BallState | null;
  /** W05 */
  selectedDraftPieceId: string | null;
  /** W05 — place 突入前の tool（終了時に復帰） */
  toolBeforePlace: ToolId | null;
  /** W04 session-only underlay strength */
  underlayOpacity: number;
};

export function emptyCaptureImportSession(
  phase: CaptureImportPhase = "idle",
): CaptureImportSession {
  return {
    phase,
    image: null,
    calibSrc4: null,
    homography: null,
    draftPieces: [],
    draftBall: null,
    selectedDraftPieceId: null,
    toolBeforePlace: null,
    underlayOpacity: 0.55,
  };
}
