import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { TOOL_COLORS } from "../models/types";
import { TOOL_ITEMS } from "./tools";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  toolLabel: string;
};

/** 配信モード用。ピッチ常駐レールの代わりに、右下からツールを選ぶ */
export function BroadcastToolMenu({ state, t, toolLabel }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeColor = TOOL_COLORS[state.tool];

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
          {TOOL_ITEMS.map((tool) => {
            const color = TOOL_COLORS[tool.id];
            const active = state.tool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                role="menuitem"
                className={`tool-rail-btn${active ? " active" : ""}`}
                style={{ "--tool-color": color } as CSSProperties}
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
        className={`tool-pill tool-pill-btn${open ? " open" : ""}`}
        style={{ "--tool-color": activeColor } as CSSProperties}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {t("toolIndicator")}: {toolLabel}
      </button>
    </div>
  );
}
