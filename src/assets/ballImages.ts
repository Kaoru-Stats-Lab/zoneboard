/** 競技別ボール画像（/public/balls）— デザイン言語は docs/BALL_DESIGN.md */

import type { SoccerBallLook, SportId } from "../models/types";

const cache = new Map<string, HTMLImageElement>();
const inflight = new Map<string, Promise<HTMLImageElement | null>>();

/**
 * PNG 優先（AI 生成は背景除去済み 256px）。
 * なければ軽量 SVG（soccer_ball2 等）。
 */
const BALL_SRC: Partial<Record<SportId | "rugby", string[]>> = {
  // 不透明な SVG を優先（PNG は背景除去で穴が残ることがある）
  soccer: ["balls/soccer_ball2.svg", "balls/soccer.png"],
  futsal: ["balls/futsal.png", "balls/soccer_ball2.svg"],
  beach_soccer: ["balls/soccer.png", "balls/soccer_ball2.svg"],
  basketball: ["balls/basketball.png"],
  volleyball: ["balls/volleyball.png"],
  // rugby: ["balls/rugby.png"],
};

const SOCCER_LOOK_SRC: Record<SoccerBallLook, string[]> = {
  classic: ["balls/soccer_ball2.svg", "balls/soccer.png"],
  starball: ["balls/soccer_starball.svg", "balls/soccer_ball2.svg"],
};

function pathsFor(
  sport: SportId | "rugby",
  soccerBallLook: SoccerBallLook = "classic",
): string[] | undefined {
  if (sport === "soccer") return SOCCER_LOOK_SRC[soccerBallLook];
  return BALL_SRC[sport];
}

function urlFor(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

function loadOne(path: string): Promise<HTMLImageElement | null> {
  const hit = cache.get(path);
  if (hit?.complete && hit.naturalWidth > 0) return Promise.resolve(hit);
  const pending = inflight.get(path);
  if (pending) return pending;

  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      cache.set(path, img);
      inflight.delete(path);
      resolve(img);
    };
    img.onerror = () => {
      inflight.delete(path);
      resolve(null);
    };
    img.src = urlFor(path);
  });
  inflight.set(path, p);
  return p;
}

export function getBallImage(
  sport: SportId | "rugby",
  soccerBallLook: SoccerBallLook = "classic",
): HTMLImageElement | null {
  const paths = pathsFor(sport, soccerBallLook);
  if (!paths) return null;
  for (const path of paths) {
    const img = cache.get(path);
    if (img?.complete && img.naturalWidth > 0) return img;
  }
  return null;
}

export async function loadBallImage(
  sport: SportId | "rugby",
  soccerBallLook: SoccerBallLook = "classic",
): Promise<HTMLImageElement | null> {
  const paths = pathsFor(sport, soccerBallLook);
  if (!paths) return null;
  for (const path of paths) {
    const img = await loadOne(path);
    if (img) return img;
  }
  return null;
}

export function loadSoccerBallImage(
  soccerBallLook: SoccerBallLook = "classic",
): Promise<HTMLImageElement> {
  return loadBallImage("soccer", soccerBallLook).then((img) => {
    if (!img) return Promise.reject(new Error("soccer ball asset"));
    return img;
  });
}

export function getSoccerBallImage(
  soccerBallLook: SoccerBallLook = "classic",
): HTMLImageElement | null {
  return getBallImage("soccer", soccerBallLook);
}

export function preloadBallForSport(
  sport: SportId,
  soccerBallLook: SoccerBallLook = "classic",
): void {
  void loadBallImage(sport, soccerBallLook);
}
