#!/usr/bin/env node
/**
 * Merge docs/i18n-draft/<locale>/*.json into src/i18n/messages.ts
 * Usage: node scripts/merge-locale-messages.mjs pt|pl|de|fr|tr
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const locale = process.argv[2];
if (!locale || !/^[a-z]{2}$/.test(locale)) {
  console.error("Usage: node scripts/merge-locale-messages.mjs <pt|pl|de|fr|tr>");
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagesPath = path.join(root, "src/i18n/messages.ts");
const appPath = path.join(root, `docs/i18n-draft/${locale}/gemini-app-raw.json`);
const lpPath = path.join(root, `docs/i18n-draft/${locale}/messages-lp.${locale}.json`);

const app = JSON.parse(fs.readFileSync(appPath, "utf8"));
const lpRaw = JSON.parse(fs.readFileSync(lpPath, "utf8"));
const lp = Object.fromEntries(
  Object.entries(lpRaw).filter(([k]) => !k.startsWith("_")),
);
const bag = { ...app, ...lp };

let src = fs.readFileSync(messagesPath, "utf8");
if (src.includes(`\n  ${locale}: {`)) {
  throw new Error(`${locale} block already exists in messages.ts`);
}

const jaMatch = src.match(/ja: \{([\s\S]*?)\n  \},\n  en: \{/);
if (!jaMatch) throw new Error("ja block not found");
const keys = [...jaMatch[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)].map((m) => m[1]);

const missing = keys.filter((k) => bag[k] === undefined);
const extra = Object.keys(bag).filter((k) => !keys.includes(k));
if (missing.length) throw new Error(`Missing keys: ${missing.join(", ")}`);
if (extra.length) throw new Error(`Extra keys: ${extra.join(", ")}`);

if (!src.includes(`"${locale}"`)) {
  src = src.replace(
    /export type Locale = (.+);/,
    (_, inner) => `export type Locale = ${inner} | "${locale}";`,
  );
}

function formatEntry(key, value) {
  const serialized = JSON.stringify(value);
  if (serialized.length > 72 || value.includes("\n")) {
    return `${key}:\n      ${serialized},`;
  }
  return `${key}: ${serialized},`;
}

const lines = keys.map((k) => `    ${formatEntry(k, bag[k])}`);
const block = `  ${locale}: {\n${lines.join("\n")}\n  },\n`;

const marker = "\n} as const;";
const idx = src.indexOf(marker);
if (idx < 0) throw new Error("messages.ts anchor not found");
src = src.slice(0, idx) + `\n${block}` + src.slice(idx);

fs.writeFileSync(messagesPath, src, "utf8");
console.log(`Merged ${locale}: ${keys.length} keys into messages.ts`);
