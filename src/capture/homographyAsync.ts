/**
 * Homography compute off main thread (W03).
 * Falls back to sync computeHomography if Worker unavailable.
 * W08: dst4 is caller-supplied (landmarks), not fixed corners.
 */
import {
  computeHomography,
  PITCH_CORNERS_NORM,
  type HomographyMatrix,
  type Point,
} from "./homography";

export type HomographyWorkerResult =
  | { ok: true; H: HomographyMatrix }
  | { ok: false };

let worker: Worker | null = null;

function getWorker(): Worker | null {
  if (typeof Worker === "undefined") return null;
  if (!worker) {
    try {
      worker = new Worker(new URL("./homographyWorker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      return null;
    }
  }
  return worker;
}

export function computeHomographyAsync(
  src4: Point[],
  dst4: Point[] = PITCH_CORNERS_NORM,
): Promise<HomographyMatrix | null> {
  const w = getWorker();
  if (!w) {
    return Promise.resolve(computeHomography(src4, dst4));
  }

  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent<HomographyWorkerResult>) => {
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      resolve(e.data.ok ? e.data.H : null);
    };
    const onError = () => {
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      resolve(computeHomography(src4, dst4));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({ src4, dst4 });
  });
}
