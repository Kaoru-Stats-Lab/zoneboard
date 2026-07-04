import type { MessageKey } from "../i18n/messages";
import type { ToolId } from "../models/types";

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
