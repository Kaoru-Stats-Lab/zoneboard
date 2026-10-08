/**
 * Football Content Layer — MD → static HTML (build quality gate).
 * Source: content/football/{translationGroup}/{locale}.md
 * Output: public/{locale}/football/... (gitignored) + sitemap-football.xml
 *
 * Invalid / incomplete frontmatter → process.exit(1) so Cloudflare Pages
 * does not deploy broken SEO metadata.
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLISHER, SITE_NAV } from "../src/site/publisher";
import { consentFor } from "../src/site/consentCopy";
import { LP_LOCALES, LOCALE_META } from "../src/site/localeNav";
import {
  SITE_META,
  absoluteUrl,
  documentTitle,
} from "../src/site/siteMeta";
import type { Locale } from "../src/i18n/messages";
import {
  FootballContentError,
  editionPath,
  editionPublicDir,
  markdownToHtml,
  parseFootballMarkdown,
  type ParsedFootballFile,
} from "./lib/football-md";

export { FootballContentError };

export type GenerateFootballOptions = {
  /** Repo root. Default: cwd parent of scripts/. */
  projectRoot?: string;
  /** HTML output root. Default: public/ (local). Vite plugin uses dist/. */
  outDir?: string;
};

function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function nav(): string {
  return SITE_NAV.map((item) => {
    const href = `/${item.slug}/`;
    return `<a href="${href}">${esc(item.labelEn)}</a>`;
  }).join("\n");
}

function consentLocaleScript(): string {
  const payload = Object.fromEntries(
    LP_LOCALES.map((locale) => [locale, consentFor(locale)]),
  );
  return `<script>
(function () {
  var map = ${JSON.stringify(payload)};
  var pick = "en";
  var langs = navigator.languages || [navigator.language || "en"];
  for (var i = 0; i < langs.length; i++) {
    var base = String(langs[i] || "").toLowerCase().split("-")[0];
    if (map[base]) { pick = base; break; }
  }
  var c = map[pick] || map.en;
  var root = document.getElementById("site-consent");
  if (!root) return;
  var title = root.querySelector(".site-consent__title");
  var copy = root.querySelector(".site-consent__copy");
  if (title) title.textContent = c.title;
  if (copy) copy.textContent = c.copy;
  root.querySelectorAll("[data-consent]").forEach(function (btn) {
    var key = btn.getAttribute("data-consent");
    if (key === "reject") btn.textContent = c.reject;
    if (key === "analytics") btn.textContent = c.analytics;
    if (key === "ads") btn.textContent = c.ads;
  });
  var policy = root.querySelector("a[href='/cookies/']");
  if (policy) policy.textContent = c.policyLabel;
})();
</script>`;
}

function consentBanner(): string {
  const c = consentFor("en");
  return `<aside id="site-consent" class="site-consent site-consent--compact" hidden role="region" aria-labelledby="site-consent-title">
  <div class="site-consent__inner">
    <p class="site-consent__title" id="site-consent-title">${esc(c.title)}</p>
    <p class="site-consent__copy">${esc(c.copy)}</p>
    <div class="site-consent__actions">
      <button type="button" class="site-consent__btn" data-consent="reject">${esc(c.reject)}</button>
      <button type="button" class="site-consent__btn" data-consent="analytics">${esc(c.analytics)}</button>
      <button type="button" class="site-consent__btn site-consent__btn--allow" data-consent="ads">${esc(c.ads)}</button>
      <a href="${esc(c.policyHref)}">${esc(c.policyLabel)}</a>
    </div>
  </div>
</aside>
${consentLocaleScript()}
<script src="/consent.js" defer></script>`;
}

function boardHref(locale: Locale): string {
  return locale === "en" ? "/board" : `/board/?lang=${locale}`;
}

