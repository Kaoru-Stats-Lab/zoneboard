#!/usr/bin/env node
/**
 * WCAG 2.2 relative luminance contrast. No deps.
 * Usage: node contrast.mjs "#111111" "#ffffff" ["#fg" "#bg" ...]
 */

function parseHex(raw) {
  const h = String(raw).trim().replace(/^#/, "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`bad hex: ${raw}`);
  }
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function channel(c) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function luminance({ r, g, b }) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a, b) {
  const l1 = luminance(parseHex(a));
  const l2 = luminance(parseHex(b));
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function gate(ratio, kind) {
  if (kind === "text") {
    if (ratio >= 7) return "AAA text";
    if (ratio >= 4.5) return "AA text";
    return "FAIL text (<4.5)";
  }
  if (ratio >= 3) return "AA UI (3:1)";
  return "FAIL UI (<3)";
}

const args = process.argv.slice(2);
if (args.length < 2 || args.length % 2 !== 0) {
  console.error("usage: node contrast.mjs #fg #bg [#fg #bg ...]");
  process.exit(1);
}

try {
  for (let i = 0; i < args.length; i += 2) {
    const fg = args[i];
    const bg = args[i + 1];
    const ratio = contrastRatio(fg, bg);
    const n = ratio.toFixed(2);
    console.log(
      `${fg} on ${bg}  ${n}:1  ${gate(ratio, "text")}  ${gate(ratio, "ui")}`,
    );
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
