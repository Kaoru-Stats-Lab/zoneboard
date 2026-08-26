/** Shared SEO / social meta for the SPA shell and static site pages. */
export const SITE_META = {
  /** Homepage `<title>` and default `og:title`. */
  homeTitle: "ZoneBoard — Football tactics board for OBS",
  /**
   * Homepage meta description / og:description.
   * Keep ~150–160 characters; OBS-first, matches LP H1.
   */
  homeDescription:
    "Add a football tactics board to tonight's OBS show. Hide the tools, capture only the pitch. Cam and chat stay in OBS. No account.",
  ogImagePath: "/brand/lockup-og.png",
  /** SVG retained for print / vector; crawlers need the PNG. */
  ogImageSvgPath: "/brand/lockup-og.svg",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "ZoneBoard — football tactics board",
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  locale: "en_GB",
} as const;

export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function documentTitle(pageTitle: string, product: string): string {
  if (pageTitle === product || pageTitle.includes(product)) return pageTitle;
  return `${pageTitle} — ${product}`;
}
