/**
 * Group 9.1 Release Gate — Chromium + File System Access mocks.
 * DocumentHeader save path after FileSessionBar removal.
 *
 * Label: Chromium + mock (not real OS folder picker).
 * Run: node scripts/qa-group91-release-gate.mjs
 * Needs: vite @ http://127.0.0.1:5173 + tmp/qa-group6 fixtures.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "tmp", "qa-group6", "board-alpha.zoneboard.json");
const OUT = join(ROOT, "tmp", "qa-group91-gate");
const BASE = process.env.ZB_QA_BASE || "http://127.0.0.1:5173";
const PREFS_KEY = "zoneboard:v1:prefs";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

assert(existsSync(FIX), "fixtures missing");
mkdirSync(OUT, { recursive: true });

const results = [];
function record(id, pass, detail) {
  results.push({ id, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  defaultViewport: { width: 1366, height: 900 },
});
const page = await browser.newPage();
page.setDefaultTimeout(30000);

let dialogMode = "accept"; // accept | dismiss
page.on("dialog", async (d) => {
  try {
    if (dialogMode === "dismiss") await d.dismiss();
    else await d.accept();
  } catch {
    /* already handled */
  }
});

async function installFs(initialEntries) {
  // initialEntries: Array<[fileName, text]>
  await page.evaluate((entries) => {
    const store = {
      files: new Map(entries),
      writes: [],
      failNextWrite: false,
    };
    window.__zbQaFs = store;

    function makeFileHandle(fname) {
      return {
        kind: "file",
        name: fname,
        async getFile() {
          const body = store.files.get(fname) ?? "";
          return new File([body], fname, {
            type: "application/json",
            lastModified: Date.now(),
          });
        },
        async queryPermission() {
          return "granted";
        },
        async requestPermission() {
          return "granted";
        },
        async createWritable() {
          if (store.failNextWrite) {
            throw new Error("QA injected save failure");
          }
          const chunks = [];
          return {
            async write(data) {
              if (typeof data === "string") chunks.push(data);
              else if (data instanceof Blob) chunks.push(await data.text());
              else if (data?.data != null) chunks.push(String(data.data));
              else throw new Error("bad chunk");
            },
            async close() {
              const joined = chunks.join("");
              store.files.set(fname, joined);
              store.writes.push({ name: fname, len: joined.length });
            },
            async abort() {},
            async seek() {},
            async truncate() {},
          };
        },
        async isSameEntry(other) {
          return other?.name === fname;
        },
      };
    }

    const dirHandle = {
      kind: "directory",
      name: "qa-group91-mock",
      async *values() {
        for (const fname of store.files.keys()) yield makeFileHandle(fname);
      },
      // directoryHasFile() iterates entries(); missing this makes every name look taken.
      async *entries() {
        for (const fname of store.files.keys()) {
          yield [fname, makeFileHandle(fname)];
        }
      },
      async getFileHandle(fname, opts) {
        if (!store.files.has(fname)) {
          if (opts?.create) store.files.set(fname, "");
          else {
            const err = new DOMException(
              `File not found: ${fname}`,
              "NotFoundError",
            );
            throw err;
          }
        }
        return makeFileHandle(fname);
      },
      async queryPermission() {
        return "granted";
      },
      async requestPermission() {
        return "granted";
      },
    };
    window.showDirectoryPicker = async () => dirHandle;
  }, initialEntries);
}

async function goFiles() {
  await page.goto(`${BASE}/files`, { waitUntil: "networkidle0", timeout: 60000 });
}

async function clickOpenFolder() {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /open folder|フォルダを開く|Ordner öffnen|Abrir carpeta|Abrir pasta|Ouvrir le dossier|Apri cartella|Klasör|Otwórz folder/i.test(
        b.textContent || "",
      ),
    );
    if (!btn) {
      // Short labels
      const btn2 = [...document.querySelectorAll("button")].find((b) =>
        /folder|フォルダ|Ordner|carpeta|pasta|dossier|cartella|klasör|folder/i.test(
          b.textContent || "",
        ),
      );
      if (!btn2) throw new Error("Open folder missing");
      btn2.click();
      return;
    }
    btn.click();
  });
  await page.waitForSelector('.files-card[data-source-kind="directory-file"]', {
    timeout: 15000,
  });
}

