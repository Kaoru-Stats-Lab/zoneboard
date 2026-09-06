/**
 * Canvas text — glyph coverage per locale × font preset (Chrome / Puppeteer).
 * Run: node scripts/canvas-glyph-locale-check.mjs
 * Requires: npm run dev on http://localhost:5173
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const BASE = process.env.ZB_DEV_URL ?? "http://localhost:5173";
const STORE_KEY = "zoneboard:v1:store";

/** Must stay in sync with src/presets/textStyle.ts */
const FONT_STACKS = {
  system:
    '"Segoe UI", "Yu Gothic UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
  display:
    '"Arial Black", "Helvetica Neue", "Segoe UI", "Yu Gothic UI", sans-serif',
};

const FONT_PRESETS = ["system", "display"];

const REF_STACK = '"Noto Sans JP", "Noto Sans", sans-serif';

const LOCALE_SAMPLES = {
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

const MIXED_SAMPLE = "Müller · 天皇杯 · Łódź · İstanbul";

const LOCALES = Object.keys(LOCALE_SAMPLES);

const CLICK_X = 0.45;
const CLICK_Y = 0.35;

async function waitForBoard(page) {
  await page.waitForSelector(".board-surface canvas", { timeout: 20_000 });
  await page.waitForSelector("[data-tool]", { timeout: 10_000 });
  await page.evaluate(async () => {
    await document.fonts.load('600 32px "Noto Sans"');
    await document.fonts.load('600 32px "Noto Sans JP"');
    await document.fonts.ready;
  });
}

async function placeText(page, sample) {
  await page.evaluate((key) => localStorage.removeItem(key), STORE_KEY);
  await page.reload({ waitUntil: "networkidle2" });
  await waitForBoard(page);

  await page.keyboard.press("t");
  await page.waitForFunction(
    () =>
      document.querySelector(".board-surface")?.getAttribute("data-tool") ===
      "text",
    { timeout: 5000 },
  );

  const canvas = await page.$(".board-surface canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas bounding box missing");

  const clickX = box.x + box.width * CLICK_X;
  const clickY = box.y + box.height * CLICK_Y;
  await page.mouse.click(clickX, clickY);

  await page.waitForSelector(".canvas-text-editor", { timeout: 5000 });
  await page.focus(".canvas-text-editor");
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.type(sample, { delay: 1 });

  await page.click('[data-tool="select"]');
  await page.waitForFunction(
    () => !document.querySelector(".canvas-text-editor"),
    { timeout: 5000 },
  );

  await page.mouse.click(clickX, clickY);
  await page.waitForSelector(".text-inspector", { timeout: 5000 });

  return { box, clickX, clickY };
}

async function setFontPreset(page, fontId) {
  await page.select(".text-inspector select", fontId);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 350));
}

async function auditGlyphs(page, text, fontId) {
  return page.evaluate(
    ({ text, fontStack, refStack }) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = 48;
      const testFont = `600 ${size}px ${fontStack}`;
      const refFont = `600 ${size}px ${refStack}`;

      function ink(char, font) {
        canvas.width = 96;
        canvas.height = 72;
        ctx.clearRect(0, 0, 96, 72);
        ctx.font = font;
        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(char, 8, 52);
        const d = ctx.getImageData(0, 0, 96, 72).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) {
          if (d[i] > 8) n++;
        }
        return n;
      }

      const missing = [];
      const details = [];
      for (const char of [...text]) {
        if (/\s/.test(char) || char === "·") continue;
        const refInk = ink(char, refFont);
        if (refInk < 12) continue;
        const testInk = ink(char, testFont);
        const ok = testInk >= Math.max(8, refInk * 0.25);
        details.push({
          char,
          codePoint: char.codePointAt(0)?.toString(16),
          refInk,
          testInk,
          ok,
        });
        if (!ok) missing.push(char);
      }

      return {
        missing,
        missingUnique: [...new Set(missing)],
        details,
        pass: missing.length === 0,
      };
    },
    { text, fontStack: FONT_STACKS[fontId], refStack: REF_STACK },
  );
}

async function captureCanvasClip(page, box, shotPath) {
  const clip = {
    x: Math.max(0, box.x + box.width * (CLICK_X - 0.12)),
    y: Math.max(0, box.y + box.height * (CLICK_Y - 0.06)),
    width: Math.min(box.width * 0.72, 920),
    height: Math.min(box.height * 0.14, 120),
  };
  await page.screenshot({ path: shotPath, clip });
}

