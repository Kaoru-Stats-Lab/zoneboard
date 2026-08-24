import { useState } from "react";
import { scoreForTeam } from "../canvas/matchBanner";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import type { CardKind } from "../models/types";

type TeamSide = "home" | "away";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  variant: "drawer" | "broadcast";
};

/** バナー ON 時の得点・カード追加（Match タブに潜らせない 1 行 UI） */
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

  const home = scoreForTeam(board.goals, "home");
  const away = scoreForTeam(board.goals, "away");

  return (
    <div
      className={`live-match-controls live-match-controls--${variant}`}
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
      </div>
      {variant === "drawer" && (
        <button
          type="button"
          className="live-match-card-toggle"
          onClick={() => setShowCard((v) => !v)}
        >
          {showCard ? t("liveCardHide") : t("liveCardShow")}
        </button>
      )}
      {(variant === "broadcast" || showCard) && (
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
    </div>
  );
}
