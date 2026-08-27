import { useEffect, useState } from "react";
import { normalizePieceColor } from "../canvas/pieceInk";

type Props = {
  label: string;
  hexLabel: string;
  value: string;
  onChange: (color: string) => void;
};

/** Swatch + native picker + HEX text (commit on blur / Enter). */
export function KitColorField({ label, hexLabel, value, onChange }: Props) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    const next = normalizePieceColor(draft, value);
    onChange(next);
    setDraft(next);
    setEditing(false);
  };

  return (
    <label className="kit-swatch">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
      <input
        className="kit-hex"
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        aria-label={hexLabel}
        value={editing ? draft : value}
        onFocus={() => {
          setEditing(true);
          setDraft(value);
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </label>
  );
}
