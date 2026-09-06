import type { Locale } from "../i18n/messages";

const ALL_LP_LOCALES: Locale[] = [
  "en",
  "ja",
  "es",
  "pt",
  "pl",
  "de",
  "fr",
  "tr",
  "it",
];

export type LocaleMeta = {
  nativeName: string;
  bcp47: string;
  ogLocale: string;
  hreflang: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    nativeName: "English",
    bcp47: "en-GB",
    ogLocale: "en_GB",
    hreflang: "en",
  },
  ja: {
    nativeName: "日本語",
    bcp47: "ja",
    ogLocale: "ja_JP",
    hreflang: "ja",
  },
  es: {
    nativeName: "Español",
    bcp47: "es",
    ogLocale: "es_ES",
    hreflang: "es",
  },
  pt: {
    nativeName: "Português (BR)",
    bcp47: "pt-BR",
    ogLocale: "pt_BR",
    hreflang: "pt",
  },
  pl: {
    nativeName: "Polski",
    bcp47: "pl",
    ogLocale: "pl_PL",
    hreflang: "pl",
  },
  de: {
    nativeName: "Deutsch",
    bcp47: "de",
    ogLocale: "de_DE",
    hreflang: "de",
  },
  fr: {
    nativeName: "Français",
    bcp47: "fr",
    ogLocale: "fr_FR",
    hreflang: "fr",
  },
  tr: {
    nativeName: "Türkçe",
    bcp47: "tr",
    ogLocale: "tr_TR",
    hreflang: "tr",
  },
  it: {
    nativeName: "Italiano",
    bcp47: "it",
    ogLocale: "it_IT",
    hreflang: "it",
  },
};

/** English first, then A–Z by native picker label (single source for LP footer, Settings, hreflang). */
export const LP_LOCALES: readonly Locale[] = [
  "en",
  ...ALL_LP_LOCALES.filter((code) => code !== "en").sort((a, b) =>
    LOCALE_META[a].nativeName.localeCompare(
      LOCALE_META[b].nativeName,
      "en",
      { sensitivity: "base" },
    ),
  ),
] as const;

/** Locales with a dedicated landing URL (`/` = en). */
export function localePickerLabel(locale: Locale): string {
  return LOCALE_META[locale].nativeName;
}

const SITE_ORIGIN = "https://zoneboard.app";

export function landingPath(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}/`;
}

export function landingUrl(locale: Locale, origin = SITE_ORIGIN): string {
  const path = landingPath(locale);
  return path === "/" ? `${origin}/` : `${origin}${path}`;
}

export function localeFromPathname(pathname: string): Locale | null {
  const match = pathname.match(/^\/(ja|es|pt|pl|de|fr|tr|it)(\/|$)/);
  if (match) return match[1] as Locale;
  if (pathname === "/" || pathname === "") return "en";
  return null;
}

const BROWSER_LOCALE_MAP: Record<string, Locale> = {
  ja: "ja",
  es: "es",
  pt: "pt",
  pl: "pl",
  de: "de",
  fr: "fr",
  tr: "tr",
  it: "it",
};

/** Map `navigator.languages` to a shipped LP locale (not en). */
export function browserSuggestedLocale(
  languages: readonly string[],
): Locale | null {
  for (const raw of languages) {
    const base = raw.trim().toLowerCase().split("-")[0] ?? "";
    const mapped = BROWSER_LOCALE_MAP[base];
    if (mapped) return mapped;
  }
  return null;
}

export function hreflangLinks(origin = SITE_ORIGIN): string {
  const lines = LP_LOCALES.map(
    (locale) =>
      `<link rel="alternate" hreflang="${LOCALE_META[locale].hreflang}" href="${landingUrl(locale, origin)}" />`,
  );
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="${landingUrl("en", origin)}" />`,
  );
  return lines.join("\n");
}
