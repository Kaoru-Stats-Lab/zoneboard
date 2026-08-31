#!/usr/bin/env node
/**
 * Build docs/i18n-draft/it/messages-app.it.json from gemini-app-raw.json
 * Usage: node scripts/build-it-app-draft.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = path.join(root, "src/i18n/messages.ts");
const rawPath = path.join(root, "docs/i18n-draft/it/gemini-app-raw.json");
const outPath = path.join(root, "docs/i18n-draft/it/messages-app.it.json");

const src = fs.readFileSync(srcPath, "utf8");
const enMatch = src.match(/en: \{([\s\S]*?)\n  \},\n  es: \{/);
if (!enMatch) throw new Error("en block not found");

/** @type {string[]} */
const appKeys = [];
for (const m of enMatch[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)) {
  const k = m[1];
  if (!k.startsWith("lp")) appKeys.push(k);
}

const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));

const missing = appKeys.filter((k) => raw[k] === undefined);
if (missing.length) {
  console.error("Missing translations:", missing.length, missing.slice(0, 10));
  process.exit(1);
}

const shortOverflow = appKeys
  .filter((k) => k.endsWith("Short") && k !== "feedbackTooShort" && raw[k].length > 12)
  .map((k) => ({ key: k, value: raw[k], chars: raw[k].length }));

const out = {
  _meta: {
    locale: "it",
    bcp47: "it-IT",
    source: "messages.ts en ONLY",
    excludes: "lp*",
    keyCount: appKeys.length,
    toolNames: "Passaggio / Corsa / Dribbling",
    _shortOverflow: shortOverflow,
  },
};

for (const k of appKeys) out[k] = raw[k];

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("Wrote", outPath, "keys:", appKeys.length, "short overflow:", shortOverflow.length);
