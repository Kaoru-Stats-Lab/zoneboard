import { useEffect, useState } from "react";
import { scoreForTeam } from "../canvas/matchBanner";
import {
  cardsForTeam,
  formatCardTotals,
} from "../canvas/matchCards";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { BENCH_COUNT_OPTIONS } from "../presets/bench";
import type { CardKind, HideHalf, RosterPlayer, SportId, TeamFocus } from "../models/types";
import {
  MAX_BOARDS,
  MAX_SCENES,
  PIECE_SCALE,
  usesPreferredFoot,
} from "../models/types";
import { kitsFromBoard, sportHasGk } from "../models/kits";
import { normalizePieceNumber, numberFill } from "../canvas/pieceInk";
import { STARTER_COUNT, formatRosterText } from "../presets/roster";
import { viewPresetsForSport } from "../presets/viewport";
import { scenePresetsForSport, type ScenePresetId } from "../presets/scenePresets";
import { FEATURE_PRO_VIEWPORT_TEMPLATES } from "../lib/features";
import { LiveMatchControls } from "./LiveMatchControls";

function startersPlaceholder(sport: SportId): string {
  const n = STARTER_COUNT[sport];
  return Array.from({ length: n }, (_, i) => String(i + 1)).join(",");
}

/** チップ用の短い表示名。番号が主役、名前は添え */
function chipName(label: string): string {
  const t = label.trim();
  if (!t) return "";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1]!;
  return t;
}

function playerByNormalizedNumber(
  players: RosterPlayer[],
  num: string,
): RosterPlayer | undefined {
  const n = normalizePieceNumber(num);
  return players.find((p) => normalizePieceNumber(p.number) === n);
}

function sceneLabelPhKey(sport: SportId): MessageKey {
  switch (sport) {
    case "basketball":
      return "sceneLabelPhBasket";
    case "futsal":
      return "sceneLabelPhFutsal";
    case "beach_soccer":
      return "sceneLabelPhBeach";
    case "volleyball":
      return "sceneLabelPhVolley";
    default:
      return "sceneLabelPhSoccer";
  }
}

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

type PanelTab = "match" | "scenes" | "roster";
type TeamSide = "home" | "away";

