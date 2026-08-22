import { loadPrefs } from "../storage/persist";
import type { SportId } from "../models/types";
import { messages, type Locale, type MessageKey } from "./messages";

export function detectLocaleForDefaults(): Locale {
  const prefs = loadPrefs();
  if (prefs.locale === "ja" || prefs.locale === "en") return prefs.locale;
  return "en";
}

function sceneLabelKey(sport: SportId): MessageKey {
  switch (sport) {
    case "basketball":
      return "sceneLabelPhBasket";
    case "futsal":
      return "sceneLabelPhFutsal";
    case "beach_soccer":
      return "sceneLabelPhBeach";
    case "volleyball":
      return "sceneLabelPhVolley";
    default:
      return "sceneLabelPhSoccer";
  }
}

export function defaultSceneLabel(sport: SportId, locale?: Locale): string {
  const loc = locale ?? detectLocaleForDefaults();
  return messages[loc][sceneLabelKey(sport)];
}

export function defaultBoardTitle(index: number, locale?: Locale): string {
  const loc = locale ?? detectLocaleForDefaults();
  return loc === "en" ? `Board ${index}` : `ボード ${index}`;
}
