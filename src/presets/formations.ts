import { DEFAULT_BENCH_COUNT } from "./bench";
import type { Piece, SportId } from "../models/types";
import { AWAY_COLOR, HOME_COLOR } from "../models/types";
import { uid } from "../models/id";

type Spot = { x: number; y: number; number: string };

const SOCCER_442_HOME: Spot[] = [
  { x: 0.08, y: 0.5, number: "1" },
  { x: 0.22, y: 0.18, number: "2" },
  { x: 0.22, y: 0.38, number: "4" },
  { x: 0.22, y: 0.62, number: "5" },
  { x: 0.22, y: 0.82, number: "3" },
  { x: 0.42, y: 0.18, number: "7" },
  { x: 0.42, y: 0.38, number: "6" },
  { x: 0.42, y: 0.62, number: "8" },
  { x: 0.42, y: 0.82, number: "11" },
  { x: 0.62, y: 0.38, number: "9" },
  { x: 0.62, y: 0.62, number: "10" },
];

function mirrorAway(spots: Spot[]): Spot[] {
  return spots.map((s) => ({ ...s, x: 1 - s.x }));
}

function toPieces(
  spots: Spot[],
  team: "home" | "away",
  facing: number,
  role: "starter" | "bench",
): Piece[] {
  const color = team === "home" ? HOME_COLOR : AWAY_COLOR;
  return spots.map((s) => ({
    id: uid(),
    x: s.x,
    y: s.y,
    number: s.number,
    label: "",
    color,
    team,
    facing,
    role,
  }));
}

/** ホーム下帯・アウェイ上帯（白バッファ内）に等間隔配置 */
function benchSpots(count: number, team: "home" | "away"): Spot[] {
  const y = team === "home" ? 1.08 : -0.08;
  const spots: Spot[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    spots.push({
      x: 0.06 + t * 0.88,
      y,
      number: String(12 + i),
    });
  }
  return spots;
}

export function formationPieces(
  sport: SportId,
  bothTeams: boolean,
  benchCount: number = DEFAULT_BENCH_COUNT,
): Piece[] {
  const benchN = benchCount;

  if (sport === "soccer") {
    const home = toPieces(SOCCER_442_HOME, "home", 0, "starter");
    const homeBench = toPieces(benchSpots(benchN, "home"), "home", 0, "bench");
    if (!bothTeams) return [...home, ...homeBench];
    const away = toPieces(mirrorAway(SOCCER_442_HOME), "away", 180, "starter");
    const awayBench = toPieces(benchSpots(benchN, "away"), "away", 180, "bench");
    return [...home, ...homeBench, ...away, ...awayBench];
  }

  if (sport === "basketball") {
    const homeSpots: Spot[] = [
      { x: 0.2, y: 0.5, number: "1" },
      { x: 0.35, y: 0.25, number: "2" },
      { x: 0.35, y: 0.75, number: "3" },
      { x: 0.5, y: 0.35, number: "4" },
      { x: 0.5, y: 0.65, number: "5" },
    ];
    const home = toPieces(homeSpots, "home", 0, "starter");
    const homeBench = toPieces(
      benchSpots(Math.min(benchN, 7), "home"),
      "home",
      0,
      "bench",
    );
    if (!bothTeams) return [...home, ...homeBench];
    return [
      ...home,
      ...homeBench,
      ...toPieces(mirrorAway(homeSpots), "away", 180, "starter"),
      ...toPieces(benchSpots(Math.min(benchN, 7), "away"), "away", 180, "bench"),
    ];
  }

  const homeSpots: Spot[] = [
    { x: 0.2, y: 0.5, number: "1" },
    { x: 0.35, y: 0.2, number: "2" },
    { x: 0.35, y: 0.5, number: "3" },
    { x: 0.35, y: 0.8, number: "4" },
    { x: 0.5, y: 0.35, number: "5" },
    { x: 0.5, y: 0.65, number: "6" },
  ];
  const home = toPieces(homeSpots, "home", 0, "starter");
  const homeBench = toPieces(
    benchSpots(Math.min(benchN, 6), "home"),
    "home",
    0,
    "bench",
  );
  if (!bothTeams) return [...home, ...homeBench];
  return [
    ...home,
    ...homeBench,
    ...toPieces(mirrorAway(homeSpots), "away", 180, "starter"),
    ...toPieces(benchSpots(Math.min(benchN, 6), "away"), "away", 180, "bench"),
  ];
}
