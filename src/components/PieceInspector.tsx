import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { normalizePieceNumber } from "../canvas/pieceInk";
import { sportHasGk } from "../models/kits";
import {
  usesHeight,
  usesPreferredFoot,
  usesWeight,
} from "../models/types";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

function parseMetric(raw: string): number | null {
  const n = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

/**
 * 駒カードは選択のたびに出さない。
 * サカ系: 背番号・名前・利き足
 * バスケ: 背番号・名前・身長・体重
 * バレー: 背番号・名前・身長
 */
export function PieceInspector({ state, t }: Props) {
  if (state.broadcast || !state.scene || !state.pieceInspectorId) return null;
  const selected = state.scene.pieces.find(
    (p) => p.id === state.pieceInspectorId,
  );
  if (!selected) return null;
  const sport = state.board?.sport;
  const showFoot = sport ? usesPreferredFoot(sport) : false;
  const showHeight = sport ? usesHeight(sport) : false;
  const showWeight = sport ? usesWeight(sport) : false;
  const normalizedNumber = normalizePieceNumber(selected.number);
  const duplicateNumber =
    normalizedNumber.length > 0 &&
    state.scene.pieces.some(
      (p) =>
        p.id !== selected.id &&
        p.team === selected.team &&
        normalizePieceNumber(p.number) === normalizedNumber,
    );

  return (
    <div className="piece-inspector" role="dialog" aria-label={t("pieceProps")}>
      <div className="piece-inspector-head">
        <span className="piece-inspector-title">{t("pieceProps")}</span>
        <button
          type="button"
          className="modal-close-btn modal-close-btn--compact"
          aria-label={t("close")}
          onClick={() => state.closePieceInspector()}
        >
          {t("close")}
        </button>
      </div>
      <label>
        {t("number")}
        <input
          value={selected.number}
          placeholder={t("pieceNumberPh")}
          onChange={(e) =>
            state.patchPiece(selected.id, { number: e.target.value })
          }
        />
        {duplicateNumber && (
          <p className="piece-inspector-warn" role="status">
            {t("numberDupWarn")}
          </p>
        )}
      </label>
      <label>
        {t("name")}
        <input
          value={selected.label}
          placeholder={t("pieceNamePh")}
          onChange={(e) =>
            state.patchPiece(selected.id, { label: e.target.value })
          }
        />
      </label>
      {sport && sportHasGk(sport) && (
        <label className="check">
          <input
            type="checkbox"
            checked={selected.kit === "gk"}
            onChange={(e) =>
              state.patchPiece(selected.id, {
                kit: e.target.checked ? "gk" : "outfield",
              })
            }
          />
          {t("pieceIsGk")}
        </label>
      )}
      {showFoot && (
        <label>
          {t("preferredFoot")}
          <select
            value={selected.preferredFoot ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              state.patchPiece(selected.id, {
                preferredFoot: v === "L" || v === "R" || v === "B" ? v : null,
              });
            }}
          >
            <option value="">{t("footNone")}</option>
            <option value="L">{t("footL")}</option>
            <option value="R">{t("footR")}</option>
            <option value="B">{t("footB")}</option>
          </select>
        </label>
      )}
      {showHeight && (
        <label>
          {t("heightCm")}
          <input
            inputMode="numeric"
            value={selected.heightCm ?? ""}
            placeholder={t("pieceHeightPh")}
            onChange={(e) =>
              state.patchPiece(selected.id, {
                heightCm: parseMetric(e.target.value),
              })
            }
          />
        </label>
      )}
      {showWeight && (
        <label>
          {t("weightKg")}
          <input
            inputMode="numeric"
            value={selected.weightKg ?? ""}
            placeholder={t("pieceWeightPh")}
            onChange={(e) =>
              state.patchPiece(selected.id, {
                weightKg: parseMetric(e.target.value),
              })
            }
          />
        </label>
      )}
    </div>
  );
}