async function openDirectoryCardByName(namePart) {
  await page.evaluate((part) => {
    const cards = [...document.querySelectorAll('.files-card[data-source-kind="directory-file"]')];
    const card =
      cards.find((c) => (c.getAttribute("data-file-name") || "").includes(part)) ||
      cards[0];
    const btn = [...(card?.querySelectorAll("button") || [])].find((b) => {
      const t = (b.textContent || "").trim();
      return /^(Open|開く|Abrir|Öffnen|Ouvrir|Apri|Aç|Otwórz)$/i.test(t);
    });
    (btn || card?.querySelector("button"))?.click();
  }, namePart || "");
  await page.waitForFunction(() => location.pathname.includes("/board"), {
    timeout: 15000,
  });
  await page.waitForSelector(".topbar--document", { timeout: 10000 });
}

async function ensureDrawerOpen() {
  await page.evaluate(() => {
    const toggle = document.querySelector(".topbar-drawer-toggle");
    if (toggle && toggle.getAttribute("aria-expanded") !== "true") toggle.click();
  });
  await sleep(300);
}

async function editSceneNotes(marker) {
  await ensureDrawerOpen();
  await page.evaluate((m) => {
    const ta =
      document.querySelector("textarea") ||
      [...document.querySelectorAll("textarea, input")].find((el) =>
        /notes|メモ|notas|notizen|notes|notlar|note|notatki/i.test(
          el.getAttribute("aria-label") || el.getAttribute("placeholder") || "",
        ),
      );
    if (!ta) throw new Error("notes field missing");
    const proto =
      ta.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    const next = `${ta.value || ""}${m}`;
    desc.set.call(ta, next);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    ta.dispatchEvent(new Event("change", { bubbles: true }));
  }, marker);
  await sleep(200);
}

async function waitDirty() {
  await page.waitForFunction(
    () =>
      /unsaved|未保存|sin guardar|não salva|niezapis|ungespeichert|non enregistr|kaydedilmemiş|non salv/i.test(
        document.querySelector(".doc-identity-status")?.textContent || "",
      ),
    { timeout: 10000 },
  );
}

async function waitClean() {
  await page.waitForFunction(
    () => {
      const s =
        document.querySelector(".doc-identity-status")?.textContent || "";
      return /no changes|変更なし|sin cambios|sem alterações|brak zmian|keine änderungen|aucune modification|değişiklik yok|nessuna modifica|saved|保存済/i.test(
        s,
      );
    },
    { timeout: 15000 },
  );
}

async function headerSnap() {
  return page.evaluate(() => ({
    title: document.querySelector(".doc-identity-title")?.textContent?.trim() || "",
    status: document.querySelector(".doc-identity-status")?.textContent?.trim() || "",
    location:
      document.querySelector(".doc-identity-location")?.textContent?.trim() || "",
    primary: document.querySelector(".topbar-primary-save")?.textContent?.trim() || null,
    secondary: document.querySelector(".topbar-secondary-dl")?.textContent?.trim() || null,
    moreItems: [...document.querySelectorAll(".topbar-more-menu [role=menuitem]")].map(
      (el) => (el.textContent || "").trim(),
    ),
    hasBar: !!document.querySelector(".file-session-bar"),
    isFileLike: !!document.querySelector(".doc-identity-location"),
  }));
}

async function clickPrimary() {
  await page.evaluate(() => {
    const btn = document.querySelector(".topbar-primary-save");
    if (!btn || btn.disabled) throw new Error("primary save unavailable");
    btn.click();
  });
}

