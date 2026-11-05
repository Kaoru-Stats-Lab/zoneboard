import { uid } from "../models/id";
import type {
  BallObject,
  BoardDocument,
  DrawObject,
  Piece,
  Scene,
} from "../models/types";

function mapId(map: Map<string, string>, oldId: string): string {
  const existing = map.get(oldId);
  if (existing) return existing;
  const next = uid();
  map.set(oldId, next);
  return next;
}

function remapPiece(p: Piece, pieceMap: Map<string, string>): Piece {
  // Corrupt source may repeat the same piece id. First wins for attachedTo/link
  // remaps; later duplicates get a fresh id so the scene stays unique.
  if (pieceMap.has(p.id)) {
    return { ...p, id: uid() };
  }
  return { ...p, id: mapId(pieceMap, p.id) };
}

function remapBall(b: BallObject, pieceMap: Map<string, string>): BallObject {
  const next: BallObject = { ...b, id: uid() };
  if (typeof b.attachedTo === "string" && b.attachedTo) {
    const host = pieceMap.get(b.attachedTo);
    next.attachedTo = host ?? null;
  }
  return next;
}

function remapObject(
  obj: DrawObject,
  pieceMap: Map<string, string>,
): DrawObject {
  const id = uid();
  if (obj.type === "link") {
    return {
      ...obj,
      id,
      pieceIds: obj.pieceIds
        .map((pid) => pieceMap.get(pid))
        .filter((x): x is string => typeof x === "string"),
    };
  }
  return { ...obj, id };
}

function remapScene(scene: Scene): Scene {
  const pieceMap = new Map<string, string>();
  const pieces = scene.pieces.map((p) => remapPiece(p, pieceMap));
  const balls = scene.balls.map((b) => remapBall(b, pieceMap));
  const objects = scene.objects.map((o) => remapObject(o, pieceMap));
  return {
    ...scene,
    id: uid(),
    pieces,
    balls,
    objects,
  };
}

/**
 * Mint fresh board / scene / piece / object / ball ids.
 * Rewires ball.attachedTo and link.pieceIds within each scene.
 * Match records (goals/cards/subs/pk) get new entry ids (scorer strings unchanged).
 */
export function remapBoardIds(board: BoardDocument): BoardDocument {
  const sceneIdMap = new Map<string, string>();
  const scenes = board.scenes.map((s) => {
    const next = remapScene(s);
    sceneIdMap.set(s.id, next.id);
    return next;
  });
  const active =
    sceneIdMap.get(board.activeSceneId) ?? scenes[0]?.id ?? uid();

  const goals = (board.goals ?? []).map((g) => ({ ...g, id: uid() }));
  const cards = (board.cards ?? []).map((c) => ({ ...c, id: uid() }));
  const subs = (board.subs ?? []).map((s) => ({ ...s, id: uid() }));
  const pk = board.pk
    ? {
        ...board.pk,
        home: board.pk.home.map((slot) => ({ ...slot, id: uid() })),
        away: board.pk.away.map((slot) => ({ ...slot, id: uid() })),
      }
    : board.pk;

  const viewportTemplates = board.viewportTemplates?.map((t) => ({
    ...t,
    id: uid(),
  }));

  return {
    ...board,
    id: uid(),
    scenes,
    activeSceneId: active,
    goals,
    cards,
    subs,
    pk,
    ...(viewportTemplates ? { viewportTemplates } : {}),
    updatedAt: new Date().toISOString(),
  };
}
