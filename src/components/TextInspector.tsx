import { useEffect, useId, useState } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import type { TextAlign, TextFontId, TextObject } from "../models/types";
import { textRotationDeg } from "../canvas/textGeometry";
import {
  TEXT_SIZE_UI_MAX,
  TEXT_SIZE_UI_MIN,
  TEXT_SIZE_UI_STEP,
  fontSizeToUi,
  uiToFontSize,
} from "../presets/textSizeUi";
import { ColorSwatchField } from "./ColorSwatchField";

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

const ALIGN_OPTIONS: { id: TextAlign; key: MessageKey }[] = [
  { id: "left", key: "textAlignLeft" },
  { id: "center", key: "textAlignCenter" },
  { id: "right", key: "textAlignRight" },
];

const ROTATION_PRESETS = [0, 90, 180, 270] as const;

function currentAlign(obj: TextObject): TextAlign {
  return obj.align === "center" || obj.align === "right" ? obj.align : "left";
}

export function TextInspector({ state, t }: Props) {
  const sizeId = useId();
  const rotId = useId();
  if (state.broadcast || !state.scene || !state.selectedObjectId) return null;
  const selected = state.scene.objects.find(
    (o): o is TextObject =>
      o.id === state.selectedObjectId && o.type === "text",
  );
  if (!selected) return null;

  return (
    <TextInspectorBody
      key={selected.id}
      selected={selected}
      state={state}
      t={t}
      sizeId={sizeId}
      rotId={rotId}
    />
  );
}

