export const CONSENT_KEY = "zb-consent";
export const CONSENT_VERSION = 2;
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

export type ConsentChoice = {
  analytics: boolean;
  ads: boolean;
};

export type ConsentState = ConsentChoice & {
  v: typeof CONSENT_VERSION;
  at: number;
};

function isExpired(at: number): boolean {
  return Date.now() - at > CONSENT_MAX_AGE_MS;
}

function asChoice(value: unknown): ConsentState | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (typeof data.at !== "number" || isExpired(data.at)) return null;

  if (
    data.v === CONSENT_VERSION &&
    typeof data.analytics === "boolean" &&
    typeof data.ads === "boolean"
  ) {
    return {
      v: CONSENT_VERSION,
      analytics: data.analytics,
      ads: data.ads,
      at: data.at,
    };
  }

  // v1 was ads-only. Advertising yes is not analytics yes.
  if (data.v === 1 && typeof data.ads === "boolean") {
    return {
      v: CONSENT_VERSION,
      analytics: false,
      ads: data.ads,
      at: data.at,
    };
  }

  return null;
}

function persistMigrated(parsed: unknown, next: ConsentState): void {
  if (
    parsed &&
    typeof parsed === "object" &&
    (parsed as { v?: unknown }).v !== CONSENT_VERSION
  ) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  }
}

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const next = asChoice(parsed);
    if (!next) return null;
    persistMigrated(parsed, next);
    return next;
  } catch {
    return null;
  }
}

export function applyConsent(choice: ConsentChoice): void {
  document.documentElement.dataset.zbAnalytics = choice.analytics ? "1" : "0";
  document.documentElement.dataset.zbAds = choice.ads ? "1" : "0";
  document.dispatchEvent(
    new CustomEvent<ConsentChoice>("zb-consent", { detail: choice }),
  );
  if (choice.ads && typeof window.zbOnAdsAllowed === "function") {
    window.zbOnAdsAllowed();
  }
}

export function writeConsent(choice: ConsentChoice): ConsentState {
  const next: ConsentState = {
    v: CONSENT_VERSION,
    analytics: choice.analytics,
    ads: choice.ads,
    at: Date.now(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  applyConsent(next);
  return next;
}

export function consentRejectOptional(): ConsentChoice {
  return { analytics: false, ads: false };
}

export function consentAllowAnalytics(): ConsentChoice {
  return { analytics: true, ads: readConsent()?.ads ?? false };
}

export function consentAllowAdvertising(): ConsentChoice {
  return { analytics: true, ads: true };
}

export function bootConsentBanner(banner: HTMLElement): void {
  const existing = readConsent();

  function hide(): void {
    banner.hidden = true;
    document.body.classList.remove("has-consent");
  }

  function show(): void {
    banner.hidden = false;
    document.body.classList.add("has-consent");
    banner.querySelector("button")?.focus();
  }

  if (existing) {
    applyConsent(existing);
    hide();
  } else {
    show();
  }

  banner.querySelector("[data-consent=reject]")?.addEventListener("click", () => {
    writeConsent(consentRejectOptional());
    hide();
  });
  banner
    .querySelector("[data-consent=analytics]")
    ?.addEventListener("click", () => {
      writeConsent(consentAllowAnalytics());
      hide();
    });
  banner.querySelector("[data-consent=ads]")?.addEventListener("click", () => {
    writeConsent(consentAllowAdvertising());
    hide();
  });

  document.querySelectorAll("[data-consent-open]").forEach((el) => {
    el.addEventListener("click", () => show());
  });
}
