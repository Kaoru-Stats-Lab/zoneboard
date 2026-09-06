import type { Locale } from "../i18n/messages";

export type ConsentCopy = {
  title: string;
  copy: string;
  reject: string;
  analytics: string;
  ads: string;
  policyHref: string;
  policyLabel: string;
  choices: string;
};

const BASE = {
  policyHref: "/cookies/",
} as const;

/** @deprecated Use consentFor(locale) */
export const CONSENT_BANNER = {
  title: "Privacy choices",
  titleJa: "プライバシーの選択",
  copy: "Analytics and ads stay off until you choose. The board stays on this device.",
  copyJa:
    "計測と広告は、選ぶまでオフです。ボードはこの端末に残ります。",
  reject: "Reject optional",
  rejectJa: "任意の Cookie を拒否",
  analytics: "Allow analytics",
  analyticsJa: "計測を許可",
  ads: "Allow advertising",
  adsJa: "広告を許可",
  policyHref: "/cookies/",
  policyLabel: "Cookie policy",
  policyLabelJa: "Cookie ポリシー",
  choices: "Cookie choices",
  choicesJa: "Cookie の選択",
} as const;

const BY_LOCALE: Record<Locale, ConsentCopy> = {
  en: {
    ...BASE,
    title: "Privacy choices",
    copy: "Analytics and ads stay off until you choose. The board stays on this device.",
    reject: "Reject optional",
    analytics: "Allow analytics",
    ads: "Allow advertising",
    policyLabel: "Cookie policy",
    choices: "Cookie choices",
  },
  ja: {
    ...BASE,
    title: "プライバシーの選択",
    copy: "計測と広告は、選ぶまでオフです。ボードはこの端末に残ります。",
    reject: "任意の Cookie を拒否",
    analytics: "計測を許可",
    ads: "広告を許可",
    policyLabel: "Cookie ポリシー",
    choices: "Cookie の選択",
  },
  es: {
    ...BASE,
    title: "Opciones de privacidad",
    copy: "Análisis y anuncios permanecen desactivados hasta que elijas. El tablero se queda en este dispositivo.",
    reject: "Rechazar opcionales",
    analytics: "Permitir analítica",
    ads: "Permitir publicidad",
    policyLabel: "Política de cookies",
    choices: "Opciones de cookies",
  },
  pt: {
    ...BASE,
    title: "Opções de privacidade",
    copy: "Análise e anúncios ficam desligados até você escolher. O quadro permanece neste dispositivo.",
    reject: "Rejeitar opcionais",
    analytics: "Permitir análise",
    ads: "Permitir publicidade",
    policyLabel: "Política de cookies",
    choices: "Opções de cookies",
  },
  pl: {
    ...BASE,
    title: "Wybór prywatności",
    copy: "Analityka i reklamy są wyłączone, dopóki nie wybierzesz. Plansza zostaje na tym urządzeniu.",
    reject: "Odrzuć opcjonalne",
    analytics: "Zezwól na analitykę",
    ads: "Zezwól na reklamy",
    policyLabel: "Polityka cookies",
    choices: "Ustawienia cookies",
  },
  de: {
    ...BASE,
    title: "Datenschutz-Auswahl",
    copy: "Analyse und Werbung bleiben aus, bis du wählst. Das Board bleibt auf diesem Gerät.",
    reject: "Optional ablehnen",
    analytics: "Analyse erlauben",
    ads: "Werbung erlauben",
    policyLabel: "Cookie-Richtlinie",
    choices: "Cookie-Auswahl",
  },
  fr: {
    ...BASE,
    title: "Choix de confidentialité",
    copy: "Analyses et publicités restent désactivées jusqu'à ton choix. Le tableau reste sur cet appareil.",
    reject: "Refuser l'optionnel",
    analytics: "Autoriser l'analyse",
    ads: "Autoriser la pub",
    policyLabel: "Politique cookies",
    choices: "Choix des cookies",
  },
  tr: {
    ...BASE,
    title: "Gizlilik tercihleri",
    copy: "Analitik ve reklamlar seçene kadar kapalıdır. Tahta bu cihazda kalır.",
    reject: "İsteğe bağlıyı reddet",
    analytics: "Analitiğe izin ver",
    ads: "Reklama izin ver",
    policyLabel: "Çerez politikası",
    choices: "Çerez tercihleri",
  },
  it: {
    ...BASE,
    title: "Scelte privacy",
    copy: "Analitica e annunci restano off finché non scegli. La lavagna resta su questo dispositivo.",
    reject: "Rifiuta opzionali",
    analytics: "Consenti analitica",
    ads: "Consenti pubblicità",
    policyLabel: "Policy cookie",
    choices: "Scelta cookie",
  },
};

export function consentFor(locale: Locale): ConsentCopy {
  return BY_LOCALE[locale];
}
