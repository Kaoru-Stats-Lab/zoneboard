/**
 * Group 6 — Chromium File mode + Directory capability UI (no OS folder picker).
 * Uses Puppeteer. Does not clear existing localStorage beyond the app origin's
 * session for this ephemeral profile (isolated userDataDir).
 *
 * Run: node scripts/qa-group6-chromium-filemode.mjs
 * Requires: vite on http://127.0.0.1:5173
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FIX = join(ROOT, "tmp", "qa-group6");
const OUT = join(ROOT, "tmp", "qa-group6-report");
mkdirSync(OUT, { recursive: true });

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const BASE = process.env.ZB_QA_BASE || "http://127.0.0.1:5173";
const alpha = join(FIX, "board-alpha.zoneboard.json");
const beta = join(FIX, "board-beta.zoneboard.json");
assert(existsSync(alpha) && existsSync(beta), "fixtures missing — run qa-group6-fixtures.ts");

const chromePath =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
const notes = [];

try {
  await page.goto(`${BASE}/files`, { waitUntil: "networkidle0", timeout: 60000 });

  // Directory capability: Chromium headless may or may not expose showDirectoryPicker.
  const cap = await page.evaluate(() => ({
    secure: window.isSecureContext,
    hasPicker: typeof window.showDirectoryPicker === "function",
  }));
  notes.push(`capability: secure=${cap.secure} showDirectoryPicker=${cap.hasPicker}`);

  const openFolderVisible = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    return buttons.some((b) => /folder|フォルダ|Ordner|carpeta|pasta|dossier|klasör|cartella/i.test(b.textContent || ""));
  });
  notes.push(`Open folder visible: ${openFolderVisible}`);
  // When API present, button should show; when absent, must not claim folder save.
  if (cap.hasPicker) {
    assert(openFolderVisible, "Open folder should show when API available");
  } else {
    assert(!openFolderVisible, "Open folder hidden when API unavailable");
  }

  // File mode: select JSON via input[type=file]
  const input = await page.$('input[type="file"]');
  assert(input, "file input present");
  await input.uploadFile(alpha, beta);
  await page.waitForFunction(
    () => document.querySelectorAll(".files-card, [class*='files-card']").length >= 1,
    { timeout: 15000 },
  ).catch(() => {});

  // Fallback: wait for any open buttons
  await new Promise((r) => setTimeout(r, 800));
  const cardCount = await page.evaluate(
    () => document.querySelectorAll(".files-card").length,
  );
  notes.push(`cards after select: ${cardCount}`);
  assert(cardCount >= 2, `expected ≥2 cards, got ${cardCount}`);

  // Thumbs present (img or canvas)
  const thumbs = await page.evaluate(
    () =>
      document.querySelectorAll(
        ".files-card img, .files-card canvas, .files-card-thumb, .files-card-thumb-btn",
      ).length,
  );
  notes.push(`thumb nodes: ${thumbs}`);
  assert(thumbs >= 1, "thumbnails expected");

  // Open first ok card — exact label "Open" / "開く" (not "Open folder")
  const opened = await page.evaluate(() => {
    const labels = new Set([
      "Open",
      "開く",
      "Abrir",
      "Otwórz",
      "Öffnen",
      "Ouvrir",
      "Aç",
      "Apri",
    ]);
    const btn = [...document.querySelectorAll(".files-card button")].find((b) =>
      labels.has((b.textContent || "").trim()),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  assert(opened, "Open button clicked");
  await page.waitForFunction(() => location.pathname.includes("/board"), {
    timeout: 20000,
  });
  await page.waitForSelector(".file-session-bar", { timeout: 10000 });

  const session = await page.evaluate(() => {
    const bar = document.querySelector(".file-session-bar");
    const saveBtns = [...document.querySelectorAll(".file-session-btn")].map(
      (b) => (b.textContent || "").trim(),
    );
    const storeRaw = localStorage.getItem("zoneboard:v1:store");
    return {
      hasBar: !!bar,
      saveBtns,
      storeRaw,
      dirty: !!(bar && /unsaved|未保存/i.test(bar.textContent || "")),
      barText: (bar?.textContent || "").slice(0, 240),
    };
  });
  notes.push(`file session bar: ${session.hasBar}`);
  notes.push(`bar text: ${session.barText}`);
  notes.push(`save buttons texts: ${JSON.stringify(session.saveBtns)}`);
  assert(session.hasBar, "File Session bar present after Open");

  // File mode must NOT offer working source Save (or clearly unavailable)
  const hasSourceSave = session.saveBtns.some((t) =>
    /^(Save|保存|Guardar|Zapisz|Speichern|Enreg|Kaydet|Salva)$/i.test(t),
  );
  notes.push(`source Save visible (should be false for file mode): ${hasSourceSave}`);
  assert(!hasSourceSave, "File mode must not show Directory Save");

  // Store must not gain a new board from Open — compare board count if store exists
  const storeBeforeOpen = session.storeRaw;
  notes.push(
    `store after open length: ${storeBeforeOpen ? storeBeforeOpen.length : 0}`,
  );

  // Edit: trigger dirty via keyboard if possible — click canvas area
  await page.mouse.click(400, 300);
  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 400));

  const afterEdit = await page.evaluate(() => {
    const bar = document.querySelector(".file-session-bar");
    const text = bar?.textContent || "";
    return {
      dirty: /unsaved|未保存/i.test(text),
      text: text.slice(0, 200),
      store: localStorage.getItem("zoneboard:v1:store"),
    };
  });
  notes.push(`after edit dirty=${afterEdit.dirty} bar=${afterEdit.text}`);
  // Store unchanged by Open/edit in file session
  assert(
    afterEdit.store === storeBeforeOpen,
    "BoardStore localStorage must not change during File Session",
  );

  // Download JSON present
  const hasDl = await page.evaluate(() =>
    [...document.querySelectorAll(".file-session-btn")].some((b) =>
      /JSON|Download|DL|ダウンロード|Descargar|Baixar|Pobierz|herunterladen|Télécharger|İndir|Scarica/i.test(
        b.textContent || "",
      ),
    ),
  );
  assert(hasDl, "Download JSON available");

  writeFileSync(
    join(OUT, "chromium-filemode.json"),
    JSON.stringify({ ok: true, notes, cap }, null, 2),
  );
  console.log(notes.join("\n"));
  console.log("qa-group6-chromium-filemode: OK");
} catch (e) {
  writeFileSync(
    join(OUT, "chromium-filemode.json"),
    JSON.stringify({ ok: false, error: String(e), notes }, null, 2),
  );
  console.error(e);
  process.exitCode = 1;
} finally {
  await browser.close();
}
