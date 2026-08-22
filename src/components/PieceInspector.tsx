import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
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

  return (
    <div className="piece-inspector" role="dialog" aria-label={t("pieceProps")}>
      <div className="piece-inspector-head">
        <span className="piece-inspector-title">{t("pieceProps")}</span>
        <button
          type="button"
          className="piece-inspector-close"
          aria-label={t("close")}
          onClick={() => state.closePieceInspector()}
        >
          ×
        </button>
      </div>
      <label>
        {t("number")}
        <input
          value={selected.number}
          placeholder="18"
          onChange={(e) =>
            state.patchPiece(selected.id, { number: e.target.value })
          }
        />
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
            placeholder="186"
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
            placeholder="88"
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
