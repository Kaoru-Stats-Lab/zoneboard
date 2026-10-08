import path from "node:path";
import type { Plugin } from "vite";
import {
  FootballContentError,
  generateFootballPages,
} from "./scripts/write-football-pages";

/**
 * Emit Football static HTML into dist/ during production build.
 * Runs inside Vite (no node --experimental-strip-types), so Cloudflare
 * Pages Node 20 can deploy. Bad Markdown throws → build fails → no deploy.
 */
export function footballPagesPlugin(): Plugin {
  return {
    name: "football-pages",
    apply: "build",
    async closeBundle() {
      try {
        await generateFootballPages({
          projectRoot: path.resolve("."),
          outDir: path.resolve("dist"),
        });
      } catch (err) {
        if (err instanceof FootballContentError) {
          throw new Error(
            `Football content error (build aborted): ${err.message}`,
          );
        }
        throw err;
      }
    },
  };
}
