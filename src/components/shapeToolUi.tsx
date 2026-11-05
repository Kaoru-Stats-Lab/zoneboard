import type { MessageKey } from "../i18n/messages";
import type { ShapeKind } from "../models/types";

/** Circle → Rectangle → Triangle（Photoshop 型フライアウト順） */
export const SHAPE_KIND_OPTIONS: { kind: ShapeKind; key: MessageKey }[] = [
  { kind: "circle", key: "shapeCircle" },
  { kind: "rect", key: "shapeRect" },
  { kind: "triangle", key: "shapeTriangle" },
];

export function shapeKindMessageKey(kind: ShapeKind): MessageKey {
  if (kind === "circle") return "shapeCircle";
  if (kind === "triangle") return "shapeTriangle";
  return "shapeRect";
}

/** Compact glyph for flyout rows (no external icon pack). */
export function ShapeKindIcon({ kind }: { kind: ShapeKind }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 14 14",
    "aria-hidden": true as const,
    focusable: false as const,
  };
  if (kind === "circle") {
    return (
      <svg {...common}>
        <circle
          cx="7"
          cy="7"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (kind === "triangle") {
    return (
      <svg {...common}>
        <path
          d="M7 2.2 L12.2 11.5 H1.8 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect
        x="2.2"
        y="3.2"
        width="9.6"
        height="7.6"
        rx="0.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
