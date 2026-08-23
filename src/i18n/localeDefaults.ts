import type { SportId } from "../models/types";
import { APP_LOCALE } from "./locale";
import { messages, type Locale, type MessageKey } from "./messages";

export function detectLocaleForDefaults(): Locale {
  return APP_LOCALE;
}

function sceneDefaultLabelKey(sport: SportId): MessageKey {
  switch (sport) {
    case "basketball":
      return "sceneDefaultBasket";
    case "futsal":
      return "sceneDefaultFutsal";
    case "beach_soccer":
      return "sceneDefaultBeach";
    case "volleyball":
      return "sceneDefaultVolley";
    default:
      return "sceneDefaultSoccer";
  }
}

export function defaultSceneLabel(sport: SportId, _locale?: Locale): string {
  return messages[APP_LOCALE][sceneDefaultLabelKey(sport)];
}

/** 複製シーン等の自動名（Scene 2, Scene 3…） */
export function defaultSceneName(index: number, sport: SportId = "soccer"): string {
  if (index <= 1) return defaultSceneLabel(sport);
  return `Scene ${index}`;
}

export function defaultBoardTitle(index: number, _locale?: Locale): string {
  return `Board ${index}`;
}
