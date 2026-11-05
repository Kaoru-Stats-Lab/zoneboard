import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { AppState } from "../hooks/useAppState";
import { useFileLibrary } from "../hooks/FileLibraryContext";
import { boardDisplayName } from "../lib/boardLabel";
import { defaultBoardTitle } from "../i18n/localeDefaults";
import type { MessageKey } from "../i18n/messages";
import { isCaptureImportEnabled } from "../lib/captureImportGate";
import { landingPath } from "../site/localeNav";
import type { SaveAsPhase } from "../storage/directorySaveAs";
import { BrandLockup } from "./BrandMark";
import { BoardSwitcher } from "./BoardSwitcher";
import { FileSaveAsDialog } from "./FileSaveAsDialog";
import { FileSaveConflictDialog } from "./FileSaveConflictDialog";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  onOpenHowTo: () => void;
  onOpenFeedback: () => void;
  /** Request Drawer to show / focus the active scene chip. */
  onRevealActiveScene: () => void;
};

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

function fileSessionStatusLabel(
  fs: NonNullable<AppState["fileSession"]>,
  saveAsPhase: SaveAsPhase,
  t: (k: MessageKey) => string,
): string | null {
  if (saveAsPhase === "waiting_permission") {
    return t("filesSaveAsWaitingPermission");
  }
  if (saveAsPhase === "saving" || fs.saveUi === "saving") {
    return t("filesSaving");
  }
  if (saveAsPhase === "verifying") {
    return t("filesSaveAsVerifying");
  }
  if (fs.saveUi === "failed") return t("filesSaveFailed");
  if (fs.saveUi === "permission_denied") return t("filesPermissionDenied");
  if (fs.saveUi === "conflict") return t("filesExternalChanged");
  if (fs.saveUi === "missing") return t("filesSourceMissing");
  if (fs.neverSavedToFile) return t("filesNotSavedYet");
  if (fs.dirty) return t("fileSessionUnsaved");
  if (fs.directorySource) return t("filesNoChanges");
  if (fs.saveUi === "saved" && !fs.dirty) return t("filesSavedToSource");
  return null;
}

/**
 * Document-first top bar (Group 9.1 Option E').
 * Reuses existing File Session save callbacks — does not invent a second save source of truth.
 */
