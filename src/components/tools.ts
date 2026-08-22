import type { MessageKey } from "../i18n/messages";
import type { SportId, ToolId } from "../models/types";
import { usesScreenTool } from "../models/types";

export const TOOL_ITEMS: { id: ToolId; key: MessageKey; short?: MessageKey }[] =
  [
    { id: "select", key: "select" },
    { id: "piece-home", key: "pieceHome", short: "pieceHomeShort" },
    { id: "piece-away", key: "pieceAway", short: "pieceAwayShort" },
    { id: "ball", key: "ball" },
    { id: "pass", key: "pass" },
    { id: "run", key: "run" },
    { id: "dribble", key: "dribble" },
    { id: "zone", key: "zone" },
    { id: "pen", key: "pen" },
    { id: "text", key: "text" },
  ];

export const BASKETBALL_LINE_TOOLS: {
  id: ToolId;
  key: MessageKey;
  short?: MessageKey;
}[] = [{ id: "screen", key: "screen", short: "screenShort" }];

/** 競技に応じたツールレール（バスケのみスクリーン線） */
export function toolItemsForSport(sport: SportId | undefined) {
  if (!sport || !usesScreenTool(sport)) return TOOL_ITEMS;
  const idx = TOOL_ITEMS.findIndex((t) => t.id === "dribble");
  return [
    ...TOOL_ITEMS.slice(0, idx + 1),
    ...BASKETBALL_LINE_TOOLS,
    ...TOOL_ITEMS.slice(idx + 1),
  ];
}
