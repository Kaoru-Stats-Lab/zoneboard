/**
 * Pitch landmarks for capture-import calib (W08 engine · W09 presets/UX).
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

/** Landmark set presets (camera-agnostic). */
export type CalibLandmarkPreset = "full" | "penalty" | "goal" | "mixed";

/** Canonical pitch: x=0 left goal · x=1 right goal (not screen / attack). */
export type CalibGoalSide = "x0" | "x1";

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

  // x=0 goal: near = goal line, far = penalty-area field edge
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

/** Full pitch corners — regression. */
export const PRESET_FULL_CORNERS: LandmarkQuad = [
  "corner_tl",
  "corner_tr",
  "corner_br",
  "corner_bl",
];

/** Penalty-area view · Canonical x=0 goal. */
export const PRESET_PENALTY_X0: LandmarkQuad = [
  "pen_l_near_t",
  "pen_l_far_b",
  "goal_l_far_t",
  "pen_spot_l",
];

export const PRESET_PENALTY_X1: LandmarkQuad = [
  "pen_r_near_t",
  "pen_r_far_b",
  "goal_r_far_t",
  "pen_spot_r",
];

/** Tight goal-area view · x=0. */
export const PRESET_GOAL_X0: LandmarkQuad = [
  "goal_l_near_t",
  "goal_l_far_b",
  "post_l_b",
  "pen_spot_l",
];

export const PRESET_GOAL_X1: LandmarkQuad = [
  "goal_r_near_t",
  "goal_r_far_b",
  "post_r_b",
  "pen_spot_r",
];

/** Suggested broadcast default · x=0. */
export const PRESET_MIXED_X0: LandmarkQuad = [
  "pen_l_near_t",
  "pen_l_far_t",
  "goal_l_far_b",
  "pen_spot_l",
];

export const PRESET_MIXED_X1: LandmarkQuad = [
  "pen_r_near_t",
  "pen_r_far_t",
  "goal_r_far_b",
  "pen_spot_r",
];

export function landmarkPresetNeedsGoalSide(
  preset: CalibLandmarkPreset,
): boolean {
  return preset !== "full";
}

export function landmarkPresetIds(
  preset: CalibLandmarkPreset,
  goalSide: CalibGoalSide | null = null,
): LandmarkQuad | null {
  if (preset === "full") return [...PRESET_FULL_CORNERS];
  if (!goalSide) return null;
  if (preset === "penalty") {
    return goalSide === "x0"
      ? [...PRESET_PENALTY_X0]
      : [...PRESET_PENALTY_X1];
  }
  if (preset === "goal") {
    return goalSide === "x0" ? [...PRESET_GOAL_X0] : [...PRESET_GOAL_X1];
  }
  return goalSide === "x0" ? [...PRESET_MIXED_X0] : [...PRESET_MIXED_X1];
}

/** Context suggestions (6–8) for bottom-list “recommended” group. */
export function suggestedLandmarkIds(
  preset: CalibLandmarkPreset,
  goalSide: CalibGoalSide | null,
): LandmarkId[] {
  if (preset === "full" || !goalSide) {
    return [...PRESET_FULL_CORNERS];
  }
  if (goalSide === "x0") {
    if (preset === "goal") {
      return [
        "goal_l_near_t",
        "goal_l_near_b",
        "goal_l_far_t",
        "goal_l_far_b",
        "post_l_t",
        "post_l_b",
        "pen_spot_l",
        "pen_l_far_t",
      ];
    }
    return [
      "pen_l_near_t",
      "pen_l_near_b",
      "pen_l_far_t",
      "pen_l_far_b",
      "goal_l_far_t",
      "goal_l_far_b",
      "pen_spot_l",
      "pen_arc_apex_l",
    ];
  }
  if (preset === "goal") {
    return [
      "goal_r_near_t",
      "goal_r_near_b",
      "goal_r_far_t",
      "goal_r_far_b",
      "post_r_t",
      "post_r_b",
      "pen_spot_r",
      "pen_r_far_t",
    ];
  }
  return [
    "pen_r_near_t",
    "pen_r_near_b",
    "pen_r_far_t",
    "pen_r_far_b",
    "goal_r_far_t",
    "goal_r_far_b",
    "pen_spot_r",
    "pen_arc_apex_r",
  ];
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

/** Pitch-relative side for UI subtitle (not screen top/bot). */
export type LandmarkPitchSide = "goalLine" | "field" | null;

export function landmarkPitchSide(id: LandmarkId): LandmarkPitchSide {
  if (id.includes("_near_")) return "goalLine";
  if (id.includes("_far_") || id.includes("arc_apex")) return "field";
  return null;
}

/**
 * Initial handle positions: small cross near image centre.
 * Optional light bias toward the selected goal half — not line snap.
 */
export function initialCalibSrcPoints(
  width: number,
  height: number,
  goalSide: CalibGoalSide | null = null,
): Point[] {
  const cx = width * 0.5;
  const cy = height * 0.5;
  let ox = 0;
  if (goalSide === "x0") ox = -width * 0.12;
  if (goalSide === "x1") ox = width * 0.12;
  const s = Math.min(width, height) * 0.08;
  const clamp = (p: Point): Point => ({
    x: Math.min(width, Math.max(0, p.x)),
    y: Math.min(height, Math.max(0, p.y)),
  });
  return [
    clamp({ x: cx + ox, y: cy - s }),
    clamp({ x: cx + ox + s, y: cy }),
    clamp({ x: cx + ox, y: cy + s }),
    clamp({ x: cx + ox - s, y: cy }),
  ];
}
