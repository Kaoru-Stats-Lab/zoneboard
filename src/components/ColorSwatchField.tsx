import { TEXT_COLOR_PRESETS } from "../presets/textStyle";

type Props = {
  value: string;
  onChange: (color: string) => void;
  label: string;
  customLabel: string;
  disabled?: boolean;
};

function normHex(c: string): string {
  return c.trim().toLowerCase();
}

/**
 * Shared swatch + native color input for Text and Shape inspectors.
 * Presets come from TEXT_COLOR_PRESETS (single source — do not duplicate).
 */
export function ColorSwatchField({
  value,
  onChange,
  label,
  customLabel,
  disabled = false,
}: Props) {
  const current = normHex(value);
  const presetActive = (TEXT_COLOR_PRESETS as readonly string[]).some(
    (c) => c === current,
  );

  return (
    <fieldset className="text-color-field" disabled={disabled}>
      <legend>{label}</legend>
      <div className="text-color-swatches">
        {TEXT_COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            className={`text-color-swatch${current === c ? " active" : ""}`}
            style={{ background: c }}
            aria-label={c}
            aria-pressed={current === c}
            disabled={disabled}
            onClick={() => onChange(c)}
          />
        ))}
        <label
          className={`text-color-custom${presetActive ? "" : " is-custom-active"}`}
        >
          <span className="sr-only">{customLabel}</span>
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#eab308"}
            disabled={disabled}
            aria-label={customLabel}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      </div>
    </fieldset>
  );
}
