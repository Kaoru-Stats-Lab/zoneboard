import type { Locale } from "../i18n/messages";
import { LOCALE_META } from "./localeNav.ts";

export type LocalePublicCopy = {
  siteNavEnNote: string;
  siteNavEnTitle: string;
  lpFooterLanguage: string;
  languageHint: string;
  languageLandingLink: string;
  localeSuggestBody: string;
  localeSuggestGo: string;
  localeSuggestDismiss: string;
  cookieChoices: string;
  notFoundTitle: string;
  notFoundCopy: string;
  notFoundOpenBoard: string;
  notFoundHome: string;
  privacySummaryHeading: string;
};

const COPY: Record<Locale, LocalePublicCopy> = {
  en: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Reading pages are in English",
    lpFooterLanguage: "Language",
    languageHint:
      "Switches board menus only. Guide, privacy, and other reading pages stay in English. Piece names on the pitch stay as you typed them.",
    languageLandingLink: "Open English landing page",
    localeSuggestBody: "View ZoneBoard in {lang}?",
    localeSuggestGo: "Go",
    localeSuggestDismiss: "Stay in English",
    cookieChoices: "Cookie choices",
    notFoundTitle: "This page is not here",
    notFoundCopy:
      "The address is wrong, or the page has moved. The tactics board is still on this site.",
    notFoundOpenBoard: "Open board",
    notFoundHome: "Home",
    privacySummaryHeading: "Summary in your language",
  },
  ja: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "ガイドなどの長文は英語版です",
    lpFooterLanguage: "言語",
    languageHint:
      "メニュー表示だけ切り替わります。ガイド・プライバシーなどは英語のまま。下のリンクから日本語 LP を開けます。ピッチ上の名前は変わりません。",
    languageLandingLink: "日本語のトップへ",
    localeSuggestBody: "ZoneBoard を{lang}で見ますか？",
    localeSuggestGo: "開く",
    localeSuggestDismiss: "English のまま",
    cookieChoices: "Cookie の選択",
    notFoundTitle: "ページが見つかりません",
    notFoundCopy:
      "アドレスが違うか、ページが移動しました。戦術ボードは使えます。",
    notFoundOpenBoard: "ボードを開く",
    notFoundHome: "ホーム",
    privacySummaryHeading: "各言語の要約",
  },
  es: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Las páginas de lectura están en inglés",
    lpFooterLanguage: "Idioma",
    languageHint:
      "Solo cambia los menús del tablero. Guía, privacidad y otras páginas de lectura siguen en inglés. Abre tu landing abajo. Los nombres en el campo no cambian.",
    languageLandingLink: "Abrir landing en español",
    localeSuggestBody: "¿Ver ZoneBoard en {lang}?",
    localeSuggestGo: "Ir",
    localeSuggestDismiss: "Quedarme en English",
    cookieChoices: "Opciones de cookies",
    notFoundTitle: "Esta página no está aquí",
    notFoundCopy:
      "La dirección es incorrecta o la página se movió. El tablero táctico sigue en este sitio.",
    notFoundOpenBoard: "Abrir tablero",
    notFoundHome: "Inicio",
    privacySummaryHeading: "Resumen en tu idioma",
  },
  pt: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Páginas de leitura estão em inglês",
    lpFooterLanguage: "Idioma",
    languageHint:
      "Só muda os menus do quadro. Guia, privacidade e outras páginas de leitura ficam em inglês. Abra sua landing abaixo. Nomes no campo permanecem como você digitou.",
    languageLandingLink: "Abrir landing em português",
    localeSuggestBody: "Ver ZoneBoard em {lang}?",
    localeSuggestGo: "Ir",
    localeSuggestDismiss: "Ficar em English",
    cookieChoices: "Opções de cookies",
    notFoundTitle: "Esta página não existe",
    notFoundCopy:
      "O endereço está errado ou a página mudou. O quadro tático continua neste site.",
    notFoundOpenBoard: "Abrir quadro",
    notFoundHome: "Início",
    privacySummaryHeading: "Resumo no seu idioma",
  },
  pl: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Strony do czytania są po angielsku",
    lpFooterLanguage: "Język",
    languageHint:
      "Zmienia tylko menu planszy. Poradnik, prywatność i inne strony do czytania pozostają po angielsku. Otwórz landing poniżej. Nazwy na boisku zostają bez zmian.",
    languageLandingLink: "Otwórz landing po polsku",
    localeSuggestBody: "Zobaczyć ZoneBoard po {lang}?",
    localeSuggestGo: "Idź",
    localeSuggestDismiss: "Zostań przy English",
    cookieChoices: "Ustawienia cookies",
    notFoundTitle: "Nie ma takiej strony",
    notFoundCopy:
      "Adres jest błędny lub strona została przeniesiona. Plansza taktyczna nadal jest na tej stronie.",
    notFoundOpenBoard: "Otwórz planszę",
    notFoundHome: "Start",
    privacySummaryHeading: "Streszczenie w Twoim języku",
  },
  de: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Leseseiten sind auf Englisch",
    lpFooterLanguage: "Sprache",
    languageHint:
      "Wechselt nur Board-Menüs. Guide, Datenschutz und andere Leseseiten bleiben Englisch. Landing unten öffnen. Namen auf dem Feld bleiben unverändert.",
    languageLandingLink: "Deutsche Landing öffnen",
    localeSuggestBody: "ZoneBoard auf {lang} ansehen?",
    localeSuggestGo: "Los",
    localeSuggestDismiss: "Auf English bleiben",
    cookieChoices: "Cookie-Auswahl",
    notFoundTitle: "Diese Seite gibt es nicht",
    notFoundCopy:
      "Die Adresse ist falsch oder die Seite wurde verschoben. Das Taktikboard ist weiterhin auf dieser Site.",
    notFoundOpenBoard: "Board öffnen",
    notFoundHome: "Start",
    privacySummaryHeading: "Zusammenfassung in Ihrer Sprache",
  },
  fr: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Les pages de lecture sont en anglais",
    lpFooterLanguage: "Langue",
    languageHint:
      "Ne change que les menus du tableau. Guide, confidentialité et autres pages de lecture restent en anglais. Ouvre ta landing ci-dessous. Les noms sur le terrain restent tels que saisis.",
    languageLandingLink: "Ouvrir la landing en français",
    localeSuggestBody: "Voir ZoneBoard en {lang} ?",
    localeSuggestGo: "Aller",
    localeSuggestDismiss: "Rester en English",
    cookieChoices: "Choix des cookies",
    notFoundTitle: "Cette page n'existe pas",
    notFoundCopy:
      "L'adresse est incorrecte ou la page a été déplacée. Le tableau tactique est toujours sur ce site.",
    notFoundOpenBoard: "Ouvrir le tableau",
    notFoundHome: "Accueil",
    privacySummaryHeading: "Résumé dans votre langue",
  },
  tr: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Okuma sayfaları İngilizcedir",
    lpFooterLanguage: "Dil",
    languageHint:
      "Yalnızca tahta menülerini değiştirir. Rehber, gizlilik ve diğer okuma sayfaları İngilizce kalır. Aşağıdan landing'i aç. Sahadaki isimler yazdığın gibi kalır.",
    languageLandingLink: "Türkçe landing'i aç",
    localeSuggestBody: "ZoneBoard'u {lang} olarak görüntüle?",
    localeSuggestGo: "Git",
    localeSuggestDismiss: "English'te kal",
    cookieChoices: "Çerez tercihleri",
    notFoundTitle: "Bu sayfa burada değil",
    notFoundCopy:
      "Adres yanlış veya sayfa taşındı. Taktik tahtası hâlâ bu sitede.",
    notFoundOpenBoard: "Tahtayı aç",
    notFoundHome: "Ana sayfa",
    privacySummaryHeading: "Dilinizde özet",
  },
  it: {
    siteNavEnNote: "(EN)",
    siteNavEnTitle: "Le pagine di lettura sono in inglese",
    lpFooterLanguage: "Lingua",
    languageHint:
      "Cambia solo i menu della lavagna. Guida, privacy e altre pagine di lettura restano in inglese. Apri la landing qui sotto. I nomi sul campo restano come li hai scritti.",
    languageLandingLink: "Apri landing in italiano",
    localeSuggestBody: "Vedere ZoneBoard in {lang}?",
    localeSuggestGo: "Vai",
    localeSuggestDismiss: "Resta in English",
    cookieChoices: "Scelta cookie",
    notFoundTitle: "Questa pagina non c'è",
    notFoundCopy:
      "L'indirizzo è sbagliato o la pagina è stata spostata. La lavagna tattica è ancora su questo sito.",
    notFoundOpenBoard: "Apri lavagna",
    notFoundHome: "Home",
    privacySummaryHeading: "Riassunto nella tua lingua",
  },
};

export function publicCopy(locale: Locale): LocalePublicCopy {
  return COPY[locale];
}

export function localeSuggestBody(locale: Locale): string {
  return COPY.en.localeSuggestBody.replace("{lang}", LOCALE_META[locale].nativeName);
}
