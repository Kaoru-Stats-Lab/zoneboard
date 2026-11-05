import { useEffect, useId, useRef, useState } from "react";
import {
  getSceneThumbDataUrl,
  resolvePreviewScene,
} from "../canvas/sceneThumb";
import type { FileLibraryEntryOk } from "../hooks/FileLibraryContext";
import type { MessageKey } from "../i18n/messages";

const PREVIEW_W = 640;

type Props = {
  entry: FileLibraryEntryOk;
  t: (k: MessageKey) => string;
  onClose: () => void;
  onOpen: (entry: FileLibraryEntryOk) => void | Promise<void>;
  /** Element to restore focus to after close. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

export function FilePreviewModal({
  entry,
  t,
  onClose,
  onOpen,
  returnFocusRef,
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const board = entry.board;
  const initial = resolvePreviewScene(board);
  const [sceneId, setSceneId] = useState(initial?.id ?? "");
  const [img, setImg] = useState<{
    url: string;
    w: number;
    h: number;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  const scene = resolvePreviewScene(board, sceneId);
  const sceneLabel = scene?.label?.trim() || sceneId.slice(0, 6);
  const boardTitle = board.title?.trim() ?? "";
  const showBoardName =
    boardTitle.length > 0 && boardTitle !== entry.displayTitle.trim();

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      returnFocusRef?.current?.focus?.();
    };
  }, [returnFocusRef]);

  useEffect(() => {
    if (!scene) {
      setImg(null);
      setFailed(true);
      return;
    }
    let cancelled = false;
    setFailed(false);
    setImg(null);
    const raf = window.requestAnimationFrame(() => {
      if (cancelled) return;
      const next = getSceneThumbDataUrl(board, scene, PREVIEW_W, {
        cacheScope: entry.id,
        overview: false,
      });
      if (cancelled) return;
      if (!next) {
        setFailed(true);
        setImg(null);
        return;
      }
      setImg(next);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [board, scene, entry.id]);

  return (
    <div
      className="modal-backdrop files-preview-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="modal files-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="files-preview-header">
          <div className="files-preview-heading">
            <h2 id={titleId} className="files-preview-title">
              {entry.displayTitle}
            </h2>
            <p className="files-preview-filename" title={entry.fileName}>
              <span className="sr-only">{t("filesFileNameLabel")}: </span>
              {entry.fileName}
            </p>
            {showBoardName && (
              <p className="files-preview-board-name">
                {t("filesBoardNameLabel")}: {boardTitle}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="modal-close-btn"
            aria-label={t("filesClosePreview")}
            onClick={onClose}
          >
            {t("close")}
          </button>
        </header>

        <div className="files-preview-body">
          <div className="files-preview-stage">
            {img ? (
              <img
                className="files-preview-img"
                src={img.url}
                alt={t("filesThumbAlt")
                  .replace("{board}", entry.displayTitle)
                  .replace("{scene}", sceneLabel)}
                width={img.w}
                height={img.h}
                draggable={false}
              />
            ) : failed ? (
              <p className="files-preview-fallback" role="status">
                {t("filesPreviewUnavailable")}
              </p>
            ) : (
              <p className="files-preview-fallback" role="status">
                {t("filesPreviewLoading")}
              </p>
            )}
          </div>

          {board.scenes.length > 1 && (
            <div className="files-preview-scenes" role="tablist" aria-label={t("filesScene")}>
              {board.scenes.map((s, i) => {
                const label = s.label?.trim() || `${i + 1}`;
                const selected = s.id === scene?.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={
                      selected
                        ? "files-preview-scene is-active"
                        : "files-preview-scene"
                    }
                    onClick={() => setSceneId(s.id)}
                  >
                    <span className="files-preview-scene-idx">{i + 1}</span>
                    <span className="files-preview-scene-label">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
          {board.scenes.length === 1 && (
            <p className="files-preview-scene-one">
              {t("filesScene")}: {sceneLabel}
            </p>
          )}
        </div>

        <footer className="files-preview-footer">
          <button
            type="button"
            className="files-dash-btn"
            onClick={onClose}
          >
            {t("filesClosePreviewShort")}
          </button>
          <button
            type="button"
            className="files-dash-btn files-dash-btn--primary"
            title={t("filesOpenHint")}
            onClick={() => {
              onOpen(entry);
              onClose();
            }}
          >
            {t("filesOpenShort")}
          </button>
        </footer>
      </div>
    </div>
  );
}
