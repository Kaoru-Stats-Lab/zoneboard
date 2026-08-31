import type { Point } from "./homography";

/** TL, TR, BR, BL in image pixel space (10% inset). */
export function defaultCalibPoints(width: number, height: number): Point[] {
  const ix = width * 0.1;
  const iy = height * 0.1;
  return [
    { x: ix, y: iy },
    { x: width - ix, y: iy },
    { x: width - ix, y: height - iy },
    { x: ix, y: height - iy },
  ];
}

export function clampToImage(p: Point, width: number, height: number): Point {
  return {
    x: Math.min(width, Math.max(0, p.x)),
    y: Math.min(height, Math.max(0, p.y)),
  };
}

/** Fit image in viewport; map image px → screen px. */
export function imageDisplayLayout(
  viewportW: number,
  viewportH: number,
  imgW: number,
  imgH: number,
): { scale: number; offsetX: number; offsetY: number; displayW: number; displayH: number } {
  const scale = Math.min(viewportW / imgW, viewportH / imgH);
  const displayW = imgW * scale;
  const displayH = imgH * scale;
  return {
    scale,
    offsetX: (viewportW - displayW) / 2,
    offsetY: (viewportH - displayH) / 2,
    displayW,
    displayH,
  };
}

export function imageToScreen(
  p: Point,
  layout: ReturnType<typeof imageDisplayLayout>,
): Point {
  return {
    x: layout.offsetX + p.x * layout.scale,
    y: layout.offsetY + p.y * layout.scale,
  };
}

export function screenToImage(
  sx: number,
  sy: number,
  layout: ReturnType<typeof imageDisplayLayout>,
  imgW: number,
  imgH: number,
): Point {
  return clampToImage(
    {
      x: (sx - layout.offsetX) / layout.scale,
      y: (sy - layout.offsetY) / layout.scale,
    },
    imgW,
    imgH,
  );
}
