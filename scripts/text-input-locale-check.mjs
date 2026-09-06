/**
 * Canvas text tool — UTF-8 round-trip per locale (Chrome / Puppeteer).
 * Run: node scripts/text-input-locale-check.mjs
 * Requires: npm run dev on http://localhost:5173
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const BASE = process.env.ZB_DEV_URL ?? "http://localhost:5173";
const STORE_KEY = "zoneboard:v1:store";

/** Strings users are likely to type on-pitch per locale (diacritics + scripts). */
const SAMPLES = {
  en: "High press · Müller 09",
  ja: "ハイプレス · 天皇杯 · 漢字仮名",
  es: "Presión alta · Niño · campeón",
  pt: "Pressão alta · São Paulo · coração",
  pl: "Wysoki pressing · Łódź · ąęćłńóśźż",
  de: "Hohes Pressing · Auswärts · Straße",
  fr: "Bloc haut · équipe · François ç",
  tr: "Ön alan baskısı · İstanbul · şüphe",
  it: "Pressing alto · Passaggio · corsa",
};

const LOCALES = Object.keys(SAMPLES);

async function waitForBoard(page) {
  await page.waitForSelector(".board-surface canvas", { timeout: 20_000 });
  await page.waitForSelector("[data-tool]", { timeout: 10_000 });
}

async function readStoredTexts(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const store = JSON.parse(raw);
    const board = store?.boards?.[0];
    const scene = board?.scenes?.[0];
    if (!scene?.objects) return [];
    return scene.objects
      .filter((o) => o.type === "text")
      .map((o) => o.text);
  }, STORE_KEY);
}

async function runLocale(browser, locale, sample) {
  const page = await browser.newPage();
  const log = {
    locale,
    sample,
    inputValue: null,
    storedText: null,
    inputOk: false,
    persistOk: false,
    toolLabel: null,
    placeholder: null,
    pass: false,
    error: null,
  };

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE}/board?lang=${locale}`, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    await page.evaluate((key) => localStorage.removeItem(key), STORE_KEY);
    await page.reload({ waitUntil: "networkidle2" });

    await waitForBoard(page);

    log.toolLabel = await page.evaluate(() => {
      const btn = document.querySelector('[data-tool="text"]');
      return btn?.textContent?.trim() ?? null;
    });

    await page.keyboard.press("t");
    await page.waitForFunction(
      () => document.querySelector('.board-surface')?.getAttribute('data-tool') === 'text',
      { timeout: 5000 },
    );

    const canvas = await page.$(".board-surface canvas");
    const box = await canvas.boundingBox();
    if (!box) throw new Error("canvas bounding box missing");
    await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.35);

    await page.waitForSelector(".canvas-text-editor", { timeout: 5000 });

    log.placeholder = await page.$eval(
      ".canvas-text-editor",
      (el) => el.getAttribute("placeholder") ?? "",
    );

    await page.focus(".canvas-text-editor");
    await page.keyboard.down("Control");
    await page.keyboard.press("a");
    await page.keyboard.up("Control");
    await page.keyboard.type(sample, { delay: 2 });

    log.inputValue = await page.$eval(".canvas-text-editor", (el) => el.value);
    log.inputOk = log.inputValue === sample;

    await page.click('[data-tool="select"]');
    await page.waitForFunction(
      () => !document.querySelector(".canvas-text-editor"),
      { timeout: 5000 },
    );

    await new Promise((r) => setTimeout(r, 500));

    const stored = await readStoredTexts(page);
    log.storedText = stored[stored.length - 1] ?? null;
    log.persistOk = log.storedText === sample.trim();
    log.pass = log.inputOk && log.persistOk;
  } catch (err) {
    log.error = err instanceof Error ? err.message : String(err);
  } finally {
    await page.close();
  }

  return log;
}

function mdReport(results, meta) {
  const lines = [
    "# Canvas text input — locale UTF-8 check",
    "",
    `**Date:** ${meta.date}`,
    `**URL:** ${meta.base}/board?lang=…`,
    `**Runner:** Puppeteer (Chrome DevTools Protocol)`,
    "",
    "## Summary",
    "",
    `| Locale | Pass | Input UTF-8 | Persist | Tool label | Placeholder (hint) |`,
    `| --- | --- | --- | --- | --- | --- |`,
  ];

  let allPass = true;
  for (const r of results) {
    if (!r.pass) allPass = false;
    const ph = (r.placeholder ?? "").replace(/\|/g, "\\|").slice(0, 40);
    lines.push(
      `| ${r.locale} | ${r.pass ? "✅" : "❌"} | ${r.inputOk ? "✅" : "❌"} | ${r.persistOk ? "✅" : "❌"} | ${r.toolLabel ?? "—"} | ${ph} |`,
    );
  }

  lines.push("", `**Overall:** ${allPass ? "PASS" : "FAIL"}`, "", "## Detail", "");

  for (const r of results) {
    lines.push(`### ${r.locale}`);
    lines.push("");
    lines.push(`- **Input sample:** \`${r.sample}\``);
    lines.push(`- **Textarea after type:** \`${r.inputValue ?? "—"}\``);
    lines.push(`- **Input UTF-8 OK:** ${r.inputOk ? "yes" : "no"}`);
    lines.push(`- **Stored object.text:** \`${r.storedText ?? "—"}\``);
    lines.push(`- **Persist round-trip:** ${r.persistOk ? "yes" : "no"}`);
    if (r.error) lines.push(`- **Error:** ${r.error}`);
    lines.push("");
  }

  return lines.join("\n");
}

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "docs", "i18n-draft");
await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, "TEXT-INPUT-LOCALE-CHECK.md");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--font-render-hinting=medium"],
});

const results = [];
for (const locale of LOCALES) {
  process.stdout.write(`check ${locale}… `);
  const r = await runLocale(browser, locale, SAMPLES[locale]);
  results.push(r);
  console.log(r.pass ? "PASS" : `FAIL ${r.error ?? "mismatch"}`);
}

await browser.close();

const md = mdReport(results, {
  date: new Date().toISOString().slice(0, 10),
  base: BASE,
});
await writeFile(outPath, md, "utf8");
console.log(`\nwrote ${outPath}`);

const failed = results.filter((r) => !r.pass);
process.exit(failed.length ? 1 : 0);
