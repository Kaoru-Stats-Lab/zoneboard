import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { LOCKUP_WORD } from "../src/brand/lockupWord.ts";
import {
  BRAND,
  BRAND_ASSETS,
  MARK,
  markInnerSvg,
  renderMarkSvg,
  resolveMarkPaint,
  type MarkGround,
  type MarkScheme,
} from "../src/brand/mark.ts";

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

const MARK_BOX = 32;
const GAP = 10;
const PAD = 2;
const lockupWidth = PAD + MARK_BOX + GAP + LOCKUP_WORD.width + PAD;
const lockupHeight = PAD + MARK_BOX + PAD;
const wordX = PAD + MARK_BOX + GAP;
const baseline = PAD + MARK_BOX / 2 + LOCKUP_WORD.cap / 2;

/** Stacked: larger mark so it is not a bullet above the name. */
const STACK_MARK = 56;
const STACK_GAP = 10;
const STACK_PAD = 4;
const stackWidth = STACK_PAD + Math.max(STACK_MARK, LOCKUP_WORD.width) + STACK_PAD;
const stackHeight =
  STACK_PAD + STACK_MARK + STACK_GAP + LOCKUP_WORD.cap + LOCKUP_WORD.descender + STACK_PAD;
const stackMarkX = (stackWidth - STACK_MARK) / 2;
const stackMarkY = STACK_PAD;
const stackWordX = (stackWidth - LOCKUP_WORD.width) / 2;
const stackBaseline = STACK_PAD + STACK_MARK + STACK_GAP + LOCKUP_WORD.cap;

function lockupInner(
  scheme: MarkScheme,
  on: MarkGround,
  layout: "row" | "stack" = "row",
): string {
  const paint = resolveMarkPaint({ variant: "mark", scheme, on });
  const box = layout === "stack" ? STACK_MARK : MARK_BOX;
  const mx = layout === "stack" ? stackMarkX : PAD;
  const my = layout === "stack" ? stackMarkY : PAD;
  const wx = layout === "stack" ? stackWordX : wordX;
  const by = layout === "stack" ? stackBaseline : baseline;
  const mark = `  <svg x="${mx.toFixed(2)}" y="${my}" width="${box}" height="${box}" viewBox="${MARK.viewBoxMark}">
${markInnerSvg(paint)}
  </svg>`;
  const word = `  <path fill="${paint.ink}" d="${LOCKUP_WORD.d}" transform="translate(${wx.toFixed(2)} ${by.toFixed(2)})"/>`;
  return `${mark}\n${word}`;
}

type LockupAsset = {
  file: string;
  scheme: MarkScheme;
  on: MarkGround;
  alias?: string;
};

const LOCKUP_ASSETS: LockupAsset[] = [
  {
    file: "lockup-color-dark.svg",
    scheme: "color",
    on: "dark",
    alias: "lockup.svg",
  },
  { file: "lockup-color-light.svg", scheme: "color", on: "light" },
  { file: "lockup-mono-white.svg", scheme: "mono", on: "dark" },
  { file: "lockup-mono-black.svg", scheme: "mono", on: "light" },
];

for (const asset of LOCKUP_ASSETS) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lockupWidth.toFixed(2)} ${lockupHeight}" role="img" aria-label="ZoneBoard">
${lockupInner(asset.scheme, asset.on)}
</svg>
`;
  await writeFile(path.join(brandDir, asset.file), svg);
  if (asset.alias) {
    await writeFile(path.join(root, "public", asset.alias), svg);
  }
}

const ogW = 1200;
const ogH = 630;
const ogLockupW = 640;
const scale = ogLockupW / lockupWidth;
const ogLockupH = lockupHeight * scale;
const ogX = (ogW - ogLockupW) / 2;
const ogY = (ogH - ogLockupH) / 2;
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ogW} ${ogH}" width="${ogW}" height="${ogH}" role="img" aria-label="ZoneBoard">
  <rect width="${ogW}" height="${ogH}" fill="${BRAND.studio}"/>
  <g transform="translate(${ogX.toFixed(2)} ${ogY.toFixed(2)}) scale(${scale.toFixed(4)})">
${lockupInner("color", "dark")}
  </g>
</svg>
`;
await writeFile(path.join(brandDir, "lockup-og.svg"), ogSvg);

const STACK_ASSETS: LockupAsset[] = [
  {
    file: "lockup-stack-color-dark.svg",
    scheme: "color",
    on: "dark",
    alias: "lockup-stack.svg",
  },
  { file: "lockup-stack-color-light.svg", scheme: "color", on: "light" },
  { file: "lockup-stack-mono-white.svg", scheme: "mono", on: "dark" },
  { file: "lockup-stack-mono-black.svg", scheme: "mono", on: "light" },
];

for (const asset of STACK_ASSETS) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${stackWidth.toFixed(2)} ${stackHeight.toFixed(2)}" role="img" aria-label="ZoneBoard">
${lockupInner(asset.scheme, asset.on, "stack")}
</svg>
`;
  await writeFile(path.join(brandDir, asset.file), svg);
  if (asset.alias) {
    await writeFile(path.join(root, "public", asset.alias), svg);
  }
}

const stackOg = 1080;
const stackOgLockupW = 560;
const stackScale = stackOgLockupW / stackWidth;
const stackOgLockupH = stackHeight * stackScale;
const stackOgX = (stackOg - stackOgLockupW) / 2;
const stackOgY = (stackOg - stackOgLockupH) / 2;
const stackOgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${stackOg} ${stackOg}" width="${stackOg}" height="${stackOg}" role="img" aria-label="ZoneBoard">
  <rect width="${stackOg}" height="${stackOg}" fill="${BRAND.studio}"/>
  <g transform="translate(${stackOgX.toFixed(2)} ${stackOgY.toFixed(2)}) scale(${stackScale.toFixed(4)})">
${lockupInner("color", "dark", "stack")}
  </g>
</svg>
`;
await writeFile(path.join(brandDir, "lockup-stack-og.svg"), stackOgSvg);

console.log(
  `wrote ${BRAND_ASSETS.length} marks, ${LOCKUP_ASSETS.length + 1} row lockups, ${STACK_ASSETS.length + 1} stacked lockups to public/brand/`,
);
