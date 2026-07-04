import type { SportId } from "../models/types";

/** Logical W:H ratios (SPEC §6) */
export const SPORT_RATIO: Record<SportId, { w: number; h: number }> = {
  soccer: { w: 105, h: 68 },
  basketball: { w: 28, h: 15 },
  volleyball: { w: 18, h: 9 },
};

export function aspectFor(
  sport: SportId,
  pitchView: "full" | "half",
): number {
  const { w, h } = SPORT_RATIO[sport];
  if (sport === "soccer" && pitchView === "half") {
    return w / 2 / h;
  }
  return w / h;
}