function homeHref(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}/`;
}

type EditionRecord = ParsedFootballFile & {
  path: string;
  canonical: string;
};

function groupHreflangHtml(
  group: EditionRecord[],
  origin: string,
): string {
  const lines = group.map((ed) => {
    const hreflang = LOCALE_META[ed.frontmatter.locale].hreflang;
    return `<link rel="alternate" hreflang="${esc(hreflang)}" href="${esc(ed.canonical)}" />`;
  });
  const withSource = group.find((ed) => ed.frontmatter.sourceUrl);
  if (withSource?.frontmatter.sourceUrl) {
    lines.push(
      `<link rel="alternate" hreflang="en" href="${esc(withSource.frontmatter.sourceUrl)}" />`,
    );
    lines.push(
      `<link rel="alternate" hreflang="x-default" href="${esc(withSource.frontmatter.sourceUrl)}" />`,
    );
  } else if (group.length > 0) {
    const fallback = group[0]!;
    lines.push(
      `<link rel="alternate" hreflang="x-default" href="${esc(fallback.canonical)}" />`,
    );
  }
  return lines.map((l) => `    ${l}`).join("\n");
}

function jsonLd(ed: EditionRecord): string {
  const fm = ed.frontmatter;
  const payload = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.description,
    datePublished: fm.publishedAt,
    dateModified: fm.updatedAt,
    inLanguage: LOCALE_META[fm.locale].bcp47,
    mainEntityOfPage: ed.canonical,
    isPartOf: {
      "@type": "WebSite",
      name: PUBLISHER.product,
      url: PUBLISHER.siteUrl,
    },
    ...(fm.sourceUrl
      ? { isBasedOn: fm.sourceUrl }
      : {}),
  };
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function articleDocument(
  ed: EditionRecord,
  group: EditionRecord[],
): string {
  const fm = ed.frontmatter;
  const meta = LOCALE_META[fm.locale];
  const title = documentTitle(fm.title, PUBLISHER.product);
  const ogImage = absoluteUrl(
    PUBLISHER.siteUrl,
    fm.ogImage ?? SITE_META.ogImagePath,
  );
  const hreflang = groupHreflangHtml(group, PUBLISHER.siteUrl);
  const bodyHtml = markdownToHtml(ed.body);

  const siblingLinks = group
    .filter((g) => g.frontmatter.locale !== fm.locale)
    .map(
      (g) =>
        `<a href="${esc(g.path)}">${esc(LOCALE_META[g.frontmatter.locale].nativeName)}</a>`,
    )
    .join(" · ");

  const sourceBlock = fm.sourceUrl
    ? `<p class="football-source"><a href="${esc(fm.sourceUrl)}" rel="noopener noreferrer">English original on Substack</a></p>`
    : "";

  const langsBlock = siblingLinks
    ? `<nav class="football-langs" aria-label="Editions">${siblingLinks}</nav>`
    : "";

  const main = `<article class="football-article" data-translation-group="${esc(fm.translationGroup)}">
<p class="site-kicker">Football</p>
<h1>${esc(fm.title)}</h1>
<p class="lede">${esc(fm.description)}</p>
<p class="football-meta"><time datetime="${esc(fm.publishedAt)}">${esc(fm.publishedAt)}</time>${fm.series ? ` · ${esc(fm.series)}` : ""}</p>
${sourceBlock}
${langsBlock}
${bodyHtml}
<p class="site-status-actions football-cta">
  <a class="primary" href="${esc(boardHref(fm.locale))}">Open board</a>
  <a class="ghost" href="${esc(homeHref(fm.locale))}">ZoneBoard</a>
  <a class="ghost" href="/football/">Football hub</a>
</p>
</article>`;

  return `<!doctype html>
<html lang="${esc(meta.bcp47)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(fm.description)}" />
    <link rel="canonical" href="${esc(ed.canonical)}" />
${hreflang}
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${esc(PUBLISHER.product)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(fm.description)}" />
    <meta property="og:url" content="${esc(ed.canonical)}" />
    <meta property="og:locale" content="${esc(meta.ogLocale)}" />
    <meta property="og:image" content="${esc(ogImage)}" />
    <meta property="og:image:type" content="${SITE_META.ogImageType}" />
    <meta property="og:image:width" content="${SITE_META.ogImageWidth}" />
    <meta property="og:image:height" content="${SITE_META.ogImageHeight}" />
    <meta property="og:image:alt" content="${esc(SITE_META.ogImageAlt)}" />
    <meta property="article:published_time" content="${esc(fm.publishedAt)}" />
    <meta property="article:modified_time" content="${esc(fm.updatedAt)}" />
    <meta name="twitter:card" content="${SITE_META.twitterCard}" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(fm.description)}" />
    <meta name="twitter:image" content="${esc(ogImage)}" />
    <meta name="twitter:image:alt" content="${esc(SITE_META.ogImageAlt)}" />
    <meta name="theme-color" content="#0c0d0e" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/site-doc.css" />
    ${jsonLd(ed)}
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-head">
      <a class="site-brand" href="${esc(homeHref(fm.locale))}">
        <img src="/brand/lockup-color-dark.svg" alt="${esc(PUBLISHER.product)}" height="28" />
      </a>
      <nav class="site-nav" aria-label="Site">${nav()}</nav>
      <a class="site-cta" href="${esc(boardHref(fm.locale))}">Open board</a>
    </header>
    <main id="main" class="site-main">
      ${main}
    </main>
    <footer class="site-foot">
      <nav aria-label="Legal">${nav()}</nav>
      <p>© ${new Date().getFullYear()} ${esc(PUBLISHER.product)} · ${esc(PUBLISHER.legalName)} · <button type="button" class="site-foot-action" data-consent-open>Cookie choices</button></p>
    </footer>
    ${consentBanner()}
  </body>
