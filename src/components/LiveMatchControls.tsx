import { useState } from "react";
import { scoreForTeam } from "../canvas/matchBanner";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { createPkShootout, pkHasResults } from "../models/pkShootout";
import type { CardKind, PkKickSlot } from "../models/types";

type TeamSide = "home" | "away";
type EventPanel = "none" | "card" | "sub";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  variant: "drawer" | "broadcast";
};

function slotMark(slot: PkKickSlot): string {
  if (slot.result === "scored") return "○";
  if (slot.result === "missed") return "✕";
  return "–";
}

/**
 * 配信者の操作面。視聴の正本は試合帯（スコア・タイムライン・PK ○✕）。
 * End PK = 入力を閉じるだけ。結果があれば帯に残す。
 */
export function LiveMatchControls({ state, t, variant }: Props) {
  const board = state.board;
  if (!board || board.sport !== "soccer") return null;

  const [goalTeam, setGoalTeam] = useState<TeamSide>("home");
  const [goalScorer, setGoalScorer] = useState("");
  const [goalMinute, setGoalMinute] = useState("");
  const [cardTeam, setCardTeam] = useState<TeamSide>("home");
  const [cardPlayer, setCardPlayer] = useState("");
  const [cardMinute, setCardMinute] = useState("");
  const [cardKind, setCardKind] = useState<CardKind>("YC");
  const [panel, setPanel] = useState<EventPanel>("none");
  const [subTeam, setSubTeam] = useState<TeamSide>("home");
  const [subOut, setSubOut] = useState("");
  const [subIn, setSubIn] = useState("");
  const [subMinute, setSubMinute] = useState("");
  const [subInjured, setSubInjured] = useState(false);
  /** 操作 UI のみ。視聴帯の表示は board.pk（結果ありなら End 後も残る） */
  const [pkOpOpen, setPkOpOpen] = useState(false);
  const [pkEdit, setPkEdit] = useState<{
    team: TeamSide;
    slotId: string;
  } | null>(null);

  const home = scoreForTeam(board.goals, "home");
  const away = scoreForTeam(board.goals, "away");
  const pk = board.pk ?? createPkShootout(false);
  const isBroadcast = variant === "broadcast";

  const pkNumberValue =
    pkEdit == null
      ? ""
      : (pk[pkEdit.team].find((s) => s.id === pkEdit.slotId)?.number ?? "");

  const openPanel = (next: EventPanel) => {
    setPanel((cur) => (cur === next ? "none" : next));
  };

  const openPkOp = () => {
    state.setPkActive(true);
    setPanel("none");
    setPkEdit(null);
    setPkOpOpen(true);
  };

  /** 入力を閉じる。結果があれば帯は残す。空なら帯も閉じる */
  const closePkOp = () => {
    setPkOpOpen(false);
    setPkEdit(null);
    if (!pkHasResults(pk)) {
      state.setPkActive(false);
    }
  };

  return (
    <div
      className={`live-match-controls live-match-controls--${variant}${
        pkOpOpen ? " live-match-controls--pk-op" : ""
      }`}
      aria-label={t("scoreLabel")}
    >
      {!pkOpOpen && (
        <>
          <span className="live-match-score">
            {home} – {away}
          </span>
          <div className="live-match-goal-row">
            <select
              value={goalTeam}
              onChange={(e) => setGoalTeam(e.target.value as TeamSide)}
              aria-label={t("homeTeam")}
            >
              <option value="home">{t("teamHome")}</option>
              <option value="away">{t("teamAway")}</option>
            </select>
            <input
              value={goalScorer}
              onChange={(e) => setGoalScorer(e.target.value)}
              placeholder={t("goalScorerPh")}
              aria-label={t("goalScorer")}
            />
            <input
              className="live-match-minute"
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
            <button
              type="button"
              className="live-match-card-toggle"
              onClick={() => openPanel("card")}
              aria-expanded={panel === "card"}
            >
              {panel === "card" ? t("liveCardHide") : t("liveCardShow")}
            </button>
            <button
              type="button"
              className="live-match-card-toggle"
              onClick={() => openPanel("sub")}
              aria-expanded={panel === "sub"}
            >
              {panel === "sub" ? t("liveSubHide") : t("liveSubShow")}
            </button>
            <button
              type="button"
              className="live-match-card-toggle"
              onClick={openPkOp}
              aria-pressed={false}
            >
              {t("livePkShow")}
            </button>
          </div>
        </>
      )}

      {pkOpOpen && (
        <div className="live-match-pk-op" aria-label={t("livePkShow")}>
          <div className="live-match-pk-op-head">
            <span className="live-match-pk-op-label">{t("livePkShow")}</span>
            {!isBroadcast && (
              <span className="live-match-pk-op-hint">{t("pkBannerHint")}</span>
            )}
            <button
              type="button"
              className="live-match-card-toggle"
              onClick={closePkOp}
            >
              {t("livePkHide")}
            </button>
          </div>
          {(["home", "away"] as const).map((team) => (
            <div key={team} className="live-match-pk-op-row">
              <span className="live-match-pk-op-team">
                {team === "home" ? "H" : "A"}
              </span>
              <div className="live-match-pk-slots">
                {pk[team].map((slot) => {
                  const selected =
                    pkEdit?.team === team && pkEdit.slotId === slot.id;
                  const mark = slotMark(slot);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={`live-match-pk-slot live-match-pk-slot--${
                        slot.result ?? "pending"
                      }${selected ? " is-selected" : ""}`}
                      title={
                        slot.number
                          ? `#${slot.number} · ${t("pkSlotCycleHint")}`
                          : t("pkSlotCycleHint")
                      }
                      aria-label={
                        slot.number
                          ? `${team} #${slot.number} ${mark}`
                          : `${team} ${mark}`
                      }
                      onClick={() => {
                        state.cyclePkSlot(team, slot.id);
                        setPkEdit({ team, slotId: slot.id });
                      }}
                    >
                      <span className="live-match-pk-slot-mark" aria-hidden>
                        {mark}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="live-match-goal-row live-match-pk-tools">
            {pkEdit && (
              <input
                className="live-match-minute"
                value={pkNumberValue}
                onChange={(e) =>
                  state.setPkSlotNumber(
                    pkEdit.team,
                    pkEdit.slotId,
                    e.target.value,
                  )
                }
                placeholder={t("pkNumberPh")}
                aria-label={t("pkNumber")}
              />
            )}
            <button type="button" onClick={() => state.addPkRound()}>
              {t("pkAddRound")}
            </button>
            <button type="button" onClick={() => state.resetPk()}>
              {t("pkReset")}
            </button>
          </div>
        </div>
      )}

      {!pkOpOpen && panel === "card" && (
        <div className="live-match-goal-row">
          <select
            value={cardTeam}
            onChange={(e) => setCardTeam(e.target.value as TeamSide)}
            aria-label={t("cardsLabel")}
          >
            <option value="home">{t("teamHome")}</option>
            <option value="away">{t("teamAway")}</option>
          </select>
          <select
            value={cardKind}
            onChange={(e) => setCardKind(e.target.value as CardKind)}
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
            className="live-match-minute"
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
      )}

      {!pkOpOpen && panel === "sub" && (
        <div className="live-match-goal-row">
          <select
            value={subTeam}
            onChange={(e) => setSubTeam(e.target.value as TeamSide)}
            aria-label={t("liveSubShow")}
          >
            <option value="home">{t("teamHome")}</option>
            <option value="away">{t("teamAway")}</option>
          </select>
          <input
            className="live-match-minute"
            value={subOut}
            onChange={(e) => setSubOut(e.target.value)}
            placeholder={t("subOutPh")}
            aria-label={t("subOut")}
          />
          <span className="live-match-sub-arrow" aria-hidden>
            ↓↑
          </span>
          <input
            className="live-match-minute"
            value={subIn}
            onChange={(e) => setSubIn(e.target.value)}
            placeholder={t("subInPh")}
            aria-label={t("subIn")}
          />
          <input
            className="live-match-minute"
            value={subMinute}
            onChange={(e) => setSubMinute(e.target.value)}
            placeholder={t("goalMinutePh")}
            aria-label={t("goalMinute")}
          />
          <label className="live-match-inj-check">
            <input
              type="checkbox"
              checked={subInjured}
              onChange={(e) => setSubInjured(e.target.checked)}
            />
            {t("subInjured")}
          </label>
          <button
            type="button"
            onClick={() => {
              state.addSub(subTeam, subOut, subIn, subMinute, subInjured);
              setSubOut("");
              setSubIn("");
              setSubMinute("");
              setSubInjured(false);
            }}
          >
            {t("addSub")}
          </button>
        </div>
      )}
    </div>
  );
}
