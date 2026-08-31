/**
 * Match-tab pitch look: miniature pitch icons for view only.
 * Soccer: 5 TTA-style glyphs (landscape/portrait × full/half).
 * 5-lanes is a text segment (なし / レーン) — not drawn on pitch icons.
 */
import { useId } from "react";
import type { PitchView } from "../models/types";
import {
  SOCCER_PITCH_LOOK_ORDER,
  type SoccerPitchLookPreset,
} from "../presets/pitchLook";

type PitchThumbProps = {
  className?: string;
};

const GRASS = "#1a5c2e";
const LINE = "#e8efe8";
/** Unused half = off-camera: dark enough to read as “not shown”. */
const GHOST_FILL = "rgba(6, 7, 8, 0.78)";
/** Cut at halfway — aogai, readable at ~40px. */
const CUT = "#7eb8c4";

function GhostUnusedLeft({
  x,
  y,
  width,
  height,
  cutY1,
  cutY2,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  cutY1: number;
  cutY2: number;
}) {
  const cutX = x + width;
  return (
    <>
      <rect x={x} y={y} width={width} height={height} fill={GHOST_FILL} />
      <line
        x1={cutX}
        y1={cutY1}
        x2={cutX}
        y2={cutY2}
        stroke={CUT}
        strokeWidth="1.45"
        strokeDasharray="3.2 2.1"
        strokeLinecap="round"
      />
    </>
  );
}

function GhostUnusedTop({
  x,
  y,
  width,
  height,
  cutX1,
  cutX2,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  cutX1: number;
  cutX2: number;
}) {
  const cutY = y + height;
  return (
    <>
      <rect x={x} y={y} width={width} height={height} fill={GHOST_FILL} />
      <line
        x1={cutX1}
        y1={cutY}
        x2={cutX2}
        y2={cutY}
        stroke={CUT}
        strokeWidth="1.45"
        strokeDasharray="3.2 2.1"
        strokeLinecap="round"
      />
    </>
  );
}

function GhostUnusedBottom({
  x,
  y,
  width,
  height,
  cutX1,
  cutX2,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  cutX1: number;
  cutX2: number;
}) {
  const cutY = y;
  return (
    <>
      <rect x={x} y={y} width={width} height={height} fill={GHOST_FILL} />
      <line
        x1={cutX1}
        y1={cutY}
        x2={cutX2}
        y2={cutY}
        stroke={CUT}
        strokeWidth="1.45"
        strokeDasharray="3.2 2.1"
        strokeLinecap="round"
      />
    </>
  );
}