</html>
`;
}

function hubDocument(editions: EditionRecord[]): string {
  const byGroup = new Map<string, EditionRecord[]>();
  for (const ed of editions) {
    const g = ed.frontmatter.translationGroup;
    const list = byGroup.get(g) ?? [];
    list.push(ed);
    byGroup.set(g, list);
  }
  const items = [...byGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, list]) => {
      const sorted = [...list].sort((a, b) =>
        a.frontmatter.locale.localeCompare(b.frontmatter.locale),
      );
      const primary = sorted[0]!;
      const langs = sorted
        .map(
          (ed) =>
            `<a href="${esc(ed.path)}">${esc(LOCALE_META[ed.frontmatter.locale].nativeName)}</a>`,
        )
        .join(" · ");
      const source = primary.frontmatter.sourceUrl
        ? ` · <a href="${esc(primary.frontmatter.sourceUrl)}" rel="noopener noreferrer">Substack (EN)</a>`
        : "";
      return `<li class="football-hub__item">
<h2>${esc(primary.frontmatter.title)}</h2>
<p>${esc(primary.frontmatter.description)}</p>
<p class="football-hub__langs">${langs}${source}</p>
</li>`;
    })
    .join("\n");

  const main = `<article>
<p class="site-kicker">Football</p>
<h1>Football on ZoneBoard</h1>
<p class="lede">Localized evergreen notes on shapes, matches, and visual explanation. English originals live on Substack; this hub lists editions published on zoneboard.app.</p>
<p><a href="https://substack.com/@zoneboard" rel="noopener noreferrer">English editorial on Substack</a></p>
${editions.length === 0 ? "<p>No editions published yet.</p>" : `<ul class="football-hub__list">\n${items}\n</ul>`}
<p class="site-status-actions football-cta">
  <a class="primary" href="/board">Open board</a>
  <a class="ghost" href="/">Home</a>
</p>
</article>`;

  const canonical = `${PUBLISHER.siteUrl}/football/`;
  const title = documentTitle("Football", PUBLISHER.product);
  const description =
    "Localized football research and visual explanation on ZoneBoard. English originals on Substack; Polish and other editions here.";
  const ogImage = absoluteUrl(PUBLISHER.siteUrl, SITE_META.ogImagePath);

  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(PUBLISHER.product)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:locale" content="${SITE_META.locale}" />
    <meta property="og:image" content="${esc(ogImage)}" />
    <meta name="twitter:card" content="${SITE_META.twitterCard}" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(ogImage)}" />
    <meta name="theme-color" content="#0c0d0e" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/site-doc.css" />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-head">
      <a class="site-brand" href="/">
        <img src="/brand/lockup-color-dark.svg" alt="${esc(PUBLISHER.product)}" height="28" />
      </a>
      <nav class="site-nav" aria-label="Site">${nav()}</nav>
      <a class="site-cta" href="/board">Open board</a>
    </header>
    <main id="main" class="site-main">${main}</main>
    <footer class="site-foot">
      <nav aria-label="Legal">${nav()}</nav>
      <p>© ${new Date().getFullYear()} ${esc(PUBLISHER.product)} · ${esc(PUBLISHER.legalName)} · <button type="button" class="site-foot-action" data-consent-open>Cookie choices</button></p>
    </footer>
    ${consentBanner()}
  </body>
</html>
`;
}

