/**
 * Group 2–3 text geometry / wrap / resize self-check.
 * Run: npx --yes tsx scripts/text-geometry-check.ts
 */
import {
  TEXT_BOX_MIN_H,
  TEXT_BOX_MIN_W,
  TEXT_DEFAULT_WIDTH,
  applyTextResize,
  computeTextGeometry,
  layoutTextLines,
  placeNewTextBox,
  pointInTextBox,
  sanitizeTextObject,
  wrapParagraph,
} from "../src/canvas/textGeometry";
import type { BoardDocument, TextObject } from "../src/models/types";
import { createBoard } from "../src/models/defaults";
import type { PitchRect } from "../src/canvas/layout";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const board = createBoard("soccer") as BoardDocument;
const pitch: PitchRect = { x: 0, y: 0, w: 800, h: 520 };
const fontPx = 28;

// --- legacy short ---
const legacy: TextObject = {
  id: "t1",
  type: "text",
  x: 0.4,
  y: 0.3,
  text: "Free-Kick",
  color: "#fff",
  fontSize: 0.035,
};
const geomLegacy = computeTextGeometry(legacy, board, pitch);
assert(!!geomLegacy, "legacy geom");
assert(!geomLegacy!.hasExplicitWidth, "legacy has no explicit width");
assert(geomLegacy!.lines.length === 1, "legacy single line");
assert(
  pointInTextBox(geomLegacy!, geomLegacy!.pitchX + 0.01, geomLegacy!.pitchY + 0.01),
  "hit inside",
);

// --- long EN wrap ---
const longEn =
  "The quick brown fox jumps over the lazy dog near the penalty arc and keeps going.";
const wrappedEn = layoutTextLines(longEn, 180, fontPx, "system");
assert(wrappedEn.length >= 2, "long EN wraps to multiple lines");
assert(!wrappedEn.some((l) => l.includes("\n")), "no raw newlines in lines");

// --- long JA wrap ---
const longJa =
  "ペナルティエリア付近でプレスをかけ、サイドへ展開してクロスを入れる形を共有したい。";
const wrappedJa = layoutTextLines(longJa, 160, fontPx, "system");
assert(wrappedJa.length >= 2, "long JA wraps");

// --- mixed ---
const mixed = "PRESS from 左SB then switch to 右SH for the cross.";
const wrappedMix = layoutTextLines(mixed, 200, fontPx, "system");
assert(wrappedMix.length >= 1, "mixed wraps ok");

// --- explicit newlines ---
const withBreaks = "Line A\n\nLine C";
const breakLines = layoutTextLines(withBreaks, 400, fontPx, "system");
assert(breakLines.length === 3, `explicit breaks → 3 lines got ${breakLines.length}`);
assert(breakLines[1] === "", "empty line preserved");

// --- no-space long token ---
const url = "https://example.com/very/long/path/without/spaces/for/wrapping";
const urlLines = wrapParagraph(url, 120, fontPx, "system");
assert(urlLines.length >= 2, "long token force-breaks");

// --- emoji / ZWJ (best-effort; Segmenter when available) ---
const emoji = "🏳️‍🌈 team press";
const emojiLines = layoutTextLines(emoji, 400, fontPx, "system");
assert(emojiLines.length >= 1, "emoji layout");
assert(emojiLines.join("").includes("team"), "emoji content kept");

// --- boxed geometry grows with wrap ---
const boxed: TextObject = {
  ...legacy,
  text: longEn,
  width: 0.18,
};
const geomNarrow = computeTextGeometry(boxed, board, pitch);
assert(!!geomNarrow, "narrow geom");
assert(geomNarrow!.hasExplicitWidth, "explicit width");
assert(geomNarrow!.lines.length >= 2, "narrow has multiple lines");
assert(
  geomNarrow!.worldH + 1e-9 >= geomNarrow!.contentH,
  "box H >= content H",
);

const wide: TextObject = { ...boxed, width: 0.55 };
const geomWide = computeTextGeometry(wide, board, pitch);
assert(!!geomWide, "wide geom");
assert(
  geomWide!.lines.length <= geomNarrow!.lines.length,
  "wider → fewer or equal lines",
);

// --- manual min height ---
const tall: TextObject = { ...boxed, width: 0.2, height: 0.25 };
const geomTall = computeTextGeometry(tall, board, pitch);
assert(!!geomTall && geomTall.worldH >= 0.25 - 1e-6, "min height respected");

// --- resize anchors ---
const east = applyTextResize(
  { x: 0.4, y: 0.3, width: 0.2, height: 0.05 },
  "e",
  0.45,
  0.3,
  { x: 0.4, y: 0.3 },
);
assert(east.x === 0.4, "east keeps x");
assert(east.width > 0.2, "east grows width");

const west = applyTextResize(
  { x: 0.4, y: 0.3, width: 0.2, height: 0.05 },
  "w",
  0.35,
  0.3,
  { x: 0.4, y: 0.3 },
);
assert(Math.abs(west.x + west.width - 0.6) < 1e-9, "west keeps right edge");
assert(west.width >= TEXT_BOX_MIN_W, "west min width");

const north = applyTextResize(
  { x: 0.4, y: 0.3, width: 0.2, height: 0.08 },
  "n",
  0.4,
  0.25,
  { x: 0.4, y: 0.3 },
);
assert(Math.abs(north.y + north.height - 0.38) < 1e-9, "north keeps bottom");
assert(north.height >= TEXT_BOX_MIN_H, "north min height");

// --- place new text near right edge ---
const placed = placeNewTextBox(0.95, 0.4);
assert(placed.width >= TEXT_BOX_MIN_W, "placed min width");
assert(placed.x + placed.width <= 1.001, "placed stays on pitch");
assert(placed.width <= TEXT_DEFAULT_WIDTH + 1e-9, "default width cap");

// --- sanitize does not invent width for legacy ---
const dirty = sanitizeTextObject({
  ...legacy,
  width: -1,
  height: Number.NaN,
  align: "nope" as TextObject["align"],
});
assert(dirty.width === undefined, "strip bad width / no invent");
assert(dirty.height === undefined, "strip bad height");

const keepLegacy = sanitizeTextObject(legacy);
assert(keepLegacy.width === undefined, "legacy width stays undefined");

// --- long legacy stays auto-width single visual line ---
const longLegacy: TextObject = {
  ...legacy,
  text: "Very long existing caption that must stay auto-width until resize",
};
const gLong = computeTextGeometry(longLegacy, board, pitch);
assert(!!gLong && !gLong.hasExplicitWidth, "long legacy still auto-width");
assert(gLong!.lines.length === 1, "legacy no wrap");

// --- small pitch vs large pitch: same wrap (no font px floor drift) ---
{
  const caption: TextObject = {
    ...legacy,
    text: longEn + " " + longJa,
    width: 0.28,
  };
  const small: PitchRect = { x: 70, y: 130, w: 340, h: 220 }; // font < 10px
  const large: PitchRect = { x: 350, y: 150, w: 1430, h: 920 };
  const gs = computeTextGeometry(caption, board, small)!;
  const gl = computeTextGeometry(caption, board, large)!;
  assert(gs.fontPx < 10, "small pitch font under former 10px floor");
  assert(
    JSON.stringify(gs.lines.map((l) => l.text)) ===
      JSON.stringify(gl.lines.map((l) => l.text)),
    "wrap parity small vs large pitch",
  );
}

console.log("text-geometry-check passed");