export function Drawer({ state, t }: Props) {
  const [prepOpen, setPrepOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("scenes");
  const [teamSide, setTeamSide] = useState<TeamSide>("home");
  const [rosterText, setRosterText] = useState({ home: "", away: "" });
  const [rosterDirty, setRosterDirty] = useState({ home: false, away: false });
  const [xiText, setXiText] = useState({ home: "", away: "" });
  const [goalTeam, setGoalTeam] = useState<TeamSide>("home");
  const [goalScorer, setGoalScorer] = useState("");
  const [goalMinute, setGoalMinute] = useState("");
  const [cardTeam, setCardTeam] = useState<TeamSide>("home");
  const [cardPlayer, setCardPlayer] = useState("");
  const [cardMinute, setCardMinute] = useState("");
  const [cardKind, setCardKind] = useState<CardKind>("YC");

  const boardRoster = state.board?.roster;
  const homeXiKey = boardRoster?.home.starterNumbers.join(",") ?? "";
  const awayXiKey = boardRoster?.away.starterNumbers.join(",") ?? "";
  useEffect(() => {
    if (!boardRoster) return;
    setRosterText((prev) => ({
      home: rosterDirty.home
        ? prev.home
        : formatRosterText(boardRoster.home.players),
      away: rosterDirty.away
        ? prev.away
        : formatRosterText(boardRoster.away.players),
    }));
  }, [boardRoster, rosterDirty.home, rosterDirty.away]);

  useEffect(() => {
    setXiText({ home: homeXiKey, away: awayXiKey });
  }, [homeXiKey, awayXiKey]);

  if (!state.drawerOpen || state.broadcast || !state.board || !state.scene)
    return null;
  const board = state.board;
  const scene = state.scene;
  const atLimit = state.store.boards.length >= MAX_BOARDS;
  const sceneLimit = board.scenes.length >= MAX_SCENES;
  const roster = board.roster[teamSide];
  const kits = kitsFromBoard(board);
  const xiMax = STARTER_COUNT[board.sport];
  const starterNorm = new Set(
    roster.starterNumbers.map((n) => normalizePieceNumber(n)).filter(Boolean),
  );
  const xiPlayers = roster.starterNumbers
    .map((n) => playerByNormalizedNumber(roster.players, n))
    .filter((p): p is RosterPlayer => !!p);
  const squadPlayers = roster.players.filter(
    (p) => !starterNorm.has(normalizePieceNumber(p.number)),
  );

  const commitXi = (numbers: string[]) => {
    setXiText((prev) => ({ ...prev, [teamSide]: numbers.join(",") }));
    state.setStarterNumbers(teamSide, numbers);
  };

  const addToXi = (number: string) => {
    const n = normalizePieceNumber(number);
    if (!n || starterNorm.has(n)) return;
    if (xiPlayers.length >= xiMax) return;
    commitXi([...roster.starterNumbers, number]);
  };

  const removeFromXi = (number: string) => {
    const n = normalizePieceNumber(number);
    commitXi(
      roster.starterNumbers.filter((x) => normalizePieceNumber(x) !== n),
    );
  };

  return (
    <aside className="drawer">
      <div className="drawer-phase-bar">
        {prepOpen ? (
          <button
            type="button"
            className="drawer-phase-back"
            onClick={() => setPrepOpen(false)}
          >
            ← {t("panelLive")}
          </button>
        ) : (
          <>
            <span className="drawer-phase-label">{t("tabScenes")}</span>
            <button
              type="button"
              className="drawer-prep-toggle"
              onClick={() => {
                setPrepOpen(true);
                setTab("roster");
              }}
            >
              {t("panelPrep")}
            </button>
          </>
        )}
      </div>

      {prepOpen && (
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
      )}

      <div className="drawer-body">
        {(!prepOpen || tab === "scenes") && (
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
              {scenePresetsForSport(board.sport).length > 0 && (
                <label>
                  {t("fromPreset")}
                  <select
                    value=""
                    disabled={sceneLimit}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) return;
                      if (!state.addSceneFromPreset(id as ScenePresetId)) {
                        window.alert(t("sceneLimit"));
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">—</option>
                    {scenePresetsForSport(board.sport).map(({ id, key }) => (
                      <option key={id} value={id}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
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
                placeholder={t(sceneLabelPhKey(board.sport))}
              />
            </label>
            <button type="button" onClick={state.mirrorSceneEnds}>
              {t("sceneMirrorEnds")}
            </button>
            <p className="hint-muted">{t("sceneMirrorEndsHint")}</p>
            <label>
              {t("teamFocus")}
              <select
                value={scene.teamFocus ?? "both"}
                onChange={(e) =>
                  state.setTeamFocus(e.target.value as TeamFocus)
                }
              >
                <option value="both">{t("teamFocusBoth")}</option>
                <option value="home">{t("teamFocusHome")}</option>
                <option value="away">{t("teamFocusAway")}</option>
              </select>
            </label>
            <p className="hint-muted">{t("teamFocusHint")}</p>
            {board.sport === "soccer" && (
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
            )}

            <details className="drawer-details">
              <summary>{t("viewFocus")}</summary>
              <p className="hint-muted">{t("viewFocusHint")}</p>
              <div className="tool-grid">
                {viewPresetsForSport(board.sport).map(({ id, key }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => state.applyViewPreset(id)}
                  >
                    {t(key as MessageKey)}
                  </button>
                ))}
              </div>
              <button type="button" onClick={state.resetViewport}>
                {t("viewReset")}
              </button>
            </details>
            {FEATURE_PRO_VIEWPORT_TEMPLATES && (
              <details className="drawer-details">
                <summary>{t("viewTemplates")}</summary>
                <p className="hint-muted">{t("viewTemplatesHint")}</p>
                <label className="field-stack">
                  {t("viewTemplateLabel")}
                  <input
                    type="text"
                    id="view-template-label"
                    placeholder={t("viewTemplatePlaceholder")}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(
                      "view-template-label",
                    ) as HTMLInputElement | null;
                    if (el && state.saveViewportTemplate(el.value)) {
                      el.value = "";
                    }
                  }}
                >
                  {t("viewTemplateSave")}
                </button>
                {(board.viewportTemplates ?? []).map((tpl) => (
                  <div key={tpl.id} className="view-template-row">
                    <button
                      type="button"
                      onClick={() => state.applyViewportTemplate(tpl.id)}
                    >
                      {tpl.label}
                    </button>
                    <button
                      type="button"
                      className="danger-text"
                      onClick={() => state.deleteViewportTemplate(tpl.id)}
                    >
                      {t("viewTemplateDelete")}
                    </button>
                  </div>
                ))}
              </details>
            )}
            {!prepOpen && board.showMatchBanner && board.sport === "soccer" && (
              <LiveMatchControls state={state} t={t} variant="drawer" />
            )}
          </section>
        )}

        {prepOpen && tab === "roster" && (
          <section className="drawer-panel">
            <p className="hint-muted">
              {t(
                board.sport === "basketball"
                  ? "rosterHintBasket"
                  : board.sport === "volleyball"
                    ? "rosterHintVolley"
                    : usesPreferredFoot(board.sport)
                      ? "rosterHint"
                      : "rosterHintNoFoot",
              )}
            </p>
            <div className="team-segment" role="tablist">
              <button
                type="button"
                role="tab"
                className={`team-home${teamSide === "home" ? " active" : ""}`}
                aria-selected={teamSide === "home"}
                style={
                  teamSide === "home"
                    ? {
                        background: kits.home,
                        color: numberFill(kits.home),
                      }
                    : { borderLeft: `3px solid ${kits.home}` }
                }
                onClick={() => setTeamSide("home")}
              >
                {t("teamHome")}
              </button>
              <button
                type="button"
                role="tab"
                className={`team-away${teamSide === "away" ? " active" : ""}`}
                aria-selected={teamSide === "away"}
                style={
                  teamSide === "away"
                    ? {
                        background: kits.away,
                        color: numberFill(kits.away),
                      }
                    : { borderLeft: `3px solid ${kits.away}` }
                }
                onClick={() => setTeamSide("away")}
              >
                {t("teamAway")}
              </button>
            </div>
            <div className="kit-colors">
              <div className="kit-colors-row">
                <span className="kit-colors-team">{t("homeTeam")}</span>
                <label className="kit-swatch">
                  <span>
                    {sportHasGk(board.sport) ? t("kitOutfield") : t("kitColor")}
                  </span>
                  <input
                    type="color"
                    value={kitsFromBoard(board).home}
                    onChange={(e) =>
                      state.setKitColor("home", "outfield", e.target.value)
                    }
                  />
                </label>
                {sportHasGk(board.sport) && (
                  <label className="kit-swatch">
                    <span>{t("kitGk")}</span>
                    <input
                      type="color"
                      value={kitsFromBoard(board).homeGk}
                      onChange={(e) =>
                        state.setKitColor("home", "gk", e.target.value)
                      }
                    />
                  </label>
                )}
              </div>
              <div className="kit-colors-row">
                <span className="kit-colors-team">{t("awayTeam")}</span>
                <label className="kit-swatch">
                  <span>
                    {sportHasGk(board.sport) ? t("kitOutfield") : t("kitColor")}
                  </span>
                  <input
                    type="color"
                    value={kitsFromBoard(board).away}
                    onChange={(e) =>
                      state.setKitColor("away", "outfield", e.target.value)
                    }
                  />
                </label>
                {sportHasGk(board.sport) && (
                  <label className="kit-swatch">
                    <span>{t("kitGk")}</span>
                    <input
                      type="color"
                      value={kitsFromBoard(board).awayGk}
                      onChange={(e) =>
                        state.setKitColor("away", "gk", e.target.value)
                      }
                    />
                  </label>
                )}
              </div>
              {sportHasGk(board.sport) && (
                <p className="hint-muted">{t("kitHint")}</p>
              )}
            </div>
            <label className={`roster-field roster-${teamSide}`}>
              {t("rosterPaste")}
              <textarea
                rows={4}
                style={{ borderLeftColor: kits[teamSide] }}
                value={rosterText[teamSide]}
                onChange={(e) => {
                  setRosterDirty((d) => ({ ...d, [teamSide]: true }));
                  setRosterText((prev) => ({
                    ...prev,
                    [teamSide]: e.target.value,
                  }));
                }}
                placeholder={t(
                  board.sport === "basketball"
                    ? "rosterPlaceholderBasket"
                    : board.sport === "volleyball"
                      ? "rosterPlaceholderVolley"
                      : usesPreferredFoot(board.sport)
                        ? "rosterPlaceholder"
                        : "rosterPlaceholderNoFoot",
                )}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                if (!state.importRoster(teamSide, rosterText[teamSide])) {
                  window.alert(t("rosterParseFail"));
                } else {
                  setRosterDirty((d) => ({ ...d, [teamSide]: false }));
                }
              }}
            >
              {t("importRoster")}
            </button>

            {roster.players.length > 0 && (
              <>
                <div className="roster-chip-block">
                  <div className="roster-chip-head">
                    <h3>
                      {t("xiChips")} · {xiPlayers.length}/{xiMax}
                    </h3>
                  </div>
                  <p className="hint-muted">{t("xiChipsHint")}</p>
                  <div className="roster-chips" role="list">
                    {xiPlayers.length === 0 ? (
                      <p className="roster-chips-empty">{t("xiChipsEmpty")}</p>
                    ) : (
                      xiPlayers.map((p) => {
                        const name = chipName(p.label);
                        return (
                          <button
                            key={`xi-${p.number}`}
                            type="button"
                            role="listitem"
                            className="roster-chip roster-chip--xi"
                            title={t("xiChipRemove")}
                            onClick={() => removeFromXi(p.number)}
                          >
                            <span className="roster-chip-num">{p.number}</span>
                            {name ? (
                              <span className="roster-chip-name">{name}</span>
                            ) : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="roster-chip-block">
                  <div className="roster-chip-head">
                    <h3>{t("squadChips")}</h3>
                  </div>
                  <p className="hint-muted">{t("squadChipsHint")}</p>
                  <div className="roster-chips" role="list">
                    {squadPlayers.length === 0 ? (
                      <p className="roster-chips-empty">{t("squadChipsEmpty")}</p>
                    ) : (
                      squadPlayers.map((p) => {
                        const name = chipName(p.label);
                        const full = xiPlayers.length >= xiMax;
                        return (
                          <button
                            key={`sq-${p.number}`}
                            type="button"
                            role="listitem"
                            className="roster-chip roster-chip--squad"
                            disabled={full}
                            title={
                              full ? t("xiChipsFull") : t("xiChipAdd")
                            }
                            onClick={() => addToXi(p.number)}
                          >
                            <span className="roster-chip-num">{p.number}</span>
                            {name ? (
                              <span className="roster-chip-name">{name}</span>
                            ) : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            <p className="hint-muted">
              {t("rosterCount")}: {roster.players.length}/
              {roster.starterNumbers.length}
            </p>

            <details className="drawer-details">
              <summary>{t("xiPasteDetails")}</summary>
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
                  placeholder={startersPlaceholder(board.sport)}
                />
              </label>
              <button
                type="button"
                className="active"
                onClick={() => {
                  const result = state.setStarters(
                    teamSide,
                    xiText[teamSide],
                  );
                  if (result === false) {
                    window.alert(t("xiParseFail"));
                    return;
                  }
                  if (result.length > 0) {
                    window.alert(
                      t("xiMissing").replace("{nums}", result.join(", ")),
                    );
                  }
                }}
              >
                {t("setXi")}
              </button>
              <p className="hint-muted">{t("setXiHint")}</p>
            </details>

            <button
              type="button"
              onClick={() => {
                if (!state.applyLineup()) window.alert(t("lineupFail"));
              }}
            >
              {t("applyLineup")}
            </button>
            <p className="hint-muted">{t("applyLineupHint")}</p>
          </section>
        )}

        {prepOpen && tab === "match" && (
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

            {board.sport === "soccer" && (
              <div className="stack match-banner-panel">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showMatchBanner}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showMatchBanner: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("showMatchBanner")}
                </label>
                <p className="hint-muted">{t("matchBannerHint")}</p>
                <div className="row">
                  <label className="grow">
                    {t("homeTeam")}
                    <input
                      value={board.homeTeam}
                      onChange={(e) =>
                        state.updateBoard(
                          (b) => ({ ...b, homeTeam: e.target.value }),
                          false,
                        )
                      }
                      placeholder={t("homeTeamPh")}
                    />
                  </label>
                  <label className="grow">
                    {t("awayTeam")}
                    <input
                      value={board.awayTeam}
                      onChange={(e) =>
                        state.updateBoard(
                          (b) => ({ ...b, awayTeam: e.target.value }),
                          false,
                        )
                      }
                      placeholder={t("awayTeamPh")}
                    />
                  </label>
                </div>
                <p className="score-summary">
                  {t("scoreLabel")}: {scoreForTeam(board.goals, "home")} -{" "}
                  {scoreForTeam(board.goals, "away")}
                  <span className="hint-muted"> ({t("scoreFromGoals")})</span>
                </p>
                {(board.cards?.length ?? 0) > 0 && (
                  <p className="score-summary">
                    {t("cardsLabel")}:{" "}
                    {formatCardTotals(cardsForTeam(board.cards ?? [], "home")) ||
                      "🟨0 🟥0"}{" "}
                    ·{" "}
                    {formatCardTotals(cardsForTeam(board.cards ?? [], "away")) ||
                      "🟨0 🟥0"}
                    <span className="hint-muted"> ({t("cardsSummary")})</span>
                  </p>
                )}
                {board.goals.length > 0 && (
                  <ul className="goal-list">
                    {board.goals.map((g) => (
                      <li key={g.id}>
                        <span
                          className={
                            g.team === "home" ? "goal-home" : "goal-away"
                          }
                        >
                          {g.minute ? `${g.minute}' ` : ""}
                          {g.scorer}
                        </span>
                        <button
                          type="button"
                          className="goal-remove"
                          onClick={() => state.removeGoal(g.id)}
                          aria-label={t("removeGoal")}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="goal-add row">
                  <select
                    value={goalTeam}
                    onChange={(e) =>
                      setGoalTeam(e.target.value as TeamSide)
                    }
                  >
                    <option value="home">{t("homeTeam")}</option>
                    <option value="away">{t("awayTeam")}</option>
                  </select>
                  <input
                    value={goalScorer}
                    onChange={(e) => setGoalScorer(e.target.value)}
                    placeholder={t("goalScorerPh")}
                    aria-label={t("goalScorer")}
                  />
                  <input
                    className="goal-minute"
                    value={goalMinute}
                    onChange={(e) => setGoalMinute(e.target.value)}
                    placeholder={t("goalMinutePh")}
                    aria-label={t("goalMinute")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      state.addGoal(goalTeam, goalScorer, goalMinute);
                      setGoalScorer("");
                      setGoalMinute("");
                    }}
                  >
                    {t("addGoal")}
                  </button>
                </div>
                {(board.cards?.length ?? 0) > 0 && (
                  <ul className="goal-list card-list">
                    {(board.cards ?? []).map((c) => (
                      <li key={c.id}>
                        <span
                          className={
                            c.team === "home" ? "goal-home" : "goal-away"
                          }
                        >
                          {c.minute ? `${c.minute}' ` : ""}
                          {c.kind === "YC" ? "🟨" : "🟥"}{" "}
                          {c.player}
                          {c.kind === "Y2C" ? ` (${t("cardY2CLabel")})` : ""}
                        </span>
                        <button
                          type="button"
                          className="goal-remove"
                          onClick={() => state.removeCard(c.id)}
                          aria-label={t("removeCard")}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="goal-add row">
                  <select
                    value={cardTeam}
                    onChange={(e) =>
                      setCardTeam(e.target.value as TeamSide)
                    }
                  >
                    <option value="home">{t("homeTeam")}</option>
                    <option value="away">{t("awayTeam")}</option>
                  </select>
                  <select
                    value={cardKind}
                    onChange={(e) =>
                      setCardKind(e.target.value as CardKind)
                    }
                    aria-label={t("cardsLabel")}
                  >
                    <option value="YC">{t("cardYC")}</option>
                    <option value="RC">{t("cardRC")}</option>
                    <option value="Y2C">{t("cardY2C")}</option>
                  </select>
                  <input
                    value={cardPlayer}
                    onChange={(e) => setCardPlayer(e.target.value)}
                    placeholder={t("cardPlayerPh")}
                    aria-label={t("cardPlayer")}
                  />
                  <input
                    className="goal-minute"
                    value={cardMinute}
                    onChange={(e) => setCardMinute(e.target.value)}
                    placeholder={t("cardMinutePh")}
                    aria-label={t("goalMinute")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      state.addCard(cardTeam, cardPlayer, cardKind, cardMinute);
                      setCardPlayer("");
                      setCardMinute("");
                    }}
                  >
                    {t("addCard")}
                  </button>
                </div>
              </div>
            )}

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
                placeholder={t("titlePh")}
              />
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

            {board.sport === "futsal" && (
              <div className="stack">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showCorridors3}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showCorridors3: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("corridors3")}
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showPressLines}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showPressLines: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("pressLines")}
                </label>
                <p className="hint-muted">{t("futsalOverlayHint")}</p>
              </div>
            )}

            {board.sport === "beach_soccer" && (
              <div className="stack">
                <p className="hint-muted">{t("beachOverlayHint")}</p>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showShotCorridor}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showShotCorridor: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("shotCorridor")}
                </label>
                <p className="hint-muted">{t("shotCorridorHint")}</p>
              </div>
            )}

            {board.sport === "basketball" && (
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
                {board.pitchView === "half" && (
                  <>
                    <p className="hint-muted">{t("basketHalfHint")}</p>
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
                  </>
                )}
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showPaintHighlight}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showPaintHighlight: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("paintHighlight")}
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showThreePointEmphasis}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showThreePointEmphasis: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("threePointEmphasis")}
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showSpotMarkers}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showSpotMarkers: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("spotMarkers")}
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showMiddleLine}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showMiddleLine: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("middleLine")}
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showSlotLines}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showSlotLines: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("slotLines")}
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={board.showWoodCourt}
                    onChange={(e) =>
                      state.updateBoard(
                        (b) => ({
                          ...b,
                          showWoodCourt: e.target.checked,
                        }),
                        false,
                      )
                    }
                  />
                  {t("woodCourt")}
                </label>
                <p className="hint-muted">{t("woodCourtHint")}</p>
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
            {/* 運営フォーメ再適用は出さない — PRODUCT_NOTE 決定ログ 2026-08-25 */}
          </section>
        )}
      </div>
    </aside>
  );
}
