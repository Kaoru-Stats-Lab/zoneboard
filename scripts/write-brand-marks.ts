import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { BRAND_ASSETS, renderMarkSvg } from "../src/brand/mark.ts";

const root = path.resolve(import.meta.dirname, "..");
const brandDir = path.join(root, "public", "brand");

await mkdir(brandDir, { recursive: true });

for (const asset of BRAND_ASSETS) {
  const svg = renderMarkSvg(asset);
  await writeFile(path.join(brandDir, asset.file), svg);
  if (asset.alias) {
    await writeFile(path.join(root, "public", asset.alias), svg);
  }
}

console.log(`wrote ${BRAND_ASSETS.length} marks to public/brand/`);
