import { computeHomography, type Point } from "./homography";
import type { HomographyWorkerResult } from "./homographyAsync";

export type HomographyWorkerRequest = {
  src4: Point[];
  dst4: Point[];
};

self.onmessage = (e: MessageEvent<HomographyWorkerRequest>) => {
  const { src4, dst4 } = e.data;
  const H = computeHomography(src4, dst4);
  const result: HomographyWorkerResult = H ? { ok: true, H } : { ok: false };
  self.postMessage(result);
};
