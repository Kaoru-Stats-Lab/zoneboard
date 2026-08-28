import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PUBLISHER, SITE_NAV } from "../src/site/publisher.ts";
import { SITE_PAGES, type SitePage } from "../src/site/pages.ts";
import {
  CHANGELOG,
  publicChangelogEntries,
  type ChangelogType,
} from "../src/site/changelog.ts";
import { CONSENT_BANNER } from "../src/site/consentCopy.ts";
import { STREAM_SHARE_BLURB } from "../src/site/shareCopy.ts";
import {
  SITE_META,
  absoluteUrl,
  documentTitle,
} from "../src/site/siteMeta.ts";
import { uniqueSectionIds } from "../src/site/siteAnchors.ts";
import {
  SHORTCUT_SHEET_COPY,
  shortcutSheetArticle,
} from "../src/site/shortcutSheet.ts";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");

function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function linkify(text: string): string {
  return esc(text).replace(/https:\/\/[^\s<]+/g, (url) => {
    const clean = url.replace(/[.,;:)\]\}]+$/u, "");
    const trail = url.slice(clean.length);
    return `<a href="${clean}" rel="noopener noreferrer">${clean}</a>${esc(trail)}`;
  });
}

function paragraphs(lines: string[]): string {
  return lines.map((p) => `<p>${linkify(p)}</p>`).join("\n");
}

function nav(current: string): string {
  return SITE_NAV.map((item) => {
    const href = `/${item.slug}/`;
    const currentAttr = item.slug === current ? ' aria-current="page"' : "";
    return `<a href="${href}"${currentAttr}>${esc(item.labelEn)}</a>`;
  }).join("\n");
}

/** Public pages ship English only. Japanese copy on SitePage is not written to HTML. */
function article(page: SitePage): string {
  const ids = uniqueSectionIds(page.sections);
  const sectionBlocks = page.sections.map(
    (section, i) =>
      `<h2 id="${esc(ids[i]!)}">${esc(section.headingEn)}</h2>\n${paragraphs(section.en)}`,
  );
  if (page.slug === "guide") {
    const rehearseIdx = page.sections.findIndex((s) => s.id === "rehearse");
    if (rehearseIdx >= 0) {
      sectionBlocks.splice(rehearseIdx + 1, 0, guideShortcutSheetAside());
    }
  }
  const sections = sectionBlocks.join("\n");
  const form = page.showContactForm ? contactForm() : "";
  const extras =
    page.slug === "materials"
      ? materialsExtras()
      : page.slug === "updates"
        ? updatesExtras()
        : "";
  return `<article>
<h1>${esc(page.titleEn)}</h1>
<p class="lede">${linkify(page.ledeEn)}</p>
${extras}
${form}
${sections}
</article>`;
}

function materialsExtras(): string {
  return `${shortcutSheetLinks()}
${materialsMedia()}
${materialsShareCopy()}`;
}

function shortcutSheetLinks(): string {
  return `<aside class="site-share shortcut-sheet-promo" aria-labelledby="shortcut-sheet-heading">
<h2 id="shortcut-sheet-heading">Broadcast shortcut sheet</h2>
<p>Printable command table for on-air piece work. Same shortcuts as the in-app how-to (? / F1).</p>
<p class="site-share__row">
<a class="primary" href="/materials/shortcut-sheet/">English · Print / PDF</a>
<a class="ghost" href="/materials/shortcut-sheet/ja/">日本語</a>
</p>
</aside>`;
}

/** After Guide § rehearse — anchor #shortcut-sheet for PH / outreach links. */
function guideShortcutSheetAside(): string {
  return `<aside id="shortcut-sheet" class="site-share shortcut-sheet-promo" aria-labelledby="guide-shortcut-heading">
<h2 id="guide-shortcut-heading">Print before you go live</h2>
<p>Broadcast mode hides the tools. Keep this command table beside the keyboard — same shortcuts as ? / F1 in the editor.</p>
<p class="site-share__row">
<a class="primary" href="/materials/shortcut-sheet/">English · Print / PDF</a>
<a class="ghost" href="/materials/shortcut-sheet/ja/">日本語</a>
</p>
</aside>`;
}

