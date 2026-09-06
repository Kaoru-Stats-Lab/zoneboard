import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Locale } from "../i18n/messages";
import {
  browserSuggestedLocale,
  landingPath,
  LOCALE_META,
} from "../site/localeNav.ts";
import { localeSuggestBody, publicCopy } from "../site/localePublicCopy.ts";

const DISMISS_KEY = "zb-locale-suggest-dismiss";

type Props = {
  /** Current LP locale — banner only on English `/`. */
  locale: Locale;
};

export function LocaleSuggestBanner({ locale }: Props) {
  const [suggested, setSuggested] = useState<Locale | null>(null);

  useEffect(() => {
    if (locale !== "en") {
      setSuggested(null);
      return;
    }
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    const hit = browserSuggestedLocale(navigator.languages);
    if (hit && hit !== "en") setSuggested(hit);
  }, [locale]);

  if (!suggested) return null;

  const copy = publicCopy("en");
  const body = localeSuggestBody(suggested);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setSuggested(null);
  };

  return (
    <aside className="lp-locale-suggest" role="region" aria-label={copy.lpFooterLanguage}>
      <p>{body}</p>
      <p className="lp-locale-suggest__actions">
        <Link className="lp-locale-suggest__go" to={landingPath(suggested)}>
          {copy.localeSuggestGo} · {LOCALE_META[suggested].nativeName}
        </Link>
        <button type="button" className="lp-locale-suggest__dismiss" onClick={dismiss}>
          {copy.localeSuggestDismiss}
        </button>
      </p>
    </aside>
  );
}
