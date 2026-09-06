import { useEffect } from "react";
import type { Locale } from "../i18n/messages";
import { lpDocumentMeta } from "../site/localeDocumentMeta";

type Props = {
  locale: Locale;
};

/** Sets document lang, canonical, hreflang, and OG locale for locale LPs. */
export function LocaleDocumentHead({ locale }: Props) {
  useEffect(() => {
    const origin = window.location.origin;
    const doc = lpDocumentMeta(locale, origin);

    document.documentElement.lang = doc.lang;
    document.title = doc.title;

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

    setMeta('meta[name="description"]', doc.description);
    setMeta('meta[property="og:title"]', doc.title);
    setMeta('meta[property="og:description"]', doc.description);
    setMeta('meta[property="og:locale"]', doc.ogLocale);
    setMeta('meta[property="og:url"]', doc.canonical);
    setMeta('meta[name="twitter:title"]', doc.title);
    setMeta('meta[name="twitter:description"]', doc.description);

    document
      .querySelectorAll('meta[property="og:locale:alternate"]')
      .forEach((node) => node.remove());
    for (const alt of doc.ogLocaleAlternates) {
      const el = document.createElement("meta");
      el.setAttribute("property", "og:locale:alternate");
      el.setAttribute("content", alt);
      document.head.appendChild(el);
    }

    let linkCanon = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!linkCanon) {
      linkCanon = document.createElement("link");
      linkCanon.rel = "canonical";
      document.head.appendChild(linkCanon);
    }
    linkCanon.href = doc.canonical;

    document
      .querySelectorAll('link[rel="alternate"][data-zb-hreflang]')
      .forEach((node) => node.remove());
    const wrapper = document.createElement("div");
    wrapper.innerHTML = doc.hreflangHtml;
    wrapper.querySelectorAll("link").forEach((link) => {
      link.setAttribute("data-zb-hreflang", "1");
      document.head.appendChild(link);
    });

    return () => {
      document
        .querySelectorAll('link[rel="alternate"][data-zb-hreflang]')
        .forEach((node) => node.remove());
      document
        .querySelectorAll('meta[property="og:locale:alternate"]')
        .forEach((node) => node.remove());
    };
  }, [locale]);

  return null;
}
