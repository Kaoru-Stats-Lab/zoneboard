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
import {
  DEFAULT_TOOL_RAIL,
  type ToolRailPosition,
} from "../models/types";
import { loadPrefs, savePrefs } from "../storage/persist";
import { toolItemsForSport, toolMessageKey } from "./tools";

const STAGE_MARGIN = 8;

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
  const [pos, setPos] = useState<ToolRailPosition>(
    () => loadPrefs().toolRail ?? DEFAULT_TOOL_RAIL,
  );
  const [offset, setOffset] = useState<{ left: number; top: number } | null>(
    null,
  );
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
  } | null>(null);

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
  const currentToolLabel = t(toolMessageKey(state.tool));

  const renderToolBtn = (tool: (typeof allTools)[number]) => {
    const color = toolColorForBoard(state.board, tool.id);
    const active = state.tool === tool.id;
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
        <span className="tool-rail-indicator-value">{currentToolLabel}</span>
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
    </div>
  );
}
