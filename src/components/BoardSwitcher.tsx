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
  const board = state.board;
  const atLimit = state.store.boards.length >= maxBoards();

  const currentIndex = board
    ? state.store.boards.findIndex((b) => b.id === board.id)
    : -1;
  const currentLabel = board
    ? boardDisplayName(
        board,
        defaultBoardTitle(currentIndex >= 0 ? currentIndex + 1 : 1, state.locale),
      )
    : t("boards");

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

  const requestNew = useCallback(() => {
    if (!atLimit) {
      state.addBoard();
      setMenuOpen(false);
      return;
    }
    setMenuOpen(false);
    setLimitOpen(true);
  }, [atLimit, state]);

  const confirmReplace = useCallback(
    (replaceId: string) => {
      state.addBoardReplacing(replaceId);
      setLimitOpen(false);
    },
    [state],
  );

  if (!board) return null;

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
          <span className="board-switcher__label">{currentLabel}</span>
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
              const active = b.id === board.id;
              return (
                <li key={b.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    className={active ? "active" : ""}
                    onClick={() => {
                      state.setActiveBoard(b.id);
                      setMenuOpen(false);
                    }}
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
