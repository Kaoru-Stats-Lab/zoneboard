import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
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
  landmarkNorm,
  landmarkPitchSide,
  landmarkPresetNeedsGoalSide,
  suggestedLandmarkIds,
  type CalibGoalSide,
  type CalibLandmarkPreset,
  type LandmarkId,
} from "../capture/pitchLandmarks";

const HANDLE_LABELS = ["①", "②", "③", "④"] as const;
const HANDLE_COLORS = ["#f87171", "#4ade80", "#60a5fa", "#fbbf24"];

/** Mini-pitch SVG viewBox → landmarkNorm mapping. */
const MP_VB = { w: 120, h: 68, padX: 2, padY: 2, innerW: 116, innerH: 64 };

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
  focusLandmarkId,
  onPick,
  t,
}: {
  selected: CalibGoalSide | null;
  needsPick: boolean;
  focusLandmarkId: LandmarkId | null;
  onPick: (side: CalibGoalSide) => void;
  t: (k: MessageKey) => string;
}) {
  const pin = focusLandmarkId ? landmarkNorm(focusLandmarkId) : null;
  const pinCx = pin
    ? MP_VB.padX + pin.x * MP_VB.innerW
    : null;
  const pinCy = pin
    ? MP_VB.padY + pin.y * MP_VB.innerH
    : null;

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
          viewBox={`0 0 ${MP_VB.w} ${MP_VB.h}`}
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
          {pinCx != null && pinCy != null && (
            <circle
              className="mp-landmark-pin"
              cx={pinCx}
              cy={pinCy}
              r="3.5"
            />
          )}
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
  const changePanelRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [computing, setComputing] = useState(false);
  const [failKey, setFailKey] = useState<MessageKey | null>(null);
  /** Row index whose change panel is open; null = closed */
  const [changeRow, setChangeRow] = useState<number | null>(null);
  const [showAllInPanel, setShowAllInPanel] = useState(false);
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

  useEffect(() => {
    setChangeRow(null);
    setShowAllInPanel(false);
  }, [preset, goalSide]);

  useEffect(() => {
    if (changeRow == null) return;
    const onDoc = (e: MouseEvent) => {
      const panel = changePanelRef.current;
      if (panel && !panel.contains(e.target as Node)) {
        setChangeRow(null);
        setShowAllInPanel(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [changeRow]);

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
  const focusLandmarkId =
    setupReady && landmarkIds
      ? (landmarkIds[focusIndex] ?? null)
      : null;

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

  const lmLabel = (id: LandmarkId) => {
    const base = landmarkMsgBase(id);
    return {
      short: t(`${base}Short` as MessageKey),
      full: t(base as MessageKey),
    };
  };

  const sideSubtitle = (id: LandmarkId): string | null => {
    const side = landmarkPitchSide(id);
    if (side === "goalLine") return t("captureCalibSideGoalLine");
    if (side === "field") return t("captureCalibSideField");
    return null;
  };

  const openChange = (index: number) => {
    state.setCaptureCalibFocus(index);
    setShowAllInPanel(false);
    setChangeRow((prev) => (prev === index ? null : index));
  };

  const pickLandmark = (index: number, id: LandmarkId) => {
    state.setCaptureCalibLandmark(index, id);
    setChangeRow(null);
    setShowAllInPanel(false);
  };

  const onPanelKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setChangeRow(null);
      setShowAllInPanel(false);
    }
  };

  const renderCandidate = (
    rowIndex: number,
    sid: LandmarkId,
    current: LandmarkId,
  ) => {
    const lab = lmLabel(sid);
    const sub = sideSubtitle(sid);
    const selected = sid === current;
    return (
      <button
        key={sid}
        type="button"
        role="option"
        className={`capture-calib-pick${selected ? " selected" : ""}`}
        aria-selected={selected}
        title={lab.full}
        onClick={() => pickLandmark(rowIndex, sid)}
      >
        <span className="capture-calib-pick-main">{lab.short}</span>
        {sub && <span className="capture-calib-pick-sub">{sub}</span>}
      </button>
    );
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
          focusLandmarkId={focusLandmarkId}
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
          </div>
          <ul className="capture-calib-list-rows">
            {landmarkIds.map((id, i) => {
              const { short, full } = lmLabel(id);
              const sub = sideSubtitle(id);
              const panelOpen = changeRow === i;
              const panelIds =
                showAllInPanel || otherIds.includes(id)
                  ? [...suggested, ...otherIds]
                  : suggested;
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
                  <div className="capture-calib-list-body">
                    <span className="capture-calib-list-main" title={full}>
                      {short}
                    </span>
                    {sub && (
                      <span className="capture-calib-list-sub">{sub}</span>
                    )}
                  </div>
                  <div
                    className="capture-calib-list-change-wrap"
                    ref={panelOpen ? changePanelRef : undefined}
                  >
                    <button
                      type="button"
                      className="capture-calib-list-change"
                      title={t("captureCalibChange")}
                      aria-label={`${HANDLE_LABELS[i]} ${t("captureCalibChange")}`}
                      aria-expanded={panelOpen}
                      aria-haspopup="listbox"
                      disabled={computing}
                      onClick={() => openChange(i)}
                    >
                      {t("captureCalibChangeShort")}
                    </button>
                    {panelOpen && (
                      <div
                        className="capture-calib-change-panel"
                        role="listbox"
                        aria-label={t("captureCalibChange")}
                        onKeyDown={onPanelKeyDown}
                      >
                        <div className="capture-calib-change-panel-head">
                          <span>{t("captureCalibSuggestedGroup")}</span>
                          <button
                            type="button"
                            className="capture-calib-list-more"
                            onClick={() =>
                              setShowAllInPanel((v) => !v)
                            }
                          >
                            {showAllInPanel
                              ? t("captureCalibLessLandmarks")
                              : t("captureCalibMoreLandmarks")}
                          </button>
                        </div>
                        <div className="capture-calib-change-panel-opts">
                          {panelIds.map((sid) =>
                            renderCandidate(i, sid, id),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
