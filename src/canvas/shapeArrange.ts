import type { DrawObject } from "../models/types";

export type ShapeArrangeOp =
  | "front"
  | "forward"
  | "backward"
  | "back";

/**
 * Reorder a DrawObject inside scene.objects[].
 * Array front = backmost, array end = frontmost (among DrawObjects).
 * Returns null when the op would be a no-op (caller must not push history).
 */
export function arrangeDrawObject(
  objects: DrawObject[],
  id: string,
  op: ShapeArrangeOp,
): DrawObject[] | null {
  const i = objects.findIndex((o) => o.id === id);
  if (i < 0) return null;
  const last = objects.length - 1;
  let j = i;
  switch (op) {
    case "front":
      j = last;
      break;
    case "forward":
      j = Math.min(last, i + 1);
      break;
    case "backward":
      j = Math.max(0, i - 1);
      break;
    case "back":
      j = 0;
      break;
  }
  if (j === i) return null;
  const next = objects.slice();
  const [row] = next.splice(i, 1);
  next.splice(j, 0, row!);
  return next;
}

export function shapeArrangeCan(
  objects: DrawObject[],
  id: string,
): Record<ShapeArrangeOp, boolean> {
  const i = objects.findIndex((o) => o.id === id);
  const last = objects.length - 1;
  if (i < 0) {
    return { front: false, forward: false, backward: false, back: false };
  }
  return {
    front: i < last,
    forward: i < last,
    backward: i > 0,
    back: i > 0,
  };
}
