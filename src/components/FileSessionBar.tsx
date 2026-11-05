import { useState } from "react";
import { Link } from "react-router-dom";
import type { AppState } from "../hooks/useAppState";
import { useFileLibrary } from "../hooks/FileLibraryContext";
import type { MessageKey } from "../i18n/messages";
import type { SaveAsPhase } from "../storage/directorySaveAs";
import { FileSaveAsDialog } from "./FileSaveAsDialog";
import { FileSaveConflictDialog } from "./FileSaveConflictDialog";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

function saveStatusLabel(
  fs: NonNullable<AppState["fileSession"]>,
  t: (k: MessageKey) => string,
): string | null {
  switch (fs.saveUi) {
    case "saving":
      return t("filesSaving");
    case "saved":
      return fs.dirty ? null : t("filesSavedToSource");
    case "failed":
      return t("filesSaveFailed");
    case "permission_denied":
      return t("filesPermissionDenied");
    case "conflict":
      return t("filesExternalChanged");
    case "missing":
      return t("filesSourceMissing");
    case "no_handle":
      return fs.neverSavedToFile ? null : t("filesSaveNeedsFolder");
    default:
      return null;
  }
}

function applyLibraryEntry(
  library: ReturnType<typeof useFileLibrary>,
  entry: NonNullable<
    Extract<
      Awaited<ReturnType<AppState["saveBoardAsToFolder"]>>,
      { ok: true }
    >["libraryEntry"]
  >,
) {
  library.addOrReplaceDirectoryEntry({
    id: entry.id,
    fileName: entry.fileName,
    byteSize: entry.byteSize,
    addedAt: Date.now(),
    status: "ok",
    displayTitle: entry.displayTitle,
    sceneCount: entry.sceneCount,
    exportedAt: null,
    boardUpdatedAt: entry.boardUpdatedAt,
    text: entry.text,
    board: entry.board,
    source: {
      kind: "directory-file",
      fileHandle: entry.fileHandle,
      directorySessionId: entry.directorySessionId,
    },
    openSnapshot: entry.openSnapshot,
  });
}

/**
 * File Session chrome — BoardStore autosave never applies here.
 * Directory Save clears dirty only after write+close verify.
 */