/** Full landscape pitch (~105:68). */
export function PitchThumbFull({ className }: PitchThumbProps) {
  return (
    <svg
      className={["pitch-thumb", "pitch-thumb--landscape", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 72 46"
      width="72"
      height="46"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <SoccerLandscapeBody />
    </svg>
  );
}

/**
 * Landscape half: right attacking end live; left ghosted
 * (centre arc on left edge, goal on right).
 */
export function PitchThumbHalf({ className }: PitchThumbProps) {
  return (
    <svg
      className={["pitch-thumb", "pitch-thumb--landscape", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 72 46"
      width="72"
      height="46"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <SoccerLandscapeBody />
      <GhostUnusedLeft
        x={2.5}
        y={2.5}
        width={33.5}
        height={41}
        cutY1={2.5}
        cutY2={43.5}
      />
    </svg>
  );
}

export function SoccerLandscapeBody() {
  return (
    <>
      <rect width="72" height="46" rx="2" fill={GRASS} />
      <rect
        x="2.5"
        y="2.5"
        width="67"
        height="41"
        rx="1"
        fill="none"
        stroke={LINE}
        strokeWidth="1.2"
      />
      <line x1="36" y1="2.5" x2="36" y2="43.5" stroke={LINE} strokeWidth="1" />
      <circle cx="36" cy="23" r="6" fill="none" stroke={LINE} strokeWidth="1" />
      <circle cx="36" cy="23" r="1.1" fill={LINE} />
      <rect
        x="2.5"
        y="12"
        width="11"
        height="22"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
      <rect
        x="58.5"
        y="12"
        width="11"
        height="22"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
      <rect
        x="2.5"
        y="17"
        width="4.5"
        height="12"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
      <rect
        x="65"
        y="17"
        width="4.5"
        height="12"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
    </>
  );
}

/** Full portrait pitch (~68:105). Goals top/bottom. */
export function PitchThumbPortraitFull({ className }: PitchThumbProps) {
  return (
    <svg
      className={["pitch-thumb", "pitch-thumb--portrait", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 46 72"
      width="46"
      height="72"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <SoccerPortraitBody />
    </svg>
  );
}

/** Portrait half: bottom goal live; top ghosted (pitchFlipped false). */
export function PitchThumbPortraitHalfBottom({ className }: PitchThumbProps) {
  return (
    <svg
      className={["pitch-thumb", "pitch-thumb--portrait", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 46 72"
      width="46"
      height="72"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <SoccerPortraitBody />
      <GhostUnusedTop
        x={2.5}
        y={2.5}
        width={41}
        height={33.5}
        cutX1={2.5}
        cutX2={43.5}
      />
    </svg>
  );
}

/** Portrait half: top goal live; bottom ghosted (pitchFlipped true). */
export function PitchThumbPortraitHalfTop({ className }: PitchThumbProps) {
  return (
    <svg
      className={["pitch-thumb", "pitch-thumb--portrait", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 46 72"
      width="46"
      height="72"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <SoccerPortraitBody />
      <GhostUnusedBottom
        x={2.5}
        y={36}
        width={41}
        height={33.5}
        cutX1={2.5}
        cutX2={43.5}
      />
    </svg>
  );
}

export function SoccerPortraitBody() {
  return (
    <>
      <rect width="46" height="72" rx="2" fill={GRASS} />
      <rect
        x="2.5"
        y="2.5"
        width="41"
        height="67"
        rx="1"
        fill="none"
        stroke={LINE}
        strokeWidth="1.2"
      />
      <line x1="2.5" y1="36" x2="43.5" y2="36" stroke={LINE} strokeWidth="1" />
      <circle cx="23" cy="36" r="6" fill="none" stroke={LINE} strokeWidth="1" />
      <circle cx="23" cy="36" r="1.1" fill={LINE} />
      <rect
        x="12"
        y="2.5"
        width="22"
        height="11"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
      <rect
        x="12"
        y="58.5"
        width="22"
        height="11"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
      <rect
        x="17"
        y="2.5"
        width="12"
        height="4.5"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
      <rect
        x="17"
        y="65"
        width="12"
        height="4.5"
        fill="none"
        stroke={LINE}
        strokeWidth="1"
      />
    </>
  );
}

function SoccerPitchLookThumb({ preset }: { preset: SoccerPitchLookPreset }) {
  switch (preset) {
    case "landscapeFull":
      return <PitchThumbFull />;
    case "portraitFull":
      return <PitchThumbPortraitFull />;
    case "portraitHalfBottom":
      return <PitchThumbPortraitHalfBottom />;
    case "landscapeHalfRight":
      return <PitchThumbHalf />;
    case "portraitHalfTop":
      return <PitchThumbPortraitHalfTop />;
  }
}

/** FIBA-ish court for basketball view thumbs (not soccer lanes). */
export function CourtThumbBasketFull({ className }: { className?: string }) {
  const wood = "#c4a574";
  const line = "#1a1612";
  return (
    <svg
      className={["pitch-thumb", "pitch-thumb--landscape", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 72 38"
      width="72"
      height="38"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="72" height="38" rx="2" fill={wood} />
      <rect
        x="2"
        y="2"
        width="68"
        height="34"
        rx="1"
        fill="none"
        stroke={line}
        strokeWidth="1.2"
      />
      <line x1="36" y1="2" x2="36" y2="36" stroke={line} strokeWidth="1" />
      <circle cx="36" cy="19" r="5.5" fill="none" stroke={line} strokeWidth="1" />
      <rect
        x="2"
        y="10"
        width="12"
        height="18"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
      <rect
        x="58"
        y="10"
        width="12"
        height="18"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
      <path
        d="M14 10 A8 8 0 0 1 14 28"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
      <path
        d="M58 10 A8 8 0 0 0 58 28"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
    </svg>
  );
}

/** Basketball half: same landscape court, ghost the unused backcourt. */
export function CourtThumbBasketHalf({ className }: { className?: string }) {
  const wood = "#c4a574";
  const line = "#1a1612";
  return (
    <svg
      className={["pitch-thumb", "pitch-thumb--landscape", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 72 38"
      width="72"
      height="38"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="72" height="38" rx="2" fill={wood} />
      <rect
        x="2"
        y="2"
        width="68"
        height="34"
        rx="1"
        fill="none"
        stroke={line}
        strokeWidth="1.2"
      />
      <line x1="36" y1="2" x2="36" y2="36" stroke={line} strokeWidth="1" />
      <circle cx="36" cy="19" r="5.5" fill="none" stroke={line} strokeWidth="1" />
      <rect
        x="2"
        y="10"
        width="12"
        height="18"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
      <rect
        x="58"
        y="10"
        width="12"
        height="18"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
      <path
        d="M14 10 A8 8 0 0 1 14 28"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
      <path
        d="M58 10 A8 8 0 0 0 58 28"
        fill="none"
        stroke={line}
        strokeWidth="1"
      />
      <GhostUnusedLeft
        x={2}
        y={2}
        width={34}
        height={34}
        cutY1={2}
        cutY2={36}
      />
    </svg>
  );
}

type SoccerPitchViewLabels = {
  pitchView: string;
  lanes5: string;
  lanesOff: string;
  lanesOffShort: string;
  lanesOnShort: string;
  lanes5Hint: string;
  pitchLookLandscapeFull: string;
  pitchLookPortraitFull: string;
  pitchLookPortraitHalfBottom: string;
  pitchLookLandscapeHalfRight: string;
  pitchLookPortraitHalfTop: string;
};

type BasketballLabels = {
  pitchView: string;
  full: string;
  half: string;
  lanes5: string;
  lanesOff: string;
  lanesOffShort: string;
  lanesOnShort: string;
  lanes5Hint: string;
  flip: string;
};

export type PitchLookPickerProps =
  | {
      mode: "soccerPitchView";
      preset: SoccerPitchLookPreset;
      onPreset: (preset: SoccerPitchLookPreset) => void;
      showLanes5?: boolean;
      onLanes5?: (on: boolean) => void;
      labels: SoccerPitchViewLabels;
    }
  | {
      mode?: "basketball";
      court: "basketball";
      pitchView: PitchView;
      onPitchView: (view: PitchView) => void;
      showFlip?: boolean;
      onFlip?: () => void;
      labels: BasketballLabels;
    };

const PRESET_LABEL_KEY: Record<
  SoccerPitchLookPreset,
  keyof SoccerPitchViewLabels
> = {
  landscapeFull: "pitchLookLandscapeFull",
  portraitFull: "pitchLookPortraitFull",
  portraitHalfBottom: "pitchLookPortraitHalfBottom",
  landscapeHalfRight: "pitchLookLandscapeHalfRight",
  portraitHalfTop: "pitchLookPortraitHalfTop",
};

export function PitchLookPicker(props: PitchLookPickerProps) {
  const viewId = useId();
  const lanesId = useId();

  if (props.mode === "soccerPitchView") {
    const { preset, onPreset, showLanes5 = false, onLanes5, labels } = props;
    return (
      <div className="pitch-look">
        <div className="pitch-look__block">
          <span className="pitch-look__label" id={viewId}>
            {labels.pitchView}
          </span>
          <div
            className="pitch-look__thumbs pitch-look__thumbs--soccer"
            role="group"
            aria-labelledby={viewId}
          >
            {SOCCER_PITCH_LOOK_ORDER.map((p) => {
              const labelKey = PRESET_LABEL_KEY[p];
              const label = labels[labelKey];
              return (
                <button
                  key={p}
                  type="button"
                  className={
                    preset === p
                      ? "pitch-look__thumb is-active"
                      : "pitch-look__thumb"
                  }
                  aria-pressed={preset === p}
                  title={label}
                  aria-label={label}
                  onClick={() => onPreset(p)}
                >
                  <SoccerPitchLookThumb preset={p} />
                </button>
              );
            })}
          </div>
        </div>

        {onLanes5 && (
          <div className="pitch-look__block">
            <span className="pitch-look__label" id={lanesId}>
              {labels.lanes5}
            </span>
            <div
              className="team-segment pitch-look__lanes"
              role="group"
              aria-labelledby={lanesId}
            >
              <button
                type="button"
                className={!showLanes5 ? "is-active" : undefined}
                aria-pressed={!showLanes5}
                title={labels.lanesOff}
                aria-label={labels.lanesOff}
                onClick={() => onLanes5(false)}
              >
                {labels.lanesOffShort}
              </button>
              <button
                type="button"
                className={showLanes5 ? "is-active" : undefined}
                aria-pressed={showLanes5}
                title={labels.lanes5Hint}
                aria-label={labels.lanes5}
                onClick={() => onLanes5(true)}
              >
                {labels.lanesOnShort}
              </button>
            </div>
            <p className="hint-muted pitch-look__hint">{labels.lanes5Hint}</p>
          </div>
        )}
      </div>
    );
  }

  const {
    pitchView,
    onPitchView,
    showFlip = false,
    onFlip,
    labels,
  } = props;

  return (
    <div className="pitch-look">
      <div className="pitch-look__block">
        <span className="pitch-look__label" id={viewId}>
          {labels.pitchView}
        </span>
        <div
          className="pitch-look__thumbs"
          role="group"
          aria-labelledby={viewId}
        >
          <button
            type="button"
            className={
              pitchView === "full"
                ? "pitch-look__thumb is-active"
                : "pitch-look__thumb"
            }
            aria-pressed={pitchView === "full"}
            title={labels.full}
            aria-label={labels.full}
            onClick={() => onPitchView("full")}
          >
            <CourtThumbBasketFull />
          </button>
          <button
            type="button"
            className={
              pitchView === "half"
                ? "pitch-look__thumb is-active"
                : "pitch-look__thumb"
            }
            aria-pressed={pitchView === "half"}
            title={labels.half}
            aria-label={labels.half}
            onClick={() => onPitchView("half")}
          >
            <CourtThumbBasketHalf />
          </button>
        </div>
      </div>

      {showFlip && onFlip && (
        <button type="button" className="pitch-look__flip" onClick={onFlip}>
          {labels.flip}
        </button>
      )}
    </div>
  );
}