function TextInspectorBody({
  selected,
  state,
  t,
  sizeId,
  rotId,
}: {
  selected: TextObject;
  state: AppState;
  t: (k: MessageKey) => string;
  sizeId: string;
  rotId: string;
}) {
  const align = currentAlign(selected);
  const rotDeg = Math.round(textRotationDeg(selected));

  const [sizeDraft, setSizeDraft] = useState(() =>
    String(fontSizeToUi(selected.fontSize)),
  );
  const [rotDraft, setRotDraft] = useState(() => String(rotDeg));

  useEffect(() => {
    setSizeDraft(String(fontSizeToUi(selected.fontSize)));
  }, [selected.id, selected.fontSize]);

  useEffect(() => {
    setRotDraft(String(Math.round(textRotationDeg(selected))));
  }, [selected.id, selected.rotationDeg]);

  const commitSize = () => {
    const parsed = Number(sizeDraft);
    if (!Number.isFinite(parsed)) {
      setSizeDraft(String(fontSizeToUi(selected.fontSize)));
      return;
    }
    const next = uiToFontSize(parsed);
    setSizeDraft(String(fontSizeToUi(next)));
    if (Math.abs(next - selected.fontSize) < 1e-9) return;
    state.patchText(selected.id, { fontSize: next }, true);
  };

  const nudgeSize = (delta: number) => {
    const cur = fontSizeToUi(selected.fontSize);
    const next = uiToFontSize(cur + delta);
    setSizeDraft(String(fontSizeToUi(next)));
    if (Math.abs(next - selected.fontSize) < 1e-9) return;
    state.patchText(selected.id, { fontSize: next }, true);
  };

  const commitRotation = () => {
    const parsed = Number(rotDraft);
    if (!Number.isFinite(parsed)) {
      setRotDraft(String(Math.round(textRotationDeg(selected))));
      return;
    }
    let d = parsed % 360;
    if (d < 0) d += 360;
    if (Math.abs(d - 360) < 1e-9) d = 0;
    setRotDraft(String(Math.round(d)));
    if (Math.abs(d - textRotationDeg(selected)) < 1e-6) return;
    state.patchText(selected.id, { rotationDeg: d }, true);
  };

  const setAlign = (next: TextAlign) => {
    if (currentAlign(selected) === next) return;
    state.patchText(selected.id, { align: next }, true);
  };

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

      <label>
        {t("textFont")}
        <select
          value={selected.fontFamily ?? "system"}
          onChange={(e) =>
            state.patchText(
              selected.id,
              { fontFamily: e.target.value as TextFontId },
              true,
            )
          }
        >
          {FONT_OPTIONS.map(({ id, key }) => (
            <option key={id} value={id}>
              {t(key)}
            </option>
          ))}
        </select>
      </label>

      <div className="text-inspector-field">
        <label htmlFor={sizeId}>{t("textSize")}</label>
        <div className="text-size-row">
          <button
            type="button"
            className="text-stepper-btn"
            aria-label={t("textSizeDecrease")}
            onClick={() => nudgeSize(-TEXT_SIZE_UI_STEP)}
          >
            −
          </button>
          <input
            id={sizeId}
            type="number"
            inputMode="numeric"
            min={TEXT_SIZE_UI_MIN}
            max={TEXT_SIZE_UI_MAX}
            step={TEXT_SIZE_UI_STEP}
            value={sizeDraft}
            aria-describedby={`${sizeId}-hint`}
            onChange={(e) => setSizeDraft(e.target.value)}
            onBlur={commitSize}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === "Escape") {
                setSizeDraft(String(fontSizeToUi(selected.fontSize)));
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          <button
            type="button"
            className="text-stepper-btn"
            aria-label={t("textSizeIncrease")}
            onClick={() => nudgeSize(TEXT_SIZE_UI_STEP)}
          >
            +
          </button>
        </div>
        <p id={`${sizeId}-hint`} className="text-inspector-microhint">
          {t("textSizeHint")}
        </p>
      </div>

      <ColorSwatchField
        label={t("textColor")}
        customLabel={t("textColorCustom")}
        value={selected.color}
        onChange={(color) =>
          state.patchText(selected.id, { color }, true)
        }
      />

      <fieldset className="text-align-field">
        <legend>{t("textAlign")}</legend>
        <div
          className="text-align-segment"
          role="group"
          aria-label={t("textAlign")}
        >
          {ALIGN_OPTIONS.map(({ id, key }) => (
            <button
              key={id}
              type="button"
              className={`text-align-btn text-align-btn--${id}${align === id ? " active" : ""}`}
              aria-label={t(key)}
              title={t(key)}
              aria-pressed={align === id}
              onClick={() => setAlign(id)}
            >
              <span className="text-align-icon" aria-hidden="true">
                {id === "left" ? "⫷" : id === "center" ? "☰" : "⫸"}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="text-inspector-field">
        <label htmlFor={rotId}>{t("textRotation")}</label>
        <div className="text-rotation-row">
          <input
            id={rotId}
            type="number"
            inputMode="numeric"
            step={1}
            value={rotDraft}
            aria-label={t("textRotationAngle")}
            onChange={(e) => setRotDraft(e.target.value)}
            onBlur={commitRotation}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === "Escape") {
                setRotDraft(String(Math.round(textRotationDeg(selected))));
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          <span className="text-rotation-unit" aria-hidden="true">
            °
          </span>
        </div>
        <div
          className="text-rotation-presets"
          role="group"
          aria-label={t("textRotation")}
        >
          {ROTATION_PRESETS.map((deg) => (
            <button
              key={deg}
              type="button"
              className={`text-rotation-preset${rotDeg === deg ? " active" : ""}`}
              aria-pressed={rotDeg === deg}
              aria-label={t(
                deg === 0
                  ? "textRotationPreset0"
                  : deg === 90
                    ? "textRotationPreset90"
                    : deg === 180
                      ? "textRotationPreset180"
                      : "textRotationPreset270",
              )}
              onClick={() => {
                setRotDraft(String(deg));
                if (Math.abs(deg - textRotationDeg(selected)) < 1e-6) return;
                state.patchText(selected.id, { rotationDeg: deg }, true);
              }}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="text-edit-btn"
        onClick={() => state.requestTextEdit(selected.id)}
      >
        {t("textEdit")}
      </button>
    </div>
  );
}
