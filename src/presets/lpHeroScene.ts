import { lineColorForBoard } from "../canvas/drawingInk";
import { smoothLinePath } from "../canvas/smoothPath";
import { createBoard } from "../models/defaults";
import { ballPosOnPiece } from "../models/ballAttach";
import type {
  BoardDocument,
  LineObject,
  Piece,
  Scene,
} from "../models/types";
import {
  AWAY_COLOR,
  AWAY_GK_COLOR,
  HOME_COLOR,
  HOME_GK_COLOR,
  PIECE_SCALE,
} from "../models/types";
import { DEFAULT_VIEWPORT } from "../presets/viewport";

export const LP_HERO_CYCLE_MS = 6000;
export const LP_T_PASS_START = 1200;
export const LP_T_PASS_END = 2800;
export const LP_T_DRIBBLE_END = 4200;
export const LP_T_RAIL_START = 4200;
export const LP_T_OBS_START = 5500;

export const LP_HERO_PIECE = {
  home8: "lp-h-8",
  home7: "lp-h-7",
} as const;

type Spot = { id?: string; x: number; y: number; number: string };

const HOME_433: Spot[] = [
  { x: 0.08, y: 0.5, number: "1" },
  { x: 0.22, y: 0.16, number: "2" },
  { x: 0.22, y: 0.38, number: "4" },
  { x: 0.22, y: 0.62, number: "5" },
  { x: 0.22, y: 0.84, number: "3" },
  { x: 0.38, y: 0.5, number: "6" },
  { id: LP_HERO_PIECE.home8, x: 0.42, y: 0.32, number: "8" },
  { x: 0.42, y: 0.68, number: "10" },
  { id: LP_HERO_PIECE.home7, x: 0.64, y: 0.18, number: "7" },
  { x: 0.68, y: 0.5, number: "9" },
  { x: 0.64, y: 0.82, number: "11" },
];

/** 浅いブロック（主役の 4-3-3 を食わない） */
const AWAY_BLOCK: Spot[] = [
  { x: 0.92, y: 0.5, number: "1" },
  { x: 0.78, y: 0.38, number: "4" },
  { x: 0.78, y: 0.62, number: "5" },
  { x: 0.72, y: 0.5, number: "6" },
];

export const LP_PASS_RAW = [
  { x: 0.42, y: 0.32 },
  { x: 0.52, y: 0.22 },
  { x: 0.64, y: 0.18 },
];

export const LP_DRIBBLE_RAW = [
  { x: 0.64, y: 0.18 },
  { x: 0.72, y: 0.24 },
  { x: 0.8, y: 0.34 },
];

export const LP_PASS_POINTS = smoothLinePath(LP_PASS_RAW);
export const LP_DRIBBLE_POINTS = smoothLinePath(LP_DRIBBLE_RAW);

function makePiece(spot: Spot, team: "home" | "away"): Piece {
  const isGk = spot.number === "1";
  return {
    id: spot.id ?? `lp-${team}-${spot.number}`,
    x: spot.x,
    y: spot.y,
    number: spot.number,
    label: "",
    color: isGk
      ? team === "home"
        ? HOME_GK_COLOR
        : AWAY_GK_COLOR
      : team === "home"
        ? HOME_COLOR
        : AWAY_COLOR,
    team,
    facing: team === "home" ? 0 : 180,
    role: "starter",
    kit: isGk ? "gk" : "outfield",
  };
}

export function createLpHeroData(): { board: BoardDocument; scene: Scene } {
  const base = createBoard("soccer", "", "en");
  const pieces = [
    ...HOME_433.map((s) => makePiece(s, "home")),
    ...AWAY_BLOCK.map((s) => makePiece(s, "away")),
  ];
  const piece8 = pieces.find((p) => p.id === LP_HERO_PIECE.home8)!;
  const ballStart = ballPosOnPiece(piece8);
  const scene: Scene = {
    id: "lp-hero-scene",
    label: "",
    phase: "live",
    pieces,
    ball: { ...ballStart, attachedTo: LP_HERO_PIECE.home8 },
    objects: [],
    hideHalf: "none",
    teamFocus: "both",
  };
  const board: BoardDocument = {
    ...base,
    id: "lp-hero-board",
    title: "",
    showMatchBanner: false,
    showLanes5: false,
    showGrassPitch: true,
    pieceScale: PIECE_SCALE.tactics,
    scenes: [scene],
    activeSceneId: scene.id,
    viewport: { ...DEFAULT_VIEWPORT },
  };
  return { board, scene };
}

export function lpHeroPassLine(board: BoardDocument): LineObject {
  return {
    id: "lp-pass",
    type: "line",
    kind: "pass",
    points: LP_PASS_POINTS,
    color: lineColorForBoard(board, "pass"),
    strokeWidth: 2,
  };
}

export function lpHeroDribbleLine(board: BoardDocument): LineObject {
  return {
    id: "lp-dribble",
    type: "line",
    kind: "dribble",
    points: LP_DRIBBLE_POINTS,
    color: lineColorForBoard(board, "dribble"),
    strokeWidth: 2,
  };
}

export function passProgress(t: number): number {
  if (t < LP_T_PASS_START) return 0;
  if (t >= LP_T_PASS_END) return 1;
  return (t - LP_T_PASS_START) / (LP_T_PASS_END - LP_T_PASS_START);
}

export function dribbleProgress(t: number): number {
  if (t < LP_T_PASS_END) return 0;
  if (t >= LP_T_DRIBBLE_END) return 1;
  return (t - LP_T_PASS_END) / (LP_T_DRIBBLE_END - LP_T_PASS_END);
}

export function railCollapsed(t: number): boolean {
  return t >= LP_T_RAIL_START && t < LP_HERO_CYCLE_MS;
}

export function obsVisible(t: number): boolean {
  return t >= LP_T_OBS_START;
}

/** Pass and dribble already on the pitch — still for the after-match band. */
export function lpHeroSceneComplete(
  base: Scene,
  board: BoardDocument,
): Scene {
  const p7 = base.pieces.find((p) => p.id === LP_HERO_PIECE.home7);
  const ball = p7
    ? { ...ballPosOnPiece(p7), attachedTo: LP_HERO_PIECE.home7 }
    : base.ball;
  return {
    ...base,
    ball,
    objects: [lpHeroPassLine(board), lpHeroDribbleLine(board)],
  };
}
