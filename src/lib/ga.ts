import { readConsent, type ConsentChoice } from "./consent";

const DENIED = "denied" as const;
const GRANTED = "granted" as const;

type GtagConsentState = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    zbOnAdsAllowed?: () => void;
  }
  interface DocumentEventMap {
    "zb-consent": CustomEvent<ConsentChoice>;
  }
}

let listening = false;
let scriptRequested = false;
let configured = false;
let pendingPageView = false;
let analyticsGranted = false;

function measurementId(): string {
  const raw = import.meta.env.VITE_GA_MEASUREMENT_ID;
  return typeof raw === "string" ? raw.trim() : "";
}

export function isBroadcastMode(search = window.location.search): boolean {
  const params = new URLSearchParams(search);
  return params.get("broadcast") === "1" || params.get("capture") === "1";
}

export function isSpaTrackedPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/" || path === "/board";
}

function ensureStub(): boolean {
  const id = measurementId();
  if (!id) return false;
  if (typeof window.gtag === "function") return true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("consent", "default", {
    ad_storage: DENIED,
    ad_user_data: DENIED,
    ad_personalization: DENIED,
    analytics_storage: DENIED,
    wait_for_update: 500,
  });
  return true;
}

function consentUpdate(choice: ConsentChoice): void {
  if (typeof window.gtag !== "function") return;
  const ads: GtagConsentState = choice.ads ? GRANTED : DENIED;
  const analytics: GtagConsentState = choice.analytics ? GRANTED : DENIED;
  window.gtag("consent", "update", {
    analytics_storage: analytics,
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  });
}

function flushPageView(): void {
  if (!pendingPageView) return;
  if (!configured || typeof window.gtag !== "function") return;
  if (isBroadcastMode()) {
    pendingPageView = false;
    return;
  }
  const consent = readConsent();
  if (!consent?.analytics) {
    pendingPageView = false;
    return;
  }
  pendingPageView = false;
  const pagePath = window.location.pathname;
  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: document.title,
    page_location: `${window.location.origin}${pagePath}`,
  });
}

function loadTag(choice: ConsentChoice): void {
  const id = measurementId();
  if (!id || isBroadcastMode()) return;
  if (!ensureStub()) return;
  consentUpdate(choice);

  if (scriptRequested) {
    if (configured) flushPageView();
    return;
  }
  scriptRequested = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.onload = () => {
    if (typeof window.gtag !== "function") return;
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: false });
    configured = true;
    flushPageView();
  };
  document.head.appendChild(script);
}

function syncChoice(choice: ConsentChoice | null): void {
  if (isBroadcastMode()) {
    if (typeof window.gtag === "function") {
      consentUpdate({ analytics: false, ads: false });
    }
    return;
  }
  const next = Boolean(choice?.analytics);
  const became = next && !analyticsGranted;
  analyticsGranted = next;
  if (next && choice) {
    if (became) pendingPageView = true;
    loadTag(choice);
    return;
  }
  if (typeof window.gtag === "function") {
    consentUpdate(choice ?? { analytics: false, ads: false });
  }
}

function onConsent(event: CustomEvent<ConsentChoice>): void {
  syncChoice(event.detail);
}

export function initAnalytics(): void {
  if (listening) {
    syncChoice(readConsent());
    return;
  }
  listening = true;
  document.addEventListener("zb-consent", onConsent);
  const existing = readConsent();
  if (existing) {
    document.documentElement.dataset.zbAnalytics = existing.analytics
      ? "1"
      : "0";
    document.documentElement.dataset.zbAds = existing.ads ? "1" : "0";
  }
  syncChoice(existing);
}

export function sendPageView(): void {
  if (isBroadcastMode()) return;
  if (!measurementId()) return;
  const consent = readConsent();
  if (!consent?.analytics) return;
  pendingPageView = true;
  loadTag(consent);
  flushPageView();
}

export function trackEvent(
  name: "open_board" | "feedback_open" | "preview_end_card",
): void {
  if (isBroadcastMode()) return;
  if (!measurementId()) return;
  const consent = readConsent();
  if (!consent?.analytics) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name);
}
