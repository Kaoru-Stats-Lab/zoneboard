import type { Locale } from "../i18n/messages.ts";
import { HOW_TO } from "../i18n/howTo.ts";

export const SHORTCUT_SHEET_COPY = {
  en: {
    title: "Broadcast shortcut sheet",
    description:
      "Printable keyboard reference for ZoneBoard broadcast mode — select, move, scenes, and on-air controls.",
    intro:
      "Print or save as PDF (Ctrl/Cmd+P). Keep it beside your keyboard during a show.",
    print: "Print / Save as PDF",
    board: "Open board",
    otherLang: "日本語版",
    otherLangHref: "ja/",
    footnote:
      "Rehearse before you go live. ? or F1 opens the full how-to in the editor.",
    keysCol: "Keys",
    actionCol: "Action",
  },
  ja: {
    title: "配信コマンド表",
    description:
      "ZoneBoard 配信モード用の印刷可能なキーボード早見表 — 選択・移動・局面・オンエア操作。",
    intro:
      "印刷または PDF 保存（Ctrl/Cmd+P）。配信デスクの横に置いて使えます。",
    print: "印刷 / PDF 保存",
    board: "ボードを開く",
    otherLang: "English",
    otherLangHref: "../",
    footnote:
      "本番前に一度リハーサルしてください。エディタでは ? または F1 で全文の使い方を開けます。",
    keysCol: "キー",
    actionCol: "操作",
  },
} as const;

function shortcutCopy(locale: Locale) {
  return SHORTCUT_SHEET_COPY[locale === "ja" ? "ja" : "en"];
}

function boardHrefForLocale(locale: Locale): string {
  if (locale === "ja") return "/board/?lang=ja";
  if (locale === "es") return "/board/?lang=es";
  if (locale === "pt") return "/board/?lang=pt";
  if (locale === "pl") return "/board/?lang=pl";
  if (locale === "de") return "/board/?lang=de";
  return "/board/";
}

function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderKeysTable(
  locale: Locale,
  keys: { combo: string; meaning: string }[],
): string {
  const c = shortcutCopy(locale);
  const rows = keys
    .map(
      (row) =>
        `<tr><td class="shortcut-key"><kbd>${esc(row.combo)}</kbd></td><td>${esc(row.meaning)}</td></tr>`,
    )
    .join("\n");
  return `<table class="shortcut-table">
<thead><tr><th scope="col">${esc(c.keysCol)}</th><th scope="col">${esc(c.actionCol)}</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`;
}

/** Printable article body — keys only, sourced from HOW_TO. */
export function shortcutSheetArticle(locale: Locale): string {
  const doc = HOW_TO[locale];
  const c = shortcutCopy(locale);
  const boardHref = boardHrefForLocale(locale);
  const sections = doc.sections
    .filter((s) => s.keys && s.keys.length > 0)
    .map(
      (section) => `<section class="shortcut-section">
<h2>${esc(section.heading)}</h2>
${renderKeysTable(locale, section.keys!)}
</section>`,
    )
    .join("\n");

  return `<article class="shortcut-sheet">
<div class="shortcut-actions no-print">
<button type="button" class="shortcut-print" onclick="window.print()">${esc(c.print)}</button>
<a class="shortcut-board ghost" href="${boardHref}">${esc(c.board)}</a>
<a class="shortcut-lang" href="${esc(c.otherLangHref)}">${esc(c.otherLang)}</a>
</div>
<h1>${esc(c.title)}</h1>
<p class="lede">${esc(c.intro)}</p>
<p class="shortcut-tagline">${esc(doc.intro)}</p>
<div class="shortcut-grid">
${sections}
</div>
<footer class="shortcut-foot">
<p><strong>ZoneBoard</strong> · zoneboard.app/board · ${esc(c.footnote)}</p>
</footer>
</article>`;
}

export function shortcutSheetPath(locale: Locale): string {
  return locale === "ja"
    ? "/materials/shortcut-sheet/ja/"
    : "/materials/shortcut-sheet/";
}
