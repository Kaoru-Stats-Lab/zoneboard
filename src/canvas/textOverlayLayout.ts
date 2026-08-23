import type { BoardDocument, Viewport } from "../models/types";
import { worldToPitch } from "./drawBoard";
import {
  broadcastFrameRect,
  fitSurfaceLayout,
  fromNorm,
} from "./layout";
import { matchBannerHeight } from "./matchBanner";

export function textOverlayRect(
  surfaceW: number,
  surfaceH: number,
  board: BoardDocument,
  view: Viewport,
  worldX: number,
  worldY: number,
  fontSizeNorm = 0.035,
  broadcast = false,
): { left: number; top: number; fontSize: number } | null {
  const mapped = worldToPitch(worldX, worldY, board);
  if (!mapped) return null;
  const frame = broadcast ? broadcastFrameRect(surfaceW, surfaceH) : null;
  const bannerH = matchBannerHeight(
    frame?.w ?? surfaceW,
    frame?.h ?? surfaceH,
    board,
  );
  const { pitch } = fitSurfaceLayout(
    surfaceW,
    surfaceH,
    board,
    4,
    view,
    bannerH,
    broadcast,
  );
  const p = fromNorm(mapped.x, mapped.y, pitch);
  return {
    left: p.x,
    top: p.y,
    fontSize: Math.max(14, Math.min(pitch.w, pitch.h) * fontSizeNorm),
  };
}
