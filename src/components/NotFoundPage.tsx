import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { normalizeLocale } from "../i18n/locale";
import type { Locale } from "../i18n/messages";
import { loadPrefs } from "../storage/persist";
import { localeFromPathname, landingPath } from "../site/localeNav.ts";
import { publicCopy } from "../site/localePublicCopy.ts";
import { StudioStatus } from "./StudioStatus";

function resolveNotFoundLocale(pathname: string): Locale {
  const fromPath = localeFromPathname(pathname);
  if (fromPath) return fromPath;
  try {
    const prefs = loadPrefs();
    if (prefs.locale) return normalizeLocale(prefs.locale);
  } catch {
    /* ignore */
  }
  return "en";
}

export function NotFoundPage() {
  const { pathname } = useLocation();
  const locale = useMemo(
    () => resolveNotFoundLocale(pathname),
    [pathname],
  );
  const copy = publicCopy(locale);

  useEffect(() => {
    document.documentElement.lang =
      locale === "ja" ? "ja" : locale === "en" ? "en-GB" : locale;
    document.title = `404 — ZoneBoard`;
  }, [locale]);

  return (
    <StudioStatus
      kicker="404"
      title={copy.notFoundTitle}
      copy={copy.notFoundCopy}
      primary={{
        to: locale === "en" ? "/board" : `/board?lang=${locale}`,
        label: copy.notFoundOpenBoard,
      }}
      secondary={{ to: landingPath(locale), label: copy.notFoundHome }}
    />
  );
}
