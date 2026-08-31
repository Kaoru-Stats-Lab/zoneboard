#!/usr/bin/env node
/**
 * Merge docs/i18n-draft/<locale>/howTo.<locale>.json into src/i18n/howTo.ts
 * Usage: node scripts/merge-locale-howto.mjs pt|pl|de
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const locale = process.argv[2];
if (!locale || !/^[a-z]{2}$/.test(locale)) {
  console.error("Usage: node scripts/merge-locale-howto.mjs <pt|pl|de>");
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const howToPath = path.join(root, "src/i18n/howTo.ts");
const jsonPath = path.join(root, `docs/i18n-draft/${locale}/howTo.${locale}.json`);

const doc = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
delete doc._meta;

function tsString(s) {
  return JSON.stringify(s);
}

function formatSection(section, indent) {
  const lines = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  heading: ${tsString(section.heading)},`);
  lines.push(`${indent}  paragraphs: [`);
  for (const p of section.paragraphs) {
    lines.push(`${indent}    ${tsString(p)},`);
  }
  lines.push(`${indent}  ],`);
  if (section.keys?.length) {
    lines.push(`${indent}  keys: [`);
    for (const row of section.keys) {
      lines.push(
        `${indent}    { combo: ${tsString(row.combo)}, meaning: ${tsString(row.meaning)} },`,
      );
    }
    lines.push(`${indent}  ],`);
  }
  lines.push(`${indent}},`);
  return lines.join("\n");
}

const body = [];
body.push(`const ${locale}: HowToDoc = {`);
body.push(`  intro: ${tsString(doc.intro)},`);
body.push("  sections: [");
doc.sections.forEach((s, i) => {
  body.push(formatSection(s, "    ") + (i < doc.sections.length - 1 ? "" : ""));
});
body.push("  ],");
body.push("};");

const localeConst = body.join("\n");

let src = fs.readFileSync(howToPath, "utf8");
if (src.includes(`const ${locale}: HowToDoc`)) {
  throw new Error(`${locale} howTo block already exists`);
}

const exportMatch = src.match(
  /export const HOW_TO: Record<Locale, HowToDoc> = \{ ([^}]+) \};/,
);
if (!exportMatch) throw new Error("HOW_TO export not found");
const locales = exportMatch[1].split(",").map((s) => s.trim());
if (!locales.includes(locale)) locales.push(locale);

src = src.replace(
  /export const HOW_TO: Record<Locale, HowToDoc> = \{ [^}]+ \};/,
  `${localeConst}\n\nexport const HOW_TO: Record<Locale, HowToDoc> = { ${locales.join(", ")} };`,
);

fs.writeFileSync(howToPath, src, "utf8");
console.log(`Added ${locale} to howTo.ts`);
