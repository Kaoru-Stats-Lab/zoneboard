import { Link } from "react-router-dom";
import { APP_LOCALE } from "../i18n/locale";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { useFeedback } from "./FeedbackProvider";

export function Landing() {
  const t = (k: MessageKey) => messages[APP_LOCALE][k];
  const { openFeedback } = useFeedback();

  return (
    <div className="lp">
      <main>
        <header className="lp-hero">
          <p className="lp-eyebrow">zoneboard.app</p>
          <h1>
            {t("lpHeadline1")}
            <br />
            {t("lpHeadline2")}
            <span className="lp-payoff">{t("lpPayoff")}</span>
          </h1>
          <p className="lp-lede">{t("lpLede")}</p>
          <Link className="lp-cta" to="/board">
            {t("openBoard")}
          </Link>

          <figure className="lp-hero-board" aria-hidden="true">
            <div className="lp-board-frame">
              <div className="lp-board-rail">
                <span />
                <span />
                <span />
              </div>
              <div className="lp-board-pitch">
                <div className="lp-board-line lp-board-line--half" />
                <div className="lp-board-line lp-board-line--circle" />
                <svg
                  className="lp-board-path lp-board-path--pass"
                  viewBox="0 0 200 120"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="28"
                    y1="88"
                    x2="168"
                    y2="32"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="8 10"
                  />
                </svg>
                <svg
                  className="lp-board-path lp-board-path--dribble"
                  viewBox="0 0 200 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 36 72 Q 58 48 80 62 T 124 38 T 172 52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </div>
            <figcaption>{t("lpHeroCaption")}</figcaption>
          </figure>
        </header>

        <section className="lp-promises" aria-label="What this is">
          <article>
            <h2>{t("lpPromise1Title")}</h2>
            <p>{t("lpPromise1Body")}</p>
          </article>
          <article>
            <h2>{t("lpPromise2Title")}</h2>
            <p>{t("lpPromise2Body")}</p>
          </article>
          <article>
            <h2>{t("lpPromise3Title")}</h2>
            <p>{t("lpPromise3Body")}</p>
          </article>
        </section>

        <section id="why" className="lp-creed">
          <h2>{t("lpCreedTitle")}</h2>
          <p>{t("lpCreedBody")}</p>
        </section>
      </main>

      <footer className="lp-footer">
        <p className="lp-footer-brand">{t("brand")}</p>
        <div className="lp-footer-row">
          <p>© 2026 zoneboard.app</p>
          <nav className="lp-footer-links" aria-label="Site">
            <a href="#why">{t("lpFooterWhy")}</a>
            <button
              type="button"
              className="lp-footer-fb"
              onClick={() => openFeedback("landing")}
            >
              {t("feedbackOpen")}
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
