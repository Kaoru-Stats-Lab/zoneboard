import { useEffect, useRef } from "react";
import type { PitchOrientation } from "../models/types";
import type { MessageKey } from "../i18n/messages";

type Props = {
  open: boolean;
  t: (k: MessageKey) => string;
  onClose: () => void;
  onPick: (orientation: PitchOrientation) => void;
  /** Optional id for aria-controls */
  id?: string;
};

/**
 * Compact Landscape / Portrait picker for New board.
 * Opening does not create or discard a board — only onPick does.
 */
export function NewBoardOrientationMenu({
  open,
  t,
  onClose,
  onPick,
  id = "new-board-orient-menu",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      id={id}
      className="new-board-orient-menu"
      role="menu"
      aria-label={t("newBoardOrientationMenu")}
    >
      <button
        type="button"
        role="menuitem"
        className="new-board-orient-menu__item"
        onClick={() => onPick("landscape")}
      >
        <span className="new-board-orient-menu__title">
          {t("newBoardLandscape")}
        </span>
        <span className="new-board-orient-menu__hint">
          {t("newBoardLandscapeHint")}
        </span>
      </button>
      <button
        type="button"
        role="menuitem"
        className="new-board-orient-menu__item"
        onClick={() => onPick("portrait")}
      >
        <span className="new-board-orient-menu__title">
          {t("newBoardPortrait")}
        </span>
        <span className="new-board-orient-menu__hint">
          {t("newBoardPortraitHint")}
        </span>
      </button>
    </div>
  );
}
