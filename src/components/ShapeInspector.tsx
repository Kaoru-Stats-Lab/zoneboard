import { useEffect, useId, useRef, useState } from "react";
import {
  SHAPE_DEFAULT_FILL_OPACITY,
  clampShapeFillOpacity,
  opacityToTransparencyPct,
  transparencyPctToOpacity,
} from "../models/shapeSanitize";
import type { ShapeObject } from "../models/types";
import { shapeArrangeCan } from "../canvas/shapeArrange";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { ColorSwatchField } from "./ColorSwatchField";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

function strokeOn(obj: ShapeObject): boolean {
  return obj.strokeEnabled !== false;
}

export function ShapeInspector({ state, t }: Props) {
  if (state.broadcast || !state.scene || !state.selectedObjectId) return null;
  const selected = state.scene.objects.find(
    (o): o is ShapeObject =>
      o.id === state.selectedObjectId && o.type === "shape",
  );
  if (!selected) return null;

  return (
    <ShapeInspectorBody
      key={selected.id}
      selected={selected}
      state={state}
      t={t}
    />
  );
}

function ShapeInspectorBody({
  selected,
  state,
  t,
}: {
  selected: ShapeObject;
  state: AppState;
  t: (k: MessageKey) => string;
}) {
  const opacity =
    selected.fillOpacity != null && Number.isFinite(selected.fillOpacity)
      ? selected.fillOpacity
      : SHAPE_DEFAULT_FILL_OPACITY;
  const transparency = opacityToTransparencyPct(opacity);
  const outline = strokeOn(selected);
  const can = shapeArrangeCan(state.scene!.objects, selected.id);

  const [transDraft, setTransDraft] = useState(() => String(transparency));
  const slidingRef = useRef(false);
  const transId = useId();

  useEffect(() => {
    if (!slidingRef.current) {
      setTransDraft(String(opacityToTransparencyPct(opacity)));
    }
  }, [selected.id, opacity]);

  const beginSlide = () => {
    slidingRef.current = true;
    state.captureUndo();
  };

  const endSlide = () => {
    slidingRef.current = false;
    setTransDraft(
      String(
        opacityToTransparencyPct(
          selected.fillOpacity ?? SHAPE_DEFAULT_FILL_OPACITY,
        ),
      ),
    );
  };

  const applyTransparency = (pct: number, record: boolean) => {
    let nextOpacity = transparencyPctToOpacity(pct);
    const patch: { fillOpacity: number; strokeEnabled?: boolean } = {
      fillOpacity: nextOpacity,
    };
    // Fully invisible + no outline → cannot reselect. Force outline ON at 0 opacity.
    if (nextOpacity <= 0 && !outline) {
      patch.strokeEnabled = true;
    }
    state.patchShape(selected.id, patch, record);
  };

  const setOutline = (on: boolean) => {
    if (on === outline) return;
    if (!on && opacity <= 0) {
      // Keep a recoverable fill rather than a dead shape.
      state.patchShape(
        selected.id,
        { strokeEnabled: false, fillOpacity: 0.05 },
        true,
      );
      return;
    }
    state.patchShape(selected.id, { strokeEnabled: on }, true);
  };

  return (
    <div className="text-inspector shape-inspector" role="dialog" aria-label={t("shapeProps")}>
      <div className="text-inspector-head">
        <span className="text-inspector-title">{t("shapeProps")}</span>
        <button
          type="button"
          className="modal-close-btn modal-close-btn--compact"
          aria-label={t("close")}
          onClick={() => state.setSelectedObjectId(null)}
        >
          {t("close")}
        </button>
      </div>

      <ColorSwatchField
        label={t("shapeFillColor")}
        customLabel={t("textColorCustom")}
        value={selected.fillColor}
        onChange={(color) =>
          state.patchShape(selected.id, { fillColor: color }, true)
        }
      />

      <div className="text-inspector-field">
        <label htmlFor={transId}>
          {t("shapeTransparency")}
          <span className="shape-transparency-value"> {transparency}%</span>
        </label>
        <input
          id={transId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={transparency}
          aria-valuetext={`${transparency}%`}
          onPointerDown={beginSlide}
          onPointerUp={endSlide}
          onPointerCancel={() => {
            state.rollbackLastHistory();
            endSlide();
          }}
          onChange={(e) => {
            const pct = Number(e.target.value);
            setTransDraft(String(pct));
            applyTransparency(pct, !slidingRef.current);
          }}
        />
        <input
          type="number"
          className="shape-transparency-number"
          min={0}
          max={100}
          step={1}
          value={transDraft}
          aria-label={t("shapeTransparency")}
          onFocus={() => state.captureUndo()}
          onChange={(e) => {
            setTransDraft(e.target.value);
            const pct = Number(e.target.value);
            if (!Number.isFinite(pct)) return;
            applyTransparency(pct, false);
          }}
          onBlur={() => {
            const pct = Number(transDraft);
            if (!Number.isFinite(pct)) {
              setTransDraft(String(transparency));
              return;
            }
            applyTransparency(pct, false);
            setTransDraft(String(opacityToTransparencyPct(
              clampShapeFillOpacity(1 - Math.min(100, Math.max(0, pct)) / 100),
            )));
          }}
        />
      </div>

      <label className="shape-outline-check check">
        <input
          type="checkbox"
          checked={outline}
          disabled={opacity <= 0 && outline}
          onChange={(e) => setOutline(e.target.checked)}
        />
        {t("shapeOutline")}
      </label>

      <fieldset className="shape-arrange-field">
        <legend>{t("shapeArrange")}</legend>
        <div
          className="shape-arrange-row"
          role="group"
          aria-label={t("shapeArrange")}
        >
          {(
            [
              ["front", "shapeBringToFront", "shapeBringToFrontShort", "⤴"],
              ["forward", "shapeBringForward", "shapeBringForwardShort", "↑"],
              ["backward", "shapeSendBackward", "shapeSendBackwardShort", "↓"],
              ["back", "shapeSendToBack", "shapeSendToBackShort", "⤵"],
            ] as const
          ).map(([op, fullKey, shortKey, icon]) => (
            <button
              key={op}
              type="button"
              className="shape-arrange-btn"
              title={t(fullKey)}
              aria-label={t(fullKey)}
              disabled={!can[op]}
              onClick={() => state.arrangeSelectedShape(op)}
            >
              <span aria-hidden="true">{icon}</span>
              <span className="shape-arrange-btn-label">{t(shortKey)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className="text-edit-btn shape-duplicate-btn"
        onClick={() => state.duplicateSelected()}
      >
        {t("shapeDuplicate")}
      </button>
    </div>
  );
}
