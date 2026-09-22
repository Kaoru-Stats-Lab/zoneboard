import type { HomographyMatrix, Point } from "./homography";
import type {
  CalibGoalSide,
  CalibLandmarkPreset,
  LandmarkQuad,
} from "./pitchLandmarks";
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
  /** Image pixels (order matches calibLandmarkIds) */
  calibSrc4: Point[] | null;
  /**
   * True after the user drags at least one handle away from the initial cross.
   * Apply stays blocked until this is true (avoids wild H from undragged seed).
   */
  calibSrcMoved: boolean;
  /** W08/W09 — dst landmarks; null until preset applied */
  calibLandmarkIds: LandmarkQuad | null;
  /** W09 — Canonical goal (x=0 / x=1); null until picked or full */
  calibGoalSide: CalibGoalSide | null;
  /** W09 — landmark-set preset */
  calibPreset: CalibLandmarkPreset | null;
  /** W09 — which of ①–④ is focused in the bottom list */
  calibFocusIndex: number | null;
  /** Homography after apply */
  homography: HomographyMatrix | null;
  /** W05 — 確定まで scene.pieces と別配列 */
  draftPieces: Piece[];
  /** W05 */
  draftBall: BallState | null;
  /** W05 */
  selectedDraftPieceId: string | null;
  /** W05 — ドラフトボール選択（Delete 用） */
  selectedDraftBall: boolean;
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
    calibSrcMoved: false,
    calibLandmarkIds: null,
    calibGoalSide: null,
    calibPreset: null,
    calibFocusIndex: null,
    homography: null,
    draftPieces: [],
    draftBall: null,
    selectedDraftPieceId: null,
    selectedDraftBall: false,
    toolBeforePlace: null,
    underlayOpacity: 0.55,
  };
}
