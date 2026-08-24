import type { Locale } from "../i18n/messages";

const MAX_MESSAGE = 500;
const FIRST_REF_KEY = "zb-fb-referrer";
const FIRST_UTM_KEY = "zb-fb-utm";

export type FeedbackKind = "bug" | "ux" | "feature" | "other";
export type FeedbackSource =
  | "landing"
  | "settings"
  | "editor"
  | "footer"
  | "contact";

export type FeedbackPayload = {
  tool_id: string;
  source: FeedbackSource;
  kind: FeedbackKind;
  message: string;
  ua_short: string;
  locale: Locale;
  timezone: string;
  viewport: string;
  color_scheme: string;
  page_path: string;
  referrer: string;
  utm: string;
};

export function captureLandingHints(): void {
  try {
    if (!sessionStorage.getItem(FIRST_REF_KEY)) {
      sessionStorage.setItem(
        FIRST_REF_KEY,
        cleanUrl(document.referrer) || "(direct)",
      );
    }
    if (!sessionStorage.getItem(FIRST_UTM_KEY)) {
      const params = new URLSearchParams(location.search);
      const parts = ["utm_source", "utm_medium", "utm_campaign"]
        .map((k) => {
          const v = params.get(k);
          return v ? `${k.replace("utm_", "")}=${v}` : "";
        })
        .filter(Boolean);
      if (parts.length) sessionStorage.setItem(FIRST_UTM_KEY, parts.join(" "));
    }
  } catch {
    /* ignore */
  }
}

export function clientMeta(path: string, locale: Locale): Omit<
  FeedbackPayload,
  "tool_id" | "source" | "kind" | "message"
> {
  let timezone = "";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    /* ignore */
  }
  const dpr = typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : 1;
  const scheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  let referrer = "";
  let utm = "";
  try {
    referrer =
      sessionStorage.getItem(FIRST_REF_KEY) ||
      cleanUrl(document.referrer) ||
      "(direct)";
    utm = sessionStorage.getItem(FIRST_UTM_KEY) || "";
  } catch {
    referrer = cleanUrl(document.referrer) || "(direct)";
  }
  return {
    ua_short: uaShort(),
    locale,
    timezone,
    viewport: `${window.innerWidth}x${window.innerHeight}@${dpr}`,
    color_scheme: scheme,
    page_path: path,
    referrer,
    utm,
  };
}

export async function submitFeedback(
  payload: FeedbackPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      message: payload.message.trim().slice(0, MAX_MESSAGE),
    }),
    keepalive: true,
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error || `http_${res.status}` };
  }
  return { ok: true };
}

export function toolIdForPath(path: string): string {
  return path.includes("/board") ? "zoneboard" : "landing";
}

function cleanUrl(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`.slice(0, 200);
  } catch {
    return String(raw)
      .replace(/[?#].*/, "")
      .slice(0, 200);
  }
}

function uaShort(): string {
  try {
    const nav = navigator as Navigator & {
      userAgentData?: {
        brands?: { brand: string; version: string }[];
        mobile?: boolean;
        platform?: string;
      };
    };
    const ch = nav.userAgentData;
    if (ch && Array.isArray(ch.brands) && ch.brands.length) {
      const brand = [...ch.brands]
        .reverse()
        .find((b) => b.brand && !/not.?a.?brand/i.test(b.brand));
      const name = brand ? `${brand.brand} ${brand.version}` : "Chromium";
      const form = ch.mobile ? "mobile" : "desktop";
      return `${name} / ${ch.platform || osFromUa()} / ${form}`;
    }
    const ua = navigator.userAgent || "";
    let browser = "Other";
    let ver = "";
    const mEdg = ua.match(/Edg\/(\d+)/);
    const mFf = ua.match(/Firefox\/(\d+)/);
    const mChr = ua.match(/Chrome\/(\d+)/);
    const mSaf = ua.match(/Version\/(\d+).*Safari/);
    if (mEdg) {
      browser = "Edge";
      ver = mEdg[1];
    } else if (mFf) {
      browser = "Firefox";
      ver = mFf[1];
    } else if (mChr) {
      browser = "Chrome";
      ver = mChr[1];
    } else if (mSaf) {
      browser = "Safari";
      ver = mSaf[1];
    }
    const form = /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
    return `${browser}${ver ? ` ${ver}` : ""} / ${osFromUa()} / ${form}`;
  } catch {
    return "";
  }
}

function osFromUa(): string {
  const ua = navigator.userAgent || "";
  if (/Windows NT 10/i.test(ua)) return "Windows";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}
