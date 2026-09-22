import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
  type ChangeEvent,
} from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import {
  imageDisplayLayout,
  screenToImage,
} from "../capture/calibPoints";
import {
  LANDMARK_IDS,
  landmarkMsgBase,
  landmarkPresetNeedsGoalSide,
  suggestedLandmarkIds,
  type CalibGoalSide,
  type CalibLandmarkPreset,
  type LandmarkId,
} from "../capture/pitchLandmarks";

const HANDLE_LABELS = ["①", "②", "③", "④"] as const;
const HANDLE_COLORS = ["#f87171", "#4ade80", "#60a5fa", "#fbbf24"];

const PRESETS: {
  id: CalibLandmarkPreset;
  full: MessageKey;
  short: MessageKey;
}[] = [
  {
    id: "full",
    full: "captureCalibPresetFull",
    short: "captureCalibPresetFullShort",
  },
  {
    id: "penalty",
    full: "captureCalibPresetPenalty",
    short: "captureCalibPresetPenaltyShort",
  },
  {
    id: "goal",
    full: "captureCalibPresetGoal",
    short: "captureCalibPresetGoalShort",
  },
  {
    id: "mixed",
    full: "captureCalibPresetMixed",
    short: "captureCalibPresetMixedShort",
  },
];

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

function MiniPitchGoalPicker({
  selected,
  needsPick,
  onPick,
  t,
}: {
  selected: CalibGoalSide | null;
  needsPick: boolean;
  onPick: (side: CalibGoalSide) => void;
  t: (k: MessageKey) => string;
}) {
  return (
    <div
      className={`capture-calib-minipitch${needsPick ? " needs-pick" : ""}`}
      role="group"
      aria-label={t("captureCalibGoalPick")}
    >
      <span className="capture-calib-minipitch-label">
        {t("captureCalibGoalPick")}
      </span>
      <div className="capture-calib-minipitch-frame">
        <svg
          className="capture-calib-minipitch-svg"
          viewBox="0 0 120 68"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="116"
            height="64"
            rx="2"
            className="mp-outline"
          />
          <line x1="60" y1="2" x2="60" y2="66" className="mp-mid" />
          <circle cx="60" cy="34" r="8" className="mp-mid" fill="none" />
          <rect x="2" y="22" width="10" height="24" className="mp-box" />
          <rect x="108" y="22" width="10" height="24" className="mp-box" />
        </svg>
        <button
          type="button"
          className={`mp-goal-hit mp-goal-x0${selected === "x0" ? " active" : ""}`}
          title={t("captureCalibGoalX0")}
          aria-label={t("captureCalibGoalX0")}
          aria-pressed={selected === "x0"}
          onClick={() => onPick("x0")}
        />
        <button
          type="button"
          className={`mp-goal-hit mp-goal-x1${selected === "x1" ? " active" : ""}`}
          title={t("captureCalibGoalX1")}
          aria-label={t("captureCalibGoalX1")}
          aria-pressed={selected === "x1"}
          onClick={() => onPick("x1")}
        />
      </div>
    </div>
  );
}

