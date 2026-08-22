import type { CSSProperties } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { TOOL_COLORS } from "../models/types";
import { toolItemsForSport } from "./tools";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

export function ToolRail({ state, t }: Props) {
  if (state.broadcast) return null;

  return (
    <div className="tool-rail" role="toolbar" aria-label={t("tools")}>
      {toolItemsForSport(state.board?.sport).map((tool) => {
        const color = TOOL_COLORS[tool.id];
        const active = state.tool === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            className={`tool-rail-btn${active ? " active" : ""}`}
            title={t(tool.key)}
            style={{ "--tool-color": color } as CSSProperties}
            onClick={() => state.setTool(tool.id)}
          >
            {t(tool.short ?? tool.key)}
          </button>
        );
      })}
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
