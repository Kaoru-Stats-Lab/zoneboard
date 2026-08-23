import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { toolColorForBoard } from "../canvas/drawingInk";
import { toolItemsForSport } from "./tools";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  toolLabel: string;
};

/** 配信モード用。ピッチ常駐レールの代わりに、右下からツールを選ぶ */
export function BroadcastToolMenu({ state, t, toolLabel }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeColor = toolColorForBoard(state.board, state.tool);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="broadcast-tool-menu" ref={rootRef}>
      {open && (
        <div className="broadcast-tool-pop" role="menu" aria-label={t("tools")}>
          {toolItemsForSport(state.board?.sport).map((tool) => {
            const color = toolColorForBoard(state.board, tool.id);
            const active = state.tool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                role="menuitem"
                className={`tool-rail-btn${active ? " active" : ""}`}
                style={{ "--tool-color": color } as CSSProperties}
                title={tool.hint ? t(tool.hint) : t(tool.key)}
                onClick={() => {
                  state.setTool(tool.id);
                  setOpen(false);
                }}
              >
                {t(tool.short ?? tool.key)}
              </button>
            );
          })}
          <button
            type="button"
            className="tool-rail-wipe"
            title={t("wipeDrawingHint")}
            disabled={!(state.scene?.objects.length ?? 0)}
            onClick={() => {
              state.wipeDrawing();
              setOpen(false);
            }}
          >
            {t("wipeDrawing")}
          </button>
          <button
            type="button"
            className="tool-rail-undo"
            onClick={() => {
              state.undo();
              setOpen(false);
            }}
          >
            {t("undo")}
          </button>
        </div>
      )}
      <button
        type="button"
        className={`broadcast-tool-toggle${open ? " open" : ""}`}
        style={{ "--tool-color": activeColor } as CSSProperties}
        aria-expanded={open}
        aria-haspopup="menu"
        title={`${t("toolIndicator")}: ${toolLabel}`}
        onClick={() => setOpen((v) => !v)}
      >
        {toolLabel}
      </button>
    </div>
  );
}
