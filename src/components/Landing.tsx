import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { APP_LOCALE } from "../i18n/locale";
import type { Locale, MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { trackEvent } from "../lib/ga";
import { hasPersistedStore } from "../storage/persist";
import { SITE_NAV } from "../site/publisher";
import { CONSENT_BANNER } from "../site/consentCopy";
import { isProductHuntLaunchVisible, PRODUCT_HUNT } from "../site/productHunt";
import { useFeedback } from "./FeedbackProvider";
import { BrandLockup } from "./BrandMark";
import { ConsentBanner, useConsentBanner } from "./ConsentBanner";
import { LpHeroBoard } from "./LpHeroBoard";
import { ProductHuntFollowBadge } from "./ProductHuntBadge";

/** note は空文字なら出さない（細文は例外だけ） */
const CAN_ITEMS: { line: MessageKey; note: MessageKey }[] = [
  { line: "lpCan1", note: "lpCan1Note" },
  { line: "lpCan2", note: "lpCan2Note" },
  { line: "lpCan3", note: "lpCan3Note" },
  { line: "lpCan4", note: "lpCan4Note" },
  { line: "lpCan5", note: "lpCan5Note" },
];

export function Landing({ locale = APP_LOCALE }: { locale?: Locale }) {
  const t = (k: MessageKey) => messages[locale][k];
  const boardHref = (query?: Record<string, string>) => {
    if (locale === "en" && !query) return "/board";
    const params = new URLSearchParams(query);
    if (locale !== "en") params.set("lang", locale);
    const q = params.toString();
    return q ? `/board?${q}` : "/board";
  };
  const { openFeedback } = useFeedback();
  const consent = useConsentBanner();
  const [savedBoard, setSavedBoard] = useState(false);

  useEffect(() => {
    setSavedBoard(hasPersistedStore());
  }, []);

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
          {isProductHuntLaunchVisible() ? (
            <p className="lp-ph-launch">
              <a
                href={PRODUCT_HUNT.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("lpPhLaunch")}
              </a>
            </p>
          ) : null}
          <h1>
            {t("lpHeadline1")}
            <br />
            {t("lpHeadline2")}
            <span className="lp-payoff">{t("lpPayoff")}</span>
          </h1>
          <p className="lp-lede">{t("lpLede")}</p>
          {savedBoard ? (
            <div className="lp-cta-row">
              <p className="lp-saved-hint">{t("lpSavedHint")}</p>
              <div className="lp-cta-pair">
                <Link
                  className="lp-cta"
                  to={boardHref()}
                  onClick={() => trackEvent("open_board")}
                >
                  {t("openBoardContinue")}
                </Link>
                <Link
                  className="lp-cta lp-cta--secondary"
                  to={boardHref({ new: "1" })}
                  onClick={() => trackEvent("open_board")}
                >
                  {t("openBoardNew")}
                </Link>
              </div>
            </div>
          ) : (
            <Link
              className="lp-cta"
              to={boardHref()}
              onClick={() => trackEvent("open_board")}
            >
              {t("openBoard")}
            </Link>
          )}
          <LpHeroBoard locale={locale} />
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

        <section className="lp-can" aria-labelledby="lp-can-title">
          <h2 id="lp-can-title" className="lp-can-heading">
            {t("lpCanTitle")}
          </h2>
          <p className="lp-can-lead">{t("lpCanLead")}</p>
          <ul className="lp-can-list">
            {CAN_ITEMS.map(({ line, note }) => {
              const noteText = t(note);
              return (
                <li key={line}>
                  <p className="lp-can-line">{t(line)}</p>
                  {noteText ? <p className="lp-can-note">{noteText}</p> : null}
                </li>
              );
            })}
          </ul>
        </section>

        <main className="lp-close lp-close--solo">
          <section aria-labelledby="lp-close-title">
            <h2 id="lp-close-title" className="lp-close-heading">
              {t("lpCloseTitle")}
            </h2>
            <p className="lp-close-copy">{t("lpCloseBody")}</p>
            <p className="lp-price">
              <a href="/materials/">{t("lpMaterialsLink")}</a>
              <span className="lp-price-sep" aria-hidden="true">
                ·
              </span>
              {t("lpPriceBody")}{" "}
              <a href="/pricing/">{t("lpPriceLink")}</a>
            </p>
            {savedBoard ? (
              <div className="lp-cta-row lp-cta-row--close">
                <div className="lp-cta-pair">
                  <Link
                    className="lp-cta"
                    to={boardHref()}
                    onClick={() => trackEvent("open_board")}
                  >
                    {t("openBoardContinue")}
                  </Link>
                  <Link
                    className="lp-cta lp-cta--secondary"
                    to={boardHref({ new: "1" })}
                    onClick={() => trackEvent("open_board")}
                  >
                    {t("openBoardNew")}
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                className="lp-cta lp-cta--close"
                to={boardHref()}
                onClick={() => trackEvent("open_board")}
              >
                {t("lpCloseCta")}
              </Link>
            )}
          </section>
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
          <ProductHuntFollowBadge className="lp-ph-badge" />
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