export function FileSessionBar({ state, t }: Props) {
  const library = useFileLibrary();
  const [conflictOpen, setConflictOpen] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsPhase, setSaveAsPhase] = useState<SaveAsPhase>("idle");
  const [saveAsConflict, setSaveAsConflict] = useState<string | null>(null);
  const [saveAsSuggested, setSaveAsSuggested] = useState<string | null>(null);
  const [saveAsNotice, setSaveAsNotice] = useState<string | null>(null);

  if (state.broadcast || !state.isFileSession || !state.fileSession) return null;
  const fs = state.fileSession;
  const isNewUnsaved = fs.neverSavedToFile;
  const canSave = fs.directorySource != null;
  const canSaveAs = library.directorySession != null;
  const statusExtra = saveStatusLabel(fs, t);
  const saveAsBusy = saveAsPhase !== "idle";

  const onClose = () => {
    if (fs.dirty) {
      const ok = window.confirm(t("fileSessionLeaveConfirm"));
      if (!ok) return;
    }
    state.closeFileSession({ discardDraft: true });
  };

  const onDownload = () => {
    if (!state.downloadFileSessionJson()) {
      window.alert(t("exportBoardJsonErr"));
    }
  };

  const runSave = async (allowOverwriteConflict: boolean) => {
    const result = await state.saveFileSessionToSource({
      allowOverwriteConflict,
    });
    if (result.ok) {
      if (result.libraryPatch) {
        const p = result.libraryPatch;
        library.patchDirectoryEntryAfterSave(p.entryId, p);
      }
      setConflictOpen(false);
      return;
    }
    if (result.reason === "conflict") {
      setConflictOpen(true);
      return;
    }
    if (result.reason === "permission_denied") {
      window.alert(
        `${t("filesPermissionDenied")}\n${t("filesPermissionDeniedHint")}`,
      );
      return;
    }
    if (result.reason === "missing") {
      window.alert(t("filesSourceMissing"));
      return;
    }
    if (result.reason !== "busy") {
      window.alert(t("filesSaveFailed"));
    }
  };

  const onSave = () => {
    if (!canSave) {
      window.alert(t("filesSaveNeedsFolder"));
      return;
    }
    void runSave(false);
  };

  const runSaveAs = async (stem: string) => {
    const dir = library.directorySession;
    if (!dir) return;
    setSaveAsConflict(null);
    setSaveAsSuggested(null);
    try {
      const result = await state.saveBoardAsToFolder({
        directoryHandle: dir.handle,
        directorySessionId: dir.id,
        fileName: stem,
        onPhase: setSaveAsPhase,
      });
      if (result.ok && result.libraryEntry) {
        applyLibraryEntry(library, result.libraryEntry);
        setSaveAsOpen(false);
        setSaveAsNotice(
          t("filesSaveAsSuccess")
            .replace("{file}", result.fileName)
            .replace("{folder}", dir.name),
        );
        return;
      }
      if (!result.ok && result.reason === "name_conflict") {
        setSaveAsConflict(result.fileName ?? stem);
        setSaveAsSuggested(result.suggestedName ?? null);
        return;
      }
      if (!result.ok && result.reason === "permission_denied") {
        return;
      }
      if (!result.ok) {
        window.alert(t("filesSaveAsFailed"));
      }
    } finally {
      setSaveAsPhase("idle");
    }
  };

  const openSaveAs = () => {
    setSaveAsConflict(null);
    setSaveAsSuggested(null);
    setSaveAsOpen(true);
  };

  return (
    <>
      <div
        className="file-session-bar"
        role="status"
        aria-label={
          isNewUnsaved ? t("filesNewLocalBoard") : t("fileSessionBadge")
        }
      >
        <div className="file-session-bar-main">
          <span className="file-session-badge">
            {isNewUnsaved ? t("filesNewLocalBoard") : t("fileSessionBadge")}
          </span>
          {canSave && (
            <span className="file-session-folder-tag">{t("filesFolderBadge")}</span>
          )}
          {!isNewUnsaved && (
            <span className="file-session-name" title={fs.sourceName}>
              {fs.sourceName}
            </span>
          )}
          {isNewUnsaved ? (
            <span className="file-session-dirty">{t("filesNotSavedYet")}</span>
          ) : fs.dirty ? (
            <span className="file-session-dirty">{t("fileSessionUnsaved")}</span>
          ) : (
            <span className="file-session-clean">
              {canSave ? t("filesNoChanges") : t("fileSessionSavedHint")}
            </span>
          )}
          {statusExtra && (
            <span
              className={
                fs.saveUi === "saved"
                  ? "file-session-clean"
                  : "file-session-draft-warn"
              }
            >
              {statusExtra}
            </span>
          )}
          {saveAsNotice && (
            <span className="file-session-clean">{saveAsNotice}</span>
          )}
          {fs.lastDownloadRequestedAt != null && fs.dirty && (
            <span className="file-session-dl-note">
              {t("fileSessionDownloadNotSaved")}
            </span>
          )}
          {!fs.draftSaveOk && (
            <span className="file-session-draft-warn" role="alert">
              {t("fileSessionDraftSaveFail")}
            </span>
          )}
        </div>
        <div className="file-session-bar-actions">
          {canSave && (
            <button
              type="button"
              className="file-session-btn"
              title={t("filesSaveHint")}
              disabled={fs.saveUi === "saving" || !fs.dirty}
              onClick={onSave}
            >
              {fs.saveUi === "saving"
                ? t("filesSavingShort")
                : t("filesSaveShort")}
            </button>
          )}
          {canSaveAs && (
            <button
              type="button"
              className={
                isNewUnsaved
                  ? "file-session-btn file-session-btn--primary"
                  : "file-session-btn"
              }
              title={
                isNewUnsaved
                  ? t("filesSaveToFolderHint")
                  : t("filesSaveAsHint")
              }
              disabled={saveAsBusy}
              onClick={openSaveAs}
            >
              {isNewUnsaved
                ? t("filesSaveToFolderShort")
                : t("filesSaveAsShort")}
            </button>
          )}
          <button
            type="button"
            className={
              isNewUnsaved && !canSaveAs
                ? "file-session-btn file-session-btn--primary"
                : "file-session-btn"
            }
            title={t("fileSessionDownloadHint")}
            onClick={onDownload}
          >
            {t("fileSessionDownloadShort")}
          </button>
          <Link
            className="file-session-btn file-session-btn--ghost"
            to="/files"
            title={t("filesLocal")}
          >
            {t("filesBackFilesShort")}
          </Link>
          <button
            type="button"
            className="file-session-btn file-session-btn--ghost"
            title={t("fileSessionClose")}
            onClick={onClose}
          >
            {t("fileSessionCloseShort")}
          </button>
        </div>
      </div>
      <FileSaveConflictDialog
        open={conflictOpen}
        fileName={fs.sourceName}
        t={t}
        onCancel={() => setConflictOpen(false)}
        onDownload={() => {
          onDownload();
          setConflictOpen(false);
        }}
        onOverwrite={() => {
          void runSave(true);
        }}
      />
      {library.directorySession && (
        <FileSaveAsDialog
          open={saveAsOpen}
          folderName={library.directorySession.name}
          initialFileName={
            saveAsConflict ?? state.suggestSaveAsFileName()
          }
          conflictName={saveAsConflict}
          conflictSuggested={saveAsSuggested}
          phase={saveAsPhase}
          t={t}
          onCancel={() => {
            if (saveAsBusy) return;
            setSaveAsOpen(false);
            setSaveAsConflict(null);
            setSaveAsSuggested(null);
          }}
          onConfirm={(stem) => {
            void runSaveAs(stem);
          }}
        />
      )}
    </>
  );
}

