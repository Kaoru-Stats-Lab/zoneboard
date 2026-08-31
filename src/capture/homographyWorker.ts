import {
  computeHomography,
  PITCH_CORNERS_NORM,
  type Point,
} from "./homography";
import type { HomographyWorkerResult } from "./homographyAsync";

export type HomographyWorkerRequest = { src4: Point[] };

self.onmessage = (e: MessageEvent<HomographyWorkerRequest>) => {
  const H = computeHomography(e.data.src4, PITCH_CORNERS_NORM);
  const result: HomographyWorkerResult = H ? { ok: true, H } : { ok: false };
  self.postMessage(result);
};
