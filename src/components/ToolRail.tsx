import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { toolColorForBoard } from "../canvas/drawingInk";
import { DEFAULT_TOOL_RAIL, type ToolRailPosition } from "../models/types";
import { loadPrefs, savePrefs } from "../storage/persist";
import { toolItemsForSport, toolMessageKey } from "./tools";
import {
  SHAPE_KIND_OPTIONS,
  ShapeKindIcon,
  shapeKindMessageKey,
} from "./shapeToolUi";

const STAGE_MARGIN = 8;
const FLYOUT_MIN_WIDTH = 128;
const SHAPE_MENU_ID = "tool-rail-shape-menu";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

function clampRatio(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function railOffset(
  stage: HTMLElement,
  rail: HTMLElement,
  pos: ToolRailPosition,
): { left: number; top: number } {
  const maxLeft = Math.max(
    0,
    stage.clientWidth - rail.offsetWidth - STAGE_MARGIN * 2,
  );
  const maxTop = Math.max(
    0,
    stage.clientHeight - rail.offsetHeight - STAGE_MARGIN * 2,
  );
  return {
    left: STAGE_MARGIN + clampRatio(pos.xRatio) * maxLeft,
    top: STAGE_MARGIN + clampRatio(pos.yRatio) * maxTop,
  };
}

function ratiosFromOffset(
  stage: HTMLElement,
  rail: HTMLElement,
  left: number,
  top: number,
): ToolRailPosition {
  const maxLeft = Math.max(
    0,
    stage.clientWidth - rail.offsetWidth - STAGE_MARGIN * 2,
  );
  const maxTop = Math.max(
    0,
    stage.clientHeight - rail.offsetHeight - STAGE_MARGIN * 2,
  );
  return {
    xRatio: maxLeft > 0 ? clampRatio((left - STAGE_MARGIN) / maxLeft) : 0,
    yRatio: maxTop > 0 ? clampRatio((top - STAGE_MARGIN) / maxTop) : 0.5,
  };
}

export function ToolRail({ state, t }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const shapeBtnRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<ToolRailPosition>(
    () => loadPrefs().toolRail ?? DEFAULT_TOOL_RAIL,
  );
  const [offset, setOffset] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [shapeFlyout, setShapeFlyout] = useState(false);
  const [flyoutPlace, setFlyoutPlace] = useState<{
    top: number;
    side: "left" | "right";
  }>({ top: 0, side: "right" });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!shapeFlyout) return;
    const btn = shapeBtnRef.current;
    const rail = railRef.current;
    if (!btn || !rail) return;
    const place = () => {
      const b = btn.getBoundingClientRect();
      const r = rail.getBoundingClientRect();
      const spaceRight = window.innerWidth - r.right - 8;
      const side: "left" | "right" =
        spaceRight < FLYOUT_MIN_WIDTH + 6 ? "left" : "right";
      const flyoutH = flyoutRef.current?.offsetHeight ?? 140;
      let top = b.top - r.top;
      const absBottom = r.top + top + flyoutH;
      if (absBottom > window.innerHeight - 8) {
        top = Math.max(0, top - (absBottom - (window.innerHeight - 8)));
      }
      if (r.top + top < 8) top = 8 - r.top;
      setFlyoutPlace({ top, side });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(rail);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [shapeFlyout, offset, pos]);

  useEffect(() => {
    if (!shapeFlyout) return;
    const onDoc = (e: MouseEvent) => {
      const node = e.target as Node;
      if (shapeBtnRef.current?.contains(node)) return;
      if (flyoutRef.current?.contains(node)) return;
      setShapeFlyout(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setShapeFlyout(false);
      shapeBtnRef.current?.focus();
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [shapeFlyout]);

  const layoutRail = useCallback(() => {
    const rail = railRef.current;
    const stage = rail?.closest(".board-stage") as HTMLElement | null;
    if (!rail || !stage) return;
    setOffset(railOffset(stage, rail, pos));
  }, [pos]);

  useLayoutEffect(() => {
    layoutRail();
  }, [layoutRail]);

  useEffect(() => {
    const rail = railRef.current;
    const stage = rail?.closest(".board-stage") as HTMLElement | null;
    if (!stage) return;
    const ro = new ResizeObserver(() => layoutRail());
    ro.observe(stage);
    return () => ro.disconnect();
  }, [layoutRail]);

  const onGripPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const rail = railRef.current;
    const stage = rail?.closest(".board-stage") as HTMLElement | null;
    if (!rail || !stage || offset == null) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originLeft: offset.left,
      originTop: offset.top,
    };
  };

  const onGripPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const rail = railRef.current;
    const stage = rail?.closest(".board-stage") as HTMLElement | null;
    if (!drag || drag.pointerId !== e.pointerId || !rail || !stage) return;
    const nextLeft = drag.originLeft + (e.clientX - drag.startX);
    const nextTop = drag.originTop + (e.clientY - drag.startY);
    const maxLeft = Math.max(
      0,
      stage.clientWidth - rail.offsetWidth - STAGE_MARGIN * 2,
    );
    const maxTop = Math.max(
      0,
      stage.clientHeight - rail.offsetHeight - STAGE_MARGIN * 2,
    );
    setOffset({
      left: Math.min(STAGE_MARGIN + maxLeft, Math.max(STAGE_MARGIN, nextLeft)),
      top: Math.min(STAGE_MARGIN + maxTop, Math.max(STAGE_MARGIN, nextTop)),
    });
  };

  const onGripPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const rail = railRef.current;
    const stage = rail?.closest(".board-stage") as HTMLElement | null;
    if (!drag || drag.pointerId !== e.pointerId || !rail || !stage || !offset)
      return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const next = ratiosFromOffset(stage, rail, offset.left, offset.top);
    setPos(next);
    savePrefs({ ...loadPrefs(), toolRail: next });
  };

  if (state.broadcast) return null;

  const allTools = toolItemsForSport(state.board?.sport);
  const selectTool = allTools.find((tool) => tool.id === "select");
  const scrollTools = allTools.filter((tool) => tool.id !== "select");
  const shapeActive = state.tool === "zone";
  const currentToolLabel = shapeActive
    ? t(shapeKindMessageKey(state.shapeKind))
    : t(toolMessageKey(state.tool));
  const showAspectLock = shapeActive && state.shapeKind === "rect";

  const renderToolBtn = (tool: (typeof allTools)[number]) => {
    const color = toolColorForBoard(state.board, tool.id);
    const active = state.tool === tool.id;
    if (tool.id === "zone") {
      return (
        <button
          key={tool.id}
          ref={shapeBtnRef}
          type="button"
          data-tool={tool.id}
          className={`tool-rail-btn tool-rail-btn--shape${
            shapeActive ? " active" : ""
          }${shapeFlyout ? " flyout-open" : ""}`}
          title={t("shapeToolHint")}
          aria-expanded={shapeFlyout}
          aria-haspopup="menu"
          aria-controls={SHAPE_MENU_ID}
          style={{ "--tool-color": color } as CSSProperties}
          onClick={() => setShapeFlyout((v) => !v)}
        >
          <span className="tool-rail-shape-label">
            {t(tool.short ?? tool.key)}
          </span>
          <span className="tool-rail-shape-chevron-mark" aria-hidden>
            ›
          </span>
        </button>
      );
    }
    return (
      <button
        key={tool.id}
        type="button"
        data-tool={tool.id}
        className={`tool-rail-btn${active ? " active" : ""}${
          tool.id === "select" ? " tool-rail-btn--pinned" : ""
        }`}
        title={tool.hint ? t(tool.hint) : t(tool.key)}
        style={{ "--tool-color": color } as CSSProperties}
        onClick={() => state.setTool(tool.id)}
      >
        {t(tool.short ?? tool.key)}
      </button>
    );
  };

  const railStyle: CSSProperties | undefined =
    offset != null
      ? { left: offset.left, top: offset.top, transform: "none" }
      : undefined;

  return (
    <div
      ref={railRef}
      className="tool-rail"
      role="toolbar"
      aria-label={t("tools")}
      style={railStyle}
    >
      <button
        type="button"
        className="tool-rail-grip"
        aria-label={t("toolRailDrag")}
        title={t("toolRailDrag")}
        onPointerDown={onGripPointerDown}
        onPointerMove={onGripPointerMove}
        onPointerUp={onGripPointerUp}
        onPointerCancel={onGripPointerUp}
      >
        <span className="tool-rail-grip-bars" aria-hidden />
      </button>
      <div
        className="tool-rail-indicator"
        title={`${t("toolIndicator")}: ${currentToolLabel}`}
      >
        <span className="tool-rail-indicator-label">{t("toolIndicator")}</span>
        <div className="tool-rail-indicator-row">
          <span className="tool-rail-indicator-value">{currentToolLabel}</span>
          {showAspectLock ? (
            <button
              type="button"
              className={`tool-rail-shape-aspect${
                state.shapeAspectLock ? " active" : ""
              }`}
              title={t("shapeAspectLock")}
              aria-pressed={state.shapeAspectLock}
              onClick={() => state.setShapeAspectLock(!state.shapeAspectLock)}
            >
              {t("shapeAspectLockShort")}
            </button>
          ) : null}
        </div>
      </div>
      {selectTool ? renderToolBtn(selectTool) : null}
      <div className="tool-rail-scroll">
        {scrollTools.map((tool) => renderToolBtn(tool))}
      </div>
      <button
        type="button"
        className="tool-rail-wipe"
        title={t("wipeDrawingHint")}
        disabled={!(state.scene?.objects.length ?? 0)}
        onClick={() => state.wipeDrawing()}
      >
        {t("wipeDrawing")}
      </button>
      <button
        type="button"
        className="tool-rail-undo"
        title="Ctrl+Z"
        onClick={() => state.undo()}
      >
        {t("undo")}
      </button>
      {shapeFlyout ? (
        <div
          id={SHAPE_MENU_ID}
          ref={flyoutRef}
          className="tool-rail-shape-flyout"
          role="menu"
          aria-label={t("shapeKindMenu")}
          data-side={flyoutPlace.side}
          style={{ top: flyoutPlace.top }}
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
                setShapeFlyout(false);
              }}
            >
              <ShapeKindIcon kind={kind} />
              <span>{t(key)}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