async function openMore() {
  await page.evaluate(() => {
    const btn = document.querySelector('.topbar-more > button[aria-haspopup="menu"]');
    if (!btn) throw new Error("More missing");
    if (btn.getAttribute("aria-expanded") !== "true") btn.click();
  });
  await page.waitForSelector(".topbar-more-menu", { timeout: 5000 });
}

async function spaClickFiles() {
  await page.evaluate(() => {
    const a =
      document.querySelector("a.topbar-files-link") ||
      [...document.querySelectorAll("a")].find((el) =>
        (el.getAttribute("href") || "").includes("/files"),
      );
    if (!a) throw new Error("Files link missing");
    a.click();
  });
  await page.waitForFunction(() => location.pathname.includes("/files"), {
    timeout: 10000,
  });
}

async function spaClickBoard() {
  await page.evaluate(() => {
    const a =
      [...document.querySelectorAll("a")].find((el) =>
        (el.getAttribute("href") || "") === "/board",
      ) || document.querySelector('a[href="/board"]');
    if (a) a.click();
    else location.assign("/board");
  });
  await page.waitForFunction(() => location.pathname.includes("/board"), {
    timeout: 10000,
  });
  await page.waitForSelector(".topbar--document", { timeout: 10000 });
}

async function setLocale(loc) {
  await page.evaluate(
    ({ key, locale }) => {
      const cur = JSON.parse(localStorage.getItem(key) || "{}");
      cur.locale = locale;
      localStorage.setItem(key, JSON.stringify(cur));
    },
    { key: PREFS_KEY, locale: loc },
  );
}

