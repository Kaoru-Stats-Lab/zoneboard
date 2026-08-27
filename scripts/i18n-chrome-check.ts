/**
 * Guardrail: every locale shares the same message keys, and chrome *Short
 * pairs exist so drawer/topbar layout stays language-independent.
 * Run: npm run test:i18n-chrome
 */
import { messages, type Locale } from "../src/i18n/messages.ts";

/** Full key → Short key used in constrained chrome. */
const CHROME_SHORT_PAIRS: [string, string][] = [
  ["newBoard", "newBoardShort"],
  ["deleteBoard", "deleteBoardShort"],
  ["newScene", "newSceneShort"],
  ["deleteScene", "deleteSceneShort"],
  ["fromPreset", "fromPresetShort"],
  ["sceneMirrorEnds", "sceneMirrorEndsShort"],
  ["addGoal", "addGoalShort"],
  ["addCard", "addCardShort"],
  ["sizeTactics", "sizeTacticsShort"],
  ["sizeBalanced", "sizeBalancedShort"],
  ["sizePosition", "sizePositionShort"],
];

/** Soft cap for Short labels (Latin-ish). CJK packs more meaning per char. */
const SHORT_MAX_CHARS = 14;

const locales = Object.keys(messages) as Locale[];
const baseKeys = Object.keys(messages.ja).sort();
let failed = 0;

function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failed += 1;
}

for (const loc of locales) {
  const keys = Object.keys(messages[loc]).sort();
  if (keys.length !== baseKeys.length) {
    fail(`${loc}: key count ${keys.length} ≠ ja ${baseKeys.length}`);
  }
  for (const k of baseKeys) {
    if (!(k in messages[loc])) fail(`${loc}: missing key "${k}"`);
  }
  for (const k of keys) {
    if (!(k in messages.ja)) fail(`${loc}: extra key "${k}" not in ja`);
  }
}

for (const loc of locales) {
  const bag = messages[loc] as Record<string, string>;
  for (const [full, short] of CHROME_SHORT_PAIRS) {
    if (!(full in bag)) fail(`${loc}: missing full chrome key "${full}"`);
    if (!(short in bag)) fail(`${loc}: missing Short chrome key "${short}"`);
    const text = bag[short] ?? "";
    if (!text.trim()) fail(`${loc}: empty Short "${short}"`);
    if ([...text].length > SHORT_MAX_CHARS) {
      fail(
        `${loc}: "${short}" is ${[...text].length} chars (max ${SHORT_MAX_CHARS}): "${text}"`,
      );
    }
  }
}

if (failed) {
  console.error(`i18n chrome check: ${failed} failure(s)`);
  process.exit(1);
}
console.log(
  `i18n chrome check passed (${locales.length} locales, ${CHROME_SHORT_PAIRS.length} Short pairs)`,
);
