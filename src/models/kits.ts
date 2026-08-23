import { normalizePieceColor } from "../canvas/pieceInk";
import {
  AWAY_COLOR,
  AWAY_GK_COLOR,
  HOME_COLOR,
  HOME_GK_COLOR,
  isSoccerFamily,
  type BoardDocument,
  type Piece,
  type SportId,
} from "./types";

export type PieceKit = "outfield" | "gk";

export type KitPalette = {
  home: string;
  away: string;
  homeGk: string;
  awayGk: string;
};

export function sportHasGk(sport: SportId): boolean {
  return isSoccerFamily(sport);
}

export function defaultKitPalette(): KitPalette {
  return {
    home: HOME_COLOR,
    away: AWAY_COLOR,
    homeGk: HOME_GK_COLOR,
    awayGk: AWAY_GK_COLOR,
  };
}

export function kitsFromBoard(board: BoardDocument): KitPalette {
  const d = defaultKitPalette();
  return {
    home: normalizePieceColor(board.homeColor ?? d.home, d.home),
    away: normalizePieceColor(board.awayColor ?? d.away, d.away),
    homeGk: normalizePieceColor(board.homeGkColor ?? d.homeGk, d.homeGk),
    awayGk: normalizePieceColor(board.awayGkColor ?? d.awayGk, d.awayGk),
  };
}

export function kitOf(piece: Piece): PieceKit {
  return piece.kit === "gk" ? "gk" : "outfield";
}

export function colorForKit(
  kits: KitPalette,
  team: "home" | "away",
  kit: PieceKit,
): string {
  if (team === "home") return kit === "gk" ? kits.homeGk : kits.home;
  return kit === "gk" ? kits.awayGk : kits.away;
}

export function paintPiecesWithKits(pieces: Piece[], kits: KitPalette): Piece[] {
  return pieces.map((p) => ({
    ...p,
    color: colorForKit(kits, p.team, kitOf(p)),
  }));
}

/** ゴールに一番近いスタメンを GK にする。既に kit がある駒は触らない。 */
export function tagKeepers(sport: SportId, pieces: Piece[]): Piece[] {
  if (!sportHasGk(sport)) {
    return pieces.map((p) =>
      p.kit === "gk" ? { ...p, kit: "outfield" as const } : p,
    );
  }
  const out = pieces.map((p) => ({
    ...p,
    kit: p.kit ?? ("outfield" as const),
  }));
  for (const team of ["home", "away"] as const) {
    if (out.some((p) => p.team === team && p.kit === "gk")) continue;
    const starters = out.filter((p) => p.team === team && p.role === "starter");
    if (!starters.length) continue;
    const gk = starters.reduce((best, p) => {
      if (team === "home") return p.x < best.x ? p : best;
      return p.x > best.x ? p : best;
    });
    const i = out.findIndex((p) => p.id === gk.id);
    if (i >= 0) out[i] = { ...out[i], kit: "gk" };
  }
  return out;
}

export function applyGkColorsOnMigrate(
  pieces: Piece[],
  kits: KitPalette,
): Piece[] {
  return pieces.map((p) =>
    kitOf(p) === "gk"
      ? { ...p, color: colorForKit(kits, p.team, "gk") }
      : p,
  );
}
