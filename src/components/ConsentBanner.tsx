import { useCallback, useEffect, useState } from "react";
import {
  applyConsent,
  consentAllowAdvertising,
  consentAllowAnalytics,
  consentRejectOptional,
  readConsent,
  writeConsent,
} from "../lib/consent";
import { CONSENT_BANNER } from "../site/consentCopy";

export function useConsentBanner() {
  const [open, setOpen] = useState(() => readConsent() === null);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      applyConsent(existing);
      setOpen(false);
    }
  }, []);

  const openChoices = useCallback(() => {
    setOpen(true);
    queueMicrotask(() => {
      document.querySelector<HTMLButtonElement>("#site-consent button")?.focus();
    });
  }, []);

  const reject = useCallback(() => {
    writeConsent(consentRejectOptional());
    setOpen(false);
  }, []);

  const allowAnalytics = useCallback(() => {
    writeConsent(consentAllowAnalytics());
    setOpen(false);
  }, []);

  const allowAds = useCallback(() => {
    writeConsent(consentAllowAdvertising());
    setOpen(false);
  }, []);

  return { open, openChoices, reject, allowAnalytics, allowAds };
}

type BannerProps = {
  open: boolean;
  onReject: () => void;
  onAnalytics: () => void;
  onAds: () => void;
};

export function ConsentBanner({
  open,
  onReject,
  onAnalytics,
  onAds,
}: BannerProps) {
  useEffect(() => {
    document.body.classList.toggle("has-consent", open);
    return () => document.body.classList.remove("has-consent");
  }, [open]);

  return (
    <aside
      id="site-consent"
      className="site-consent site-consent--compact"
      hidden={!open}
      role="region"
      aria-labelledby="site-consent-title"
    >
      <div className="site-consent__inner">
        <p className="site-consent__title" id="site-consent-title">
          {CONSENT_BANNER.title}
        </p>
        <p className="site-consent__copy">{CONSENT_BANNER.copy}</p>
        <div className="site-consent__actions">
          <button type="button" className="site-consent__btn" onClick={onReject}>
            {CONSENT_BANNER.reject}
          </button>
          <button
            type="button"
            className="site-consent__btn"
            onClick={onAnalytics}
          >
            {CONSENT_BANNER.analytics}
          </button>
          <button
            type="button"
            className="site-consent__btn site-consent__btn--allow"
            onClick={onAds}
          >
            {CONSENT_BANNER.ads}
          </button>
          <a href={CONSENT_BANNER.policyHref}>{CONSENT_BANNER.policyLabel}</a>
        </div>
      </div>
    </aside>
  );
}
