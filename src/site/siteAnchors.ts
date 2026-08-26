/** Stable URL fragments for site-doc section headings (`/guide/#place`). */

const STOP = new Set(["a", "an", "the", "and", "or", "of", "to", "for", "in", "on"]);

export function slugifyHeading(heading: string): string {
  const raw = heading
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const parts = raw.split("-").filter((p) => p && !STOP.has(p));
  const slug = (parts.length ? parts : raw.split("-").filter(Boolean)).join("-");
  return slug || "section";
}

/** Deduplicate within one page; returns ids in section order. */
export function uniqueSectionIds(
  sections: { id?: string; headingEn: string }[],
): string[] {
  const used = new Map<string, number>();
  return sections.map((section) => {
    const base = section.id?.trim() || slugifyHeading(section.headingEn);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  });
}
