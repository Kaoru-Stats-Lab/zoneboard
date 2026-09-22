/**
 * Pitch landmarks for capture-import calib (W08).
 * dst points are FIFA pitch-norm from SOCCER_PITCH_M / SOCCER_NORM — never invent numbers.
 */
import { SOCCER_NORM, SOCCER_PITCH_M } from "../presets/soccerPitch";
import {
  computeHomography,
  PITCH_CORNERS_NORM,
  type Point,
} from "./homography";

const { penDepth, goalDepth, penSpot, penHalfH, goalHalfH } = SOCCER_NORM;
/** Arc radius along length axis (centerR in SOCCER_NORM is width-normalized). */
const ARC_R_LEN = SOCCER_PITCH_M.centerCircleR / SOCCER_PITCH_M.length;
const POST_HALF = SOCCER_PITCH_M.goalWidth / (2 * SOCCER_PITCH_M.width);

export const LANDMARK_IDS = [
  "corner_tl",
  "corner_tr",
  "corner_br",
  "corner_bl",
  "pen_l_near_t",
  "pen_l_near_b",
  "pen_l_far_t",
  "pen_l_far_b",
  "pen_r_near_t",
  "pen_r_near_b",
  "pen_r_far_t",
  "pen_r_far_b",
  "goal_l_near_t",
  "goal_l_near_b",
  "goal_l_far_t",
  "goal_l_far_b",
  "goal_r_near_t",
  "goal_r_near_b",
  "goal_r_far_t",
  "goal_r_far_b",
  "pen_spot_l",
  "pen_spot_r",
  "pen_arc_apex_l",
  "pen_arc_apex_r",
  "post_l_t",
  "post_l_b",
  "post_r_t",
  "post_r_b",
] as const;

export type LandmarkId = (typeof LANDMARK_IDS)[number];

export type CalibLandmarkPreset = "full" | "left" | "right";

export type LandmarkQuad = [LandmarkId, LandmarkId, LandmarkId, LandmarkId];

/** Message keys: captureLmCornerTl + captureLmCornerTlShort */
export function landmarkMsgBase(id: LandmarkId): string {
  return (
    "captureLm" +
    id
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
  );
}

const LANDMARK_NORM: Record<LandmarkId, Point> = {
  corner_tl: PITCH_CORNERS_NORM[0]!,
  corner_tr: PITCH_CORNERS_NORM[1]!,
  corner_br: PITCH_CORNERS_NORM[2]!,
  corner_bl: PITCH_CORNERS_NORM[3]!,

  // Left goal (x=0): near = goal line, far = 18-yard line
  pen_l_near_t: { x: 0, y: 0.5 - penHalfH },
  pen_l_near_b: { x: 0, y: 0.5 + penHalfH },
  pen_l_far_t: { x: penDepth, y: 0.5 - penHalfH },
  pen_l_far_b: { x: penDepth, y: 0.5 + penHalfH },

  pen_r_near_t: { x: 1, y: 0.5 - penHalfH },
  pen_r_near_b: { x: 1, y: 0.5 + penHalfH },
  pen_r_far_t: { x: 1 - penDepth, y: 0.5 - penHalfH },
  pen_r_far_b: { x: 1 - penDepth, y: 0.5 + penHalfH },

  goal_l_near_t: { x: 0, y: 0.5 - goalHalfH },
  goal_l_near_b: { x: 0, y: 0.5 + goalHalfH },
  goal_l_far_t: { x: goalDepth, y: 0.5 - goalHalfH },
  goal_l_far_b: { x: goalDepth, y: 0.5 + goalHalfH },

  goal_r_near_t: { x: 1, y: 0.5 - goalHalfH },
  goal_r_near_b: { x: 1, y: 0.5 + goalHalfH },
  goal_r_far_t: { x: 1 - goalDepth, y: 0.5 - goalHalfH },
  goal_r_far_b: { x: 1 - goalDepth, y: 0.5 + goalHalfH },

  pen_spot_l: { x: penSpot, y: 0.5 },
  pen_spot_r: { x: 1 - penSpot, y: 0.5 },

  pen_arc_apex_l: { x: penSpot + ARC_R_LEN, y: 0.5 },
  pen_arc_apex_r: { x: 1 - penSpot - ARC_R_LEN, y: 0.5 },

  post_l_t: { x: 0, y: 0.5 - POST_HALF },
  post_l_b: { x: 0, y: 0.5 + POST_HALF },
  post_r_t: { x: 1, y: 0.5 - POST_HALF },
  post_r_b: { x: 1, y: 0.5 + POST_HALF },
};

export function landmarkNorm(id: LandmarkId): Point {
  const p = LANDMARK_NORM[id];
  return { x: p.x, y: p.y };
}

export function dst4FromLandmarkIds(ids: readonly LandmarkId[]): Point[] {
  return ids.map(landmarkNorm);
}

/** Full pitch corners — regression / default. */
export const PRESET_FULL_CORNERS: LandmarkQuad = [
  "corner_tl",
  "corner_tr",
  "corner_br",
  "corner_bl",
];

/**
 * Left-goal tight shot: goal-line pen corners + 18yd top + arc apex
 * (non-collinear · good area).
 */
export const PRESET_LEFT_GOAL: LandmarkQuad = [
  "pen_l_near_t",
  "pen_l_near_b",
  "pen_l_far_t",
  "pen_arc_apex_l",
];

/** Right-goal mirror of left. */
export const PRESET_RIGHT_GOAL: LandmarkQuad = [
  "pen_r_near_t",
  "pen_r_near_b",
  "pen_r_far_t",
  "pen_arc_apex_r",
];

export function landmarkPresetIds(preset: CalibLandmarkPreset): LandmarkQuad {
  if (preset === "left") return [...PRESET_LEFT_GOAL];
  if (preset === "right") return [...PRESET_RIGHT_GOAL];
  return [...PRESET_FULL_CORNERS];
}

export function hasDuplicateLandmarkIds(
  ids: readonly LandmarkId[],
): boolean {
  return new Set(ids).size !== ids.length;
}

/** True when DLT would reject (collinear / zero area). */
export function isLandmarkDstDegenerate(
  ids: readonly LandmarkId[],
): boolean {
  if (ids.length !== 4 || hasDuplicateLandmarkIds(ids)) return true;
  const dst = dst4FromLandmarkIds(ids);
  const src = dst.map((p) => ({ x: p.x * 200 + 10, y: p.y * 200 + 10 }));
  return computeHomography(src, dst) === null;
}

export function resolveCalibLandmarkIds(
  ids: LandmarkQuad | null | undefined,
): LandmarkQuad {
  return ids ?? [...PRESET_FULL_CORNERS];
}
