import { useState } from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { BENCH_COUNT_OPTIONS } from "../presets/bench";
import type { HideHalf } from "../models/types";
import { MAX_BOARDS, MAX_SCENES, PIECE_SCALE } from "../models/types";
import type { ViewPresetId } from "../presets/viewport";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

type PanelTab = "match" | "scenes" | "roster";
type TeamSide = "home" | "away";

const VIEW_PRESETS: { id: ViewPresetId; key: MessageKey }[] = [
  { id: "full", key: "viewFull" },
  { id: "final-third-left", key: "viewFtL" },
  { id: "final-third-right", key: "viewFtR" },
  { id: "corner-bl", key: "viewCkBl" },
  { id: "corner-br", key: "viewCkBr" },
  { id: "corner-tl", key: "viewCkTl" },
  { id: "corner-tr", key: "viewCkTr" },
  { id: "throw-top", key: "viewThrowTop" },
  { id: "throw-bottom", key: "viewThrowBot" },
  { id: "pen-left", key: "viewPenL" },
  { id: "pen-right", key: "viewPenR" },
];

export function Drawer({ state, t }: Props) {
  const [tab, setTab] = useState<PanelTab>("scenes");
  const [teamSide, setTeamSide] = useState<TeamSide>("home");
  const [rosterText, setRosterText] = useState({ home: "", away: "" });
  const [xiText, setXiText] = useState({ home: "", away: "" });

  if (!state.drawerOpen || state.broadcast || !state.board || !state.scene)
    return null;
  const board = state.board;
  const scene = state.scene;
  const atLimit = state.store.boards.length >= MAX_BOARDS;
  const sceneLimit = board.scenes.length >= MAX_SCENES;
  const roster = board.roster[teamSide];

  return (
    <aside className="drawer">
      <div className="drawer-tabs" role="tablist">
        {(
          [
            ["scenes", "tabScenes"],
            ["roster", "tabRoster"],
            ["match", "tabMatch"],
          ] as const
        ).map(([id, key]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {t(key)}
          </button>
        ))}
      </div>

      <div className="drawer-body">
        {tab === "scenes" && (
          <section className="drawer-panel">
            <p className="hint-muted">{t("scenesHint")}</p>
            <div className="scene-chips">
              {board.scenes.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={s.id === scene.id ? "active" : ""}
                  onClick={() => state.setActiveScene(s.id)}
                >
                  {i + 1}
                  {s.label ? ` · ${s.label}` : ""}
                </button>
              ))}
            </div>
            <div className="row">
              <button
                type="button"
                disabled={sceneLimit}
                onClick={() => {
                  if (!state.addScene()) window.alert(t("sceneLimit"));
                }}
              >
                {t("newScene")}
              </button>
              <button
                type="button"
                disabled={board.scenes.length <= 1}
                onClick={() => state.deleteScene(scene.id)}
              >
                {t("deleteScene")}
              </button>
            </div>
            <label>
              {t("sceneLabel")}
              <input
                value={scene.label}
                onChange={(e) =>
                  state.updateScene(
                    (s) => ({ ...s, label: e.target.value }),
                    false,
                  )
                }
              />
            </label>
            <label>
              {t("hideHalf")}
              <select
                value={scene.hideHalf}
                onChange={(e) =>
                  state.setHideHalf(e.target.value as HideHalf)
                }
              >
                <option value="none">{t("hideNone")}</option>
                <option value="left">{t("hideLeft")}</option>
                <option value="right">{t("hideRight")}</option>
              </select>
            </label>

            <details className="drawer-details">
              <summary>{t("viewFocus")}</summary>
              <p className="hint-muted">{t("viewFocusHint")}</p>
              <div className="tool-grid">
                {VIEW_PRESETS.map(({ id, key }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => state.applyViewPreset(id)}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
              <button type="button" onClick={state.resetViewport}>
                {t("viewReset")}
              </button>
            </details>
          </section>
        )}

        {tab === "roster" && (
          <section className="drawer-panel">
            <p className="hint-muted">{t("rosterHint")}</p>
            <div className="team-segment" role="tablist">
              <button
                type="button"
                role="tab"
                className={`team-home${teamSide === "home" ? " active" : ""}`}
                aria-selected={teamSide === "home"}
                onClick={() => setTeamSide("home")}
              >
                {t("teamHome")}
              </button>
              <button
                type="button"
                role="tab"
                className={`team-away${teamSide === "away" ? " active" : ""}`}
                aria-selected={teamSide === "away"}
                onClick={() => setTeamSide("away")}
              >
                {t("teamAway")}
              </button>
            </div>
            <label className={`roster-field roster-${teamSide}`}>
              {t("rosterPaste")}
              <textarea
                rows={4}
                value={rosterText[teamSide]}
                onChange={(e) =>
                  setRosterText((prev) => ({
                    ...prev,
                    [teamSide]: e.target.value,
                  }))
                }
                placeholder={"1\n2\n3\n…"}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                if (!state.importRoster(teamSide, rosterText[teamSide])) {
                  window.alert(t("rosterParseFail"));
                }
              }}
            >
              {t("importRoster")}
            </button>
            <label>
              {t("startersXi")}
              <input
                value={xiText[teamSide]}
                onChange={(e) =>
                  setXiText((prev) => ({
                    ...prev,
                    [teamSide]: e.target.value,
                  }))
                }
                placeholder="1,2,3,4,5,6,7,8,9,10,11"
              />
            </label>
            <button
              type="button"
              onClick={() => state.setStarters(teamSide, xiText[teamSide])}
            >
              {t("setXi")}
            </button>
            <p className="hint-muted">
              {t("rosterCount")}: {roster.players.length}/
              {roster.starterNumbers.length}
            </p>
            <button
              type="button"
              className="active"
              onClick={() => {
                if (!state.applyLineup()) window.alert(t("lineupFail"));
              }}
            >
              {t("applyLineup")}
            </button>
          </section>
        )}

        {tab === "match" && (
          <section className="drawer-panel">
            <ul className="board-list">
              {state.store.boards.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className={b.id === board.id ? "active" : ""}
                    onClick={() => state.setActiveBoard(b.id)}
                  >
                    {b.matchLabel || b.title || b.id.slice(0, 6)}
                  </button>
                </li>
              ))}
            </ul>
            <div className="row">
              <button
                type="button"
                disabled={atLimit}
                title={atLimit ? t("boardLimit") : undefined}
                onClick={() => {
                  if (!state.addBoard()) window.alert(t("boardLimit"));
                }}
              >
                {t("newBoard")}
              </button>
              <button
                type="button"
                onClick={() => state.deleteBoard(board.id)}
              >
                {t("deleteBoard")}
              </button>
            </div>
            {atLimit && <p className="hint">{t("boardLimit")}</p>}

            <label>
              {t("matchLabel")}
              <input
                value={board.matchLabel}
                onChange={(e) =>
                  state.updateBoard(
                    (b) => ({ ...b, matchLabel: e.target.value }),
                    false,
                  )
                }
                placeholder={t("matchLabelPh")}
              />
            </label>
            <label>
              {t("title")}
              <input
                value={board.title}
                onChange={(e) =>
                  state.updateBoard(
                    (b) => ({ ...b, title: e.target.value }),
                    false,
                  )
                }
              />
            </label>

            <label>
              {t("sport")}
              <select
                value={board.sport}
                onChange={(e) => {
                  if (!window.confirm(t("confirmSport"))) return;
                  state.changeSport(e.target.value as typeof board.sport);
                }}
              >
                <option value="soccer">{t("soccer")}</option>
                <option value="basketball">{t("basketball")}</option>
                <option value="volleyball">{t("volleyball")}</option>
              </select>
            </label>

            {board.sport === "soccer" && (
              <div className="stack">
                <div className="row">
                  <button
                    type="button"
                    className={board.pitchView === "full" ? "active" : ""}
                    onClick={() =>
                      state.updateBoard(
                        (b) => ({ ...b, pitchView: "full" }),
                        false,
                      )
                    }
                  >
                    {t("full")}
                  </button>
                  <button
                    type="button"
                    className={board.pitchView === "half" ? "active" : ""}
                    onClick={() =>
                      state.updateBoard(
                        (b) => ({ ...b, pitchView: "half" }),
                        false,
                      )
                    }
                  >
                    {t("half")}
                  </button>
                </div>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showLanes5}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showLanes5: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("lanes5")}
                </label>
                {board.pitchView === "half" && (
                  <button
                    type="button"
                    onClick={() =>
                      state.updateBoard((b) => ({
                        ...b,
                        pitchFlipped: !b.pitchFlipped,
                      }))
                    }
                  >
                    {t("flip")}
                  </button>
                )}
              </div>
            )}

            <label>
              {t("benchCount")}
              <select
                value={board.benchCount}
                onChange={(e) => {
                  if (!window.confirm(t("confirmBench"))) return;
                  state.setBenchCount(Number(e.target.value));
                }}
              >
                {BENCH_COUNT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                    {t("benchCountUnit")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t("pieceSize")} ({board.pieceScale.toFixed(2)})
              <input
                type="range"
                min={PIECE_SCALE.min}
                max={PIECE_SCALE.max}
                step={0.05}
                value={board.pieceScale}
                onChange={(e) =>
                  state.updateBoard(
                    (b) => ({ ...b, pieceScale: Number(e.target.value) }),
                    false,
                  )
                }
              />
            </label>
            <div className="row">
              <button
                type="button"
                onClick={() =>
                  state.updateBoard(
                    (b) => ({ ...b, pieceScale: PIECE_SCALE.tactics }),
                    false,
                  )
                }
              >
                {t("sizeTactics")}
              </button>
              <button
                type="button"
                onClick={() =>
                  state.updateBoard(
                    (b) => ({ ...b, pieceScale: PIECE_SCALE.balanced }),
                    false,
                  )
                }
              >
                {t("sizeBalanced")}
              </button>
              <button
                type="button"
                onClick={() =>
                  state.updateBoard(
                    (b) => ({ ...b, pieceScale: PIECE_SCALE.position }),
                    false,
                  )
                }
              >
                {t("sizePosition")}
              </button>
            </div>
            <button type="button" onClick={state.applyFormation}>
              {t("formation")}
            </button>
          </section>
        )}
      </div>
    </aside>
  );
}
