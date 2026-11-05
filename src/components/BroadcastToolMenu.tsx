import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { toolColorForBoard } from "../canvas/drawingInk";
import { toolItemsForSport } from "./tools";
import { SHAPE_KIND_OPTIONS, ShapeKindIcon } from "./shapeToolUi";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  toolLabel: string;
};

/** 配信モード用。ピッチ常駐レールの代わりに、右下からツールを選ぶ */
export function BroadcastToolMenu({ state, t, toolLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [shapeOpen, setShapeOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeColor = toolColorForBoard(state.board, state.tool);

  useEffect(() => {
    if (!open) setShapeOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      if (shapeOpen) {
        setShapeOpen(false);
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, shapeOpen]);

  return (
    <div className="broadcast-tool-menu" ref={rootRef}>
      {open && (
        <div className="broadcast-tool-pop" role="menu" aria-label={t("tools")}>
          {toolItemsForSport(state.board?.sport).map((tool) => {
            const color = toolColorForBoard(state.board, tool.id);
            const active = state.tool === tool.id;
            if (tool.id === "zone") {
              return (
                <div key={tool.id} className="broadcast-shape-block">
                  <button
                    type="button"
                    role="menuitem"
                    data-tool={tool.id}
                    className={`tool-rail-btn${active ? " active" : ""}`}
                    style={{ "--tool-color": color } as CSSProperties}
                    title={t("shapeToolHint")}
                    aria-expanded={shapeOpen}
                    onClick={() => setShapeOpen((v) => !v)}
                  >
                    {t(tool.short ?? tool.key)}
                    <span className="broadcast-shape-caret" aria-hidden>
                      ›
                    </span>
                  </button>
                  {shapeOpen ? (
                    <div
                      className="broadcast-shape-flyout"
                      role="group"
                      aria-label={t("shapeKindMenu")}
                    >
                      {SHAPE_KIND_OPTIONS.map(({ kind, key }) => (
                        <button
                          key={kind}
                          type="button"
                          role="menuitemradio"
                          className={`tool-rail-shape-kind${
                            state.shapeKind === kind ? " active" : ""
                          }`}
                          aria-checked={state.shapeKind === kind}
                          onClick={() => {
                            state.setShapeKind(kind);
                            state.setTool("zone");
                            setOpen(false);
                            setShapeOpen(false);
                          }}
                        >
                          <ShapeKindIcon kind={kind} />
                          <span>{t(key)}</span>
                        </button>
                      ))}
                      {active && state.shapeKind === "rect" ? (
                        <button
                          type="button"
                          className={`tool-rail-shape-aspect${
                            state.shapeAspectLock ? " active" : ""
                          }`}
                          title={t("shapeAspectLock")}
                          aria-pressed={state.shapeAspectLock}
                          onClick={() =>
                            state.setShapeAspectLock(!state.shapeAspectLock)
                          }
                        >
                          {t("shapeAspectLockShort")}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }
            return (
              <button
                key={tool.id}
                type="button"
                role="menuitem"
                data-tool={tool.id}
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
