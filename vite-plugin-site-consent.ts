import path from "node:path";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild") as typeof import("esbuild");

function measurementIdDefine(): string {
  return JSON.stringify(process.env.VITE_GA_MEASUREMENT_ID ?? "");
}

async function bundleConsentJs(): Promise<string> {
  const result = await esbuild.build({
    absWorkingDir: process.cwd(),
    entryPoints: [path.resolve("src/site/readingConsent.ts")],
    bundle: true,
    format: "iife",
    write: false,
    platform: "browser",
    target: ["es2020"],
    define: {
      "import.meta.env.VITE_GA_MEASUREMENT_ID": measurementIdDefine(),
      "import.meta.env.DEV": "false",
      "import.meta.env.PROD": "true",
      "import.meta.env.MODE": JSON.stringify("production"),
      "import.meta.env.BASE_URL": JSON.stringify("/"),
      "import.meta.env.SSR": "false",
    },
  });
  const file = result.outputFiles?.[0];
  if (!file) throw new Error("site-consent bundle produced no output");
  return file.text;
}

export function siteConsentPlugin(): Plugin {
  return {
    name: "site-consent",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/consent.js") {
          next();
          return;
        }
        void bundleConsentJs()
          .then((js) => {
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            res.end(js);
          })
          .catch(next);
      });
    },
    async writeBundle(options) {
      const dir = options.dir ?? path.resolve("dist");
      await writeFile(path.join(dir, "consent.js"), await bundleConsentJs());
    },
  };
}