function typeLabel(type: ChangelogType): string {
  if (type === "feature") return "Feature";
  if (type === "fix") return "Fix";
  return "Improve";
}

function updatesExtras(): string {
  const items = publicChangelogEntries()
    .map(
      (e) => `<li class="site-changelog__item" data-type="${esc(e.type)}">
<p class="site-changelog__meta"><time datetime="${esc(e.date)}">${esc(e.date)}</time> · <span class="site-changelog__type">${esc(typeLabel(e.type))}</span></p>
<h3 class="site-changelog__title">${esc(e.title)}</h3>
<p class="site-changelog__body">${linkify(e.body)}</p>
</li>`,
    )
    .join("\n");
  return `<aside class="site-changelog" aria-labelledby="changelog-heading">
<p class="site-changelog__policy">${esc(CHANGELOG.policyEn)}</p>
<p class="site-changelog__updated">Updated <time datetime="${esc(CHANGELOG.updatedAt)}">${esc(CHANGELOG.updatedAt)}</time></p>
<h2 id="changelog-heading">Shipped timeline</h2>
<ol class="site-changelog__list">
${items}
</ol>
</aside>`;
}

function materialsMedia(): string {
  return `<figure class="site-media">
<video controls playsinline preload="metadata" poster="/brand/motion/exports/A/final-lockup-plate-16x9.png" src="/brand/motion/exports/A/sting-lockup-plate-16x9.mp4"></video>
<figcaption>Default lockup end card (16:9) — drop after the board capture, not on the live pitch.</figcaption>
</figure>`;
}

function materialsShareCopy(): string {
  return `<aside class="site-share" aria-labelledby="stream-share-heading">
<h2 id="stream-share-heading">Copy for your description</h2>
<p>Paste into YouTube, Discord, or a Twitch panel. Not a pitch watermark.</p>
<div class="site-share__row">
<textarea id="stream-share-text" readonly rows="3">${esc(STREAM_SHARE_BLURB)}</textarea>
<button type="button" id="stream-share-copy">Copy</button>
</div>
<p class="site-share__status" id="stream-share-status" role="status"></p>
</aside>
<script>
(function () {
  var btn = document.getElementById("stream-share-copy");
  var text = document.getElementById("stream-share-text");
  var status = document.getElementById("stream-share-status");
  if (!btn || !text) return;
  btn.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(text.value);
      status.textContent = "Copied.";
      window.setTimeout(function () { status.textContent = ""; }, 1600);
    } catch (err) {
      text.focus();
      text.select();
      status.textContent = "Select and copy manually.";
    }
  });
})();
</script>`;
}

function contactForm(): string {
  return `<form class="site-form" id="contact-form">
<label for="contact-kind">Topic</label>
<select id="contact-kind" name="kind">
  <option value="other">General</option>
  <option value="ux">Product</option>
  <option value="bug">Bug</option>
</select>
<label for="contact-message">Message</label>
<textarea id="contact-message" name="message" maxlength="500" required></textarea>
<button type="submit">Send</button>
<p class="form-status" id="contact-status" role="status"></p>
</form>
<script>
document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("contact-status");
  const message = document.getElementById("contact-message").value.trim();
  if (message.length < 3) {
    status.textContent = "Write a little more.";
    return;
  }
  status.textContent = "Sending…";
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool_id: "zoneboard",
        source: "contact",
        kind: document.getElementById("contact-kind").value,
        message,
        ua_short: navigator.userAgent.slice(0, 120),
        locale: document.documentElement.lang || "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        viewport: window.innerWidth + "x" + window.innerHeight,
        color_scheme: "dark",
        page_path: location.pathname,
        referrer: document.referrer || "",
        utm: ""
      })
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.ok) {
      status.textContent = "Could not send. Email ${PUBLISHER.email} instead.";
      return;
    }
    status.textContent = "Sent. Thank you.";
    document.getElementById("contact-message").value = "";
  } catch (err) {
    status.textContent = "Could not send. Email ${PUBLISHER.email} instead.";
  }
});
</script>`;
}

