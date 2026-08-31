import path from "node:path";
import { copyFile, mkdir } from "node:fs/promises";
import type { Plugin } from "vite";

/**
 * Cloudflare Pages was 308-redirecting `/board` → `/` when only a
 * `_redirects` rewrite to `/index.html` existed. Emitting real
 * `board/index.html`, `es/index.html`, `pt/index.html`, and `pl/index.html`
 * (same SPA shell) makes hard
 * links and locale LPs work.
 */
export function boardSpaShellPlugin(): Plugin {
  return {
    name: "board-spa-shell",
    async closeBundle() {
      const outDir = path.resolve("dist");
      const indexHtml = path.join(outDir, "index.html");
      for (const sub of ["board", "es", "pt", "pl"]) {
        const dir = path.join(outDir, sub);
        await mkdir(dir, { recursive: true });
        await copyFile(indexHtml, path.join(dir, "index.html"));
      }
    },
  };
}
