import type { Locale } from "../i18n/messages";
import { messages } from "../i18n/messages";
import {
  LP_LOCALES,
  LOCALE_META,
  hreflangLinks,
  landingUrl,
} from "./localeNav";
import { SITE_META, absoluteUrl } from "./siteMeta";

const SITE_ORIGIN = "https://zoneboard.app";
const DESC_SOFT_MAX = 200;

export type LpDocumentMeta = {
  locale: Locale;
  lang: string;
  ogLocale: string;
  ogLocaleAlternates: string[];
  title: string;
  description: string;
  canonical: string;
  ogImageUrl: string;
  ogImageAlt: string;
  hreflangHtml: string;
};

/** Escape for HTML attribute / text content in meta tags. */
export function escapeHtmlAttr(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function truncateDescription(text: string, max = DESC_SOFT_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  const base = sp > max * 0.6 ? cut.slice(0, sp) : cut;
  return `${base.trimEnd()}…`;
}

/**
 * Title / description formula shared by LocaleDocumentHead and build-time shells.
 * No dedicated og* MessageKeys — uses existing LP chrome keys.
 */
export function lpDocumentMeta(
  locale: Locale,
  origin = SITE_ORIGIN,
): LpDocumentMeta {
  const m = messages[locale];
  const meta = LOCALE_META[locale];
  const title = `${m.brand} — ${m.lpHeadline1}`;
  const description = truncateDescription(
    `${m.lpLede} ${m.lpPayoff}`.trim(),
  );
  const ogLocaleAlternates = LP_LOCALES.filter((l) => l !== locale).map(
    (l) => LOCALE_META[l].ogLocale,
  );
  return {
    locale,
    lang: meta.bcp47,
    ogLocale: meta.ogLocale,
    ogLocaleAlternates,
    title,
    description,
    canonical: landingUrl(locale, origin),
    ogImageUrl: absoluteUrl(origin, SITE_META.ogImagePath),
    ogImageAlt: SITE_META.ogImageAlt,
    hreflangHtml: hreflangLinks(origin),
  };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setMetaContent(
  html: string,
  kind: "name" | "property",
  key: string,
  content: string,
): string {
  const e = escapeHtmlAttr(content);
  const k = escapeRegExp(key);
  const reAttrFirst = new RegExp(
    `(<meta\\b[^>]*?\\b${kind}="${k}"[^>]*?\\bcontent=")[^"]*(")`,
    "is",
  );
  if (reAttrFirst.test(html)) {
    return html.replace(reAttrFirst, `$1${e}$2`);
  }
  const reContentFirst = new RegExp(
    `(<meta\\b[^>]*?\\bcontent=")[^"]*("[^>]*?\\b${kind}="${k}")`,
    "is",
  );
  if (reContentFirst.test(html)) {
    return html.replace(reContentFirst, `$1${e}$2`);
  }
  const tag =
    kind === "property"
      ? `    <meta property="${key}" content="${e}" />\n`
      : `    <meta name="${key}" content="${e}" />\n`;
  return html.replace(/<\/head>/i, `${tag}  </head>`);
}

function setLinkHref(html: string, rel: string, href: string): string {
  const e = escapeHtmlAttr(href);
  const re = new RegExp(
    `(<link\\b[^>]*?\\brel="${escapeRegExp(rel)}"[^>]*?\\bhref=")[^"]*(")`,
    "is",
  );
  if (re.test(html)) {
    return html.replace(re, `$1${e}$2`);
  }
  return html.replace(
    /<\/head>/i,
    `    <link rel="${rel}" href="${e}" />\n  </head>`,
  );
}

/**
 * Rewrite SPA shell HTML so crawlers see locale-specific OG / canonical / lang.
 * Keeps shared og:image from the template (P0: one PNG for all locales).
 */
export function applyLpDocumentMetaToHtml(
  html: string,
  locale: Locale,
  origin = SITE_ORIGIN,
): string {
  const meta = lpDocumentMeta(locale, origin);
  let out = html;

  out = out.replace(
    /<html\s+lang="[^"]*"/i,
    `<html lang="${escapeHtmlAttr(meta.lang)}"`,
  );
  out = out.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeHtmlAttr(meta.title)}</title>`,
  );

  out = setMetaContent(out, "name", "description", meta.description);
  out = setLinkHref(out, "canonical", meta.canonical);

  out = setMetaContent(out, "property", "og:title", meta.title);
  out = setMetaContent(out, "property", "og:description", meta.description);
  out = setMetaContent(out, "property", "og:url", meta.canonical);
  out = setMetaContent(out, "property", "og:locale", meta.ogLocale);
  // Image stays the shared PNG already in the shell (do not rewrite path).

  out = setMetaContent(out, "name", "twitter:title", meta.title);
  out = setMetaContent(out, "name", "twitter:description", meta.description);

  // Fresh alternate locales
  out = out.replace(
    /\s*<meta\s+property="og:locale:alternate"[^>]*\/?>/gi,
    "",
  );
  const altBlock = meta.ogLocaleAlternates
    .map(
      (loc) =>
        `    <meta property="og:locale:alternate" content="${escapeHtmlAttr(loc)}" />`,
    )
    .join("\n");
  out = out.replace(
    /(<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>)/i,
    `$1\n${altBlock}`,
  );

  // Fresh hreflang (including x-default)
  out = out.replace(
    /\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/gi,
    "",
  );
  const hreflangIndented = meta.hreflangHtml
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
  out = out.replace(
    /(<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>)/i,
    `$1\n${hreflangIndented}`,
  );

  return out;
}
