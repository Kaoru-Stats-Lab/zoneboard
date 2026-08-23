import { UI_FONT_STACK, type TextFontId } from "../models/types";

export const TEXT_FONT_STACKS: Record<TextFontId, string> = {
  system: UI_FONT_STACK,
  display:
    '"Arial Black", "Helvetica Neue", "Segoe UI", "Yu Gothic UI", sans-serif',
  serif: 'Georgia, "Times New Roman", "Yu Mincho", serif',
  mono: '"Consolas", "Courier New", "Noto Sans Mono", monospace',
};

/** SNS・芝生向けプリセット（配信で読めるコントラスト） */
export const TEXT_COLOR_PRESETS = [
  "#ffffff",
  "#fde047",
  "#93c5fd",
  "#fdba74",
  "#f472b6",
  "#111111",
] as const;

export function textFontStack(id: TextFontId | undefined): string {
  return TEXT_FONT_STACKS[id ?? "system"];
}

export function defaultTextFont(): TextFontId {
  return "system";
}
