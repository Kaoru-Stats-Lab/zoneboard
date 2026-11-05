import type { MessageKey } from "../i18n/messages";

type Props = {
  open: boolean;
  fileName: string;
  t: (k: MessageKey) => string;
  onCancel: () => void;
  onDownload: () => void;
  onOverwrite: () => void;
};

/**
 * External change detected before Directory Save.
 * Default path is Cancel (safe). Overwrite requires explicit choice.
 */
export function FileSaveConflictDialog({
  open,
  fileName,
  t,
  onCancel,
  onDownload,
  onOverwrite,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop files-conflict-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="modal files-conflict-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="files-conflict-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="files-conflict-title">{t("filesConflictTitle")}</h2>
        <p className="files-conflict-body">
          {t("filesConflictBody").replace("{name}", fileName)}
        </p>
        <p className="hint-muted">{t("filesConflictHint")}</p>
        <div className="files-conflict-actions">
          <button type="button" className="files-dash-btn" onClick={onCancel}>
            {t("filesConflictCancel")}
          </button>
          <button
            type="button"
            className="files-dash-btn"
            onClick={onDownload}
            title={t("fileSessionDownloadHint")}
          >
            {t("fileSessionDownloadShort")}
          </button>
          <button
            type="button"
            className="files-dash-btn files-dash-btn--danger"
            onClick={onOverwrite}
            title={t("filesConflictOverwriteHint")}
          >
            {t("filesConflictOverwrite")}
          </button>
        </div>
      </div>
    </div>
  );
}
