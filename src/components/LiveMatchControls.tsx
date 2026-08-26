import { useState } from "react";
import { scoreForTeam } from "../canvas/matchBanner";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { kitsFromBoard } from "../models/kits";
import {
  createPkShootout,
  pkScoredCount,
  teamLabelForPk,
} from "../models/pkShootout";
import type { CardKind, PkKickSlot } from "../models/types";

type TeamSide = "home" | "away";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  variant: "drawer" | "broadcast";
};

function slotMark(slot: PkKickSlot): string {
  if (slot.result === "scored") return "○";
  if (slot.result === "missed") return "✕";
  return "·";
}

/** バナー ON 時の得点・カード・交代・PK（Match タブに潜らせない） */
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
  const [showCard, setShowCard] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [subTeam, setSubTeam] = useState<TeamSide>("home");
  const [subOut, setSubOut] = useState("");
  const [subIn, setSubIn] = useState("");
  const [subMinute, setSubMinute] = useState("");
  const [subInjured, setSubInjured] = useState(false);
  const [pkEdit, setPkEdit] = useState<{
    team: TeamSide;
    slotId: string;
  } | null>(null);

  const home = scoreForTeam(board.goals, "home");
  const away = scoreForTeam(board.goals, "away");
  const pk = board.pk ?? createPkShootout(false);
  const kits = kitsFromBoard(board);
  const pkNumberValue =
    pkEdit == null
      ? ""
      : (pk[pkEdit.team].find((s) => s.id === pkEdit.slotId)?.number ?? "");

  return (
    <div
      className={`live-match-controls live-match-controls--${variant}${
        pk.active ? " live-match-controls--pk" : ""
      }`}
      aria-label={t("scoreLabel")}
    >
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
          onClick={() => setShowCard((v) => !v)}
          aria-expanded={showCard}
        >
          {showCard ? t("liveCardHide") : t("liveCardShow")}
        </button>
        <button
          type="button"
          className="live-match-card-toggle"
          onClick={() => setShowSub((v) => !v)}
          aria-expanded={showSub}
        >
          {showSub ? t("liveSubHide") : t("liveSubShow")}
        </button>
        <button
          type="button"
          className="live-match-card-toggle"
          onClick={() => {
            const next = !pk.active;
            state.setPkActive(next);
            if (!next) setPkEdit(null);
          }}
          aria-pressed={pk.active}
        >
          {pk.active ? t("livePkHide") : t("livePkShow")}
        </button>
      </div>
      {showCard && (
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
      {showSub && (
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
      {pk.active && (
        <div className="live-match-pk" aria-label={t("livePkShow")}>
          {(["home", "away"] as const).map((team) => (
            <div key={team} className="live-match-pk-row">
              <span
                className="live-match-pk-kit"
                style={{
                  background: team === "home" ? kits.home : kits.away,
                }}
                aria-hidden
              />
              <span className="live-match-pk-name">
                {teamLabelForPk(board, team)}
              </span>
              <span className="live-match-pk-score" aria-hidden>
                {pkScoredCount(pk[team])}
              </span>
              <div className="live-match-pk-slots">
                {pk[team].map((slot) => {
                  const selected =
                    pkEdit?.team === team && pkEdit.slotId === slot.id;
                  const mark = slotMark(slot);
                  const label = slot.number
                    ? `${slot.number} ${mark}`
                    : mark;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={`live-match-pk-slot live-match-pk-slot--${
                        slot.result ?? "pending"
                      }${selected ? " is-selected" : ""}`}
                      title={t("pkSlotCycleHint")}
                      aria-label={
                        slot.number
                          ? `${teamLabelForPk(board, team)} #${slot.number} ${mark}`
                          : `${teamLabelForPk(board, team)} ${mark}`
                      }
                      onClick={() => {
                        state.cyclePkSlot(team, slot.id);
                        setPkEdit({ team, slotId: slot.id });
                      }}
                    >
                      {label}
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
    </div>
  );
}
