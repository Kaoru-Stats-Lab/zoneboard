import type { BoardDocument, PitchOrientation, PitchView } from "../models/types";
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

/** 向き変更時: 全局面を空シード（createBoard portrait と同思想） */
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
      ball: { x: 0.5, y: 0.5 },
      viewport: { ...emptyViewport },
    })),
  };
}
