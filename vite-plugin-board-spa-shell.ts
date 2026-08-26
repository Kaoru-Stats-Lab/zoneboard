import path from "node:path";
import { copyFile, mkdir } from "node:fs/promises";
import type { Plugin } from "vite";

/**
 * Cloudflare Pages was 308-redirecting `/board` → `/` when only a
 * `_redirects` rewrite to `/index.html` existed. Emitting a real
 * `board/index.html` (same SPA shell) makes hard links and OBS URLs work.
 */
export function boardSpaShellPlugin(): Plugin {
  return {
    name: "board-spa-shell",
    async closeBundle() {
      const outDir = path.resolve("dist");
      const indexHtml = path.join(outDir, "index.html");
      const boardDir = path.join(outDir, "board");
      await mkdir(boardDir, { recursive: true });
      await copyFile(indexHtml, path.join(boardDir, "index.html"));
    },
  };
}
