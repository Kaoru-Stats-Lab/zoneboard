import type { Locale } from "../i18n/messages";
import type { SiteSlug } from "./publisher";
import { shortcutSheetPath } from "./shortcutSheet.ts";

/** Reading pages with a locale-native entry point (no per-link EN tag). */
export function hasLocalizedEntry(slug: SiteSlug, locale: Locale): boolean {
  if (slug === "privacy") return locale !== "en";
  if (slug === "materials") return true;
  return false;
}

export function siteFooterHref(slug: SiteSlug, locale: Locale): string {
  if (slug === "privacy") {
    return locale === "en"
      ? "/privacy/"
      : `/privacy/#privacy-summary-${locale}`;
  }
  if (slug === "materials") {
    return shortcutSheetPath(locale);
  }
  return `/${slug}/`;
}

export function siteFooterLinkTitle(
  label: string,
  slug: SiteSlug,
  locale: Locale,
  readingNote: string,
): string | undefined {
  if (hasLocalizedEntry(slug, locale)) return label;
  return `${label} — ${readingNote}`;
}
