import { useEffect, useRef, useState } from "react";
import {
  getSceneThumbDataUrl,
  resolvePreviewScene,
  sceneThumbCssSize,
} from "../canvas/sceneThumb";
import type { BoardDocument } from "../models/types";
import type { MessageKey } from "../i18n/messages";

const LIST_THUMB_W = 160;

type Props = {
  entryId: string;
  board: BoardDocument;
  displayTitle: string;
  t: (k: MessageKey) => string;
  onOpenPreview: (fromEl: HTMLElement) => void;
};

type ThumbState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; url: string; w: number; h: number; sceneLabel: string }
  | { kind: "error" };

/**
 * Lazy list thumbnail for File Library cards.
 * Uses overview viewport + entry-scoped cache (no BoardStore / File Session).
 */
export function FileLibraryThumb({
  entryId,
  board,
  displayTitle,
  t,
  onOpenPreview,
}: Props) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [thumb, setThumb] = useState<ThumbState>({ kind: "idle" });
  const fallback = sceneThumbCssSize(LIST_THUMB_W);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setThumb({ kind: "loading" });
    const raf = window.requestAnimationFrame(() => {
      if (cancelled) return;
      const scene = resolvePreviewScene(board);
      if (!scene) {
        setThumb({ kind: "error" });
        return;
      }
      const next = getSceneThumbDataUrl(board, scene, LIST_THUMB_W, {
        cacheScope: entryId,
        overview: true,
      });
      if (cancelled) return;
      if (!next) {
        setThumb({ kind: "error" });
        return;
      }
      setThumb({
        kind: "ready",
        url: next.url,
        w: next.w,
        h: next.h,
        sceneLabel: scene.label?.trim() || scene.id.slice(0, 6),
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [visible, board, entryId]);

  const alt =
    thumb.kind === "ready"
      ? t("filesThumbAlt")
          .replace("{board}", displayTitle)
          .replace("{scene}", thumb.sceneLabel)
      : t("filesPreview");

  return (
    <button
      ref={rootRef}
      type="button"
      className="files-card-thumb-btn"
      title={t("filesPreviewHint")}
      aria-label={alt}
      onClick={(e) => onOpenPreview(e.currentTarget)}
      style={{ width: fallback.w, minHeight: fallback.h }}
    >
      {thumb.kind === "ready" ? (
        <img
          className="files-card-thumb-img"
          src={thumb.url}
          alt=""
          width={thumb.w}
          height={thumb.h}
          draggable={false}
        />
      ) : thumb.kind === "error" ? (
        <span className="files-card-thumb-fallback" role="img" aria-label={t("filesPreviewUnavailable")}>
          {t("filesPreviewUnavailableShort")}
        </span>
      ) : (
        <span className="files-card-thumb-loading" aria-hidden>
          {visible ? t("filesPreviewLoadingShort") : null}
        </span>
      )}
    </button>
  );
}
