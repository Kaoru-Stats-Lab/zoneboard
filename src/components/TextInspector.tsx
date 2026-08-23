import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import type { TextObject } from "../models/types";
import { TEXT_COLOR_PRESETS } from "../presets/textStyle";
import type { TextFontId } from "../models/types";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

const FONT_OPTIONS: { id: TextFontId; key: MessageKey }[] = [
  { id: "system", key: "textFontSystem" },
  { id: "display", key: "textFontDisplay" },
  { id: "serif", key: "textFontSerif" },
  { id: "mono", key: "textFontMono" },
];

export function TextInspector({ state, t }: Props) {
  if (state.broadcast || !state.scene || !state.selectedObjectId) return null;
  const selected = state.scene.objects.find(
    (o): o is TextObject =>
      o.id === state.selectedObjectId && o.type === "text",
  );
  if (!selected) return null;

  return (
    <div className="text-inspector" role="dialog" aria-label={t("textProps")}>
      <div className="text-inspector-head">
        <span className="text-inspector-title">{t("textProps")}</span>
        <button
          type="button"
          className="modal-close-btn modal-close-btn--compact"
          aria-label={t("close")}
          onClick={() => state.setSelectedObjectId(null)}
        >
          {t("close")}
        </button>
      </div>
      <p className="text-inspector-hint">{t("textMoveHint")}</p>
      <fieldset className="text-color-field">
        <legend>{t("textColor")}</legend>
        <div className="text-color-swatches">
          {TEXT_COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className={`text-color-swatch${selected.color.toLowerCase() === c ? " active" : ""}`}
              style={{ background: c }}
              aria-label={c}
              aria-pressed={selected.color.toLowerCase() === c}
              onClick={() => state.patchText(selected.id, { color: c })}
            />
          ))}
          <label className="text-color-custom">
            <span className="sr-only">{t("textColorCustom")}</span>
            <input
              type="color"
              value={selected.color}
              onChange={(e) =>
                state.patchText(selected.id, { color: e.target.value })
              }
            />
          </label>
        </div>
      </fieldset>
      <label>
        {t("textFont")}
        <select
          value={selected.fontFamily ?? "system"}
          onChange={(e) =>
            state.patchText(selected.id, {
              fontFamily: e.target.value as TextFontId,
            })
          }
        >
          {FONT_OPTIONS.map(({ id, key }) => (
            <option key={id} value={id}>
              {t(key)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
