import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { Plugin } from "vite";
import type { Locale } from "./src/i18n/messages";
import { LP_LOCALES } from "./src/site/localeNav";
import { applyLpDocumentMetaToHtml } from "./src/site/localeDocumentMeta";

/**
 * Cloudflare Pages was 308-redirecting `/board` → `/` when only a
 * `_redirects` rewrite to `/index.html` existed. Emitting real
 * `board/index.html` and locale LP shells with **locale-baked** OG /
 * canonical / hreflang (same SPA JS bundle) makes hard links and
 * crawler share cards work.
 */
export function boardSpaShellPlugin(): Plugin {
  return {
    name: "board-spa-shell",
    async closeBundle() {
      const outDir = path.resolve("dist");
      const indexHtml = path.join(outDir, "index.html");
      const template = await readFile(indexHtml, "utf8");

      // Root = English LP (rewrite meta to messages formula + hreflang)
      const enHtml = applyLpDocumentMetaToHtml(template, "en");
      await writeFile(indexHtml, enHtml, "utf8");

      for (const locale of LP_LOCALES) {
        if (locale === "en") continue;
        const dir = path.join(outDir, locale);
        await mkdir(dir, { recursive: true });
        const html = applyLpDocumentMetaToHtml(template, locale as Locale);
        await writeFile(path.join(dir, "index.html"), html, "utf8");
      }

      // /board/ is the editor SPA — English shell meta is fine
      const boardDir = path.join(outDir, "board");
      await mkdir(boardDir, { recursive: true });
      await writeFile(path.join(boardDir, "index.html"), enHtml, "utf8");
    },
  };
}
