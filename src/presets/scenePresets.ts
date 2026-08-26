import type { KitPalette } from "../models/kits";
import { defaultKitPalette } from "../models/kits";
import type {
  BallState,
  Piece,
  ScenePhase,
  SportId,
  Viewport,
} from "../models/types";
import { APP_LOCALE } from "../i18n/locale";
import { messages, type Locale, type MessageKey } from "../i18n/messages";
import {
  benchPieces,
  piecesFromSpots,
  type Spot,
} from "./formations";
import { VIEW_PRESETS } from "./viewport";

export type ScenePresetId = "ck-right-zonal" | "ck-left-zonal";

export type ScenePresetEntry = { id: ScenePresetId; key: MessageKey };

export interface BuiltScenePreset {
  label: string;
  phase: ScenePhase;
  viewport: Viewport;
  pieces: Piece[];
  ball: BallState;
}

type Side = "right" | "left";

function mirrorSpots(spots: Spot[]): Spot[] {
  return spots.map((s) => ({ ...s, x: 1 - s.x }));
}

function mirrorBall(ball: BallState): BallState {
  return { ...ball, x: 1 - ball.x };
}

/** 右ゴール（x=1）側 CK — ゾーン守備の骨格 */
const CK_RIGHT_HOME: Spot[] = [
  { x: 0.965, y: 0.5, number: "1", gk: true },
  { x: 0.928, y: 0.76, number: "4" },
  { x: 0.928, y: 0.24, number: "5" },
  { x: 0.898, y: 0.5, number: "6" },
  { x: 0.868, y: 0.38, number: "2" },
  { x: 0.868, y: 0.62, number: "3" },
  { x: 0.838, y: 0.5, number: "8" },
  { x: 0.808, y: 0.3, number: "7" },
  { x: 0.808, y: 0.7, number: "11" },
  { x: 0.65, y: 0.4, number: "9" },
  { x: 0.65, y: 0.6, number: "10" },
];

const CK_RIGHT_AWAY: Spot[] = [
  { x: 0.045, y: 0.5, number: "1", gk: true },
  { x: 0.978, y: 0.955, number: "7" },
  { x: 0.938, y: 0.85, number: "11" },
  { x: 0.908, y: 0.72, number: "9" },
  { x: 0.908, y: 0.28, number: "10" },
  { x: 0.878, y: 0.5, number: "6" },
  { x: 0.818, y: 0.4, number: "8" },
  { x: 0.58, y: 0.35, number: "2" },
  { x: 0.58, y: 0.65, number: "3" },
  { x: 0.62, y: 0.5, number: "4" },
  { x: 0.72, y: 0.5, number: "5" },
];

const CK_RIGHT_BALL: BallState = { x: 0.992, y: 0.968 };

function ckZonalPieces(
  side: Side,
  benchCount: number,
  kits: KitPalette = defaultKitPalette(),
): Piece[] {
  const homeSpots = side === "right" ? CK_RIGHT_HOME : mirrorSpots(CK_RIGHT_HOME);
  const awaySpots = side === "right" ? CK_RIGHT_AWAY : mirrorSpots(CK_RIGHT_AWAY);
  return [
    ...piecesFromSpots(homeSpots, "home", "starter", kits),
    ...benchPieces(benchCount, "home", kits),
    ...piecesFromSpots(awaySpots, "away", "starter", kits),
    ...benchPieces(benchCount, "away", kits),
  ];
}

const SCENE_PRESET_DEFS: Record<
  ScenePresetId,
  {
    labelKey: MessageKey;
    phase: ScenePhase;
    sports: SportId[];
    build: (
      benchCount: number,
      kits: KitPalette,
    ) => Omit<BuiltScenePreset, "label">;
  }
> = {
  "ck-right-zonal": {
    labelKey: "scenePresetCkRightZonal",
    phase: "setpiece",
    sports: ["soccer"],
    build: (benchCount, kits) => ({
      phase: "setpiece",
      viewport: VIEW_PRESETS["ck-setup-right"],
      pieces: ckZonalPieces("right", benchCount, kits),
      ball: { ...CK_RIGHT_BALL },
    }),
  },
  "ck-left-zonal": {
    labelKey: "scenePresetCkLeftZonal",
    phase: "setpiece",
    sports: ["soccer"],
    build: (benchCount, kits) => ({
      phase: "setpiece",
      viewport: VIEW_PRESETS["ck-setup-left"],
      pieces: ckZonalPieces("left", benchCount, kits),
      ball: mirrorBall(CK_RIGHT_BALL),
    }),
  },
};

export function scenePresetsForSport(sport: SportId): ScenePresetEntry[] {
  return (Object.keys(SCENE_PRESET_DEFS) as ScenePresetId[])
    .filter((id) => SCENE_PRESET_DEFS[id].sports.includes(sport))
    .map((id) => ({ id, key: SCENE_PRESET_DEFS[id].labelKey }));
}

export function buildScenePreset(
  id: ScenePresetId,
  sport: SportId,
  benchCount: number,
  kits: KitPalette = defaultKitPalette(),
  locale: Locale = APP_LOCALE,
): BuiltScenePreset | null {
  const def = SCENE_PRESET_DEFS[id];
  if (!def || !def.sports.includes(sport)) return null;
  const built = def.build(benchCount, kits);
  return {
    label: messages[locale][def.labelKey],
    ...built,
  };
}