function consentBanner(): string {
  return `<aside id="site-consent" class="site-consent site-consent--compact" hidden role="region" aria-labelledby="site-consent-title">
  <div class="site-consent__inner">
    <p class="site-consent__title" id="site-consent-title">${esc(CONSENT_BANNER.title)}</p>
    <p class="site-consent__copy">
      ${esc(CONSENT_BANNER.copy)}
    </p>
    <div class="site-consent__actions">
      <button type="button" class="site-consent__btn" data-consent="reject">
        ${esc(CONSENT_BANNER.reject)}
      </button>
      <button type="button" class="site-consent__btn" data-consent="analytics">
        ${esc(CONSENT_BANNER.analytics)}
      </button>
      <button type="button" class="site-consent__btn site-consent__btn--allow" data-consent="ads">
        ${esc(CONSENT_BANNER.ads)}
      </button>
      <a href="${esc(CONSENT_BANNER.policyHref)}">${esc(CONSENT_BANNER.policyLabel)}</a>
    </div>
  </div>
</aside>
<script src="/consent.js" defer></script>`;
}

type ShellOpts = {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  currentNav?: string;
  main: string;
  consent: boolean;
  lang?: string;
  extraStylesheet?: string;
};

function documentShell(opts: ShellOpts): string {
  const title = documentTitle(opts.title, PUBLISHER.product);
  const lang = opts.lang ?? "en-GB";
  const extraCss = opts.extraStylesheet
    ? `    <link rel="stylesheet" href="${esc(opts.extraStylesheet)}" />\n`
    : "";
  const canonical = opts.canonical
    ? `    <link rel="canonical" href="${esc(opts.canonical)}" />\n`
    : "";
  const robots = opts.robots
    ? `    <meta name="robots" content="${esc(opts.robots)}" />\n`
    : "";
  const ogUrl = opts.canonical
    ? `    <meta property="og:url" content="${esc(opts.canonical)}" />\n`
    : "";
  const ogImage = absoluteUrl(PUBLISHER.siteUrl, SITE_META.ogImagePath);
  return `<!doctype html>
<html lang="${esc(lang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(opts.description)}" />
${canonical}${robots}    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(PUBLISHER.product)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(opts.description)}" />
${ogUrl}    <meta property="og:locale" content="${SITE_META.locale}" />
    <meta property="og:image" content="${esc(ogImage)}" />
    <meta property="og:image:type" content="${SITE_META.ogImageType}" />
    <meta property="og:image:width" content="${SITE_META.ogImageWidth}" />
    <meta property="og:image:height" content="${SITE_META.ogImageHeight}" />
    <meta property="og:image:alt" content="${esc(SITE_META.ogImageAlt)}" />
    <meta name="twitter:card" content="${SITE_META.twitterCard}" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(opts.description)}" />
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
${extraCss}  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-head">
      <a class="site-brand" href="/">
        <img src="/brand/lockup-color-dark.svg" alt="${esc(PUBLISHER.product)}" height="28" />
      </a>
      <nav class="site-nav" aria-label="Site">${nav(opts.currentNav ?? "")}</nav>
      <a class="site-cta" href="/board">Open board</a>
    </header>
    <main id="main" class="site-main">
      ${opts.main}
    </main>
    <footer class="site-foot">
      <nav aria-label="Legal">${nav(opts.currentNav ?? "")}</nav>
      <p>© ${new Date().getFullYear()} ${esc(PUBLISHER.product)} · ${esc(PUBLISHER.legalName)}${
        opts.consent
          ? ` · <button type="button" class="site-foot-action" data-consent-open>Cookie choices</button>`
          : ""
      }</p>
    </footer>
    ${opts.consent ? consentBanner() : ""}
  </body>
</html>
`;
}

function documentFor(page: SitePage): string {
  return documentShell({
    title: page.titleEn,
    description: page.descriptionEn,
    canonical: `${PUBLISHER.siteUrl}/${page.slug}/`,
    currentNav: page.slug,
    main: article(page),
    consent: true,
  });
}

