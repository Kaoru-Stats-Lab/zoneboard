import type { DrawObject, Piece } from "./types";

/** Resolve ordered piece centres for a structure link polyline. */
export function resolveLinkPoints(
  pieces: Piece[],
  pieceIds: string[],
): { x: number; y: number }[] {
  const byId = new Map(pieces.map((p) => [p.id, p]));
  const pts: { x: number; y: number }[] = [];
  for (const id of pieceIds) {
    const p = byId.get(id);
    if (p) pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

/** Drop deleted pieces from links; remove links that fall below 2 anchors. */
export function pruneLinkObjects(
  objects: DrawObject[],
  dropPieceIds: Set<string>,
): DrawObject[] {
  if (dropPieceIds.size === 0) return objects;
  const out: DrawObject[] = [];
  for (const obj of objects) {
    if (obj.type !== "link") {
      out.push(obj);
      continue;
    }
    const pieceIds = obj.pieceIds.filter((id) => !dropPieceIds.has(id));
    if (pieceIds.length >= 2) out.push({ ...obj, pieceIds });
  }
  return out;
}