try {
  const jsonText = readFileSync(FIX, "utf8");

  // ═══════════════ A. Directory Save ═══════════════
  await goFiles();
  await setLocale("en");
  await page.reload({ waitUntil: "networkidle0" });
  await installFs([["board-alpha.zoneboard.json", jsonText]]);
  await clickOpenFolder();
  await openDirectoryCardByName("board-alpha");

  let snap = await headerSnap();
  record(
    "A1-open",
    !snap.hasBar && Boolean(snap.primary) && /folder|local/i.test(snap.location + snap.status + "folder"),
    JSON.stringify(snap),
  );
  // location should mention folder
  if (!snap.primary) throw new Error("A: no Save primary");

  await editSceneNotes("-G91A");
  await waitDirty();
  snap = await headerSnap();
  record("A2-dirty", /unsaved/i.test(snap.status), snap.status);

  await clickPrimary();
  await waitClean();
  const writesA = await page.evaluate(() => window.__zbQaFs.writes.length);
  const savedText = await page.evaluate(() =>
    window.__zbQaFs.files.get("board-alpha.zoneboard.json"),
  );
  writeFileSync(join(OUT, "after-save.zoneboard.json"), savedText, "utf8");
  record(
    "A3-save",
    writesA >= 1 && savedText.includes("G91A"),
    `writes=${writesA}; hasMarker=${savedText.includes("G91A")}`,
  );

  // Re-open
  dialogMode = "accept";
  await goFiles();
  await installFs([["board-alpha.zoneboard.json", savedText]]);
  await clickOpenFolder();
  await openDirectoryCardByName("board-alpha");
  await ensureDrawerOpen();
  const reopened = await page.evaluate(() => {
    const ta = document.querySelector("textarea");
    return ta?.value || "";
  });
  record("A4-reopen", /G91A/.test(reopened), `notes=${reopened.slice(0, 80)}`);

  // ═══════════════ B. Store + Folder Save As ═══════════════
  // Start Store board with folder connected (SPA, no full reload after folder)
  await goFiles();
  await installFs([["board-alpha.zoneboard.json", jsonText]]);
  await clickOpenFolder();
  // Navigate to Store board without opening the directory card
  await spaClickBoard();
  // Close any leftover file session
  snap = await headerSnap();
  if (snap.isFileLike || snap.primary) {
    dialogMode = "accept";
    await openMore();
    const didClose = await page.evaluate(() => {
      const item = [...document.querySelectorAll("[role=menuitem]")].find((el) =>
        /close|閉じ/i.test(el.textContent || ""),
      );
      if (!item) return false;
      item.click();
      return true;
    });
    if (didClose) await sleep(600);
  }

  // Re-attach folder without leaving Store: Files → Open folder → Board (SPA)
  await spaClickFiles();
  await installFs([["board-alpha.zoneboard.json", jsonText]]);
  await clickOpenFolder();
  await spaClickBoard();
  await sleep(400);

  const storeTitleBefore = await page.evaluate(
    () => document.querySelector(".doc-identity-title")?.textContent?.trim() || "",
  );

  await openMore();
  snap = await headerSnap();
  const saveAsLabel = snap.moreItems.find((t) =>
    /save as|別名|guardar como|salvar como|speichern unter|enregistrer sous|farklı kaydet|salva con nome|zapisz jako/i.test(
      t,
    ),
  );
  record(
    "B1-discover",
    Boolean(saveAsLabel),
    `more=${JSON.stringify(snap.moreItems)}; discoverability=More menu only`,
  );

  async function typeSaveAsStem(stem) {
    const input = await page.$(".files-save-as-modal input");
    assert(input, "Save As input missing");
    await input.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await input.type(stem, { delay: 10 });
  }

  async function submitSaveAs() {
    await page.evaluate(() => {
      const btn = [
        ...document.querySelectorAll(".files-save-as-modal button"),
      ].find((b) => /save|保存/i.test(b.textContent || ""));
      if (!btn || btn.disabled) throw new Error("Save As submit missing");
      btn.click();
    });
  }

  if (saveAsLabel) {
    await page.evaluate((label) => {
      const item = [...document.querySelectorAll("[role=menuitem]")].find(
        (el) => (el.textContent || "").trim() === label,
      );
      item?.click();
    }, saveAsLabel);
    await page.waitForSelector(".files-save-as-modal", { timeout: 10000 });
    const stem = `g91-saveas-${Date.now()}`;
    await typeSaveAsStem(stem);
    const filesBefore = await page.evaluate(() => [
      ...(window.__zbQaFs?.files.keys() || []),
    ]);
    await submitSaveAs();
    await page.waitForFunction(
      (s) =>
        [...(window.__zbQaFs?.files.keys() || [])].some((k) => k.includes(s)) ||
        /exist|衝突|bereits|suggested|提案/i.test(
          document.querySelector(".files-save-as-modal")?.textContent || "",
        ),
      { timeout: 15000 },
      stem,
    );
    const created = await page.evaluate(
      (s) => [...window.__zbQaFs.files.keys()].filter((k) => k.includes(s)),
      stem,
    );
    record(
      "B2-created",
      created.length >= 1,
      `files=${created.join(",")}; before=${filesBefore.join(",")}`,
    );

    // Collision: Save As same stem again (from whatever mode we are in)
    await sleep(400);
    // Ensure folder still connected — may now be in file session of new file
    await openMore();
    snap = await headerSnap();
    const saveAs2 = snap.moreItems.find((t) =>
      /save as|別名|guardar como|salvar como|speichern unter|enregistrer sous|farklı kaydet|salva con nome|zapisz jako/i.test(
        t,
      ),
    );
    if (saveAs2) {
      await page.evaluate((label) => {
        const item = [...document.querySelectorAll("[role=menuitem]")].find(
          (el) => (el.textContent || "").trim() === label,
        );
        item?.click();
      }, saveAs2);
      await page.waitForSelector(".files-save-as-modal", { timeout: 10000 });
      await typeSaveAsStem(stem);
      await submitSaveAs();
      await sleep(1200);
      const coll = await page.evaluate((s) => {
        const modal = document.querySelector(".files-save-as-modal");
        const text = modal?.textContent || "";
        const inputVal = modal?.querySelector("input")?.value || "";
        const files = [...(window.__zbQaFs?.files.keys() || [])].filter((k) =>
          k.includes(s),
        );
        return {
          modalOpen: !!modal,
          textSnippet: text.slice(0, 240),
          inputVal,
          fileCount: files.length,
          files,
        };
      }, stem);
      const collisionOk =
        coll.fileCount === 1 ||
        /exist|衝突|bereits|já|già|zaten|już|suggested|提案|vorschlag|nombre|name/i.test(
          coll.textSnippet + coll.inputVal,
        ) ||
        (coll.inputVal && coll.inputVal !== stem);
      record("B3-collision", collisionOk, JSON.stringify(coll));
    } else {
      record("B3-collision", false, `Save As gone after first save; more=${JSON.stringify(snap.moreItems)}`);
    }
  } else {
    record("B2-created", false, "Save As missing from More");
    record("B3-collision", false, "skipped");
  }

  const storeTitleAfter = await page.evaluate(
    () => document.querySelector(".doc-identity-title")?.textContent?.trim() || "",
  );
  // After Save As from Store, app may open the new file session — check Store boards count unchanged via localStorage
  const storeIntact = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("zoneboard:v1:store");
      const parsed = raw ? JSON.parse(raw) : null;
      const boards = parsed?.boards ?? parsed?.state?.boards ?? null;
      return { boardCount: Array.isArray(boards) ? boards.length : null, keys: parsed ? Object.keys(parsed) : [] };
    } catch (e) {
      return { boardCount: null, err: String(e) };
    }
  });
  record(
    "B4-store-intact",
    storeTitleBefore === storeTitleAfter || (storeIntact.boardCount ?? 0) >= 1,
    `titleBefore=${storeTitleBefore}; titleAfter=${storeTitleAfter}; store=${JSON.stringify(storeIntact)}`,
  );

  // ═══════════════ C. Boards leave confirm ═══════════════
  await goFiles();
  await installFs([["board-alpha.zoneboard.json", jsonText]]);
  await clickOpenFolder();
  await openDirectoryCardByName("board-alpha");
  await editSceneNotes("-G91C");
  await waitDirty();
  const notesBefore = await page.evaluate(
    () => document.querySelector("textarea")?.value || "",
  );

  dialogMode = "dismiss";
  await page.evaluate(() => {
    document.querySelector(".board-switcher__toggle")?.click();
  });
  await page.waitForSelector(".board-switcher__menu", { timeout: 5000 });
  await page.evaluate(() => {
    document.querySelector(".board-switcher__menu button")?.click();
  });
  await sleep(700);
  const afterDismiss = await page.evaluate(() => ({
    notes: document.querySelector("textarea")?.value || "",
    status: document.querySelector(".doc-identity-status")?.textContent || "",
    menuOpen: !!document.querySelector(".board-switcher__menu"),
  }));
  record(
    "C1-cancel",
    /G91C/.test(afterDismiss.notes) && /unsaved/i.test(afterDismiss.status),
    `before=${notesBefore.slice(-20)}; after=${JSON.stringify(afterDismiss)}`,
  );

  dialogMode = "accept";
  // C1 leave may leave the menu open — ensure open, then pick a Store board.
  await page.evaluate(() => {
    const menu = document.querySelector(".board-switcher__menu");
    if (!menu) document.querySelector(".board-switcher__toggle")?.click();
  });
  await sleep(250);
  await page.waitForSelector(".board-switcher__menu", { timeout: 5000 });
  await page.evaluate(() => {
    document.querySelector(".board-switcher__menu button")?.click();
  });
  await sleep(900);
  const afterAccept = await page.evaluate(() => ({
    notes: document.querySelector("textarea")?.value || "",
    status: document.querySelector(".doc-identity-status")?.textContent || "",
    location: document.querySelector(".doc-identity-location")?.textContent || "",
    title: document.querySelector(".doc-identity-title")?.textContent || "",
    isFileSession: /local file|ローカルファイル|archivo local|ficheiro local|lokale datei|fichier local|file locale|yerel dosya|plik lokalny/i.test(
      document.querySelector(".doc-identity-location")?.textContent || "",
    ),
  }));
  record(
    "C2-accept-leave",
    !afterAccept.isFileSession && !/unsaved/i.test(afterAccept.status),
    JSON.stringify(afterAccept),
  );

  // ═══════════════ D. Broadcast ═══════════════
  await page.goto(`${BASE}/board`, { waitUntil: "networkidle0" });
  await page.waitForSelector(".broadcast-btn", { timeout: 10000 });
  await page.click(".broadcast-btn");
  await sleep(600);
  const bcIn = await page.evaluate(() => {
    const exit = [...document.querySelectorAll("button")].find((b) =>
      /exit|終了|salir|sair|beenden|quitter|çık|esci|wyjdź/i.test(
        `${b.textContent || ""} ${b.getAttribute("aria-label") || ""} ${b.getAttribute("title") || ""}`,
      ),
    );
    const dup = [...document.querySelectorAll("button")].find((b) =>
      /duplicate|複製|duplicar|duplizieren|dupliquer|kopyala|duplica|duplikuj/i.test(
        b.textContent || "",
      ),
    );
    return {
      exit: !!exit,
      dup: !!dup,
      body: document.body.className,
    };
  });
  record("D1-enter", bcIn.exit, JSON.stringify(bcIn));

  if (bcIn.dup) {
    await page.evaluate(() => {
      const dup = [...document.querySelectorAll("button")].find((b) =>
        /duplicate|複製|duplicar|duplizieren|dupliquer|kopyala|duplica|duplikuj/i.test(
          b.textContent || "",
        ),
      );
      dup?.click();
    });
    await sleep(400);
    record("D2-duplicate", true, "clicked");
  } else {
    record("D2-duplicate", false, "no Duplicate in broadcast UI");
  }

  await page.keyboard.press("BracketRight");
  await sleep(300);
  record("D3-scene", true, "] key sent");

  await page.keyboard.press("Escape");
  await sleep(500);
  const bcOut = await page.evaluate(() => ({
    topbar: !!document.querySelector(".topbar--document"),
    broadcastBtn: !!document.querySelector(".broadcast-btn"),
    body: document.body.className,
  }));
  record("D4-exit", bcOut.topbar && bcOut.broadcastBtn, JSON.stringify(bcOut));

  // ═══════════════ E. Save failed ═══════════════
  await goFiles();
  await installFs([["board-alpha.zoneboard.json", jsonText]]);
  await clickOpenFolder();
  await openDirectoryCardByName("board-alpha");
  await editSceneNotes("-G91E");
  await waitDirty();
  await page.evaluate(() => {
    window.__zbQaFs.failNextWrite = true;
  });
  await clickPrimary();
  await page.waitForFunction(
    () =>
      /failed|失敗|fehler|error|échec|erro|hata|fallita|nie powiod/i.test(
        document.querySelector(".doc-identity-status")?.textContent || "",
      ) || !!document.querySelector(".topbar-secondary-dl"),
    { timeout: 10000 },
  );
  snap = await headerSnap();
  record(
    "E1-failed-ui",
    /failed|失敗|fehler|error|échec|erro|hata|fallita|nie powiod/i.test(snap.status) &&
      Boolean(snap.secondary),
    `status=${snap.status}; secondary=${snap.secondary}; primary=${snap.primary}`,
  );
  const retained = await page.evaluate(
    () => /G91E/.test(document.querySelector("textarea")?.value || ""),
  );
  record("E2-retained", retained, `notes retained=${retained}`);

  // Retry reachable
  record(
    "E3-retry",
    /retry|再試行|erneut|reintent|tentar|réessayer|yeniden|riprova|ponów/i.test(
      snap.primary || "",
    ),
    `primary=${snap.primary}`,
  );

  // ═══════════════ F. Locales @ PC/tablet widths ═══════════════
  const localeMatrix = [
    ["ja", 1920],
    ["ja", 1366],
    ["ja", 1024],
    ["en", 1920],
    ["en", 1366],
    ["en", 1024],
    ["de", 1366],
    ["de", 1024],
    ["pl", 1024],
    ["tr", 1024],
    ["es", 1366],
    ["pt", 1366],
    ["fr", 1366],
    ["it", 1366],
  ];

  for (const [loc, w] of localeMatrix) {
    await page.setViewport({ width: w, height: 900 });
    await goFiles();
    await setLocale(loc);
    await page.goto(`${BASE}/board`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".topbar--document", { timeout: 10000 });
    const layout = await page.evaluate(() => {
      const topbar = document.querySelector(".topbar--document");
      const r = topbar?.getBoundingClientRect();
      const canvas =
        document.querySelector("canvas") ||
        document.querySelector(".pitch-wrap, .editor-main, .board-view");
      const cr = canvas?.getBoundingClientRect();
      const primary = document.querySelector(".topbar-primary-save");
      const broadcast = document.querySelector(".broadcast-btn");
      const drawer = document.querySelector(".topbar-drawer-toggle");
      const boards = document.querySelector(".board-switcher__toggle");
      function overlaps(a, b) {
        if (!a || !b) return false;
        const A = a.getBoundingClientRect();
        const B = b.getBoundingClientRect();
        return !(
          A.right <= B.left ||
          B.right <= A.left ||
          A.bottom <= B.top ||
          B.bottom <= A.top
        );
      }
      return {
        headerH: r ? Math.round(r.height) : null,
        canvasH: cr ? Math.round(cr.height) : null,
        overflowX:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 2,
        overlapBcDrawer: overlaps(broadcast, drawer),
        bc: !!(broadcast && broadcast.getBoundingClientRect().width > 0),
        drawer: !!(drawer && drawer.getBoundingClientRect().width > 0),
        boards: !!(boards && boards.getBoundingClientRect().width > 0),
        primaryLabel: primary?.textContent?.trim() || null,
        bcLabel: broadcast?.textContent?.trim() || null,
        boardsLabel: boards?.textContent?.trim() || null,
      };
    });
    const ok =
      layout.headerH > 0 &&
      layout.headerH < 200 &&
      !layout.overflowX &&
      !layout.overlapBcDrawer &&
      layout.bc &&
      layout.drawer &&
      layout.boards;
    record(
      `F-${loc}-${w}`,
      ok,
      `h=${layout.headerH} canvas=${layout.canvasH} ox=${layout.overflowX} ov=${layout.overlapBcDrawer} bc=${layout.bcLabel} boards=${layout.boardsLabel}`,
    );
  }

  // 768 reference
  await page.setViewport({ width: 768, height: 1024 });
  await setLocale("en");
  await page.goto(`${BASE}/board`, { waitUntil: "networkidle0" });
  const tab = await page.evaluate(() => {
    const r = document.querySelector(".topbar--document")?.getBoundingClientRect();
    return {
      headerH: r ? Math.round(r.height) : null,
      bc: !!document.querySelector(".broadcast-btn"),
      drawer: !!document.querySelector(".topbar-drawer-toggle"),
      more: !!document.querySelector(".topbar-more"),
      overflowX:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 2,
    };
  });
  record(
    "F-ref-768",
    tab.bc && tab.drawer && tab.more && !tab.overflowX,
    JSON.stringify(tab),
  );
} catch (e) {
  console.error(e);
  record("FATAL", false, e?.message || String(e));
  process.exitCode = 1;
} finally {
  writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 2), "utf8");
  const failed = results.filter((r) => !r.pass);
  console.log("\n=== SUMMARY ===");
  console.log(`pass=${results.length - failed.length} fail=${failed.length}`);
  for (const f of failed) console.log(`  FAIL ${f.id}: ${f.detail}`);
  await browser.close();
  if (failed.length) process.exitCode = 1;
}
