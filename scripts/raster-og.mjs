/**
 * Rasterize public/brand/lockup-og.svg → lockup-og.png (1200×630).
 * Needs Google Chrome. Run after `npm run brand:marks` (or equivalent).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = path.join(root, "public", "brand", "lockup-og.svg");
const pngPath = path.join(root, "public", "brand", "lockup-og.png");

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => p && existsSync(p));
if (!chrome) {
  console.error("Chrome not found. Set CHROME_PATH or install Chrome.");
  process.exit(1);
}
if (!existsSync(svgPath)) {
  console.error("Missing", svgPath);
  process.exit(1);
}

const dir = mkdtempSync(path.join(tmpdir(), "zb-og-"));
const htmlPath = path.join(dir, "og.html");
const svgHref = pathToFileUrl(svgPath);
writeFileSync(
  htmlPath,
  `<!doctype html><html><head><style>
*{margin:0;padding:0}html,body{width:1200px;height:630px;overflow:hidden;background:#0c0d0e}
img{display:block;width:1200px;height:630px}
</style></head><body><img src="${svgHref}" width="1200" height="630" alt="" /></body></html>`,
);

const result = spawnSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1200,630",
    `--screenshot=${pngPath}`,
    pathToFileUrl(htmlPath),
  ],
  { encoding: "utf8" },
);

if (result.status !== 0 || !existsSync(pngPath)) {
  console.error(result.stderr || result.stdout || "screenshot failed");
  process.exit(1);
}
console.log("wrote", path.relative(root, pngPath));

function pathToFileUrl(p) {
  const normalized = path.resolve(p).replaceAll("\\", "/");
  return normalized.startsWith("/")
    ? `file://${normalized}`
    : `file:///${normalized}`;
}