/** Store-mode Save As when a folder is connected (does not leave BoardStore). */
export function StoreFolderSaveAsBar({ state, t }: Props) {
  const library = useFileLibrary();
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsPhase, setSaveAsPhase] = useState<SaveAsPhase>("idle");
  const [saveAsConflict, setSaveAsConflict] = useState<string | null>(null);
  const [saveAsSuggested, setSaveAsSuggested] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (state.broadcast || state.isFileSession) return null;
  if (!library.directorySession || !state.board) return null;
  const dir = library.directorySession;
  const saveAsBusy = saveAsPhase !== "idle";

  const runSaveAs = async (stem: string) => {
    setSaveAsConflict(null);
    setSaveAsSuggested(null);
    try {
      const result = await state.saveBoardAsToFolder({
        directoryHandle: dir.handle,
        directorySessionId: dir.id,
        fileName: stem,
        onPhase: setSaveAsPhase,
      });
      if (result.ok && result.libraryEntry) {
        applyLibraryEntry(library, result.libraryEntry);
        setSaveAsOpen(false);
        setNotice(
          t("filesSaveAsSuccess")
            .replace("{file}", result.fileName)
            .replace("{folder}", dir.name),
        );
        return;
      }
      if (!result.ok && result.reason === "name_conflict") {
        setSaveAsConflict(result.fileName ?? stem);
        setSaveAsSuggested(result.suggestedName ?? null);
        return;
      }
      if (!result.ok && result.reason === "permission_denied") {
        return;
      }
      if (!result.ok) window.alert(t("filesSaveAsFailed"));
    } finally {
      setSaveAsPhase("idle");
    }
  };

  return (
    <>
      <div className="file-session-bar file-session-bar--store-saveas" role="status">
        <div className="file-session-bar-main">
          <span className="file-session-folder-tag">{t("filesFolderBadge")}</span>
          <span className="file-session-name" title={dir.name}>
            {dir.name}
          </span>
          {notice ? (
            <span className="file-session-clean">{notice}</span>
          ) : (
            <span className="file-session-clean">{t("filesSaveAsStoreHint")}</span>
          )}
        </div>
        <div className="file-session-bar-actions">
          <button
            type="button"
            className="file-session-btn"
            title={t("filesSaveAsHint")}
            disabled={saveAsBusy}
            onClick={() => {
              setSaveAsConflict(null);
              setSaveAsSuggested(null);
              setSaveAsOpen(true);
            }}
          >
            {t("filesSaveAsShort")}
          </button>
          <Link
            className="file-session-btn file-session-btn--ghost"
            to="/files"
            title={t("filesLocal")}
          >
            {t("filesBackFilesShort")}
          </Link>
        </div>
      </div>
      <FileSaveAsDialog
        open={saveAsOpen}
        folderName={dir.name}
        initialFileName={saveAsConflict ?? state.suggestSaveAsFileName()}
        conflictName={saveAsConflict}
        conflictSuggested={saveAsSuggested}
        phase={saveAsPhase}
        t={t}
        onCancel={() => {
          if (saveAsBusy) return;
          setSaveAsOpen(false);
          setSaveAsConflict(null);
          setSaveAsSuggested(null);
        }}
        onConfirm={(stem) => {
          void runSaveAs(stem);
        }}
      />
    </>
  );
}

export function FileSessionRestorePrompt({ state, t }: Props) {
  if (state.broadcast || !state.pendingFileSessionRestore) return null;
  if (state.isFileSession) return null;
  const pending = state.pendingFileSessionRestore;
  const restoreName = pending.neverSavedToFile
    ? t("filesNewLocalBoard")
    : pending.sourceName;

  return (
    <div className="file-session-restore" role="dialog" aria-modal="true">
      <p className="file-session-restore-text">
        {t("fileSessionRestorePrompt").replace("{name}", restoreName)}
      </p>
      <p className="hint-muted">{t("filesRestoreNoHandleHint")}</p>
      <div className="file-session-bar-actions">
        <button
          type="button"
          className="file-session-btn"
          onClick={() => state.acceptFileSessionRestore()}
        >
          {t("fileSessionRestore")}
        </button>
        <button
          type="button"
          className="file-session-btn file-session-btn--ghost"
          onClick={() => state.dismissFileSessionRestore()}
        >
          {t("fileSessionRestoreDiscard")}
        </button>
      </div>
    </div>
  );
}
