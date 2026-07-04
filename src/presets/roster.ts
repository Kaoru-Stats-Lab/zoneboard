import type { Piece, RosterPlayer, SportId, TeamRoster } from "../models/types";
import { AWAY_COLOR, HOME_COLOR } from "../models/types";
import { uid } from "../models/id";
import { DEFAULT_BENCH_COUNT } from "./bench";

/** 競技ごとのスタメン人数 */
export const STARTER_COUNT: Record<SportId, number> = {
  soccer: 11,
  basketball: 5,
  volleyball: 6,
};

/** フォーメーション座標（背番号は後から上書き） */
export function starterSpots(sport: SportId): { x: number; y: number }[] {
  if (sport === "soccer") {
    return [
      { x: 0.08, y: 0.5 },
      { x: 0.22, y: 0.18 },
      { x: 0.22, y: 0.38 },
      { x: 0.22, y: 0.62 },
      { x: 0.22, y: 0.82 },
      { x: 0.42, y: 0.18 },
      { x: 0.42, y: 0.38 },
      { x: 0.42, y: 0.62 },
      { x: 0.42, y: 0.82 },
      { x: 0.62, y: 0.38 },
      { x: 0.62, y: 0.62 },
    ];
  }
  if (sport === "basketball") {
    return [
      { x: 0.2, y: 0.5 },
      { x: 0.35, y: 0.25 },
      { x: 0.35, y: 0.75 },
      { x: 0.5, y: 0.35 },
      { x: 0.5, y: 0.65 },
    ];
  }
  return [
    { x: 0.2, y: 0.5 },
    { x: 0.35, y: 0.2 },
    { x: 0.35, y: 0.5 },
    { x: 0.35, y: 0.8 },
    { x: 0.5, y: 0.35 },
    { x: 0.5, y: 0.65 },
  ];
}

function mirrorX(spots: { x: number; y: number }[]) {
  return spots.map((s) => ({ x: 1 - s.x, y: s.y }));
}

function parseFoot(token: string): "L" | "R" | "B" | null {
  const t = token.trim().toUpperCase();
  if (t === "L" || t === "左") return "L";
  if (t === "R" || t === "右") return "R";
  if (t === "B" || t === "両" || t === "BOTH") return "B";
  return null;
}

/**
 * 名簿テキストをパース。
 * `番号` / `番号,名前` / `番号,名前,R` / `番号,,L` / `番号,R`
 */
export function parseRosterText(text: string): RosterPlayer[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const out: RosterPlayer[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const parts = line.split(/[,，\t]/).map((s) => s.trim());
    if (parts.length === 1) {
      const m = parts[0].match(/^(\d+)(?:\s+(.+))?$/);
      if (!m) continue;
      const number = m[1];
      if (seen.has(number)) continue;
      seen.add(number);
      const rest = (m[2] ?? "").trim();
      const footOnly = parseFoot(rest);
      out.push({
        number,
        label: footOnly ? "" : rest,
        preferredFoot: footOnly,
      });
      continue;
    }
    const number = parts[0];
    if (!/^\d+$/.test(number) || seen.has(number)) continue;
    seen.add(number);
    let label = parts[1] ?? "";
    let preferredFoot: "L" | "R" | "B" | null = null;
    if (parts.length >= 3) {
      preferredFoot = parseFoot(parts[2]);
    } else {
      const footOnly = parseFoot(label);
      if (footOnly) {
        preferredFoot = footOnly;
        label = "";
      }
    }
    out.push({ number, label, preferredFoot });
  }
  return out;
}

/** スタメン背番号: `1,2,3,...` または改行区切り */
export function parseStarterNumbers(text: string): string[] {
  return text
    .split(/[\s,，、]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
}

export function emptyRoster(): TeamRoster {
  return { players: [], starterNumbers: [] };
}

/**
 * 名簿 + スタメン背番号から駒を生成。
 * スタメンはフォーメ位置、残りはベンチ帯。
 */
export function piecesFromRoster(
  sport: SportId,
  team: "home" | "away",
  roster: TeamRoster,
  benchCount: number = DEFAULT_BENCH_COUNT,
): Piece[] {
  const color = team === "home" ? HOME_COLOR : AWAY_COLOR;
  const facing = team === "home" ? 0 : 180;
  const nStart = STARTER_COUNT[sport];
  let spots = starterSpots(sport);
  if (team === "away") spots = mirrorX(spots);

  const byNum = new Map(roster.players.map((p) => [p.number, p]));
  let starters = roster.starterNumbers
    .map((n) => byNum.get(n))
    .filter((p): p is RosterPlayer => !!p)
    .slice(0, nStart);

  // スタメン未指定なら名簿の先頭から
  if (starters.length === 0 && roster.players.length > 0) {
    starters = roster.players.slice(0, nStart);
  }

  const starterSet = new Set(starters.map((p) => p.number));
  const pieces: Piece[] = [];

  starters.forEach((p, i) => {
    const spot = spots[i] ?? spots[spots.length - 1];
    pieces.push({
      id: uid(),
      x: spot.x,
      y: spot.y,
      number: p.number,
      label: p.label,
      color,
      team,
      facing,
      role: "starter",
      preferredFoot: p.preferredFoot ?? null,
    });
  });

  const benchY = team === "home" ? 1.08 : -0.08;
  const maxBench = benchCount;
  const benchPlayers = roster.players
    .filter((p) => !starterSet.has(p.number))
    .slice(0, maxBench);

  benchPlayers.forEach((p, i) => {
    const t = benchPlayers.length === 1 ? 0.5 : i / (benchPlayers.length - 1);
    pieces.push({
      id: uid(),
      x: 0.06 + t * 0.88,
      y: benchY,
      number: p.number,
      label: p.label,
      color,
      team,
      facing,
      role: "bench",
      preferredFoot: p.preferredFoot ?? null,
    });
  });

  return pieces;
}

/** 両チーム分をマージ（既存の相手チーム駒は残す場合は呼び出し側で結合） */
export function applyLineupToScenePieces(
  sport: SportId,
  home: TeamRoster,
  away: TeamRoster,
  benchCount: number = DEFAULT_BENCH_COUNT,
): Piece[] {
  return [
    ...piecesFromRoster(sport, "home", home, benchCount),
    ...piecesFromRoster(sport, "away", away, benchCount),
  ];
}
