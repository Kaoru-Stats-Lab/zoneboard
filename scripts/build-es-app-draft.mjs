#!/usr/bin/env node
/**
 * Build docs/i18n-draft/es/messages-app.es.json from gemini raw + tool-name patches.
 * Usage: node scripts/build-es-app-draft.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = path.join(root, "src/i18n/messages.ts");
const rawPath = path.join(root, "docs/i18n-draft/es/gemini-app-raw.json");
const outPath = path.join(root, "docs/i18n-draft/es/messages-app.es.json");

const src = fs.readFileSync(srcPath, "utf8");
const enMatch = src.match(/en: \{([\s\S]*?)\n  \},\n\} as const;/);
if (!enMatch) throw new Error("en block not found");

/** @type {string[]} */
const appKeys = [];
for (const m of enMatch[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)) {
  const k = m[1];
  if (!k.startsWith("lp")) appKeys.push(k);
}

/** @type {Record<string, string>} */
let raw = {};
if (fs.existsSync(rawPath)) {
  raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
}

const TOOL_PATCHES = {
  pass: "Pase",
  run: "Carrera",
  dribble: "Regate",
  passHint:
    "Pase = ruta del balón (pase, centro, tiro). Las fichas no se mueven.",
  runHint: "Carrera = movimiento sin balón. Arrastra una ficha.",
  dribbleHint: "Regate = conducción de balón. Arrastra una ficha.",
  deleteHint:
    "Pase=punteada, Carrera=sólida, Regate=ondulada. Selecciona y pulsa Suprimir",
  confirmClearDrawings:
    "¿Borrar todas las rutas, carreras, zonas y líneas?",
};

const merged = { ...raw, ...TOOL_PATCHES };

const missing = appKeys.filter((k) => merged[k] === undefined);
if (missing.length) {
  console.error("Missing translations:", missing.length, missing.slice(0, 10));
  process.exit(1);
}

const shortOverflow = appKeys
  .filter((k) => k.endsWith("Short") && k !== "feedbackTooShort" && merged[k].length > 12)
  .map((k) => ({ key: k, value: merged[k], chars: merged[k].length }));

const out = {
  _meta: {
    locale: "es",
    source: "messages.ts en",
    excludes: "lp*",
    keyCount: appKeys.length,
    toolNames: "Pase / Carrera / Regate",
    _shortOverflow: shortOverflow,
  },
};

for (const k of appKeys) out[k] = merged[k];

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("Wrote", outPath, "keys:", appKeys.length, "short overflow:", shortOverflow.length);