export function DocumentHeader({
  state,
  t,
  onOpenHowTo,
  onOpenFeedback,
  onRevealActiveScene,
}: Props) {
  const library = useFileLibrary();
  const moreId = useId();
  const moreRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsPhase, setSaveAsPhase] = useState<SaveAsPhase>("idle");
  const [saveAsConflict, setSaveAsConflict] = useState<string | null>(null);
  const [saveAsSuggested, setSaveAsSuggested] = useState<string | null>(null);
  const [dlToast, setDlToast] = useState(false);
  const dlToastTimer = useRef<number | null>(null);

  const fs = state.fileSession;
  const isFile = state.isFileSession && fs != null;
  const isNewUnsaved = Boolean(fs?.neverSavedToFile);
  const canDirSave = Boolean(fs?.directorySource);
  const canSaveAs = library.directorySession != null;
  const saveAsBusy = saveAsPhase !== "idle";
  const drawerOpen = state.drawerOpen;

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  useEffect(() => {
    return () => {
      if (dlToastTimer.current) window.clearTimeout(dlToastTimer.current);
    };
  }, []);

  const showDlToast = () => {
    setDlToast(true);
    if (dlToastTimer.current) window.clearTimeout(dlToastTimer.current);
    dlToastTimer.current = window.setTimeout(() => setDlToast(false), 4000);
  };

  const onDownload = () => {
    if (!state.downloadFileSessionJson()) {
      window.alert(t("exportBoardJsonErr"));
      return;
    }
    showDlToast();
  };

  const runSave = async (allowOverwriteConflict: boolean) => {
    const result = await state.saveFileSessionToSource({
      allowOverwriteConflict,
    });
    if (result.ok) {
      if (result.libraryPatch) {
        library.patchDirectoryEntryAfterSave(
          result.libraryPatch.entryId,
          result.libraryPatch,
        );
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
        return;
      }
      if (!result.ok && result.reason === "name_conflict") {
        setSaveAsConflict(result.fileName ?? stem);
        setSaveAsSuggested(result.suggestedName ?? null);
        return;
      }
      if (!result.ok && result.reason === "permission_denied") return;
      if (!result.ok) window.alert(t("filesSaveAsFailed"));
    } finally {
      setSaveAsPhase("idle");
    }
  };

  const onCloseLocal = () => {
    if (fs?.dirty) {
      const ok = window.confirm(t("fileSessionLeaveConfirm"));
      if (!ok) return;
    }
    state.closeFileSession({ discardDraft: true });
    setMoreOpen(false);
  };

  // —— Document identity ——
  let docTitle = "";
  let docLocation: string | null = null;
  let docStatus: string | null = null;
  let docStatusTone: "warn" | "ok" | "err" | "info" = "info";

  if (isFile && fs) {
    docTitle = isNewUnsaved
      ? t("filesNewLocalBoard")
      : fs.sourceName;
    docLocation = t("docLocationLocalFile");
    docStatus = fileSessionStatusLabel(fs, saveAsPhase, t);
    if (fs.saveUi === "failed" || fs.saveUi === "permission_denied") {
      docStatusTone = "err";
    } else if (
      isNewUnsaved ||
      fs.dirty ||
      saveAsPhase === "waiting_permission"
    ) {
      docStatusTone = "warn";
    } else if (docStatus) {
      docStatusTone = "ok";
    }
  } else if (state.board) {
    const idx = state.store.boards.findIndex((b) => b.id === state.board!.id);
    docTitle = boardDisplayName(
      state.board,
      defaultBoardTitle(idx >= 0 ? idx + 1 : 1, state.locale),
    );
    docLocation = t("docLocationBrowser");
    // Store autosave is best-effort; do not claim "Saved" without a verified signal.
    docStatus = null;
  }

  const scene = state.scene;
  const scenes = state.board?.scenes ?? [];
  const sceneIndex = scene ? scenes.findIndex((s) => s.id === scene.id) : -1;
  const sceneLabel = scene?.label?.trim() ?? "";
  const sceneContext =
    sceneIndex >= 0
      ? sceneLabel
        ? `${t("docSceneLabel")} ${sceneIndex + 1} · ${sceneLabel}`
        : `${t("docSceneLabel")} ${sceneIndex + 1}`
      : null;

  // —— Primary save action ——
  type PrimaryKind =
    | "none"
    | "save"
    | "save_to_folder"
    | "download"
    | "retry_save";
  let primary: PrimaryKind = "none";
  if (isFile && fs) {
    if (fs.saveUi === "failed" && canDirSave) {
      primary = "retry_save";
    } else if (isNewUnsaved && canSaveAs) {
      primary = "save_to_folder";
    } else if (isNewUnsaved && !canSaveAs) {
      primary = "download";
    } else if (canDirSave) {
      primary = "save";
    } else {
      primary = "download";
    }
  }

  const primaryDisabled =
    primary === "save"
      ? fs?.saveUi === "saving" || !fs?.dirty || saveAsBusy
      : primary === "retry_save"
        ? fs?.saveUi === "saving" || saveAsBusy
        : saveAsBusy;

  const primaryLabel =
    primary === "save" || primary === "retry_save"
      ? fs?.saveUi === "saving"
        ? t("filesSavingShort")
        : primary === "retry_save"
          ? t("filesRetrySaveShort")
          : t("filesSaveShort")
      : primary === "save_to_folder"
        ? t("filesSaveToFolderShort")
        : primary === "download"
          ? t("filesDownloadBoardShort")
          : "";

  const primaryTitle =
    primary === "save" || primary === "retry_save"
      ? t("filesSaveHint")
      : primary === "save_to_folder"
        ? t("filesSaveToFolderHint")
        : primary === "download"
          ? t("fileSessionDownloadHint")
          : "";

  const onPrimary = () => {
    if (primary === "save" || primary === "retry_save") {
      if (!canDirSave) {
        window.alert(t("filesSaveNeedsFolder"));
        return;
      }
      void runSave(false);
      return;
    }
    if (primary === "save_to_folder") {
      setSaveAsConflict(null);
      setSaveAsSuggested(null);
      setSaveAsOpen(true);
      return;
    }
    if (primary === "download") onDownload();
  };

  const toggleDrawer = () => state.setDrawerOpen(!drawerOpen);

  return (
    <>
      <header className="topbar topbar--document">
        <div className="topbar-left">
          <Link
            className="topbar-brand"
            to={landingPath(state.locale)}
            aria-label={t("brand")}
            onClick={(e) => {
              if (state.isFileSession && state.fileSession?.dirty) {
                const ok = window.confirm(t("fileSessionLeaveConfirm"));
                if (!ok) {
                  e.preventDefault();
                  return;
                }
                state.closeFileSession({ discardDraft: true });
              } else if (state.isFileSession) {
                state.closeFileSession({ discardDraft: true });
              }
            }}
          >
            <BrandLockup
              className="topbar-lockup"
              markClassName="topbar-mark"
              variant="mark"
              scheme="color"
              on="dark"
              word={t("brand")}
            />
          </Link>
          <BoardSwitcher state={state} t={t} />
          <Link
            className="topbar-files-link"
            to="/files"
            title={t("filesLocal")}
          >
            {t("filesLocalShort")}
          </Link>
        </div>

        <div className="topbar-center" aria-live="polite">
          <div className="doc-identity">
            <p className="doc-identity-title" title={docTitle}>
              {docTitle}
            </p>
            <div className="doc-identity-meta">
              {docLocation && (
                <span className="doc-identity-location">{docLocation}</span>
              )}
              {docStatus && (
                <span
                  className={`doc-identity-status doc-identity-status--${docStatusTone}`}
                >
                  {docStatus}
                </span>
              )}
            </div>
          </div>
          {sceneContext && (
            <button
              type="button"
              className="doc-scene-chip"
              title={sceneContext}
              onClick={onRevealActiveScene}
            >
              <span className="doc-scene-chip-text">{sceneContext}</span>
            </button>
          )}
        </div>

        <div className="topbar-right">
          {isCaptureImportEnabled() && state.captureImport && (
            <button
              type="button"
              className="topbar-capture-cancel"
              title={t("captureImportCancel")}
              onClick={() => state.clearCaptureImport()}
            >
              {t("captureImportCancelShort")}
            </button>
          )}

          {primary !== "none" && (
            <button
              type="button"
              className="topbar-primary-save"
              title={primaryTitle}
              disabled={primaryDisabled}
              onClick={onPrimary}
            >
              {primaryLabel}
            </button>
          )}
          {/* Save failed: keep Download next to Retry — not only buried in More. */}
          {primary === "retry_save" && (
            <button
              type="button"
              className="topbar-secondary-dl"
              title={t("fileSessionDownloadHint")}
              onClick={onDownload}
            >
              {t("filesDownloadBoardShort")}
            </button>
          )}

          <div className="topbar-more" ref={moreRef}>
            <button
              type="button"
              className="topbar-icon-btn"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-controls={moreId}
              title={t("docMoreMenu")}
              aria-label={t("docMoreMenu")}
              onClick={() => setMoreOpen((v) => !v)}
            >
              ⋯
            </button>
            {moreOpen && (
              <ul id={moreId} className="topbar-more-menu" role="menu">
                {canSaveAs && (
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreOpen(false);
                        setSaveAsConflict(null);
                        setSaveAsSuggested(null);
                        setSaveAsOpen(true);
                      }}
                    >
                      {t("filesSaveAsShort")}
                    </button>
                  </li>
                )}
                {isFile && (
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreOpen(false);
                        onDownload();
                      }}
                    >
                      {t("fileSessionDownloadShort")}
                    </button>
                  </li>
                )}
                {isFile && fs?.saveUi === "failed" && canDirSave && (
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreOpen(false);
                        void runSave(false);
                      }}
                    >
                      {t("filesRetrySaveShort")}
                    </button>
                  </li>
                )}
                {isFile && (
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={onCloseLocal}
                    >
                      {t("fileSessionCloseShort")}
                    </button>
                  </li>
                )}
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(false);
                      onOpenFeedback();
                    }}
                  >
                    {t("feedbackOpen")}
                  </button>
                </li>
              </ul>
            )}
          </div>

          <button
            type="button"
            className="topbar-icon-btn"
            title={t("howTo")}
            aria-label={t("howTo")}
            onClick={onOpenHowTo}
          >
            ?
          </button>
          <button
            type="button"
            className="topbar-icon-btn"
            title={t("settings")}
            aria-label={t("settings")}
            onClick={() => state.setSettingsOpen(true)}
          >
            ⚙
          </button>
          <button
            type="button"
            className="broadcast-btn"
            onClick={state.enterBroadcast}
          >
            {t("broadcast")}
          </button>
          <button
            type="button"
            className={`topbar-drawer-toggle${drawerOpen ? " active" : ""}`}
            aria-expanded={drawerOpen}
            aria-controls="zb-editor-drawer"
            aria-label={
              drawerOpen ? t("drawerClosePanel") : t("drawerOpenPanel")
            }
            title={drawerOpen ? t("drawerClosePanel") : t("drawerOpenPanel")}
            onClick={toggleDrawer}
          >
            <span className="topbar-drawer-toggle-icon" aria-hidden>
              ▤
            </span>
            <span className="topbar-drawer-toggle-label">
              {t("drawerScenesShort")}
            </span>
          </button>
        </div>

        {dlToast && (
          <p className="topbar-dl-toast" role="status">
            {t("filesDownloadStartedToast")}
          </p>
        )}
      </header>

      {isFile && fs && (
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
      )}
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
