import type { Piece, PitchOrientation } from "./types";

/**
 * チームの攻撃方向（ワールド度）。
 * canvas: 0 = +x（右）, 90 = +y（下）。
 * 横: ホーム左→右。縦: ホーム下帯→上ゴール（270°）。
 */
export function defaultFacingForTeam(
  team: "home" | "away",
  orientation: PitchOrientation | undefined = "landscape",
): number {
  if (orientation === "portrait") {
    return team === "home" ? 270 : 90;
  }
  return team === "home" ? 0 : 180;
}

export type ArrowDir = "left" | "right" | "up" | "down";

export function arrowDirFromKey(key: string): ArrowDir | null {
  if (key === "ArrowLeft") return "left";
  if (key === "ArrowRight") return "right";
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  return null;
}

/** 画面の矢印 → 向き（ピッチ向きに依存しない絶対角） */
export function facingForCardinal(dir: ArrowDir): number {
  switch (dir) {
    case "right":
      return 0;
    case "down":
      return 90;
    case "left":
      return 180;
    case "up":
      return 270;
  }
}

/**
 * 押下中の矢印コード（ArrowLeft 等）から向き。
 * 同時押しで斜め（例: Right+Up → 315°＝右上）。相反する軸は相殺。
 * どちらも無いときは null。
 */
export function facingFromArrowKeys(heldKeys: Iterable<string>): number | null {
  const held = heldKeys instanceof Set ? heldKeys : new Set(heldKeys);
  const dx =
    (held.has("ArrowRight") ? 1 : 0) - (held.has("ArrowLeft") ? 1 : 0);
  const dy =
    (held.has("ArrowDown") ? 1 : 0) - (held.has("ArrowUp") ? 1 : 0);
  if (dx === 0 && dy === 0) return null;
  return normalizeFacing((Math.atan2(dy, dx) * 180) / Math.PI);
}

export function normalizeFacing(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** 選択グループを同じ絶対向きに揃える */
export function setGroupFacing(group: Piece[], facing: number): Piece[] {
  const f = normalizeFacing(facing);
  return group.map((p) => ({ ...p, facing: f }));
}

/** 各駒を自チームの攻撃方向に揃える（ホーム／アウェイ混在可） */
export function setGroupFacingToTeamAttack(
  group: Piece[],
  orientation: PitchOrientation | undefined,
): Piece[] {
  return group.map((p) => ({
    ...p,
    facing: defaultFacingForTeam(p.team, orientation),
  }));
}
