import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PUBLISHER, SITE_NAV } from "../src/site/publisher.ts";
import { SITE_PAGES, type SitePage } from "../src/site/pages.ts";

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

function langBlock(
  lang: "en" | "ja",
  title: string,
  lede: string,
  page: SitePage,
): string {
  const label = lang === "en" ? "English" : "日本語";
  const sections = page.sections
    .map((section) => {
      const heading = lang === "en" ? section.headingEn : section.headingJa;
      const body = lang === "en" ? section.en : section.ja;
      return `<h2>${esc(heading)}</h2>\n${paragraphs(body)}`;
    })
    .join("\n");
  const form =
    page.showContactForm && lang === "en"
      ? contactForm()
      : page.showContactForm && lang === "ja"
        ? `<p lang="ja">英語欄のフォームでも、日本語で送ってください。</p>`
        : "";
  return `<section class="lang-block" lang="${lang}">
<p class="lang-label">${label}</p>
<h1>${esc(title)}</h1>
<p class="lede">${linkify(lede)}</p>
${form}
${sections}
</section>`;
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

function documentFor(page: SitePage): string {
  const url = `${PUBLISHER.siteUrl}/${page.slug}/`;
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(page.titleEn)} — ${esc(PUBLISHER.product)}</title>
    <meta name="description" content="${esc(page.descriptionEn)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${esc(page.titleEn)} — ${esc(PUBLISHER.product)}" />
    <meta property="og:description" content="${esc(page.descriptionEn)}" />
    <meta property="og:url" content="${url}" />
    <meta name="theme-color" content="#0c0d0e" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/site-doc.css" />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-head">
      <a class="site-brand" href="/">
        <img src="/brand/mark-color-dark.svg" alt="" width="24" height="24" />
        ${esc(PUBLISHER.product)}
      </a>
      <nav class="site-nav" aria-label="Site">${nav(page.slug)}</nav>
      <a class="site-cta" href="/board">Open board</a>
    </header>
    <main id="main" class="site-main">
      ${langBlock("en", page.titleEn, page.ledeEn, page)}
      ${langBlock("ja", page.titleJa, page.ledeJa, page)}
    </main>
    <footer class="site-foot">
      <nav aria-label="Legal">${nav(page.slug)}</nav>
      <p>© ${new Date().getFullYear()} ${esc(PUBLISHER.product)} · ${esc(PUBLISHER.legalName)}</p>
    </footer>
  </body>
</html>
`;
}

function wordCount(page: SitePage): number {
  const blob = page.sections
    .flatMap((s) => [...s.en, ...s.ja, s.headingEn, s.headingJa])
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

console.log(`wrote ${SITE_PAGES.length} pages, ~${totalWords} words`);
