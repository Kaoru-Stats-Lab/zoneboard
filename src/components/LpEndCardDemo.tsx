import { useCallback, useEffect, useRef, useState } from "react";
import { LOCKUP_WORD } from "../brand/lockupWord";
import { MARK } from "../brand/mark";
import { APP_LOCALE } from "../i18n/locale";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { trackEvent } from "../lib/ga";

/** Canonical row lockup metrics (scripts/write-brand-marks.ts). */
const PAD = 2;
const MARK_BOX = 32;
const GAP = 10;
const LOCKUP_W = PAD + MARK_BOX + GAP + LOCKUP_WORD.width + PAD;
const LOCKUP_H = PAD + MARK_BOX + PAD;
const WORD_X = PAD + MARK_BOX + GAP;
const BASELINE = PAD + MARK_BOX / 2 + LOCKUP_WORD.cap / 2;
const MARK_SPAN = 21;
const S = MARK_BOX / MARK_SPAN;
const TX = PAD - 5.5 * S;
const TY = PAD - 5.5 * S;
const VB_PAD = 10;
const VB = `${-VB_PAD} ${-VB_PAD} ${LOCKUP_W + VB_PAD * 2} ${LOCKUP_H + VB_PAD * 2}`;

const TOTAL_MS = 3000;

/**
 * After-band end-card: HTML/CSS lockup sting (Surface C).
 * Scroll-in plays once; Replay restarts. No parallax / no autoplay loop.
 */
export function LpEndCardDemo() {
  const t = (k: MessageKey) => messages[APP_LOCALE][k];
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [running, setRunning] = useState(false);
  const [played, setPlayed] = useState(false);
  const autoDone = useRef(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const start = useCallback(() => {
    if (reduced) return;
    setRunning(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRunning(true);
        setPlayed(true);
        trackEvent("preview_end_card");
      });
    });
  }, [reduced]);

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setRunning(false), TOTAL_MS);
    return () => window.clearTimeout(id);
  }, [running]);

  useEffect(() => {
    if (reduced || autoDone.current) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || autoDone.current) return;
        autoDone.current = true;
        start();
        io.disconnect();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, start]);

  return (
    <div className="lp-endcard" ref={rootRef}>
      <p className="lp-endcard-label">{t("lpEndCardLabel")}</p>
      <p className="lp-endcard-copy">{t("lpEndCardBody")}</p>
      <div
        className={
          running
            ? "lp-endcard-stage lp-lockup-motion is-running"
            : "lp-endcard-stage lp-lockup-motion is-final"
        }
      >
        <svg
          className="lp-lockup-motion__svg"
          viewBox={VB}
          role="img"
          aria-label={t("brand")}
        >
          <rect
            className="lp-sting-plate"
            x={0}
            y={0}
            width={LOCKUP_W}
            height={LOCKUP_H}
            rx={8}
            fill="#141516"
            stroke="#1c1d1f"
            strokeWidth={0.35}
          />
          <g className="lp-sting-lockup">
            <g
              className="lp-sting-mark"
              transform={`translate(${TX.toFixed(3)} ${TY.toFixed(3)}) scale(${S.toFixed(6)})`}
            >
              <line
                className="lp-sting-link"
                x1={22.5}
                y1={9.5}
                x2={9.5}
                y2={22.5}
                stroke="#f3f3f1"
                strokeWidth={MARK.stroke}
                strokeLinecap="round"
                pathLength={1}
                fill="none"
              />
              {MARK.dots.map(([cx, cy], i) => (
                <circle
                  key={`${cx}-${cy}`}
                  className={
                    i === MARK.first ? "lp-sting-dot-accent" : `lp-sting-dot lp-sting-dot-${i}`
                  }
                  cx={cx}
                  cy={cy}
                  r={MARK.r}
                  fill={i === MARK.first ? "#c4a24a" : "#f3f3f1"}
                />
              ))}
            </g>
            <path
              className="lp-sting-word"
              fill="#f3f3f1"
              d={LOCKUP_WORD.d}
              transform={`translate(${WORD_X.toFixed(2)} ${BASELINE.toFixed(2)})`}
            />
          </g>
        </svg>
        {reduced ? (
          <p className="lp-endcard-static">{t("lpEndCardStatic")}</p>
        ) : (
          <button
            type="button"
            className="lp-endcard-play"
            onClick={start}
            disabled={running}
          >
            {played ? t("lpEndCardReplay") : t("lpEndCardPlay")}
          </button>
        )}
      </div>
    </div>
  );
}
