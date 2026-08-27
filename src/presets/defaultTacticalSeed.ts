/**
 * 新規ボードの初期局面。
 * 完成フォーメではなく「解説の途中」— Place → Draw を暗黙に示す。
 * formationPieces は競技切替・内部足場用。ユーザー向け default はここだけ。
 */
import { lineColorForBoard } from "../canvas/drawingInk";
import { ballPosOnPiece } from "../models/ballAttach";
import { uid } from "../models/id";
import type { KitPalette } from "../models/kits";
import { colorForKit, defaultKitPalette } from "../models/kits";
import type {
  BoardDocument,
  DrawObject,
  Piece,
  Scene,
  SportId,
} from "../models/types";
import { DEFAULT_VIEWPORT } from "./viewport";

type Spot = {
  x: number;
  y: number;
  number: string;
  team: "home" | "away";
  gk?: boolean;
};

function inkBoard(sport: SportId): BoardDocument {
  return {
    sport,
    showGrassPitch: sport === "soccer",
  } as BoardDocument;
}

function pieceFromSpot(spot: Spot, kits: KitPalette): Piece {
  const kit = spot.gk ? "gk" : "outfield";
  return {
    id: uid(),
    x: spot.x,
    y: spot.y,
    number: spot.number,
    label: "",
    color: colorForKit(kits, spot.team, kit),
    team: spot.team,
    facing: spot.team === "home" ? 0 : 180,
    role: "starter",
    kit,
  };
}

function line(
  kind: "pass" | "run" | "dribble" | "screen",
  points: { x: number; y: number }[],
  sport: SportId,
): DrawObject {
  return {
    id: uid(),
    type: "line",
    kind,
    points,
    color: lineColorForBoard(inkBoard(sport), kind),
    strokeWidth: 2,
  };
}

/**
 * Soccer: left–centre moment.
 * #8 holds → pass to #10; #7 runs into the channel. Away presses the lane.
 * No GK, no bench, most of the pitch empty.
 */
function soccerSeed(kits: KitPalette): Pick<
  Scene,
  "pieces" | "ball" | "objects" | "viewport"
> {
  const spots: Spot[] = [
    { team: "home", number: "8", x: 0.36, y: 0.52 },
    { team: "home", number: "10", x: 0.5, y: 0.34 },
    { team: "home", number: "7", x: 0.54, y: 0.16 },
    { team: "home", number: "6", x: 0.26, y: 0.58 },
    { team: "away", number: "5", x: 0.43, y: 0.46 },
    { team: "away", number: "4", x: 0.55, y: 0.4 },
    { team: "away", number: "3", x: 0.62, y: 0.26 },
  ];
  const pieces = spots.map((s) => pieceFromSpot(s, kits));
  const carrier = pieces.find((p) => p.number === "8" && p.team === "home")!;
  const ballPos = ballPosOnPiece(carrier);

  return {
    pieces,
    ball: { ...ballPos, attachedTo: carrier.id },
    objects: [
      line(
        "pass",
        [
          { x: 0.38, y: 0.5 },
          { x: 0.48, y: 0.36 },
        ],
        "soccer",
      ),
      line(
        "run",
        [
          { x: 0.54, y: 0.16 },
          { x: 0.68, y: 0.22 },
          { x: 0.74, y: 0.28 },
        ],
        "soccer",
      ),
    ],
    viewport: { ...DEFAULT_VIEWPORT, zoom: 1.15, cx: 0.42, cy: 0.42 },
  };
}

