import { useEffect, useRef } from "react";
import { usesGrassInk } from "../canvas/drawingInk";
import type { BoardDocument } from "../models/types";

type Props = {
  board: BoardDocument;
  left: number;
  top: number;
  fontSize: number;
  value: string;
  placeholder: string;
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
  value,
  placeholder,
  onChange,
  onCommit,
  onCancel,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);
  const grass = usesGrassInk(board);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (inputRef.current?.contains(e.target as Node)) return;
      onCommit(valueRef.current);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [onCommit]);

  return (
    <textarea
      ref={inputRef}
      className={`canvas-text-editor${grass ? " canvas-text-editor--grass" : ""}`}
      style={{
        left,
        top,
        fontSize,
        minWidth: Math.max(120, fontSize * 6),
        minHeight: fontSize * 1.45,
      }}
      value={value}
      placeholder={placeholder}
      rows={1}
      spellCheck={false}
      aria-label={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
          return;
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onCommit(value);
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );
}
