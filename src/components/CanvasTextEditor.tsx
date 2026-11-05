import { useEffect, useLayoutEffect, useRef } from "react";
import { usesDarkPitchInk, textColorForBoard } from "../canvas/drawingInk";
import { textFontStack } from "../presets/textStyle";
import type { BoardDocument, TextAlign, TextFontId } from "../models/types";

type Props = {
  board: BoardDocument;
  left: number;
  top: number;
  fontSize: number;
  /** CSS px — matches canvas text box width */
  width: number;
  lineHeight?: number;
  /** When true, wrap like canvas (explicit width). Legacy = no wrap. */
  wrap?: boolean;
  /** Clockwise degrees (Canvas/CSS). Editing does not change rotation. */
  rotationDeg?: number;
  /** transform-origin X from overlay left (CSS px) — box centre */
  originX?: number;
  /** transform-origin Y from overlay top (CSS px) — box centre */
  originY?: number;
  /** Match canvas textAlign; default left */
  align?: TextAlign;
  value: string;
  placeholder: string;
  color?: string;
  fontFamily?: TextFontId;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
};

/** キャンバス上に直接置くテキスト入力（Figma / Miro 型） */
export function CanvasTextEditor({
  board,
  left,
  top,
  fontSize,
  width,
  lineHeight = 1.25,
  wrap = true,
  rotationDeg = 0,
  originX,
  originY,
  align = "left",
  value,
  placeholder,
  color,
  fontFamily,
  onChange,
  onCommit,
  onCancel,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);
  const grass = usesDarkPitchInk(board);
  const ink = color ?? textColorForBoard(board);
  const stack = textFontStack(fontFamily);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const syncHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(fontSize * lineHeight, el.scrollHeight)}px`;
  };

  useLayoutEffect(() => {
    syncHeight();
  }, [value, width, fontSize, lineHeight, wrap]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (inputRef.current?.contains(e.target as Node)) return;
      onCommit(valueRef.current);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [onCommit]);

  // Font load can change metrics — remeasure once fonts are ready
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
          if (!cancelled) syncHeight();
        }
      } catch {
        /* ignore */
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontSize, stack]);

  return (
    <textarea
      ref={inputRef}
      className={`canvas-text-editor${grass ? " canvas-text-editor--grass" : ""}${wrap ? "" : " canvas-text-editor--nowrap"}`}
      style={{
        left,
        top,
        width,
        fontSize,
        lineHeight,
        color: ink,
        fontFamily: stack,
        fontWeight: 600,
        textAlign: align,
        transform:
          rotationDeg && Number.isFinite(rotationDeg)
            ? `rotate(${rotationDeg}deg)`
            : undefined,
        transformOrigin:
          originX != null && originY != null
            ? `${originX}px ${originY}px`
            : "center top",
      }}
      value={value}
      placeholder={placeholder}
      rows={1}
      spellCheck={false}
      aria-label={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        requestAnimationFrame(syncHeight);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
          return;
        }
        // IME: composition Enter must not commit
        if (e.key === "Enter" && !e.shiftKey) {
          const ne = e.nativeEvent;
          if (ne.isComposing || ne.keyCode === 229) return;
          e.preventDefault();
          e.stopPropagation();
          onCommit(value);
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );
}
