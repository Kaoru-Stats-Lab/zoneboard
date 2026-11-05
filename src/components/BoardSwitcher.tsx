import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import type { PitchOrientation } from "../models/types";
import { boardDisplayName } from "../lib/boardLabel";
import { defaultBoardTitle } from "../i18n/localeDefaults";
import { maxBoards } from "../lib/plan";
import { BoardLimitDialog } from "./BoardLimitDialog";
import { NewBoardOrientationMenu } from "./NewBoardOrientationMenu";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

export function BoardSwitcher({ state, t }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orientOpen, setOrientOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [pendingOrient, setPendingOrient] = useState<PitchOrientation | null>(
    null,
  );
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
      setOrientOpen(false);
    },
    [leaveFileSessionIfNeeded, state],
  );

  const createWithOrientation = useCallback(
    (orientation: PitchOrientation) => {
      setOrientOpen(false);
      setMenuOpen(false);
      if (!leaveFileSessionIfNeeded()) return;
      if (!atLimit) {
        state.addBoard({ pitchOrientation: orientation });
        return;
      }
      setPendingOrient(orientation);
      setLimitOpen(true);
    },
    [atLimit, leaveFileSessionIfNeeded, state],
  );

  const confirmReplace = useCallback(
    (replaceId: string) => {
      if (!leaveFileSessionIfNeeded()) return;
      state.addBoardReplacing(replaceId, {
        pitchOrientation: pendingOrient ?? undefined,
      });
      setPendingOrient(null);
      setLimitOpen(false);
    },
    [leaveFileSessionIfNeeded, pendingOrient, state],
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
          onClick={() => {
            setOrientOpen(false);
            setMenuOpen((v) => !v);
          }}
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
        <div className="board-switcher__new-wrap">
          <button
            type="button"
            className="board-switcher__new"
            title={atLimit ? t("boardLimit") : t("newBoard")}
            aria-expanded={orientOpen}
            aria-haspopup="menu"
            aria-controls="board-switcher-orient-menu"
            onClick={() => {
              setMenuOpen(false);
              setOrientOpen((v) => !v);
            }}
          >
            {t("newBoardShort")}
          </button>
          <NewBoardOrientationMenu
            id="board-switcher-orient-menu"
            open={orientOpen}
            t={t}
            onClose={() => setOrientOpen(false)}
            onPick={createWithOrientation}
          />
        </div>
      </div>
      <BoardLimitDialog
        open={limitOpen}
        state={state}
        t={t}
        onClose={() => {
          setLimitOpen(false);
          setPendingOrient(null);
        }}
        onReplace={confirmReplace}
      />
    </>
  );
}

/** Drawer 等から共有: 新規ボード（上限時はダイアログ）。Orientation は呼び出し側で選ぶ。 */
export function useNewBoardFlow(state: AppState) {
  const [limitOpen, setLimitOpen] = useState(false);
  const [pendingOrient, setPendingOrient] = useState<PitchOrientation | null>(
    null,
  );
  const atLimit = state.store.boards.length >= maxBoards();

  const requestNew = useCallback(
    (orientation: PitchOrientation = "landscape") => {
      if (state.isFileSession) return false;
      if (!atLimit) {
        state.addBoard({ pitchOrientation: orientation });
        return true;
      }
      setPendingOrient(orientation);
      setLimitOpen(true);
      return false;
    },
    [atLimit, state],
  );

  const confirmReplace = useCallback(
    (replaceId: string) => {
      state.addBoardReplacing(replaceId, {
        pitchOrientation: pendingOrient ?? undefined,
      });
      setPendingOrient(null);
      setLimitOpen(false);
    },
    [pendingOrient, state],
  );

  const closeLimit = useCallback(() => {
    setLimitOpen(false);
    setPendingOrient(null);
  }, []);

  return {
    limitOpen,
    setLimitOpen,
    closeLimit,
    requestNew,
    confirmReplace,
    atLimit,
    pendingOrient,
    setPendingOrient,
  };
}
