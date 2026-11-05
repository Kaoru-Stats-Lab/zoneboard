import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PortableImportErrorCode } from "../boardio";
import { useAppStateContext } from "../hooks/AppStateContext";
import {
  useFileLibrary,
  type FileLibraryEntry,
  type FileLibraryEntryOk,
} from "../hooks/FileLibraryContext";
import { isDirectoryModeAvailable } from "../lib/fileSystemAccess";
import { messages, type Locale, type MessageKey } from "../i18n/messages";
import { buildDirectorySourceForOpen } from "../storage/fileLibrarySource";
import { BrandLockup } from "./BrandMark";
import { FileLibraryThumb } from "./FileLibraryThumb";
import { FilePreviewModal } from "./FilePreviewModal";
import { FilesFindHelp } from "./FilesFindHelp";

function errorMessageKey(code: PortableImportErrorCode): MessageKey {
  switch (code) {
    case "too_large":
      return "filesErrTooLarge";
    case "parse":
      return "filesErrInvalidJson";
    case "version_new":
    case "version_bad":
      return "filesErrUnsupportedVersion";
    case "format":
    case "structure":
      return "filesErrInvalidBoard";
    case "limit":
      return "importBoardJsonErrLimit";
    case "quota":
      return "importBoardJsonErrQuota";
    default:
      return "importBoardJsonErrUnknown";
  }
}

