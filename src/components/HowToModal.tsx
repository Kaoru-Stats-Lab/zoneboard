import { APP_LOCALE } from "../i18n/locale";
import { HOW_TO } from "../i18n/howTo";
import type { MessageKey } from "../i18n/messages";

type Props = {
  open: boolean;
  onClose: () => void;
  t: (k: MessageKey) => string;
};

export function HowToModal({ open, onClose, t }: Props) {
  if (!open) return null;
  const doc = HOW_TO[APP_LOCALE];

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modal how-to-modal"
        role="dialog"
        aria-labelledby="how-to-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2 id="how-to-title">{t("howTo")}</h2>
          <button
            type="button"
            className="modal-close-btn"
            aria-label={t("close")}
            onClick={onClose}
          >
            {t("close")}
          </button>
        </header>
        <div className="how-to-body">
          <p className="how-to-intro">{doc.intro}</p>
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
              {section.keys && section.keys.length > 0 ? (
                <dl className="how-to-keys">
                  {section.keys.map((row) => (
                    <div key={row.combo} className="how-to-key-row">
                      <dt>
                        <kbd>{row.combo}</kbd>
                      </dt>
                      <dd>{row.meaning}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          ))}
        </div>
        <footer>
          <a href="/guide/#place" target="_blank" rel="noreferrer">
            {t("howToGuideLink")}
          </a>
        </footer>
      </div>
    </div>
  );
}
