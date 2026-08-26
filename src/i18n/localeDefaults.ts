import type { SportId } from "../models/types";
import { DEFAULT_UI_LOCALE } from "./locale";
import { messages, type Locale, type MessageKey } from "./messages";

export function detectLocaleForDefaults(): Locale {
  return DEFAULT_UI_LOCALE;
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

export function defaultSceneLabel(
  sport: SportId,
  locale: Locale = DEFAULT_UI_LOCALE,
): string {
  return messages[locale][sceneDefaultLabelKey(sport)];
}

/** 複製シーン等の自動名（Scene 2, Scene 3…） */
export function defaultSceneName(
  index: number,
  sport: SportId = "soccer",
  locale: Locale = DEFAULT_UI_LOCALE,
): string {
  if (index <= 1) return defaultSceneLabel(sport, locale);
  if (locale === "ja") return `局面 ${index}`;
  return `Scene ${index}`;
}

export function defaultBoardTitle(
  index: number,
  locale: Locale = DEFAULT_UI_LOCALE,
): string {
  if (locale === "ja") return `ボード ${index}`;
  return `Board ${index}`;
}
