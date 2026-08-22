import { Link } from "react-router-dom";
import { useFeedback } from "./FeedbackProvider";
import type { Locale, MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";

type Props = {
  locale: Locale;
  boardPath: string;
};

export function Landing({ locale, boardPath }: Props) {
  const t = (k: MessageKey) => messages[locale][k];
  const { openFeedback } = useFeedback();
  return (
    <main className="landing">
      <div className="landing-card">
        <p className="eyebrow">zoneboard.app</p>
        <h1>{t("brand")}</h1>
        <p className="tagline">{t("tagline")}</p>
        <ul className="bullets">
          <li>{t("lpBullet1")}</li>
          <li>{t("lpBullet2")}</li>
          <li>{t("lpBullet3")}</li>
        </ul>
        <Link className="cta" to={boardPath}>
          {t("openBoard")}
        </Link>
        <button
          type="button"
          className="landing-fb"
          onClick={() => openFeedback("landing")}
        >
          {t("feedbackOpen")}
        </button>
      </div>
    </main>
  );
}
