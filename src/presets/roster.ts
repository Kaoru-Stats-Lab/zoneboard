import { normalizePieceNumber } from "../canvas/pieceInk";
import type { KitPalette } from "../models/kits";
import { colorForKit, defaultKitPalette, sportHasGk } from "../models/kits";
import type { Piece, RosterPlayer, SportId, TeamRoster } from "../models/types";
import { uid } from "../models/id";
import { DEFAULT_BENCH_COUNT } from "./bench";

/** 競技ごとのスタメン人数 */
export const STARTER_COUNT: Record<SportId, number> = {
  soccer: 11,
  futsal: 5,
  beach_soccer: 5,
  basketball: 5,
  volleyball: 6,
};

const FIVE_A_SIDE_SPOTS = [
  { x: 0.12, y: 0.5 },
  { x: 0.32, y: 0.28 },
  { x: 0.32, y: 0.72 },
  { x: 0.52, y: 0.5 },
  { x: 0.72, y: 0.5 },
];

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
  if (sport === "futsal" || sport === "beach_soccer") {
    return FIVE_A_SIDE_SPOTS.map((s) => ({ ...s }));
  }
  if (sport === "basketball") {
    return [
      { x: 0.58, y: 0.5 },
      { x: 0.72, y: 0.2 },
      { x: 0.72, y: 0.8 },
      { x: 0.88, y: 0.35 },
      { x: 0.88, y: 0.65 },
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

function parseMetricToken(token: string): number | null {
  const n = Number(token.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

/**
 * 名簿テキストをパース。
 * `番号` / `番号,名前` / `番号,名前,R` / `番号,名前,188,88`（バスケ身長体重）
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
    let heightCm: number | null = null;
    let weightKg: number | null = null;
    if (parts.length >= 3) {
      const foot = parseFoot(parts[2]);
      if (foot) {
        preferredFoot = foot;
      } else {
        heightCm = parseMetricToken(parts[2]);
        if (parts.length >= 4) weightKg = parseMetricToken(parts[3]);
      }
    } else {
      const footOnly = parseFoot(label);
      if (footOnly) {
        preferredFoot = footOnly;
        label = "";
      }
    }
    out.push({ number, label, preferredFoot, heightCm, weightKg });
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

/** 名簿をペースト欄と同じ文法に戻す（番号,名前[,足|身長,体重]） */
export function formatRosterText(players: RosterPlayer[]): string {
  return players
    .map((p) => {
      const parts = [p.number];
      const name = p.label.trim();
      if (name) parts.push(name);
      if (p.preferredFoot) {
        if (!name) parts.push("");
        parts.push(p.preferredFoot);
      } else if (p.heightCm) {
        if (!name) parts.push("");
        parts.push(String(p.heightCm));
        if (p.weightKg) parts.push(String(p.weightKg));
      }
      return parts.join(",");
    })
    .join("\n");
}

/** 駒カードからの名前を名簿行に載せる。背番号がキー（チーム内）。
 *  既定は空文字で既存名を消さない。`replaceLabel` でカードからの明示更新（空含む）を許す。 */
export function upsertRosterPlayer(
  team: TeamRoster,
  previousNumber: string,
  next: RosterPlayer,
  opts?: { replaceLabel?: boolean },
): TeamRoster {
  const prev = normalizePieceNumber(previousNumber);
  const number = normalizePieceNumber(next.number);
  if (!number) return team;

  const players = [...team.players];
  const idx = players.findIndex((p) => {
    const n = normalizePieceNumber(p.number);
    return n === prev || n === number;
  });
  const existing = idx >= 0 ? players[idx] : undefined;
  const nextLabel = next.label.trim();
  const row: RosterPlayer = {
    number,
    label: opts?.replaceLabel
      ? nextLabel
      : nextLabel || existing?.label?.trim() || "",
    preferredFoot:
      next.preferredFoot !== undefined
        ? next.preferredFoot
        : (existing?.preferredFoot ?? null),
    heightCm:
      next.heightCm !== undefined
        ? next.heightCm
        : (existing?.heightCm ?? null),
    weightKg:
      next.weightKg !== undefined
        ? next.weightKg
        : (existing?.weightKg ?? null),
  };
  if (idx < 0) players.push(row);
  else players[idx] = { ...existing!, ...row };

  const starterNumbers =
    prev && prev !== number
      ? team.starterNumbers.map((n) =>
          normalizePieceNumber(n) === prev ? number : n,
        )
      : team.starterNumbers;
  return { ...team, players, starterNumbers };
}

/** 名簿の名前を、同じチーム・背番号の駒へ載せる（取込直後の空ラベルを埋める） */
export function paintPiecesFromRoster(
  pieces: Piece[],
  team: "home" | "away",
  roster: TeamRoster,
): Piece[] {
  if (roster.players.length === 0) return pieces;
  const byNum = new Map(
    roster.players.map((p) => [normalizePieceNumber(p.number), p]),
  );
  return pieces.map((piece) => {
    if (piece.team !== team) return piece;
    const num = normalizePieceNumber(piece.number);
    if (!num) return piece;
    const row = byNum.get(num);
    if (!row) return piece;
    const label = piece.label.trim() || row.label.trim();
    return {
      ...piece,
      label: label || piece.label,
      preferredFoot:
        piece.preferredFoot ?? row.preferredFoot ?? null,
      heightCm: piece.heightCm ?? row.heightCm ?? null,
      weightKg: piece.weightKg ?? row.weightKg ?? null,
    };
  });
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
  kits: KitPalette = defaultKitPalette(),
): Piece[] {
  const facing = team === "home" ? 0 : 180;
  const nStart = STARTER_COUNT[sport];
  let spots = starterSpots(sport);
  if (team === "away") spots = mirrorX(spots);

  const byNum = new Map(
    roster.players.map((p) => [normalizePieceNumber(p.number), p]),
  );
  let starters = roster.starterNumbers
    .map((n) => byNum.get(normalizePieceNumber(n)))
    .filter((p): p is RosterPlayer => !!p)
    .slice(0, nStart);

  // スタメン未指定なら名簿の先頭から
  if (starters.length === 0 && roster.players.length > 0) {
    starters = roster.players.slice(0, nStart);
  }

  const starterSet = new Set(
    starters.map((p) => normalizePieceNumber(p.number)),
  );
  const pieces: Piece[] = [];

  starters.forEach((p, i) => {
    const spot = spots[i] ?? spots[spots.length - 1];
    const kit = sportHasGk(sport) && i === 0 ? "gk" : "outfield";
    pieces.push({
      id: uid(),
      x: spot.x,
      y: spot.y,
      number: p.number,
      label: p.label,
      color: colorForKit(kits, team, kit),
      team,
      facing,
      role: "starter",
      kit,
      preferredFoot: p.preferredFoot ?? null,
      heightCm: p.heightCm ?? null,
      weightKg: p.weightKg ?? null,
    });
  });

  const benchY = team === "home" ? 1.08 : -0.08;
  const maxBench = benchCount;
  const benchPlayers = roster.players
    .filter((p) => !starterSet.has(normalizePieceNumber(p.number)))
    .slice(0, maxBench);

  benchPlayers.forEach((p, i) => {
    const t = benchPlayers.length === 1 ? 0.5 : i / (benchPlayers.length - 1);
    pieces.push({
      id: uid(),
      x: 0.06 + t * 0.88,
      y: benchY,
      number: p.number,
      label: p.label,
      color: colorForKit(kits, team, "outfield"),
      team,
      facing,
      role: "bench",
      kit: "outfield",
      preferredFoot: p.preferredFoot ?? null,
      heightCm: p.heightCm ?? null,
      weightKg: p.weightKg ?? null,
    });
  });

  return pieces;
}

/** フォーメ再配置でも、直前の駒または名簿の名前・身体情報を背番号で戻す（チーム内） */
export function withRosterIdentity(
  pieces: Piece[],
  roster: { home: TeamRoster; away: TeamRoster },
  previous: Piece[] = [],
): Piece[] {
  return pieces.map((piece) => {
    const num = normalizePieceNumber(piece.number);
    if (!num) return piece;
    const prev = previous.find(
      (p) =>
        p.team === piece.team && normalizePieceNumber(p.number) === num,
    );
    const row = roster[piece.team].players.find(
      (p) => normalizePieceNumber(p.number) === num,
    );
    if (!prev && !row) return piece;
    const label = (
      prev?.label?.trim() ||
      row?.label?.trim() ||
      piece.label
    ).trim();
    return {
      ...piece,
      label: label || piece.label,
      preferredFoot:
        prev?.preferredFoot ?? row?.preferredFoot ?? piece.preferredFoot ?? null,
      heightCm: prev?.heightCm ?? row?.heightCm ?? piece.heightCm ?? null,
      weightKg: prev?.weightKg ?? row?.weightKg ?? piece.weightKg ?? null,
    };
  });
}

/** 両チーム分をマージ（既存の相手チーム駒は残す場合は呼び出し側で結合） */
export function applyLineupToScenePieces(
  sport: SportId,
  home: TeamRoster,
  away: TeamRoster,
  benchCount: number = DEFAULT_BENCH_COUNT,
  kits: KitPalette = defaultKitPalette(),
): Piece[] {
  return [
    ...piecesFromRoster(sport, "home", home, benchCount, kits),
    ...piecesFromRoster(sport, "away", away, benchCount, kits),
  ];
}

/** 指定チームだけ XI＋控えで差し替え。相手チームの駒は残す */
export function applyTeamLineupToScenePieces(
  existing: Piece[],
  sport: SportId,
  team: "home" | "away",
  roster: TeamRoster,
  benchCount: number = DEFAULT_BENCH_COUNT,
  kits: KitPalette = defaultKitPalette(),
): Piece[] {
  const kept = existing.filter((p) => p.team !== team);
  if (roster.players.length === 0) return kept;
  return [
    ...kept,
    ...piecesFromRoster(sport, team, roster, benchCount, kits),
  ];
}

/** XI に書いたが名簿にいない背番号 */
export function missingStarterNumbers(roster: TeamRoster): string[] {
  const have = new Set(
    roster.players.map((p) => normalizePieceNumber(p.number)),
  );
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of roster.starterNumbers) {
    const n = normalizePieceNumber(raw);
    if (!n || seen.has(n) || have.has(n)) continue;
    seen.add(n);
    out.push(raw.trim() || n);
  }
  return out;
}
