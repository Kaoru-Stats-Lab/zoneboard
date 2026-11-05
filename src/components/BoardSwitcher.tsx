import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { boardDisplayName } from "../lib/boardLabel";
import { defaultBoardTitle } from "../i18n/localeDefaults";
import { maxBoards } from "../lib/plan";
import { BoardLimitDialog } from "./BoardLimitDialog";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

export function BoardSwitcher({ state, t }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const atLimit = state.store.boards.length >= maxBoards();

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /** Leave File Session (with confirm) before mutating BoardStore selection. */
  const leaveFileSessionIfNeeded = useCallback((): boolean => {
    if (!state.isFileSession) return true;
    return state.confirmDiscardFileSessionIfNeeded(t("fileSessionLeaveConfirm"));
  }, [state, t]);

  const selectBoard = useCallback(
    (id: string) => {
      if (!leaveFileSessionIfNeeded()) return;
      state.setActiveBoard(id);
      setMenuOpen(false);
    },
    [leaveFileSessionIfNeeded, state],
  );

  const requestNew = useCallback(() => {
    if (!leaveFileSessionIfNeeded()) return;
    if (!atLimit) {
      state.addBoard();
      setMenuOpen(false);
      return;
    }
    setMenuOpen(false);
    setLimitOpen(true);
  }, [atLimit, leaveFileSessionIfNeeded, state]);

  const confirmReplace = useCallback(
    (replaceId: string) => {
      if (!leaveFileSessionIfNeeded()) return;
      state.addBoardReplacing(replaceId);
      setLimitOpen(false);
    },
    [leaveFileSessionIfNeeded, state],
  );

  // Always available (Store list), including during File Session.
  if (state.store.boards.length === 0) return null;

  return (
    <>
      <div className="board-switcher" ref={rootRef}>
        <button
          type="button"
          className={`board-switcher__toggle${menuOpen ? " open" : ""}`}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          title={t("boardSwitcherLabel")}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {/* Fixed label — do not repeat the current board name here. */}
          <span className="board-switcher__label">{t("boardsMenuShort")}</span>
          <span className="board-switcher__chev" aria-hidden>
            ▾
          </span>
        </button>
        {menuOpen && (
          <ul className="board-switcher__menu" role="listbox">
            {state.store.boards.map((b, i) => {
              const name = boardDisplayName(
                b,
                defaultBoardTitle(i + 1, state.locale),
              );
              // In File Session, no Store board is the "working" document.
              const active =
                !state.isFileSession && state.board?.id === b.id;
              return (
                <li key={b.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    className={active ? "active" : ""}
                    onClick={() => selectBoard(b.id)}
                  >
                    {name}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <button
          type="button"
          className="board-switcher__new"
          title={atLimit ? t("boardLimit") : t("newBoard")}
          onClick={requestNew}
        >
          {t("newBoardShort")}
        </button>
      </div>
      <BoardLimitDialog
        open={limitOpen}
        state={state}
        t={t}
        onClose={() => setLimitOpen(false)}
        onReplace={confirmReplace}
      />
    </>
  );
}

/** Drawer 等から共有: 新規ボード（上限時はダイアログ）。 */
export function useNewBoardFlow(state: AppState) {
  const [limitOpen, setLimitOpen] = useState(false);
  const atLimit = state.store.boards.length >= maxBoards();

  const requestNew = useCallback(() => {
    if (state.isFileSession) return false;
    if (!atLimit) {
      state.addBoard();
      return true;
    }
    setLimitOpen(true);
    return false;
  }, [atLimit, state]);

  const confirmReplace = useCallback(
    (replaceId: string) => {
      state.addBoardReplacing(replaceId);
      setLimitOpen(false);
    },
    [state],
  );

  return {
    limitOpen,
    setLimitOpen,
    requestNew,
    confirmReplace,
    atLimit,
  };
}
