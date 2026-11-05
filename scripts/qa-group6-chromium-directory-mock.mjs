/**
 * Browser (Chromium) + mocked showDirectoryPicker — NOT a real OS folder dialog.
 * Verifies: Open folder → data-source-kind=directory-file → Open → Save button.
 *
 * Run: node scripts/qa-group6-chromium-directory-mock.mjs
 * Requires vite on http://127.0.0.1:5173
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "tmp", "qa-group6", "board-alpha.zoneboard.json");
const BASE = process.env.ZB_QA_BASE || "http://127.0.0.1:5173";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(existsSync(FIX), "fixtures missing — run qa-group6-fixtures.ts");
const jsonText = readFileSync(FIX, "utf8");

const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/files`, { waitUntil: "networkidle0", timeout: 60000 });

  // First: Select JSON of the SAME file (repro twin).
  const input = await page.$('input[type="file"]');
  assert(input, "file input");
  await input.uploadFile(FIX);
  await page.waitForSelector('.files-card[data-source-kind="selected-file"]', {
    timeout: 10000,
  });
  const before = await page.evaluate(() =>
    [...document.querySelectorAll(".files-card")].map((el) => ({
      kind: el.getAttribute("data-source-kind"),
      name: el.getAttribute("data-file-name"),
    })),
  );
  console.log("after Select JSON:", before);
  assert(
    before.some((c) => c.kind === "selected-file"),
    "selected present",
  );

  // Inject mocked directory picker with one .zoneboard.json handle.
  await page.evaluate((text) => {
    const file = new File([text], "board-alpha.zoneboard.json", {
      type: "application/json",
      lastModified: Date.now(),
    });
    const fileHandle = {
      kind: "file",
      name: "board-alpha.zoneboard.json",
      async getFile() {
        return file;
      },
      async queryPermission() {
        return "granted";
      },
      async requestPermission() {
        return "granted";
      },
      async createWritable() {
        throw new Error("not used in this mock");
      },
      async isSameEntry() {
        return false;
      },
    };
    const dirHandle = {
      kind: "directory",
      name: "qa-group6-mock",
      async *values() {
        yield fileHandle;
      },
      async queryPermission() {
        return "granted";
      },
      async requestPermission() {
        return "granted";
      },
    };
    window.showDirectoryPicker = async () => dirHandle;
  }, jsonText);

  // Click Open folder (must stay in user-gesture stack; click is fine).
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /open folder|フォルダ/i.test(b.textContent || ""),
    );
    btn?.click();
  });
  await page.waitForSelector('.files-card[data-source-kind="directory-file"]', {
    timeout: 15000,
  });
  await new Promise((r) => setTimeout(r, 400));

  const afterFolder = await page.evaluate(() => ({
    folderBanner: document.querySelector(".files-dash-folder")?.textContent || "",
    cards: [...document.querySelectorAll(".files-card")].map((el) => ({
      kind: el.getAttribute("data-source-kind"),
      name: el.getAttribute("data-file-name"),
      meta: el.querySelector(".files-card-meta")?.textContent || "",
    })),
  }));
  console.log("after Open folder (mock):", afterFolder);
  assert(/qa-group6-mock|Folder/i.test(afterFolder.folderBanner), "folder banner");
  assert(
    afterFolder.cards.every((c) => c.kind === "directory-file"),
    "same-name selected twin dropped; only directory-file remain",
  );
  assert(
    afterFolder.cards.some((c) => /local folder|ローカルフォルダ/i.test(c.meta)),
    "Local folder label in meta",
  );

  // Open directory card → Save must appear
  await page.evaluate(() => {
    const card = document.querySelector(
      '.files-card[data-source-kind="directory-file"]',
    );
    const btn = [...(card?.querySelectorAll("button") || [])].find(
      (b) => (b.textContent || "").trim() === "Open",
    );
    btn?.click();
  });
  await page.waitForFunction(() => location.pathname.includes("/board"), {
    timeout: 15000,
  });
  await page.waitForSelector(".file-session-bar", { timeout: 10000 });
  const session = await page.evaluate(() => {
    const bar = document.querySelector(".file-session-bar");
    const btns = [...document.querySelectorAll(".file-session-btn")].map((b) =>
      (b.textContent || "").trim(),
    );
    return {
      text: (bar?.textContent || "").slice(0, 300),
      btns,
      hasSave: btns.some((t) => /^(Save|保存)$/i.test(t)),
      hasFolderBadge: /local folder|ローカルフォルダ/i.test(bar?.textContent || ""),
    };
  });
  console.log("session after directory Open:", session);
  assert(session.hasSave, "Save button visible for directorySource");
  assert(session.hasFolderBadge, "folder badge visible");

  console.log("qa-group6-chromium-directory-mock: OK");
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await browser.close();
}
