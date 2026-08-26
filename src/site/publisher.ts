/** Public publisher facts for legal pages and the site footer. */
export const PUBLISHER = {
  product: "ZoneBoard",
  legalName: "Kaoru Stats Lab",
  legalNameJa: "Kaoru Stats Lab",
  countryEn: "Japan",
  countryJa: "日本",
  siteUrl: "https://zoneboard.app",
  email: "contact@zoneboard.app",
  updatedIso: "2026-08-25",
  updatedEn: "25 August 2026",
  updatedJa: "2026年8月25日",
} as const;

export type SiteSlug =
  | "about"
  | "guide"
  | "faq"
  | "pricing"
  | "materials"
  | "privacy"
  | "terms"
  | "cookies"
  | "contact";

export const SITE_NAV: {
  slug: SiteSlug;
  labelEn: string;
  labelJa: string;
}[] = [
  { slug: "about", labelEn: "About", labelJa: "About" },
  { slug: "guide", labelEn: "Guide", labelJa: "使い方" },
  { slug: "faq", labelEn: "FAQ", labelJa: "FAQ" },
  { slug: "pricing", labelEn: "Pricing", labelJa: "料金" },
  { slug: "materials", labelEn: "Materials", labelJa: "素材" },
  { slug: "privacy", labelEn: "Privacy", labelJa: "プライバシー" },
  { slug: "terms", labelEn: "Terms", labelJa: "利用規約" },
  { slug: "cookies", labelEn: "Cookies", labelJa: "Cookie" },
  { slug: "contact", labelEn: "Contact", labelJa: "連絡先" },
];
