import { useEffect, useRef } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { boardDisplayName } from "../lib/boardLabel";
import { defaultBoardTitle } from "../i18n/localeDefaults";

type Props = {
  open: boolean;
  state: AppState;
  t: (k: MessageKey) => string;
  onClose: () => void;
  onReplace: (boardId: string) => void;
};

/** 3 枚上限時: どのボードを差し替えるか選ぶ。 */
export function BoardLimitDialog({
  open,
  state,
  t,
  onClose,
  onReplace,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="board-limit-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form method="dialog" className="board-limit-dialog__inner">
        <h2 className="board-limit-dialog__title">{t("boardLimitPick")}</h2>
        <ul className="board-limit-dialog__list">
          {state.store.boards.map((b, i) => {
            const name = boardDisplayName(
              b,
              defaultBoardTitle(i + 1, state.locale),
            );
            const isActive = b.id === state.board?.id;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  className="board-limit-dialog__pick"
                  onClick={() => onReplace(b.id)}
                >
                  <span className="board-limit-dialog__name">{name}</span>
                  {isActive && (
                    <span className="board-limit-dialog__tag">
                      {t("boardLimitCurrent")}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="board-limit-dialog__actions">
          <button type="button" className="secondary" onClick={onClose}>
            {t("boardLimitCancel")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