async function runCase(browser, caseDef) {
  const { locale, fontId, sampleKind, sample } = caseDef;
  const page = await browser.newPage();
  const id = `${locale}-${fontId}-${sampleKind}`;
  const log = {
    id,
    locale,
    fontId,
    sampleKind,
    sample,
    fontStack: FONT_STACKS[fontId],
    glyphPass: false,
    missingGlyphs: [],
    screenshot: `canvas-glyphs/${id}.png`,
    error: null,
    pass: false,
  };

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE}/board?lang=${locale}`, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    const { box } = await placeText(page, sample);
    await setFontPreset(page, fontId);

    const audit = await auditGlyphs(page, sample, fontId);
    log.glyphPass = audit.pass;
    log.missingGlyphs = audit.missingUnique;
    log.glyphDetails = audit.details.filter((d) => !d.ok);

    const shotPath = path.join(outDir, `${id}.png`);
    await captureCanvasClip(page, box, shotPath);

    log.pass = log.glyphPass;
  } catch (err) {
    log.error = err instanceof Error ? err.message : String(err);
  } finally {
    await page.close();
  }

  return log;
}

function mdReport(results, meta) {
  const fails = results.filter((r) => !r.pass);
  const allPass = fails.length === 0;

  const lines = [
    "# Canvas text — glyph render check (locale × font)",
    "",
    `**Date:** ${meta.date}`,
    `**URL:** ${meta.base}/board?lang=…`,
    `**Runner:** Puppeteer · pixel ink audit + canvas clip screenshot`,
    "",
    "Detects missing glyphs when a font stack cannot render a character (Canvas does not use CSS `unicode-range` fallback per glyph). Reference: `Noto Sans JP` + `Noto Sans`.",
    "",
    "## Conclusion",
    "",
    allPass
      ? `**字形欠けなし（${results.length}/${results.length} PASS）。** 9 ロケール × \`system\` / \`display\` ×（各ロケール文字列 + 混在 \`${MIXED_SAMPLE}\`）を Canvas 上に描画し、ピクセルインク監査 + クリップ PNG で確認。`
      : `**FAIL:** ${fails.length} ケースで字形欠け。下記 Failures とスクリーンショットを参照。`,
    "",
    "再実行: `npm run dev` 起動中に `npm run test:canvas-glyph-locale`",
    "",
    "## Summary",
    "",
    "| Locale | Font | Sample | Pass | Missing glyphs | Screenshot |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const r of results) {
    const miss =
      r.missingGlyphs.length > 0
        ? r.missingGlyphs.map((c) => `\`${c}\``).join(" ")
        : "—";
    lines.push(
      `| ${r.locale} | ${r.fontId} | ${r.sampleKind} | ${r.pass ? "✅" : "❌"} | ${miss} | [${r.id}.png](canvas-glyphs/${r.id}.png) |`,
    );
  }

  const localeResults = results.filter((r) => r.sampleKind === "locale");
  const mixedResults = results.filter((r) => r.sampleKind === "mixed");
  const localePass = localeResults.filter((r) => r.pass).length;
  const mixedPass = mixedResults.filter((r) => r.pass).length;

  lines.push(
    "",
    `**Locale samples:** ${localePass}/${localeResults.length} PASS`,
    `**Mixed script:** ${mixedPass}/${mixedResults.length} PASS`,
    `**Overall:** ${allPass ? "PASS" : "FAIL"}`,
    "",
    "## Failures",
    "",
  ];

  if (fails.length === 0) {
    lines.push("_None._", "");
  } else {
    for (const r of fails) {
      lines.push(`### ${r.id}`);
      lines.push("");
      lines.push(`- **Sample:** \`${r.sample}\``);
      lines.push(`- **Font stack:** \`${r.fontStack}\``);
      lines.push(
        `- **Missing:** ${r.missingGlyphs.length ? r.missingGlyphs.join(" ") : r.error ?? "unknown"}`,
      );
      lines.push("");
    }
  }

  lines.push("## Detail", "");

  for (const r of results) {
    lines.push(`### ${r.id}`);
    lines.push("");
    lines.push(`- **Sample:** \`${r.sample}\``);
    lines.push(`- **Font preset:** ${r.fontId}`);
    lines.push(`- **Glyph audit:** ${r.glyphPass ? "pass" : "fail"}`);
    if (r.missingGlyphs.length) {
      lines.push(`- **Missing glyphs:** ${r.missingGlyphs.join(" ")}`);
    }
    if (r.error) lines.push(`- **Error:** ${r.error}`);
    lines.push(
      `- **Screenshot:** ![${r.id}](canvas-glyphs/${r.id}.png)`,
    );
    lines.push("");
  }

  return lines.join("\n");
}

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "docs", "i18n-draft", "canvas-glyphs");
await mkdir(outDir, { recursive: true });
const outPath = path.join(
  root,
  "docs",
  "i18n-draft",
  "CANVAS-GLYPH-LOCALE-CHECK.md",
);

const cases = [];
for (const locale of LOCALES) {
  for (const fontId of FONT_PRESETS) {
    cases.push({
      locale,
      fontId,
      sampleKind: "locale",
      sample: LOCALE_SAMPLES[locale],
    });
    cases.push({
      locale,
      fontId,
      sampleKind: "mixed",
      sample: MIXED_SAMPLE,
    });
  }
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--font-render-hinting=medium"],
});

const results = [];
for (const caseDef of cases) {
  const label = `${caseDef.locale}/${caseDef.fontId}/${caseDef.sampleKind}`;
  process.stdout.write(`glyph ${label}… `);
  const r = await runCase(browser, caseDef);
  results.push(r);
  console.log(r.pass ? "PASS" : `FAIL ${r.missingGlyphs.join("") || r.error}`);
}

await browser.close();

const md = mdReport(results, {
  date: new Date().toISOString().slice(0, 10),
  base: BASE,
});
await writeFile(outPath, md, "utf8");
console.log(`\nwrote ${outPath}`);
console.log(`screenshots: ${outDir}`);

const failed = results.filter((r) => !r.pass);
process.exit(failed.length ? 1 : 0);
