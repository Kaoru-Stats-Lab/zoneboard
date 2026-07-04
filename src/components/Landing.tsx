import { Link } from "react-router-dom";
import type { Locale, MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";

type Props = {
  locale: Locale;
  boardPath: string;
};

export function Landing({ locale, boardPath }: Props) {
  const t = (k: MessageKey) => messages[locale][k];
  return (
    <main className="landing">
      <div className="landing-card">
        <p className="eyebrow">zoneboard.app</p>
        <h1>{t("brand")}</h1>
        <p className="tagline">{t("tagline")}</p>
        <ul className="bullets">
          <li>Broadcast mode · canvas ≥80%</li>
          <li>Your logo watermark</li>
          <li>No account · local save · max 3 boards</li>
        </ul>
        <Link className="cta" to={boardPath}>
          {t("openBoard")}
        </Link>
      </div>
    </main>
  );
}
