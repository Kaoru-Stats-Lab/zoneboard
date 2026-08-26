import { Link } from "react-router-dom";
import { APP_LOCALE } from "../i18n/locale";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { trackEvent } from "../lib/ga";
import { SITE_NAV } from "../site/publisher";
import { CONSENT_BANNER } from "../site/consentCopy";
import { useFeedback } from "./FeedbackProvider";
import { BrandLockup } from "./BrandMark";
import { ConsentBanner, useConsentBanner } from "./ConsentBanner";
import { LpAfterBoard } from "./LpAfterBoard";
import { LpEndCardDemo } from "./LpEndCardDemo";
import { LpHeroBoard } from "./LpHeroBoard";

export function Landing() {
  const t = (k: MessageKey) => messages[APP_LOCALE][k];
  const { openFeedback } = useFeedback();
  const consent = useConsentBanner();

  return (
    <div className="lp">
      <div className="lp-stage">
        <header className="lp-hero">
          <p className="lp-eyebrow">
            <BrandLockup
              className="lp-lockup"
              markClassName="lp-mark"
              scheme="color"
              on="dark"
              word={t("brand")}
            />
          </p>
          <h1>
            {t("lpHeadline1")}
            <br />
            {t("lpHeadline2")}
            <span className="lp-payoff">{t("lpPayoff")}</span>
          </h1>
          <p className="lp-lede">{t("lpLede")}</p>
          <Link
            className="lp-cta"
            to="/board"
            onClick={() => trackEvent("open_board")}
          >
            {t("openBoard")}
          </Link>
          <LpHeroBoard />
        </header>

        <ol className="lp-steps" aria-label={t("lpStepsLabel")}>
          <li>
            <h2>{t("lpPromise1Title")}</h2>
            <p>{t("lpPromise1Body")}</p>
          </li>
          <li>
            <h2>{t("lpPromise2Title")}</h2>
            <p>{t("lpPromise2Body")}</p>
          </li>
          <li>
            <h2>{t("lpPromise3Title")}</h2>
            <p>{t("lpPromise3Body")}</p>
          </li>
        </ol>

        <main className="lp-close">
          <section className="lp-after" aria-labelledby="lp-after-title">
            <h2 id="lp-after-title" className="lp-kicker">
              {t("lpAfterTitle")}
            </h2>
            <p className="lp-close-copy">{t("lpAfterBody")}</p>
            <p className="lp-price">
              {t("lpPriceBody")}{" "}
              <a href="/pricing/">{t("lpPriceLink")}</a>
            </p>
          </section>
          <LpAfterBoard />
          <LpEndCardDemo />
        </main>

        <footer className="lp-footer">
          <p className="lp-footer-brand">
            <BrandLockup
              className="lp-lockup"
              markClassName="lp-mark"
              scheme="color"
              on="dark"
              word={t("brand")}
            />
          </p>
          <div className="lp-footer-row">
            <p>© 2026 zoneboard.app</p>
            <nav className="lp-footer-links" aria-label="Site">
              {SITE_NAV.map((item) => (
                <a key={item.slug} href={`/${item.slug}/`}>
                  {item.labelEn}
                </a>
              ))}
              <button
                type="button"
                className="lp-footer-fb"
                onClick={() => openFeedback("landing")}
              >
                {t("feedbackOpen")}
              </button>
              <button
                type="button"
                className="lp-footer-fb"
                onClick={consent.openChoices}
              >
                {CONSENT_BANNER.choices}
              </button>
            </nav>
          </div>
        </footer>
      </div>
      <ConsentBanner
        open={consent.open}
        onReject={consent.reject}
        onAnalytics={consent.allowAnalytics}
        onAds={consent.allowAds}
      />
    </div>
  );
}
