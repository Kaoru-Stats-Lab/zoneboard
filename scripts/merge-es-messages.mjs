#!/usr/bin/env node
/**
 * Merge docs/i18n-draft/es/*.json into src/i18n/messages.ts (es locale block).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagesPath = path.join(root, "src/i18n/messages.ts");
const appPath = path.join(root, "docs/i18n-draft/es/gemini-app-raw.json");
const lpPath = path.join(root, "docs/i18n-draft/es/messages-lp.es.json");

const app = JSON.parse(fs.readFileSync(appPath, "utf8"));
const lpRaw = JSON.parse(fs.readFileSync(lpPath, "utf8"));
const lp = Object.fromEntries(
  Object.entries(lpRaw).filter(([k]) => !k.startsWith("_")),
);
const es = { ...app, ...lp };

const src = fs.readFileSync(messagesPath, "utf8");
if (!src.includes('"es"')) {
  throw new Error("Locale type must include es before merge");
}
if (src.includes("\n  es: {")) {
  throw new Error("es block already exists — remove before re-merge");
}

const updatedType = src.replace(
  /export type Locale = "[^"]+";/,
  'export type Locale = "ja" | "en" | "es";',
);

const jaMatch = src.match(/ja: \{([\s\S]*?)\n  \},\n  en: \{/);
if (!jaMatch) throw new Error("ja block not found");
const keys = [...jaMatch[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)].map((m) => m[1]);

const missing = keys.filter((k) => es[k] === undefined);
const extra = Object.keys(es).filter((k) => !keys.includes(k));
if (missing.length) throw new Error(`Missing keys: ${missing.join(", ")}`);
if (extra.length) throw new Error(`Extra keys: ${extra.join(", ")}`);

function formatEntry(key, value) {
  const serialized = JSON.stringify(value);
  if (serialized.length > 72 || value.includes("\n")) {
    return `${key}:\n      ${serialized},`;
  }
  return `${key}: ${serialized},`;
}

const lines = keys.map((k) => `    ${formatEntry(k, es[k])}`);
const esBlock = `  es: {\n${lines.join("\n")}\n  },\n`;

const anchor = "\n} as const;\n\nexport type MessageKey";
if (!updatedType.includes(anchor)) {
  throw new Error("messages.ts anchor not found for es insert");
}
const updated = updatedType.replace(anchor, `\n${esBlock}} as const;\n\nexport type MessageKey`);

fs.writeFileSync(messagesPath, updated, "utf8");
console.log(`Merged es: ${keys.length} keys into messages.ts`);