function formatWhen(
  iso: string | null | undefined,
  locale: string,
): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function FilesDashboard() {
  const state = useAppStateContext();
  const library = useFileLibrary();
  const navigate = useNavigate();
  const t = (k: MessageKey) => messages[state.locale][k];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewEntry, setPreviewEntry] = useState<FileLibraryEntryOk | null>(
    null,
  );
  const previewReturnFocusRef = useRef<HTMLElement | null>(null);
  const [notice, setNotice] = useState<{
    level: "ok" | "error";
    text: string;
  } | null>(null);

  const openPreview = (entry: FileLibraryEntryOk, fromEl?: HTMLElement | null) => {
    previewReturnFocusRef.current = fromEl ?? null;
    setPreviewEntry(entry);
  };

  const onPickFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setNotice(null);
    await library.addFiles(list, state.locale);
    if (inputRef.current) inputRef.current.value = "";
  };

  const guardSessionForOpen = (): boolean => {
    if (!state.isFileSession || !state.fileSession?.dirty) return true;
    return window.confirm(t("fileSessionLeaveConfirm"));
  };

  const onOpen = async (entry: FileLibraryEntryOk) => {
    if (!guardSessionForOpen()) return;
    setBusyId(entry.id);
    setNotice(null);
    try {
      let openEntry = entry;
      if (entry.source.kind === "directory-file") {
        const refreshed = await library.refreshDirectoryEntryForOpen(
          entry,
          state.locale,
        );
        if (refreshed.status !== "ok") {
          setNotice({
            level: "error",
            text: t(errorMessageKey(refreshed.errorCode)),
          });
          return;
        }
        openEntry = refreshed;
      }
      const err = state.openFileSession(openEntry.text, openEntry.fileName, {
        byteLength: openEntry.byteSize,
        // selected-file → null (Download only). directory-file → Handle+snapshot.
        directorySource: buildDirectorySourceForOpen(openEntry),
      });
      if (err) {
        setNotice({ level: "error", text: t(errorMessageKey(err)) });
        return;
      }
      navigate("/board");
    } finally {
      setBusyId(null);
    }
  };

  const onOpenFolder = () => {
    // Must stay in the click stack — no await before showDirectoryPicker.
    void library.openDirectory(state.locale).then((result) => {
      if (result === "ok") {
        setNotice({ level: "ok", text: t("filesFolderOpened") });
      } else if (result === "unavailable") {
        setNotice({ level: "error", text: t("filesFolderUnavailable") });
      } else if (result === "error") {
        setNotice({ level: "error", text: t("filesFolderError") });
      }
      // cancel → keep list
    });
  };

  const dirAvailable = isDirectoryModeAvailable();
  const folderConnected = library.directorySession != null;
  const directoryEntryCount = library.entries.filter(
    (e) => e.source.kind === "directory-file",
  ).length;
  const showFolderOnboard = dirAvailable && !folderConnected;
  const showFolderEmpty =
    folderConnected && directoryEntryCount === 0 && library.entries.length === 0;

  const onImport = (entry: FileLibraryEntryOk) => {
    if (
      !state.confirmDiscardFileSessionIfNeeded(t("fileSessionLeaveConfirm"))
    ) {
      return;
    }
    setBusyId(entry.id);
    setNotice(null);
    try {
      const err = state.importBoardJsonText(entry.text, entry.byteSize);
      if (err) {
        setNotice({ level: "error", text: t(errorMessageKey(err)) });
        return;
      }
      setNotice({ level: "ok", text: t("importBoardJsonOk") });
      navigate("/board");
    } finally {
      setBusyId(null);
    }
  };

  const resumeEditor = () => {
    navigate("/board");
  };

  const leaveToEditorStore = () => {
    if (
      state.isFileSession &&
      !state.confirmDiscardFileSessionIfNeeded(t("fileSessionLeaveConfirm"))
    ) {
      return;
    }
    navigate("/board");
  };

  const onNewLocalBoard = () => {
    if (
      !state.confirmDiscardFileSessionIfNeeded(t("fileSessionLeaveConfirm"))
    ) {
      return;
    }
    if (!state.createNewLocalBoardFileSession()) return;
    navigate("/board");
  };

  return (
    <div className="files-dash">
      <header className="files-dash-top">
        <Link className="files-dash-brand" to="/board" aria-label={t("brand")}>
          <BrandLockup
            className="topbar-lockup"
            markClassName="topbar-mark"
            variant="mark"
            scheme="color"
            on="dark"
            word={t("brand")}
          />
        </Link>
        <div className="files-dash-heading">
          <h1 className="files-dash-title">{t("filesLocal")}</h1>
          {library.directorySession && (
            <p className="files-dash-folder" role="status">
              <span className="files-dash-folder-label">{t("filesFolder")}:</span>{" "}
              <span className="files-dash-folder-name">
                {library.directorySession.name}
              </span>
            </p>
          )}
        </div>
        <div className="files-dash-actions">
          <button
            type="button"
            className="files-dash-btn files-dash-btn--primary"
            title={t("filesNewBoardHint")}
            onClick={onNewLocalBoard}
          >
            {t("filesNewBoardShort")}
          </button>
          {dirAvailable && (
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesChooseFolderHint")}
              disabled={library.directoryLoading}
              onClick={onOpenFolder}
            >
              {library.directoryLoading
                ? t("filesFolderLoadingShort")
                : t("filesChooseFolderShort")}
            </button>
          )}
          <button
            type="button"
            className="files-dash-btn"
            title={t("filesSelectHint")}
            onClick={() => inputRef.current?.click()}
          >
            {t("filesSelectShort")}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".json,.zoneboard.json,application/json,text/json"
            className="sr-only"
            aria-label={t("filesSelect")}
            onChange={(e) => void onPickFiles(e.target.files)}
          />
          {state.isFileSession ? (
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesBackEditor")}
              onClick={resumeEditor}
            >
              {t("filesBackEditorShort")}
            </button>
          ) : (
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesBackEditor")}
              onClick={leaveToEditorStore}
            >
              {t("filesBackEditorShort")}
            </button>
          )}
        </div>
      </header>

      {state.isFileSession && state.fileSession && (
        <div className="files-dash-session" role="status">
          <span className="file-session-badge">
            {state.fileSession.neverSavedToFile
              ? t("filesNewLocalBoard")
              : t("fileSessionBadge")}
          </span>
          {!state.fileSession.neverSavedToFile && (
            <span
              className="file-session-name"
              title={state.fileSession.sourceName}
            >
              {state.fileSession.sourceName}
            </span>
          )}
          {state.fileSession.neverSavedToFile ? (
            <span className="file-session-dirty">{t("filesNotSavedYet")}</span>
          ) : state.fileSession.dirty ? (
            <span className="file-session-dirty">{t("fileSessionUnsaved")}</span>
          ) : (
            <span className="file-session-clean">{t("fileSessionSavedHint")}</span>
          )}
          <button
            type="button"
            className="files-dash-btn files-dash-btn--small"
            onClick={resumeEditor}
          >
            {t("filesResumeEditorShort")}
          </button>
        </div>
      )}

      <p className="files-dash-lead">{t("filesLead")}</p>

      {showFolderOnboard && library.entries.length === 0 && (
        <section className="files-dash-onboard" aria-labelledby="files-onboard-title">
          <h2 id="files-onboard-title" className="files-dash-onboard-title">
            {t("filesOnboardTitle")}
          </h2>
          <p className="files-dash-onboard-body">{t("filesOnboardBody")}</p>
          <p className="files-dash-onboard-note">{t("filesOnboardSessionNote")}</p>
          <div className="files-dash-empty-actions">
            <button
              type="button"
              className="files-dash-btn files-dash-btn--primary"
              title={t("filesChooseFolderHint")}
              disabled={library.directoryLoading}
              onClick={onOpenFolder}
            >
              {library.directoryLoading
                ? t("filesFolderLoadingShort")
                : t("filesChooseFolderShort")}
            </button>
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesNewBoardHint")}
              onClick={onNewLocalBoard}
            >
              {t("filesNewBoardShort")}
            </button>
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesSelectHint")}
              onClick={() => inputRef.current?.click()}
            >
              {t("filesSelectShort")}
            </button>
          </div>
          <p className="files-dash-onboard-alt">{t("filesOnboardAlt")}</p>
          <FilesFindHelp t={t} context="generic" />
        </section>
      )}

      {showFolderOnboard && library.entries.length > 0 && (
        <div className="files-dash-onboard-slim" role="note">
          <span>{t("filesCantFindBoard")}</span>
          <button
            type="button"
            className="files-dash-btn files-dash-btn--small"
            title={t("filesChooseFolderHint")}
            disabled={library.directoryLoading}
            onClick={onOpenFolder}
          >
            {t("filesChooseFolderShort")}
          </button>
          <FilesFindHelp t={t} context="generic" />
        </div>
      )}

      {notice && (
        <p
          className={
            notice.level === "ok"
              ? "files-dash-notice files-dash-notice--ok"
              : "files-dash-notice files-dash-notice--err"
          }
          role="status"
        >
          {notice.text}
        </p>
      )}

      <div className="files-dash-select-help">
        <FilesFindHelp t={t} context="select" />
      </div>

      {library.entries.length === 0 && !showFolderOnboard ? (
        <div className="files-dash-empty">
          <p>{showFolderEmpty ? t("filesFolderEmpty") : t("filesEmpty")}</p>
          <div className="files-dash-empty-actions">
            <button
              type="button"
              className="files-dash-btn files-dash-btn--primary"
              title={t("filesNewBoardHint")}
              onClick={onNewLocalBoard}
            >
              {t("filesNewBoardShort")}
            </button>
            {dirAvailable && (
              <button
                type="button"
                className="files-dash-btn"
                title={t("filesChooseFolderHint")}
                disabled={library.directoryLoading}
                onClick={onOpenFolder}
              >
                {library.directoryLoading
                  ? t("filesFolderLoadingShort")
                  : t("filesChooseFolderShort")}
              </button>
            )}
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesSelectHint")}
              onClick={() => inputRef.current?.click()}
            >
              {t("filesSelectShort")}
            </button>
          </div>
          <FilesFindHelp
            t={t}
            context={showFolderEmpty ? "folder" : "select"}
          />
        </div>
      ) : library.entries.length > 0 ? (
        <>
          {folderConnected && directoryEntryCount === 0 && (
            <div className="files-dash-folder-empty-hint" role="status">
              <p>{t("filesFolderEmpty")}</p>
              <div className="files-dash-empty-actions">
                <button
                  type="button"
                  className="files-dash-btn files-dash-btn--primary"
                  title={t("filesNewBoardHint")}
                  onClick={onNewLocalBoard}
                >
                  {t("filesNewBoardShort")}
                </button>
              </div>
              <FilesFindHelp t={t} context="folder" />
            </div>
          )}
          <div className="files-dash-toolbar">
            <span className="files-dash-count">
              {t("filesCount").replace("{n}", String(library.entries.length))}
            </span>
            <button
              type="button"
              className="files-dash-btn files-dash-btn--ghost"
              title={t("filesClear")}
              onClick={() => {
                library.clearEntries();
                setNotice(null);
              }}
            >
              {t("filesClearShort")}
            </button>
          </div>
          <ul className="files-dash-list">
            {library.entries.map((entry) => (
              <FileLibraryCard
                key={entry.id}
                entry={entry}
                locale={state.locale}
                t={t}
                busy={busyId === entry.id}
                onOpen={(e) => void onOpen(e)}
                onImport={onImport}
                onPreview={openPreview}
                onRemove={() => library.removeEntry(entry.id)}
              />
            ))}
          </ul>
        </>
      ) : null}

      {previewEntry && (
        <FilePreviewModal
          entry={previewEntry}
          t={t}
          returnFocusRef={previewReturnFocusRef}
          onClose={() => setPreviewEntry(null)}
          onOpen={(e) => void onOpen(e)}
        />
      )}
    </div>
  );
}