export function CaptureCalibOverlay({ state, t }: Props) {
  const session = state.captureImport;
  const image = session?.image ?? null;
  const points = session?.calibSrc4 ?? null;
  const landmarkIds = session?.calibLandmarkIds ?? null;
  const preset = session?.calibPreset ?? null;
  const goalSide = session?.calibGoalSide ?? null;
  const focusIndex = session?.calibFocusIndex ?? 0;

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [computing, setComputing] = useState(false);
  const [failKey, setFailKey] = useState<MessageKey | null>(null);
  const [showAllLandmarks, setShowAllLandmarks] = useState(false);
  const dragRef = useRef<{
    index: number;
    pointerId: number;
  } | null>(null);

  const layout = useMemo(() => {
    if (!image || stageSize.w <= 0 || stageSize.h <= 0) return null;
    return imageDisplayLayout(
      stageSize.w,
      stageSize.h,
      image.width,
      image.height,
    );
  }, [image, stageSize.h, stageSize.w]);

  const suggested = useMemo(
    () =>
      suggestedLandmarkIds(preset ?? "full", goalSide).filter((id, i, arr) =>
        arr.indexOf(id) === i,
      ),
    [preset, goalSide],
  );

  const otherIds = useMemo(() => {
    const set = new Set(suggested);
    return LANDMARK_IDS.filter((id) => !set.has(id));
  }, [suggested]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setStageSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setStageSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setFailKey(null);
  }, [points, landmarkIds]);

  const onHandlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      const stage = stageRef.current;
      if (
        !drag ||
        drag.pointerId !== e.pointerId ||
        !layout ||
        !stage ||
        !image
      ) {
        return;
      }
      const rect = stage.getBoundingClientRect();
      const p = screenToImage(
        e.clientX - rect.left,
        e.clientY - rect.top,
        layout,
        image.width,
        image.height,
      );
      state.setCaptureCalibPoint(drag.index, p);
    },
    [image, layout, state],
  );

  if (!session || !image || session.phase !== "calib") return null;

  const needsGoal =
    !!preset && landmarkPresetNeedsGoalSide(preset) && !goalSide;
  const srcMoved = !!session.calibSrcMoved;
  const setupReady = !!(landmarkIds && points && points.length === 4);
  const ready = setupReady && srcMoved;

  const onApply = async () => {
    if (!setupReady) {
      setFailKey("captureCalibNeedSetup");
      return;
    }
    if (!srcMoved) {
      setFailKey("captureCalibNeedDrag");
      return;
    }
    setComputing(true);
    setFailKey(null);
    const ok = await state.applyCaptureHomography();
    setComputing(false);
    if (ok === true) return;
    if (ok === "dup") setFailKey("captureCalibDupLandmark");
    else if (ok === "undragged") setFailKey("captureCalibNeedDrag");
    else setFailKey("captureCalibFail");
  };

  const onHandlePointerDown = (
    index: number,
    e: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, pointerId: e.pointerId };
    state.setCaptureCalibFocus(index);
  };

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onListLandmarkChange = (
    index: number,
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    state.setCaptureCalibLandmark(index, e.target.value as LandmarkId);
  };

  const lmLabel = (id: LandmarkId) => {
    const base = landmarkMsgBase(id);
    return {
      short: t(`${base}Short` as MessageKey),
      full: t(base as MessageKey),
    };
  };

  return (
    <div
      className="capture-calib-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t("captureCalibTitle")}
    >
      <header className="capture-calib-bar">
        <div className="capture-calib-bar-main">
          <span className="capture-calib-title">{t("captureCalibTitle")}</span>
          <div
            className="capture-calib-presets"
            role="group"
            aria-label={t("captureCalibPresetGroup")}
          >
            {PRESETS.map(({ id, full, short }) => (
              <button
                key={id}
                type="button"
                className={preset === id ? "active" : ""}
                title={t(full)}
                aria-pressed={preset === id}
                disabled={computing}
                onClick={() => state.setCaptureCalibPreset(id)}
              >
                {t(short)}
              </button>
            ))}
          </div>
        </div>
        <div className="capture-calib-actions">
          <button
            type="button"
            title={t("captureCalibReset")}
            disabled={computing || !setupReady}
            onClick={() => state.resetCaptureCalibPoints()}
          >
            {t("captureCalibResetShort")}
          </button>
          <button
            type="button"
            title={t("captureCalibBack")}
            disabled={computing}
            onClick={() => state.backCaptureCalib()}
          >
            {t("captureCalibBack")}
          </button>
          <button
            type="button"
            title={t("captureCalibApply")}
            disabled={computing || !ready}
            onClick={() => void onApply()}
          >
            {computing ? "…" : t("captureCalibApplyShort")}
          </button>
          <button
            type="button"
            title={t("captureImportCancel")}
            disabled={computing}
            onClick={() => state.clearCaptureImport()}
          >
            {t("captureImportCancelShort")}
          </button>
        </div>
      </header>

      <div className="capture-calib-setup">
        <MiniPitchGoalPicker
          selected={goalSide}
          needsPick={needsGoal}
          onPick={(side) => state.setCaptureCalibGoalSide(side)}
          t={t}
        />
        <p className="capture-calib-hint">{t("captureCalibHint")}</p>
      </div>

      {failKey && (
        <p className="capture-calib-error" role="alert">
          {t(failKey)}
        </p>
      )}

      <div className="capture-calib-stage" ref={stageRef}>
        <img
          className="capture-calib-image"
          src={image.url}
          width={image.width}
          height={image.height}
          alt=""
          draggable={false}
        />
        {!setupReady && (
          <p className="capture-calib-stage-prompt">
            {needsGoal
              ? t("captureCalibGoalPick")
              : t("captureCalibPickPreset")}
          </p>
        )}
        {layout &&
          setupReady &&
          points!.map((p, i) => {
            const sx = layout.offsetX + p.x * layout.scale;
            const sy = layout.offsetY + p.y * layout.scale;
            const lmId = landmarkIds![i]!;
            const { full } = lmLabel(lmId);
            return (
              <button
                key={i}
                type="button"
                className={`capture-calib-handle${focusIndex === i ? " focused" : ""}`}
                style={
                  {
                    left: sx,
                    top: sy,
                    "--handle-color": HANDLE_COLORS[i],
                  } as CSSProperties
                }
                title={`${HANDLE_LABELS[i]} · ${full}`}
                aria-label={`${HANDLE_LABELS[i]} ${full}`}
                onPointerDown={(e) => onHandlePointerDown(i, e)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onPointerCancel={onHandlePointerUp}
              >
                {HANDLE_LABELS[i]}
              </button>
            );
          })}
      </div>

      {setupReady && landmarkIds && (
        <div className="capture-calib-list">
          <div className="capture-calib-list-head">
            <span>{t("captureCalibPointList")}</span>
            <button
              type="button"
              className="capture-calib-list-more"
              onClick={() => setShowAllLandmarks((v) => !v)}
            >
              {showAllLandmarks
                ? t("captureCalibLessLandmarks")
                : t("captureCalibMoreLandmarks")}
            </button>
          </div>
          <ul className="capture-calib-list-rows">
            {landmarkIds.map((id, i) => {
              const { short, full } = lmLabel(id);
              return (
                <li
                  key={i}
                  className={focusIndex === i ? "focused" : ""}
                >
                  <button
                    type="button"
                    className="capture-calib-list-num"
                    onClick={() => state.setCaptureCalibFocus(i)}
                  >
                    {HANDLE_LABELS[i]}
                  </button>
                  <label className="capture-calib-list-select">
                    <span className="sr-only">{full}</span>
                    <select
                      value={id}
                      title={full}
                      aria-label={`${HANDLE_LABELS[i]} ${full}`}
                      disabled={computing}
                      onChange={(e) => onListLandmarkChange(i, e)}
                      onFocus={() => state.setCaptureCalibFocus(i)}
                    >
                      <optgroup label={t("captureCalibSuggestedGroup")}>
                        {suggested.map((sid) => {
                          const lab = lmLabel(sid);
                          return (
                            <option
                              key={sid}
                              value={sid}
                              title={lab.full}
                            >
                              {lab.short}
                            </option>
                          );
                        })}
                      </optgroup>
                      {(showAllLandmarks ||
                        otherIds.includes(id)) && (
                        <optgroup label={t("captureCalibOtherGroup")}>
                          {otherIds.map((sid) => {
                            const lab = lmLabel(sid);
                            return (
                              <option
                                key={sid}
                                value={sid}
                                title={lab.full}
                              >
                                {lab.short}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                  </label>
                  <span className="capture-calib-list-short" title={full}>
                    {short}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
