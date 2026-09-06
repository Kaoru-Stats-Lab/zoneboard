import type { Locale } from "../i18n/messages";
import { PUBLISHER } from "./publisher.ts";
import { LOCALE_META } from "./localeNav.ts";

/** One native-language paragraph at the top of the English privacy policy. */
export const PRIVACY_SUMMARY: Record<Locale, string> = {
  en: `Operator: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Site: ${PUBLISHER.siteUrl}. Last updated ${PUBLISHER.updatedEn}. The board runs in your browser; we do not sell your tactics data.`,
  ja: `運営者: ${PUBLISHER.legalNameJa}（${PUBLISHER.countryJa}）。サイト: ${PUBLISHER.siteUrl}。最終更新 ${PUBLISHER.updatedJa}。ボードはブラウザ内で動作し、戦術データを販売しません。`,
  es: `Operador: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Sitio: ${PUBLISHER.siteUrl}. Última actualización: ${PUBLISHER.updatedEn}. El tablero funciona en tu navegador; no vendemos tus datos tácticos.`,
  pt: `Operador: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Site: ${PUBLISHER.siteUrl}. Atualizado em ${PUBLISHER.updatedEn}. O quadro roda no seu navegador; não vendemos seus dados táticos.`,
  pl: `Operator: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Strona: ${PUBLISHER.siteUrl}. Ostatnia aktualizacja: ${PUBLISHER.updatedEn}. Plansza działa w przeglądarce; nie sprzedajemy Twoich danych taktycznych.`,
  de: `Betreiber: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Website: ${PUBLISHER.siteUrl}. Stand ${PUBLISHER.updatedEn}. Das Board läuft im Browser; wir verkaufen keine Taktikdaten.`,
  fr: `Exploitant : ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Site : ${PUBLISHER.siteUrl}. Dernière mise à jour : ${PUBLISHER.updatedEn}. Le tableau fonctionne dans le navigateur ; nous ne vendons pas vos données tactiques.`,
  tr: `İşleten: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Site: ${PUBLISHER.siteUrl}. Son güncelleme: ${PUBLISHER.updatedEn}. Tahta tarayıcınızda çalışır; taktik verilerinizi satmayız.`,
  it: `Operatore: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Sito: ${PUBLISHER.siteUrl}. Ultimo aggiornamento: ${PUBLISHER.updatedEn}. La lavagna funziona nel browser; non vendiamo i tuoi dati tattici.`,
};

export function privacySummaryLabel(locale: Locale): string {
  return LOCALE_META[locale].nativeName;
}
