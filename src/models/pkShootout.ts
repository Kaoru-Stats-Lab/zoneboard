import { uid } from "./id";
import type { BoardDocument, PkKickSlot, PkShootout } from "./types";

/** 初期表示本数（サドンデスは +1 ずつ足す。先取エンジンは持たない） */
export const DEFAULT_PK_ROUNDS = 5;

export function emptyPkSlot(): PkKickSlot {
  return { id: uid() };
}

export function emptyPkSlots(count = DEFAULT_PK_ROUNDS): PkKickSlot[] {
  return Array.from({ length: count }, () => emptyPkSlot());
}

export function createPkShootout(active = false): PkShootout {
  return {
    active,
    home: emptyPkSlots(),
    away: emptyPkSlots(),
  };
}

export function normalizePkShootout(raw: unknown): PkShootout {
  if (!raw || typeof raw !== "object") return createPkShootout(false);
  const o = raw as Partial<PkShootout>;
  const home = Array.isArray(o.home) ? o.home.map(normalizeSlot) : emptyPkSlots();
  const away = Array.isArray(o.away) ? o.away.map(normalizeSlot) : emptyPkSlots();
  return {
    active: Boolean(o.active),
    home: home.length > 0 ? home : emptyPkSlots(),
    away: away.length > 0 ? away : emptyPkSlots(),
  };
}

function normalizeSlot(raw: unknown): PkKickSlot {
  if (!raw || typeof raw !== "object") return emptyPkSlot();
  const s = raw as Partial<PkKickSlot>;
  const result =
    s.result === "scored" || s.result === "missed" ? s.result : undefined;
  const number =
    typeof s.number === "string" && s.number.trim()
      ? s.number.trim()
      : undefined;
  return {
    id: typeof s.id === "string" && s.id ? s.id : uid(),
    number,
    result,
  };
}

export function pkScoredCount(slots: PkKickSlot[]): number {
  return slots.filter((s) => s.result === "scored").length;
}

export function cyclePkResult(
  current: PkKickSlot["result"],
): PkKickSlot["result"] {
  if (current === undefined) return "scored";
  if (current === "scored") return "missed";
  return undefined;
}

export function teamLabelForPk(
  board: BoardDocument,
  team: "home" | "away",
): string {
  const name =
    team === "home" ? board.homeTeam.trim() : board.awayTeam.trim();
  return name || (team === "home" ? "Home" : "Away");
}
