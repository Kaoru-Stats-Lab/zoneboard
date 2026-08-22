import { useEffect, useState } from "react";
import type { MessageKey } from "../i18n/messages";
import type { Locale } from "../i18n/messages";
import {
  clientMeta,
  submitFeedback,
  toolIdForPath,
  type FeedbackKind,
  type FeedbackSource,
} from "../lib/feedbackClient";

const KINDS: { id: FeedbackKind; key: MessageKey }[] = [
  { id: "bug", key: "feedbackKindBug" },
  { id: "ux", key: "feedbackKindUx" },
  { id: "feature", key: "feedbackKindFeature" },
  { id: "other", key: "feedbackKindOther" },
];

type Props = {
  open: boolean;
  source: FeedbackSource;
  locale: Locale;
  onClose: () => void;
  t: (k: MessageKey) => string;
};

export function FeedbackPanel({ open, source, locale, onClose, t }: Props) {
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKind("bug");
    setMessage("");
    setStatus(null);
    setSending(false);
  }, [open, source]);

  if (!open) return null;

  const onSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setStatus({ text: t("feedbackTooShort"), error: true });
      return;
    }
    setSending(true);
    setStatus({ text: t("feedbackSending"), error: false });
    const path = location.pathname || "/";
    const result = await submitFeedback({
      tool_id: toolIdForPath(path),
      source,
      kind,
      message: trimmed,
      ...clientMeta(path, locale),
    });
    if (!result.ok) {
      const text =
        result.error === "feedback_not_configured"
          ? t("feedbackNotConfigured")
          : result.error === "rate_limited"
            ? t("feedbackRateLimited")
            : t("feedbackFailed");
      setStatus({ text, error: true });
      setSending(false);
      return;
    }
    setStatus({ text: t("feedbackSent"), error: false });
    setTimeout(() => {
      onClose();
      setSending(false);
    }, 900);
  };

  return (
    <div
      className="zb-feedback-panel"
      role="dialog"
      aria-label={t("feedbackOpen")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="zb-feedback-panel__card">
        <div className="zb-feedback-panel__head">
          <p className="zb-feedback-panel__title">{t("feedbackOpen")}</p>
          <button
            type="button"
            className="zb-feedback-panel__x"
            aria-label={t("feedbackClose")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="zb-feedback-panel__hint">{t("feedbackHint")}</p>
        <fieldset className="zb-feedback-panel__kinds">
          <legend className="zb-feedback-sr">{t("feedbackOpen")}</legend>
          {KINDS.map(({ id, key }) => (
            <label key={id} className="zb-feedback-panel__kind">
              <input
                type="radio"
                name="zb-fb-kind"
                value={id}
                checked={kind === id}
                onChange={() => setKind(id)}
              />
              <span>{t(key)}</span>
            </label>
          ))}
        </fieldset>
        <label className="zb-feedback-panel__label" htmlFor="zb-fb-message">
          {t("feedbackMessage")}
        </label>
        <textarea
          id="zb-fb-message"
          className="zb-feedback-panel__ta"
          rows={4}
          maxLength={500}
          placeholder={t("feedbackPlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="zb-feedback-panel__actions">
          <button
            type="button"
            className="active zb-feedback-panel__submit"
            disabled={sending}
            onClick={() => void onSubmit()}
          >
            {t("feedbackSubmit")}
          </button>
          <button type="button" className="zb-feedback-panel__ghost" onClick={onClose}>
            {t("feedbackClose")}
          </button>
        </div>
        {status ? (
          <p
            className={`zb-feedback-panel__status${status.error ? " zb-feedback-panel__status--err" : ""}`}
            role="status"
          >
            {status.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
