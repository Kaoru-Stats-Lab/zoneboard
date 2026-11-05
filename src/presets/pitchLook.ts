import type {
  BallObject,
  BoardDocument,
  PitchOrientation,
  PitchView,
  Viewport,
} from "../models/types";
import { effectivePitchOrientation } from "./sports";
import { DEFAULT_VIEWPORT } from "./viewport";

export type SoccerPitchLookPreset =
  | "landscapeFull"
  | "portraitFull"
  | "portraitHalfBottom"
  | "landscapeHalfRight"
  | "portraitHalfTop";

/** TTA 型 Pitch View 行の並び（試合タブ 5 アイコン） */
export const SOCCER_PITCH_LOOK_ORDER: SoccerPitchLookPreset[] = [
  "landscapeFull",
  "portraitFull",
  "portraitHalfBottom",
  "landscapeHalfRight",
  "portraitHalfTop",
];

export function soccerPitchLookPresetToBoardFields(preset: SoccerPitchLookPreset): {
  pitchOrientation: PitchOrientation;
  pitchView: PitchView;
  pitchFlipped: boolean;
} {
  switch (preset) {
    case "landscapeFull":
      return { pitchOrientation: "landscape", pitchView: "full", pitchFlipped: false };
    case "portraitFull":
      return { pitchOrientation: "portrait", pitchView: "full", pitchFlipped: false };
    case "portraitHalfBottom":
      return { pitchOrientation: "portrait", pitchView: "half", pitchFlipped: false };
    case "landscapeHalfRight":
      return { pitchOrientation: "landscape", pitchView: "half", pitchFlipped: false };
    case "portraitHalfTop":
      return { pitchOrientation: "portrait", pitchView: "half", pitchFlipped: true };
  }
}

/** 現在の 3 軸 → 5 プリセットのいずれか。横ハーフ+flip は landscapeHalfRight に丸める。 */
export function boardToSoccerPitchLookPreset(
  board: BoardDocument,
): SoccerPitchLookPreset {
  const o = effectivePitchOrientation(board.sport, board.pitchOrientation);
  const half = board.pitchView === "half";
  const flip = board.pitchFlipped;

  if (o === "landscape") {
    if (!half) return "landscapeFull";
    return "landscapeHalfRight";
  }
  if (!half) return "portraitFull";
  return flip ? "portraitHalfTop" : "portraitHalfBottom";
}

export function soccerPitchOrientationChanges(
  board: BoardDocument,
  preset: SoccerPitchLookPreset,
): boolean {
  const next = soccerPitchLookPresetToBoardFields(preset).pitchOrientation;
  const cur = effectivePitchOrientation(board.sport, board.pitchOrientation);
  return cur !== next;
}

function viewportIsPristine(vp: Viewport | undefined): boolean {
  if (!vp) return true;
  return (
    vp.zoom === DEFAULT_VIEWPORT.zoom &&
    vp.cx === DEFAULT_VIEWPORT.cx &&
    vp.cy === DEFAULT_VIEWPORT.cy
  );
}

/** Initial empty-board ball: single centre ball, no attachment. */
function ballsArePristineForOrientationReset(balls: BallObject[]): boolean {
  if (balls.length === 0) return true;
  if (balls.length !== 1) return false;
  const b = balls[0]!;
  if (b.x !== 0.5 || b.y !== 0.5) return false;
  if (typeof b.attachedTo === "string" && b.attachedTo.length > 0) return false;
  return true;
}

/**
 * True when orientation reset would destroy or overwrite user content.
 * Fail closed: any pieces/objects, non-pristine balls, or non-default viewports.
 * Inspects every scene (not only the active one).
 */
export function boardHasContentBlockingOrientationChange(
  board: BoardDocument,
): boolean {
  if (!viewportIsPristine(board.viewport)) return true;
  for (const s of board.scenes) {
    if (s.pieces.length > 0) return true;
    if (s.objects.length > 0) return true;
    if (!ballsArePristineForOrientationReset(s.balls)) return true;
    if (!viewportIsPristine(s.viewport)) return true;
  }
  return false;
}

/**
 * Whether applySoccerPitchLook may change orientation (landscape ↔ portrait).
 * Same-orientation presets are always allowed at this layer.
 */
export function canChangeSoccerPitchOrientation(
  board: BoardDocument,
  preset: SoccerPitchLookPreset,
): boolean {
  if (!soccerPitchOrientationChanges(board, preset)) return true;
  return !boardHasContentBlockingOrientationChange(board);
}

/**
 * 向き変更時: 全局面を空シード（createBoard portrait と同思想）。
 * Call only after canChangeSoccerPitchOrientation === true (empty board).
 */
export function resetAllScenesForOrientationChange(
  board: BoardDocument,
  fields: ReturnType<typeof soccerPitchLookPresetToBoardFields>,
): BoardDocument {
  const emptyViewport = { ...DEFAULT_VIEWPORT };
  return {
    ...board,
    ...fields,
    showMatchBanner: fields.pitchOrientation === "landscape",
    viewport: emptyViewport,
    scenes: board.scenes.map((s) => ({
      ...s,
      pieces: [],
      objects: [],
      balls: s.balls.map((b) => ({
        ...b,
        x: 0.5,
        y: 0.5,
        attachedTo: null,
      })),
      viewport: { ...emptyViewport },
    })),
  };
}

export type ApplySoccerPitchLookPlan =
  | { action: "noop" }
  | { action: "fields"; fields: ReturnType<typeof soccerPitchLookPresetToBoardFields> }
  | {
      action: "orientation_reset";
      fields: ReturnType<typeof soccerPitchLookPresetToBoardFields>;
    }
  | { action: "blocked_orientation" };

/** Pure plan for pitch look apply — shared by state + tests. */
export function planSoccerPitchLookApply(
  board: BoardDocument,
  preset: SoccerPitchLookPreset,
): ApplySoccerPitchLookPlan {
  const current = boardToSoccerPitchLookPreset(board);
  if (current === preset) return { action: "noop" };
  const fields = soccerPitchLookPresetToBoardFields(preset);
  if (!soccerPitchOrientationChanges(board, preset)) {
    return { action: "fields", fields };
  }
  if (boardHasContentBlockingOrientationChange(board)) {
    return { action: "blocked_orientation" };
  }
  return { action: "orientation_reset", fields };
}
