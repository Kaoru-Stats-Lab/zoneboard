import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PUBLISHER, SITE_NAV } from "../src/site/publisher.ts";
import { SITE_PAGES, type SitePage } from "../src/site/pages.ts";
import { CONSENT_BANNER } from "../src/site/consentCopy.ts";

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
  const sections = page.sections
    .map(
      (section) =>
        `<h2>${esc(section.headingEn)}</h2>\n${paragraphs(section.en)}`,
    )
    .join("\n");
  const form = page.showContactForm ? contactForm() : "";
  return `<article>
<h1>${esc(page.titleEn)}</h1>
<p class="lede">${linkify(page.ledeEn)}</p>
${form}
${sections}
</article>`;
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
  return `<aside id="site-consent" class="site-consent" hidden role="region" aria-labelledby="site-consent-title">
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
};

function documentShell(opts: ShellOpts): string {
  const canonical = opts.canonical
    ? `    <link rel="canonical" href="${esc(opts.canonical)}" />\n`
    : "";
  const robots = opts.robots
    ? `    <meta name="robots" content="${esc(opts.robots)}" />\n`
    : "";
  const ogUrl = opts.canonical
    ? `    <meta property="og:url" content="${esc(opts.canonical)}" />\n`
    : "";
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(opts.title)} — ${esc(PUBLISHER.product)}</title>
    <meta name="description" content="${esc(opts.description)}" />
${canonical}${robots}    <meta property="og:title" content="${esc(opts.title)} — ${esc(PUBLISHER.product)}" />
    <meta property="og:description" content="${esc(opts.description)}" />
${ogUrl}    <meta property="og:locale" content="en_GB" />
    <meta property="og:image" content="${PUBLISHER.siteUrl}/brand/lockup-og.svg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
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
console.log("wrote 404.html and maintenance.html");
