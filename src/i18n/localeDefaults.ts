import type { SportId } from "../models/types";
import { APP_LOCALE } from "./locale";
import { messages, type Locale, type MessageKey } from "./messages";

export function detectLocaleForDefaults(): Locale {
  return APP_LOCALE;
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

export function defaultSceneLabel(sport: SportId, _locale?: Locale): string {
  return messages[APP_LOCALE][sceneLabelKey(sport)];
}

export function defaultBoardTitle(index: number, _locale?: Locale): string {
  return `Board ${index}`;
}
