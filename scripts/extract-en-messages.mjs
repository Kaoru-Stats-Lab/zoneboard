#!/usr/bin/env node
/**
 * Export messages.ts en block to JSON for locale draft pipelines.
 * Usage: node scripts/extract-en-messages.mjs [app|lp|all]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const mode = process.argv[2] || "all";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "src/i18n/messages.ts"), "utf8");
const enMatch = src.match(/en: \{([\s\S]*?)\n  \},\n  es: \{/);
if (!enMatch) throw new Error("en block not found");

/** @type {Record<string, string>} */
const bag = {};
let cur = null;
let buf = "";

function flush() {
  if (!cur) return;
  bag[cur] = JSON.parse(buf);
  cur = null;
  buf = "";
}

for (const line of enMatch[1].split("\n")) {
  const keyOnly = line.match(/^\s+([a-zA-Z0-9_]+):\s*$/);
  if (keyOnly) {
    flush();
    cur = keyOnly[1];
    continue;
  }
  const inline = line.match(/^\s+([a-zA-Z0-9_]+):\s*(.+),?\s*$/);
  if (inline && !cur) {
    flush();
    bag[inline[1]] = JSON.parse(inline[2].replace(/,$/, ""));
    continue;
  }
  if (cur) {
    buf += (buf ? "\n" : "") + line.trim().replace(/,$/, "");
    if (line.trim().endsWith('",') || line.trim().endsWith('"')) flush();
  }
}
flush();

const app = Object.fromEntries(Object.entries(bag).filter(([k]) => !k.startsWith("lp")));
const lp = Object.fromEntries(Object.entries(bag).filter(([k]) => k.startsWith("lp")));
const shared = ["brand", "openBoard", "openBoardContinue", "openBoardNew"];
for (const k of shared) if (bag[k]) lp[k] = bag[k];

const outDir = path.join(root, "docs/i18n-draft/_en-source");
fs.mkdirSync(outDir, { recursive: true });

if (mode === "app" || mode === "all") {
  fs.writeFileSync(
    path.join(outDir, "messages-app.en.json"),
    JSON.stringify(app, null, 2) + "\n",
  );
  console.log("app keys:", Object.keys(app).length);
}
if (mode === "lp" || mode === "all") {
  fs.writeFileSync(
    path.join(outDir, "messages-lp.en.json"),
    JSON.stringify(lp, null, 2) + "\n",
  );
  console.log("lp keys:", Object.keys(lp).length);
}
