import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { normalizePieceColor } from "../canvas/pieceInk";

type Props = {
  label: string;
  hexLabel: string;
  value: string;
  onChange: (color: string) => void;
};

/**
 * Compact swatch in the roster row. HEX lives in the popover — not inline —
 * so the prep drawer never grows a horizontal scrollbar.
 */
export function KitColorField({ label, hexLabel, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const hexRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  const placePop = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const width = 184;
    const left = Math.min(
      Math.max(8, r.left),
      window.innerWidth - width - 8,
    );
    const top = Math.min(r.bottom + 6, window.innerHeight - 160);
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    placePop();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    const t = window.setTimeout(() => hexRef.current?.select(), 0);
    const onResize = () => placePop();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const commitHex = () => {
    const next = normalizePieceColor(draft, value);
    onChange(next);
    setDraft(next);
  };

  return (
    <div className="kit-swatch" ref={rootRef}>
      <span className="kit-swatch__label">{label}</span>
      <button
        ref={btnRef}
        type="button"
        className="kit-swatch__btn"
        style={{ background: value }}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        title={value}
        onClick={() => setOpen((v) => !v)}
      />
      {open &&
        pos &&
        createPortal(
          <div
            ref={popRef}
            id={panelId}
            className="kit-color-pop"
            role="dialog"
            aria-label={label}
            style={{ top: pos.top, left: pos.left }}
          >
            <label className="kit-color-pop__picker">
              <span className="zb-feedback-sr">{label}</span>
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setDraft(e.target.value);
                }}
              />
            </label>
            <label className="kit-color-pop__hex">
              <span>{hexLabel}</span>
              <input
                ref={hexRef}
                className="kit-hex"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitHex}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitHex();
                    setOpen(false);
                  }
                }}
              />
            </label>
          </div>,
          document.body,
        )}
    </div>
  );
}
