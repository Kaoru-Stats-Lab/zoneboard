import type { Locale } from "../i18n/messages.ts";
import { HOW_TO } from "../i18n/howTo.ts";
import { LP_LOCALES, LOCALE_META, landingPath } from "./localeNav.ts";

export type ShortcutSheetCopy = {
  title: string;
  description: string;
  intro: string;
  print: string;
  board: string;
  footnote: string;
  keysCol: string;
  actionCol: string;
  otherLangs: string;
};

export const SHORTCUT_SHEET_COPY: Record<Locale, ShortcutSheetCopy> = {
  en: {
    title: "Broadcast shortcut sheet",
    description:
      "Printable keyboard reference for ZoneBoard broadcast mode — select, move, scenes, and on-air controls.",
    intro:
      "Print or save as PDF (Ctrl/Cmd+P). Keep it beside your keyboard during a show.",
    print: "Print / Save as PDF",
    board: "Open board",
    footnote:
      "Rehearse before you go live. ? or F1 opens the full how-to in the editor.",
    keysCol: "Keys",
    actionCol: "Action",
    otherLangs: "Other languages",
  },
  ja: {
    title: "配信コマンド表",
    description:
      "ZoneBoard 配信モード用の印刷可能なキーボード早見表 — 選択・移動・局面・オンエア操作。",
    intro:
      "印刷または PDF 保存（Ctrl/Cmd+P）。配信デスクの横に置いて使えます。",
    print: "印刷 / PDF 保存",
    board: "ボードを開く",
    footnote:
      "本番前に一度リハーサルしてください。エディタでは ? または F1 で全文の使い方を開けます。",
    keysCol: "キー",
    actionCol: "操作",
    otherLangs: "他の言語",
  },
  es: {
    title: "Hoja de atajos para directo",
    description:
      "Referencia imprimible del teclado para el modo directo de ZoneBoard.",
    intro:
      "Imprime o guarda en PDF (Ctrl/Cmd+P). Déjala junto al teclado durante el directo.",
    print: "Imprimir / PDF",
    board: "Abrir tablero",
    footnote:
      "Ensaya antes del directo. ? o F1 abre la guía completa en el editor.",
    keysCol: "Teclas",
    actionCol: "Acción",
    otherLangs: "Otros idiomas",
  },
  pt: {
    title: "Folha de atalhos para live",
    description:
      "Referência imprimível de teclado para o modo live do ZoneBoard.",
    intro:
      "Imprima ou salve em PDF (Ctrl/Cmd+P). Deixe ao lado do teclado durante a live.",
    print: "Imprimir / PDF",
    board: "Abrir quadro",
    footnote:
      "Ensaie antes da live. ? ou F1 abre o guia completo no editor.",
    keysCol: "Teclas",
    actionCol: "Ação",
    otherLangs: "Outros idiomas",
  },
  pl: {
    title: "Skróty klawiszowe na live",
    description:
      "Drukowalna ściągawka klawiszy trybu transmisji ZoneBoard.",
    intro:
      "Drukuj lub zapisz PDF (Ctrl/Cmd+P). Trzymaj obok klawiatury podczas transmisji.",
    print: "Drukuj / PDF",
    board: "Otwórz planszę",
    footnote:
      "Przećwicz przed live. ? lub F1 otwiera pełny poradnik w edytorze.",
    keysCol: "Klawisze",
    actionCol: "Akcja",
    otherLangs: "Inne języki",
  },
  de: {
    title: "Broadcast-Tastenkürzel",
    description:
      "Druckbare Tastaturübersicht für den ZoneBoard-Broadcast-Modus.",
    intro:
      "Drucken oder als PDF speichern (Strg/Cmd+P). Neben die Tastatur legen.",
    print: "Drucken / PDF",
    board: "Board öffnen",
    footnote:
      "Vor dem Live testen. ? oder F1 öffnet die Anleitung im Editor.",
    keysCol: "Tasten",
    actionCol: "Aktion",
    otherLangs: "Weitere Sprachen",
  },
  fr: {
    title: "Aide-mémoire clavier direct",
    description:
      "Référence clavier imprimable pour le mode direct ZoneBoard.",
    intro:
      "Imprime ou enregistre en PDF (Ctrl/Cmd+P). Garde-la près du clavier en direct.",
    print: "Imprimer / PDF",
    board: "Ouvrir le tableau",
    footnote:
      "Répète avant le direct. ? ou F1 ouvre le guide complet dans l'éditeur.",
    keysCol: "Touches",
    actionCol: "Action",
    otherLangs: "Autres langues",
  },
  tr: {
    title: "Yayın kısayol sayfası",
    description:
      "ZoneBoard yayın modu için yazdırılabilir klavye referansı.",
    intro:
      "Yazdır veya PDF kaydet (Ctrl/Cmd+P). Yayın sırasında klavyenin yanında tut.",
    print: "Yazdır / PDF",
    board: "Tahtayı aç",
    footnote:
      "Yayın öncesi dene. ? veya F1 editörde tam rehberi açar.",
    keysCol: "Tuşlar",
    actionCol: "Eylem",
    otherLangs: "Diğer diller",
  },
  it: {
    title: "Foglio scorciatoie diretta",
    description:
      "Riferimento tastiera stampabile per la modalità diretta ZoneBoard.",
    intro:
      "Stampa o salva PDF (Ctrl/Cmd+P). Tienilo accanto alla tastiera in diretta.",
    print: "Stampa / PDF",
    board: "Apri lavagna",
    footnote:
      "Prova prima della diretta. ? o F1 apre la guida completa nell'editor.",
    keysCol: "Tasti",
    actionCol: "Azione",
    otherLangs: "Altre lingue",
  },
};

function boardHrefForLocale(locale: Locale): string {
  if (locale === "en") return "/board/";
  return `/board/?lang=${locale}`;
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
  const c = SHORTCUT_SHEET_COPY[locale];
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

function shortcutLangLinks(current: Locale): string {
  const c = SHORTCUT_SHEET_COPY[current];
  const links = LP_LOCALES.filter((code) => code !== current)
    .map((code) => {
      const href = shortcutSheetPath(code);
      return `<a href="${esc(href)}">${esc(LOCALE_META[code].nativeName)}</a>`;
    })
    .join("\n");
  return `<nav class="shortcut-langs" aria-label="${esc(c.otherLangs)}">
${links}
</nav>`;
}

/** Printable article body — keys only, sourced from HOW_TO. */
export function shortcutSheetArticle(locale: Locale): string {
  const doc = HOW_TO[locale];
  const c = SHORTCUT_SHEET_COPY[locale];
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
</div>
${shortcutLangLinks(locale)}
<h1>${esc(c.title)}</h1>
<p class="lede">${esc(c.intro)}</p>
<p class="shortcut-tagline">${esc(doc.intro)}</p>
<div class="shortcut-grid">
${sections}
</div>
<footer class="shortcut-foot">
<p><strong>ZoneBoard</strong> · zoneboard.app/board · ${esc(c.footnote)}</p>
<p><a href="${esc(landingPath(locale))}">${esc(LOCALE_META[locale].nativeName)} LP</a></p>
</footer>
</article>`;
}

export function shortcutSheetPath(locale: Locale): string {
  if (locale === "en") return "/materials/shortcut-sheet/";
  return `/materials/shortcut-sheet/${locale}/`;
}

export function shortcutSheetSubdir(locale: Locale): string {
  if (locale === "en") return "materials/shortcut-sheet";
  return `materials/shortcut-sheet/${locale}`;
}
