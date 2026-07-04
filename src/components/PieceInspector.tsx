import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

/**
 * 駒カードは選択のたびに出さない。
 * トリプルクリック / 右クリックで開く（欲しいときだけその場で）。
 * 載せるのは背番号・名前・利き足のみ（PL 百科は載せない）。
 */
export function PieceInspector({ state, t }: Props) {
  if (state.broadcast || !state.scene || !state.pieceInspectorId) return null;
  const selected = state.scene.pieces.find(
    (p) => p.id === state.pieceInspectorId,
  );
  if (!selected) return null;

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
          onChange={(e) =>
            state.patchPiece(selected.id, { number: e.target.value })
          }
        />
      </label>
      <label>
        {t("name")}
        <input
          value={selected.label}
          onChange={(e) =>
            state.patchPiece(selected.id, { label: e.target.value })
          }
        />
      </label>
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
    </div>
  );
}
