/**
 * Scene camera presets: landscape pitch + viewfinder (crop). Not Match-tab world crop.
 */
import type { MessageKey } from "../i18n/messages";
import type { SportId, Viewport } from "../models/types";
import {
  VIEW_PRESETS,
  cameraNormRect,
  viewportMatchesPreset,
  viewPresetsForSport,
  type ViewPresetId,
} from "../presets/viewport";
import { SoccerLandscapeBody } from "./PitchLookPicker";

const FINDER = "#7eb8c4";
const DIM = "rgba(6, 7, 8, 0.48)";
const SOCCER_INNER = { x: 2.5, y: 2.5, w: 67, h: 41 };
const COURT_INNER = { x: 2, y: 2, w: 68, h: 34 };

type Inner = { x: number; y: number; w: number; h: number };

function finderOnInner(vp: Viewport, inner: Inner) {
  const n = cameraNormRect(vp);
  const x = inner.x + n.x * inner.w;
  const y = inner.y + n.y * inner.h;
  const w = n.w * inner.w;
  const h = n.h * inner.h;
  const x0 = Math.max(inner.x, x);
  const y0 = Math.max(inner.y, y);
  const x1 = Math.min(inner.x + inner.w, x + w);
  const y1 = Math.min(inner.y + inner.h, y + h);
  return {
    x: x0,
    y: y0,
    w: Math.max(0.8, x1 - x0),
    h: Math.max(0.8, y1 - y0),
  };
}

function FinderOverlay({
  presetId,
  inner,
}: {
  presetId: ViewPresetId;
  inner: Inner;
}) {
  const f = finderOnInner(VIEW_PRESETS[presetId], inner);
  return (
    <>
      <path
        fill={DIM}
        fillRule="evenodd"
        d={`M${inner.x} ${inner.y}h${inner.w}v${inner.h}h${-inner.w}z M${f.x} ${f.y}h${f.w}v${f.h}h${-f.w}z`}
      />
      <rect
        x={f.x}
        y={f.y}
        width={f.w}
        height={f.h}
        fill="none"
        stroke={FINDER}
        strokeWidth="1.6"
      />
    </>
  );
}

function SoccerFinderThumb({ presetId }: { presetId: ViewPresetId }) {
  return (
    <svg
      className="pitch-thumb pitch-thumb--landscape view-preset__svg"
      viewBox="0 0 72 46"
      width="72"
      height="46"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <SoccerLandscapeBody />
      <FinderOverlay presetId={presetId} inner={SOCCER_INNER} />
    </svg>
  );
}

function CourtFinderThumb({ presetId }: { presetId: ViewPresetId }) {
  const wood = "#c4a574";
  const line = "#1a1612";
  return (
    <svg
      className="pitch-thumb pitch-thumb--landscape view-preset__svg"
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
      <FinderOverlay presetId={presetId} inner={COURT_INNER} />
    </svg>
  );
}

export function ViewportPresetGrid({
  sport,
  viewport,
  onPreset,
  t,
}: {
  sport: SportId;
  viewport: Viewport;
  onPreset: (id: ViewPresetId) => void;
  t: (k: MessageKey) => string;
}) {
  const court = sport === "basketball";
  return (
    <div className="view-preset-grid">
      {viewPresetsForSport(sport).map(({ id, key }) => {
        const full = t(key as MessageKey);
        const short = t(`${key}Short` as MessageKey);
        const active = viewportMatchesPreset(viewport, id);
        return (
          <button
            key={id}
            type="button"
            className={
              active ? "view-preset is-active" : "view-preset"
            }
            title={full}
            aria-label={full}
            aria-pressed={active}
            onClick={() => onPreset(id)}
          >
            {court ? (
              <CourtFinderThumb presetId={id} />
            ) : (
              <SoccerFinderThumb presetId={id} />
            )}
            <span className="view-preset__label">{short}</span>
          </button>
        );
      })}
    </div>
  );
}
