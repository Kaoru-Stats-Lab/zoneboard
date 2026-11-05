import type { BoardDocument, TextObject, Viewport } from "../models/types";
import {
  TEXT_DEFAULT_FONT_SIZE,
  TEXT_LINE_HEIGHT_RATIO,
  computeTextGeometry,
  fontPxForText,
  placeNewTextBox,
} from "./textGeometry";
import {
  broadcastFrameRect,
  fitSurfaceLayout,
  fromNorm,
  type PitchRect,
} from "./layout";
import { matchBannerHeight } from "./matchBanner";
import { worldToPitch } from "./pitchCoords";

export type TextOverlayRect = {
  left: number;
  top: number;
  fontSize: number;
  /** CSS px width of the text box (explicit or content) */
  width: number;
  lineHeight: number;
  /** true when wrapping should match canvas (explicit width) */
  wrap: boolean;
  /** Clockwise deg; CSS transform around box centre */
  rotationDeg: number;
  /** Transform origin as CSS px offset from left/top of overlay (= box centre) */
  originX: number;
  originY: number;
  align: "left" | "center" | "right";
};

function resolvePitch(
  surfaceW: number,
  surfaceH: number,
  board: BoardDocument,
  view: Viewport,
  broadcast: boolean,
): PitchRect {
  const frame = broadcast ? broadcastFrameRect(surfaceW, surfaceH) : null;
  const bannerH = matchBannerHeight(
    frame?.w ?? surfaceW,
    frame?.h ?? surfaceH,
    board,
  );
  return fitSurfaceLayout(
    surfaceW,
    surfaceH,
    board,
    4,
    view,
    bannerH,
    broadcast,
  ).pitch;
}

/**
 * Overlay for an existing text object (edit). Uses shared geometry when possible.
 */
export function textOverlayForObject(
  surfaceW: number,
  surfaceH: number,
  board: BoardDocument,
  view: Viewport,
  obj: TextObject,
  broadcast = false,
): TextOverlayRect | null {
  const pitch = resolvePitch(surfaceW, surfaceH, board, view, broadcast);
  const geom = computeTextGeometry(obj, board, pitch);
  if (!geom) return null;
  const width = Math.max(geom.pw, geom.fontPx * 2);
  return {
    left: geom.px,
    top: geom.py,
    fontSize: geom.fontPx,
    width,
    lineHeight: TEXT_LINE_HEIGHT_RATIO,
    wrap: geom.hasExplicitWidth,
    rotationDeg: geom.rotationDeg,
    originX: geom.cx - geom.px,
    originY: geom.cy - geom.py,
    align: geom.align,
  };
}

/**
 * Overlay for a new text session (not yet committed).
 * `worldWidth` should be set for new boxes so wrap matches canvas after commit.
 */
export function textOverlayRect(
  surfaceW: number,
  surfaceH: number,
  board: BoardDocument,
  view: Viewport,
  worldX: number,
  worldY: number,
  fontSizeNorm = TEXT_DEFAULT_FONT_SIZE,
  broadcast = false,
  worldWidth?: number,
): TextOverlayRect | null {
  const pitch = resolvePitch(surfaceW, surfaceH, board, view, broadcast);
  const mapped = worldToPitch(worldX, worldY, board);
  if (!mapped) return null;
  const p = fromNorm(mapped.x, mapped.y, pitch);
  // Match fontPxForText — no absolute floor (keeps DOM editor wrap = canvas/PNG).
  const fontSize = Math.max(1e-3, Math.min(pitch.w, pitch.h) * fontSizeNorm);
  const wrap = worldWidth != null && worldWidth > 0;
  let widthCss: number;
  if (wrap) {
    const stub: TextObject = {
      id: "__draft__",
      type: "text",
      x: worldX,
      y: worldY,
      text: " ",
      color: "#fff",
      fontSize: fontSizeNorm,
      width: worldWidth,
    };
    const geom = computeTextGeometry(stub, board, pitch);
    widthCss = geom?.pw ?? worldWidth * pitch.w;
  } else {
    widthCss = Math.max(120, fontSize * 8);
  }
  return {
    left: p.x,
    top: p.y,
    fontSize,
    width: widthCss,
    lineHeight: TEXT_LINE_HEIGHT_RATIO,
    wrap,
    rotationDeg: 0,
    originX: widthCss / 2,
    originY: fontSize * TEXT_LINE_HEIGHT_RATIO * 0.5,
    align: "left",
  };
}

export { placeNewTextBox, fontPxForText };
