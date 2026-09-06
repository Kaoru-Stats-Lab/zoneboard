import { useEffect } from "react";
import type { Locale } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { hreflangLinks, landingUrl, LOCALE_META } from "../site/localeNav.ts";

type Props = {
  locale: Locale;
};

/** Sets document lang, canonical, hreflang, and OG locale for locale LPs. */
export function LocaleDocumentHead({ locale }: Props) {
  useEffect(() => {
    const meta = LOCALE_META[locale];
    const m = messages[locale];
    const title = `${m.brand} — ${m.lpHeadline1}`;
    const description = `${m.lpLede} ${m.lpPayoff}`.trim();

    document.documentElement.lang = meta.bcp47;
    document.title = title;

    const setMeta = (selector: string, content: string, attr = "content") => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const isProp = selector.startsWith('meta[property="');
        if (isProp) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) el.setAttribute("property", prop);
        } else {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) el.setAttribute("name", name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:locale"]', meta.ogLocale);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    const canonical = landingUrl(locale, window.location.origin);
    setMeta('meta[property="og:url"]', canonical);
    let linkCanon = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkCanon) {
      linkCanon = document.createElement("link");
      linkCanon.rel = "canonical";
      document.head.appendChild(linkCanon);
    }
    linkCanon.href = canonical;

    document
      .querySelectorAll('link[rel="alternate"][data-zb-hreflang]')
      .forEach((node) => node.remove());
    const wrapper = document.createElement("div");
    wrapper.innerHTML = hreflangLinks(window.location.origin);
    wrapper.querySelectorAll("link").forEach((link) => {
      link.setAttribute("data-zb-hreflang", "1");
      document.head.appendChild(link);
    });

    return () => {
      document
        .querySelectorAll('link[rel="alternate"][data-zb-hreflang]')
        .forEach((node) => node.remove());
    };
  }, [locale]);

  return null;
}