function FileLibraryCard({
  entry,
  locale,
  t,
  busy,
  onOpen,
  onImport,
  onPreview,
  onRemove,
}: {
  entry: FileLibraryEntry;
  locale: Locale;
  t: (k: MessageKey) => string;
  busy: boolean;
  onOpen: (e: FileLibraryEntryOk) => void;
  onImport: (e: FileLibraryEntryOk) => void;
  onPreview: (e: FileLibraryEntryOk, fromEl?: HTMLElement | null) => void;
  onRemove: () => void;
}) {
  const exported =
    entry.status === "ok"
      ? formatWhen(entry.exportedAt, locale)
      : null;
  const updated =
    entry.status === "ok"
      ? formatWhen(entry.boardUpdatedAt, locale)
      : null;
  const boardTitle =
    entry.status === "ok" ? (entry.board.title?.trim() ?? "") : "";
  const showBoardName =
    entry.status === "ok" &&
    boardTitle.length > 0 &&
    boardTitle !== entry.displayTitle.trim();

  return (
    <li
      className="files-card"
      data-source-kind={entry.source.kind}
      data-file-name={entry.fileName}
    >
      {entry.status === "ok" ? (
        <FileLibraryThumb
          entryId={entry.id}
          board={entry.board}
          displayTitle={entry.displayTitle}
          t={t}
          onOpenPreview={(el) => onPreview(entry, el)}
        />
      ) : (
        <div className="files-card-thumb files-card-thumb--err" aria-hidden />
      )}
      <div className="files-card-body">
        {entry.status === "ok" ? (
          <>
            <h2 className="files-card-title">{entry.displayTitle}</h2>
            <p className="files-card-filename" title={entry.fileName}>
              <span className="sr-only">{t("filesFileNameLabel")}: </span>
              {entry.fileName}
            </p>
            {showBoardName && (
              <p className="files-card-board-name">
                {t("filesBoardNameLabel")}: {boardTitle}
              </p>
            )}
            <p className="files-card-meta">
              <span
                className={
                  entry.source.kind === "directory-file"
                    ? "files-card-source files-card-source--folder"
                    : "files-card-source files-card-source--selected"
                }
              >
                {entry.source.kind === "directory-file"
                  ? t("filesSourceFolder")
                  : t("filesSourceSelected")}
              </span>
              {" · "}
              {t("filesScenes").replace("{n}", String(entry.sceneCount))}
              {" · "}
              {formatBytes(entry.byteSize)}
              {exported && (
                <>
                  {" · "}
                  {t("filesExported").replace("{when}", exported)}
                </>
              )}
              {updated && (
                <>
                  {" · "}
                  {t("filesBoardUpdated").replace("{when}", updated)}
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h2 className="files-card-title files-card-title--err">
              {entry.fileName}
            </h2>
            <p className="files-card-meta files-card-meta--err" role="alert">
              {t(errorMessageKey(entry.errorCode))}
              {" · "}
              {formatBytes(entry.byteSize)}
              {" · "}
              {entry.source.kind === "directory-file"
                ? t("filesSourceFolder")
                : t("filesSourceSelected")}
            </p>
          </>
        )}
      </div>
      <div className="files-card-actions">
        {entry.status === "ok" ? (
          <>
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesPreviewHint")}
              onClick={(e) => onPreview(entry, e.currentTarget)}
            >
              {t("filesPreviewShort")}
            </button>
            <button
              type="button"
              className="files-dash-btn files-dash-btn--primary"
              title={t("filesOpenHint")}
              disabled={busy}
              onClick={() => onOpen(entry)}
            >
              {t("filesOpenShort")}
            </button>
            <button
              type="button"
              className="files-dash-btn"
              title={t("filesImportHint")}
              disabled={busy}
              onClick={() => onImport(entry)}
            >
              {t("filesImportShort")}
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="files-dash-btn files-dash-btn--ghost"
          title={t("filesRemove")}
          onClick={onRemove}
        >
          {t("filesRemoveShort")}
        </button>
      </div>
    </li>
  );
}