async function cleanGeneratedFootball(outRoot: string): Promise<void> {
  await rm(path.join(outRoot, "football"), { recursive: true, force: true });
  for (const locale of LP_LOCALES) {
    if (locale === "en") continue;
    await rm(path.join(outRoot, locale, "football"), {
      recursive: true,
      force: true,
    });
  }
  await rm(path.join(outRoot, "sitemap-football.xml"), { force: true });
}

async function loadEditions(projectRoot: string): Promise<EditionRecord[]> {
  const contentRoot = path.join(projectRoot, "content", "football");
  let groupDirs: string[] = [];
  try {
    const entries = await readdir(contentRoot, { withFileTypes: true });
    groupDirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((name) => !name.startsWith("."));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      console.log("content/football/: no directory yet — hub only");
      return [];
    }
    throw err;
  }

  const editions: EditionRecord[] = [];
  const seenSlugLocale = new Set<string>();

  for (const folderGroup of groupDirs.sort()) {
    const dir = path.join(contentRoot, folderGroup);
    const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
    if (files.length === 0) {
      throw new FootballContentError(
        `${dir}: translation group folder has no .md editions`,
      );
    }
    for (const file of files) {
      const fileLocale = file.replace(/\.md$/i, "");
      const filePath = path.join(dir, file);
      const raw = await readFile(filePath, "utf8");
      const parsed = parseFootballMarkdown(
        raw,
        path.relative(projectRoot, filePath).replaceAll("\\", "/"),
        folderGroup,
        fileLocale,
      );
      const pubPath = editionPath(
        parsed.frontmatter.locale,
        parsed.frontmatter.slug,
      );
      const key = `${parsed.frontmatter.slug}::${parsed.frontmatter.locale}`;
      if (seenSlugLocale.has(key)) {
        throw new FootballContentError(
          `${parsed.filePath}: duplicate slug+locale ${key}`,
        );
      }
      seenSlugLocale.add(key);
      editions.push({
        ...parsed,
        path: pubPath,
        canonical: `${PUBLISHER.siteUrl}${pubPath}`,
      });
    }
  }

  return editions;
}

/** Generate Football HTML into outDir. Throws FootballContentError on bad MD. */
export async function generateFootballPages(
  options: GenerateFootballOptions = {},
): Promise<void> {
  const projectRoot =
    options.projectRoot ?? path.resolve(import.meta.dirname, "..");
  const outRoot = options.outDir ?? path.join(projectRoot, "public");

  await cleanGeneratedFootball(outRoot);
  const editions = await loadEditions(projectRoot);

  const byGroup = new Map<string, EditionRecord[]>();
  for (const ed of editions) {
    const g = ed.frontmatter.translationGroup;
    const list = byGroup.get(g) ?? [];
    list.push(ed);
    byGroup.set(g, list);
  }

  for (const ed of editions) {
    const group = byGroup.get(ed.frontmatter.translationGroup) ?? [ed];
    const relDir = editionPublicDir(
      ed.frontmatter.locale,
      ed.frontmatter.slug,
    );
    const articleDir = path.join(outRoot, relDir);
    await mkdir(articleDir, { recursive: true });
    await writeFile(
      path.join(articleDir, "index.html"),
      articleDocument(ed, group),
      "utf8",
    );
    console.log(`football: ${ed.path}`);
  }

  const hubDir = path.join(outRoot, "football");
  await mkdir(hubDir, { recursive: true });
  await writeFile(path.join(hubDir, "index.html"), hubDocument(editions), "utf8");
  console.log("football: /football/");

  const sitemapUrls = [
    `  <url><loc>${PUBLISHER.siteUrl}/football/</loc></url>`,
    ...editions.map(
      (ed) =>
        `  <url><loc>${ed.canonical}</loc><lastmod>${ed.frontmatter.updatedAt}</lastmod></url>`,
    ),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join("\n")}
</urlset>
`;
  await writeFile(path.join(outRoot, "sitemap-football.xml"), sitemap, "utf8");
  console.log(`football: wrote ${editions.length} edition(s) + hub → ${outRoot}`);
}

const isCli =
  process.argv[1] !== undefined &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isCli) {
  try {
    await generateFootballPages();
  } catch (err) {
    if (err instanceof FootballContentError) {
      console.error(
        `\nFootball content error (build aborted):\n  ${err.message}\n`,
      );
      process.exit(1);
    }
    throw err;
  }
}
