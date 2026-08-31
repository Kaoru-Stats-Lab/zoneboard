import type { Locale } from "./messages";

/** Public LP / legal stay English. Board chrome may follow prefs. */
export const APP_LOCALE: Locale = "en";

export const DEFAULT_UI_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ja" || value === "es";
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_UI_LOCALE;
}

/** `?lang=ja` / `?lang=en` / `?lang=es` for DM deep links. */
export function localeFromSearchParam(raw: string | null): Locale | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === "ja" || v === "jp") return "ja";
  if (v === "en") return "en";
  if (v === "es") return "es";
  return null;
}
