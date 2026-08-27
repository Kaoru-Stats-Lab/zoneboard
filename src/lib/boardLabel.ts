import type { BoardDocument } from "../models/types";

/** 試合帯ラベル → ボードタイトル → 短い id */
export function boardDisplayName(
  board: BoardDocument,
  fallback = "",
): string {
  const match = board.matchLabel?.trim();
  if (match) return match;
  const title = board.title?.trim();
  if (title) return title;
  return fallback || board.id.slice(0, 6);
}
