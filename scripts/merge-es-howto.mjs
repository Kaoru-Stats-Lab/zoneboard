#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const howToPath = path.join(root, "src/i18n/howTo.ts");
const jsonPath = path.join(root, "docs/i18n-draft/es/howTo.es.json");

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
body.push("const es: HowToDoc = {");
body.push(`  intro: ${tsString(doc.intro)},`);
body.push("  sections: [");
doc.sections.forEach((s, i) => {
  body.push(formatSection(s, "    ") + (i < doc.sections.length - 1 ? "" : ""));
});
body.push("  ],");
body.push("};");

const esConst = body.join("\n");

let src = fs.readFileSync(howToPath, "utf8");
if (src.includes("const es: HowToDoc")) {
  throw new Error("es howTo block already exists");
}
src = src.replace(
  "export const HOW_TO: Record<Locale, HowToDoc> = { ja, en };",
  `${esConst}\n\nexport const HOW_TO: Record<Locale, HowToDoc> = { ja, en, es };`,
);
fs.writeFileSync(howToPath, src, "utf8");
console.log("Added es to howTo.ts");