function statusMain(opts: {
  kicker: string;
  heading: string;
  copy: string;
  actions: string;
}): string {
  return `<article class="site-status">
<p class="site-kicker">${esc(opts.kicker)}</p>
<h1>${esc(opts.heading)}</h1>
<p class="lede">${esc(opts.copy)}</p>
<p class="site-status-actions">
${opts.actions}
</p>
</article>`;
}

function wordCount(page: SitePage): number {
  const blob = [page.titleEn, page.ledeEn, page.descriptionEn]
    .concat(page.sections.flatMap((s) => [s.headingEn, ...s.en]))
    .join(" ");
  return blob.trim().split(/\s+/).length;
}

let totalWords = 0;
for (const page of SITE_PAGES) {
  const dir = path.join(publicDir, page.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), documentFor(page));
  const n = wordCount(page);
  totalWords += n;
  console.log(`${page.slug}: ~${n} words`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${PUBLISHER.siteUrl}/</loc></url>
  <url><loc>${PUBLISHER.siteUrl}/board</loc></url>
${SITE_PAGES.map((p) => `  <url><loc>${PUBLISHER.siteUrl}/${p.slug}/</loc><lastmod>${PUBLISHER.updatedIso}</lastmod></url>`).join("\n")}
  <url><loc>${PUBLISHER.siteUrl}/materials/shortcut-sheet/</loc><lastmod>${PUBLISHER.updatedIso}</lastmod></url>
  <url><loc>${PUBLISHER.siteUrl}/materials/shortcut-sheet/ja/</loc><lastmod>${PUBLISHER.updatedIso}</lastmod></url>
</urlset>
`;
await writeFile(path.join(publicDir, "sitemap.xml"), sitemap);

await writeFile(
  path.join(publicDir, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${PUBLISHER.siteUrl}/sitemap.xml
`,
);

await writeFile(
  path.join(publicDir, "404.html"),
  documentShell({
    title: "Page not found",
    description: "This address is not a ZoneBoard page.",
    robots: "noindex, nofollow",
    main: statusMain({
      kicker: "404",
      heading: "This page is not here",
      copy: "The address is wrong, or the page has moved. The tactics board is still at /board.",
      actions: `  <a class="primary" href="/board">Open board</a>
  <a class="ghost" href="/">Home</a>
  <a class="ghost" href="/guide/">Guide</a>`,
    }),
    consent: false,
  }),
);

await writeFile(
  path.join(publicDir, "maintenance.html"),
  documentShell({
    title: "Temporarily unavailable",
    description: "ZoneBoard is offline for a short maintenance window.",
    robots: "noindex, nofollow",
    main: statusMain({
      kicker: "Unavailable",
      heading: "The board is offline for a short time",
      copy: `We are doing maintenance. Try again in a few minutes. If this stays up, email ${PUBLISHER.email}.`,
      actions: `  <a class="primary" href="/">Try again</a>
  <a class="ghost" href="mailto:${esc(PUBLISHER.email)}">Email</a>`,
    }),
    consent: false,
  }),
);

console.log(`wrote ${SITE_PAGES.length} pages, ~${totalWords} words`);

for (const locale of ["en", "ja"] as const) {
  const copy = SHORTCUT_SHEET_COPY[locale];
  const subdir =
    locale === "ja" ? "materials/shortcut-sheet/ja" : "materials/shortcut-sheet";
  const dir = path.join(publicDir, subdir);
  await mkdir(dir, { recursive: true });
  const canonical = `${PUBLISHER.siteUrl}/${subdir}/`;
  await writeFile(
    path.join(dir, "index.html"),
    documentShell({
      title: copy.title,
      description: copy.description,
      canonical,
      currentNav: "materials",
      main: shortcutSheetArticle(locale),
      consent: true,
      lang: locale === "ja" ? "ja" : "en-GB",
      extraStylesheet: "/shortcut-sheet.css",
    }),
  );
  console.log(`shortcut-sheet/${locale === "ja" ? "ja" : "en"}`);
}

console.log("wrote 404.html and maintenance.html");
