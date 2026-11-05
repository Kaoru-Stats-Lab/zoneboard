import { useEffect, useId, useRef, useState } from "react";
import {
  saveAsStemFromFileName,
  ZONEBOARD_JSON_EXT,
  type SaveAsPhase,
} from "../storage/directorySaveAs";
import type { MessageKey } from "../i18n/messages";

type Props = {
  open: boolean;
  folderName: string;
  /** Full file name or stem; dialog always edits stem only. */
  initialFileName: string;
  conflictName?: string | null;
  conflictSuggested?: string | null;
  t: (k: MessageKey) => string;
  phase?: SaveAsPhase;
  onCancel: () => void;
  /** Stem only (extension appended by save boundary). */
  onConfirm: (stem: string) => void;
};

function phaseStatusKey(phase: SaveAsPhase): MessageKey | null {
  switch (phase) {
    case "waiting_permission":
      return "filesSaveAsWaitingPermission";
    case "saving":
      return "filesSaving";
    case "verifying":
      return "filesSaveAsVerifying";
    case "checking":
      return "filesSaving";
    default:
      return null;
  }
}

/**
 * Compact Save As — stem input + fixed `.zoneboard.json`.
 * No app-level “really save?” / overwrite confirm (conflict → rename only).
 */
export function FileSaveAsDialog({
  open,
  folderName,
  initialFileName,
  conflictName,
  conflictSuggested,
  t,
  phase = "idle",
  onCancel,
  onConfirm,
}: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stem, setStem] = useState(() => saveAsStemFromFileName(initialFileName));

  useEffect(() => {
    if (!open) return;
    const next = conflictSuggested
      ? saveAsStemFromFileName(conflictSuggested)
      : saveAsStemFromFileName(initialFileName);
    setStem(next);
    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [open, initialFileName, conflictSuggested]);

  if (!open) return null;

  const busy = phase !== "idle";
  const statusKey = phaseStatusKey(phase);
  const showingConflict = Boolean(conflictName);

  const submit = () => {
    if (busy) return;
    onConfirm(stem);
  };

  return (
    <div
      className="modal-backdrop files-conflict-backdrop files-save-as-backdrop"
      role="presentation"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        className="modal files-save-as-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !busy) {
            e.stopPropagation();
            onCancel();
          }
          if (e.key === "Enter" && !busy) {
            e.preventDefault();
            submit();
          }
        }}
      >
        <h2 id={titleId} className="files-save-as-title">
          {t("filesSaveAsTitle")}
        </h2>
        <p className="files-save-as-folder" title={folderName}>
          <span className="files-save-as-folder-label">
            {t("filesSaveAsFolderLabel")}
          </span>{" "}
          <span className="files-save-as-folder-name">{folderName}</span>
        </p>

        <label className="files-save-as-label" htmlFor={`${titleId}-name`}>
          {t("filesSaveAsFileName")}
        </label>
        <div className="files-save-as-name-row">
          <input
            id={`${titleId}-name`}
            ref={inputRef}
            className="files-save-as-input"
            type="text"
            value={stem}
            disabled={busy}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={showingConflict || undefined}
            aria-describedby={
              showingConflict ? `${titleId}-conflict` : `${titleId}-ext`
            }
            onChange={(e) => setStem(e.target.value)}
          />
          <span className="files-save-as-ext" aria-hidden="true">
            {ZONEBOARD_JSON_EXT}
          </span>
        </div>
        <p id={`${titleId}-ext`} className="files-save-as-ext-hint">
          {t("filesSaveAsExtHint")}
        </p>

        {showingConflict && (
          <div
            id={`${titleId}-conflict`}
            className="files-dash-notice files-dash-notice--err"
            role="alert"
          >
            <p className="files-save-as-conflict-lead">
              {t("filesSaveAsConflict").replace("{name}", conflictName ?? "")}
            </p>
            <p className="files-save-as-conflict-hint">
              {t("filesSaveAsConflictHint")}
            </p>
          </div>
        )}

        {statusKey && (
          <p className="files-save-as-status" role="status" aria-live="polite">
            {t(statusKey)}
          </p>
        )}

        <div className="files-conflict-actions files-save-as-actions">
          <button
            type="button"
            className="files-dash-btn"
            disabled={busy}
            onClick={onCancel}
          >
            {t("filesConflictCancel")}
          </button>
          <button
            type="button"
            className="files-dash-btn files-dash-btn--primary"
            disabled={busy || !stem.trim()}
            onClick={submit}
          >
            {t("filesSaveAsConfirmShort")}
          </button>
        </div>
      </div>
    </div>
  );
}
