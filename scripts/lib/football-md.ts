/**
 * Football Content — frontmatter parse / validate / light Markdown → HTML.
 * Zero npm deps. Invalid editions throw (build quality gate).
 */

import type { Locale } from "../../src/i18n/messages.ts";
import { isLocale } from "../../src/i18n/locale.ts";

export const FOOTBALL_REQUIRED_KEYS = [
  "translationGroup",
  "locale",
  "title",
  "description",
  "slug",
  "publishedAt",
  "updatedAt",
] as const;

export type FootballRequiredKey = (typeof FOOTBALL_REQUIRED_KEYS)[number];

export type FootballFrontmatter = {
  translationGroup: string;
  locale: Locale;
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  series?: string;
  originalLocale?: Locale;
  sourceUrl?: string;
  ogImage?: string;
};

export type ParsedFootballFile = {
  filePath: string;
  folderGroup: string;
  fileLocale: string;
  frontmatter: FootballFrontmatter;
  body: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GROUP = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class FootballContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FootballContentError";
  }
}

function fail(filePath: string, message: string): never {
  throw new FootballContentError(`${filePath}: ${message}`);
}

/** Parse `---` YAML-ish frontmatter (flat `key: value` only). */
export function splitFrontmatter(
  raw: string,
  filePath: string,
): { matter: Record<string, string>; body: string } {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n") && text !== "---") {
    fail(filePath, "missing opening frontmatter fence (---)");
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    fail(filePath, "missing closing frontmatter fence (---)");
  }
  const matterBlock = text.slice(4, end);
  const body = text.slice(end + 5).replace(/^\n+/, "");
  const matter: Record<string, string> = {};
  for (const line of matterBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon <= 0) {
      fail(filePath, `invalid frontmatter line: ${line}`);
    }
    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    matter[key] = value;
  }
  return { matter, body };
}

export function validateAndNormalize(
  matter: Record<string, string>,
  filePath: string,
  folderGroup: string,
  fileLocale: string,
): FootballFrontmatter {
  for (const key of FOOTBALL_REQUIRED_KEYS) {
    const v = matter[key];
    if (v === undefined || v.trim() === "") {
      fail(filePath, `missing required frontmatter: ${key}`);
    }
  }

  const localeRaw = matter.locale!.trim();
  if (!isLocale(localeRaw)) {
    fail(
      filePath,
      `locale must be a shipped UI locale, got "${localeRaw}"`,
    );
  }
  if (localeRaw !== fileLocale) {
    fail(
      filePath,
      `locale "${localeRaw}" must match filename "${fileLocale}.md"`,
    );
  }

  const translationGroup = matter.translationGroup!.trim();
  if (!GROUP.test(translationGroup)) {
    fail(
      filePath,
      `translationGroup must be kebab-case [a-z0-9-], got "${translationGroup}"`,
    );
  }
  if (translationGroup !== folderGroup) {
    fail(
      filePath,
      `translationGroup "${translationGroup}" must match folder "${folderGroup}"`,
    );
  }

  const slug = matter.slug!.trim();
  if (!SLUG.test(slug)) {
    fail(filePath, `slug must be kebab-case [a-z0-9-], got "${slug}"`);
  }

  const publishedAt = matter.publishedAt!.trim();
  const updatedAt = matter.updatedAt!.trim();
  if (!ISO_DATE.test(publishedAt)) {
    fail(filePath, `publishedAt must be YYYY-MM-DD, got "${publishedAt}"`);
  }
  if (!ISO_DATE.test(updatedAt)) {
    fail(filePath, `updatedAt must be YYYY-MM-DD, got "${updatedAt}"`);
  }

  const title = matter.title!.trim();
  const description = matter.description!.trim();
  if (title.length < 3) fail(filePath, "title is too short");
  if (description.length < 10) fail(filePath, "description is too short");

  let originalLocale: Locale | undefined;
  if (matter.originalLocale !== undefined && matter.originalLocale.trim()) {
    const ol = matter.originalLocale.trim();
    if (!isLocale(ol)) {
      fail(filePath, `originalLocale invalid: "${ol}"`);
    }
    originalLocale = ol;
  }

  let sourceUrl: string | undefined;
  if (matter.sourceUrl !== undefined && matter.sourceUrl.trim()) {
    sourceUrl = matter.sourceUrl.trim();
    if (!/^https:\/\//i.test(sourceUrl)) {
      fail(filePath, "sourceUrl must be an https URL");
    }
  }

  let ogImage: string | undefined;
  if (matter.ogImage !== undefined && matter.ogImage.trim()) {
    ogImage = matter.ogImage.trim();
    if (!ogImage.startsWith("/")) {
      fail(filePath, "ogImage must be a root-relative path starting with /");
    }
  }

  let series: string | undefined;
  if (matter.series !== undefined && matter.series.trim()) {
    series = matter.series.trim();
    if (!GROUP.test(series)) {
      fail(filePath, `series must be kebab-case, got "${series}"`);
    }
  }

  return {
    translationGroup,
    locale: localeRaw,
    title,
    description,
    slug,
    publishedAt,
    updatedAt,
    series,
    originalLocale,
    sourceUrl,
    ogImage,
  };
}

export function parseFootballMarkdown(
  raw: string,
  filePath: string,
  folderGroup: string,
  fileLocale: string,
): ParsedFootballFile {
  const { matter, body } = splitFrontmatter(raw, filePath);
  if (!body.trim()) {
    fail(filePath, "body is empty");
  }
  const frontmatter = validateAndNormalize(
    matter,
    filePath,
    folderGroup,
    fileLocale,
  );
  return { filePath, folderGroup, fileLocale, frontmatter, body };
}

function escHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineFormat(text: string): string {
  let s = escHtml(text);
  s = s.replace(
    /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,
    '<a href="$2" rel="noopener noreferrer">$1</a>',
  );
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

/** Minimal Markdown: headings, paragraphs, ul, blank-line blocks. */
export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").trim().split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      out.push(`<h${level}>${inlineFormat(heading[2]!.trim())}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i]!)) {
        items.push(`<li>${inlineFormat(lines[i]!.replace(/^-\s+/, ""))}</li>`);
        i += 1;
      }
      out.push(`<ul>\n${items.join("\n")}\n</ul>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() !== "" && !/^#{1,3}\s+/.test(lines[i]!) && !/^-\s+/.test(lines[i]!)) {
      para.push(lines[i]!);
      i += 1;
    }
    out.push(`<p>${inlineFormat(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

/** Public URL path for an edition (trailing slash). */
export function editionPath(locale: Locale, slug: string): string {
  if (locale === "en") return `/football/${slug}/`;
  return `/${locale}/football/${slug}/`;
}

export function editionPublicDir(locale: Locale, slug: string): string {
  if (locale === "en") return `football/${slug}`;
  return `${locale}/football/${slug}`;
}