/** Futsal / beach: same idea, fewer bodies on a denser pitch. */
function fiveASideSeed(
  sport: "futsal" | "beach_soccer",
  kits: KitPalette,
): Pick<Scene, "pieces" | "ball" | "objects" | "viewport"> {
  const spots: Spot[] = [
    { team: "home", number: "8", x: 0.34, y: 0.5 },
    { team: "home", number: "9", x: 0.52, y: 0.36 },
    { team: "home", number: "7", x: 0.48, y: 0.72 },
    { team: "away", number: "4", x: 0.46, y: 0.48 },
    { team: "away", number: "5", x: 0.6, y: 0.38 },
  ];
  const pieces = spots.map((s) => pieceFromSpot(s, kits));
  const carrier = pieces.find((p) => p.number === "8" && p.team === "home")!;
  const ballPos = ballPosOnPiece(carrier);
  return {
    pieces,
    ball: { ...ballPos, attachedTo: carrier.id },
    objects: [
      line(
        "pass",
        [
          { x: 0.36, y: 0.48 },
          { x: 0.5, y: 0.38 },
        ],
        sport,
      ),
      line(
        "run",
        [
          { x: 0.48, y: 0.72 },
          { x: 0.66, y: 0.62 },
        ],
        sport,
      ),
    ],
    viewport: { ...DEFAULT_VIEWPORT },
  };
}

/** Basketball half: drive / kick-out moment, not a full 5v5 set. */
function basketballSeed(kits: KitPalette): Pick<
  Scene,
  "pieces" | "ball" | "objects" | "viewport"
> {
  const spots: Spot[] = [
    { team: "home", number: "1", x: 0.68, y: 0.5 },
    { team: "home", number: "3", x: 0.82, y: 0.22 },
    { team: "home", number: "4", x: 0.78, y: 0.72 },
    { team: "away", number: "2", x: 0.74, y: 0.42 },
    { team: "away", number: "5", x: 0.86, y: 0.55 },
  ];
  const pieces = spots.map((s) => pieceFromSpot(s, kits));
  const carrier = pieces.find((p) => p.number === "1" && p.team === "home")!;
  const ballPos = ballPosOnPiece(carrier);
  return {
    pieces,
    ball: { ...ballPos, attachedTo: carrier.id },
    objects: [
      line(
        "pass",
        [
          { x: 0.7, y: 0.48 },
          { x: 0.8, y: 0.26 },
        ],
        "basketball",
      ),
      line(
        "run",
        [
          { x: 0.78, y: 0.72 },
          { x: 0.9, y: 0.58 },
        ],
        "basketball",
      ),
    ],
    viewport: { ...DEFAULT_VIEWPORT },
  };
}

/** Volleyball: serve-receive / set moment — few pieces, empty court. */
function volleyballSeed(kits: KitPalette): Pick<
  Scene,
  "pieces" | "ball" | "objects" | "viewport"
> {
  const spots: Spot[] = [
    { team: "home", number: "1", x: 0.28, y: 0.55 },
    { team: "home", number: "2", x: 0.38, y: 0.28 },
    { team: "home", number: "3", x: 0.42, y: 0.72 },
    { team: "away", number: "4", x: 0.62, y: 0.4 },
    { team: "away", number: "5", x: 0.7, y: 0.62 },
  ];
  const pieces = spots.map((s) => pieceFromSpot(s, kits));
  const carrier = pieces.find((p) => p.number === "1" && p.team === "home")!;
  const ballPos = ballPosOnPiece(carrier);
  return {
    pieces,
    ball: { ...ballPos, attachedTo: carrier.id },
    objects: [
      line(
        "pass",
        [
          { x: 0.3, y: 0.52 },
          { x: 0.38, y: 0.32 },
        ],
        "volleyball",
      ),
      line(
        "run",
        [
          { x: 0.42, y: 0.72 },
          { x: 0.48, y: 0.45 },
        ],
        "volleyball",
      ),
    ],
    viewport: { ...DEFAULT_VIEWPORT },
  };
}

/** 新規ボード／空ストア用。ベンチなし・ラベルなし・解説の途中。 */
export function defaultTacticalSeed(
  sport: SportId = "soccer",
  kits: KitPalette = defaultKitPalette(),
): Pick<Scene, "pieces" | "ball" | "objects" | "viewport"> {
  if (sport === "soccer") return soccerSeed(kits);
  if (sport === "futsal" || sport === "beach_soccer") {
    return fiveASideSeed(sport, kits);
  }
  if (sport === "basketball") return basketballSeed(kits);
  return volleyballSeed(kits);
}
