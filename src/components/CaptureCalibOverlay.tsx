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
  landmarkPresetIds,
  resolveCalibLandmarkIds,
  type CalibLandmarkPreset,
  type LandmarkId,
} from "../capture/pitchLandmarks";

const HANDLE_LABELS = ["1", "2", "3", "4"] as const;
const HANDLE_COLORS = ["#f87171", "#4ade80", "#60a5fa", "#fbbf24"];

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

function activePreset(
  ids: readonly LandmarkId[],
): CalibLandmarkPreset | null {
  for (const preset of ["full", "left", "right"] as const) {
    const want = landmarkPresetIds(preset);
    if (ids.every((id, i) => id === want[i])) return preset;
  }
  return null;
}

export function CaptureCalibOverlay({ state, t }: Props) {
  const session = state.captureImport;
  const image = session?.image ?? null;
  const points = session?.calibSrc4 ?? null;
  const landmarkIds = useMemo(
    () => resolveCalibLandmarkIds(session?.calibLandmarkIds),
    [session?.calibLandmarkIds],
  );
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [computing, setComputing] = useState(false);
  const [failKey, setFailKey] = useState<MessageKey | null>(null);
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

  if (!session || !image || !points || session.phase !== "calib") return null;

  const preset = activePreset(landmarkIds);

  const onApply = async () => {
    setComputing(true);
    setFailKey(null);
    const ok = await state.applyCaptureHomography();
    setComputing(false);
    if (ok === true) return;
    if (ok === "dup") setFailKey("captureCalibDupLandmark");
    else setFailKey("captureCalibFail");
  };

  const onHandlePointerDown = (
    index: number,
    e: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, pointerId: e.pointerId };
  };

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onLandmarkChange = (
    index: number,
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    e.stopPropagation();
    state.setCaptureCalibLandmark(index, e.target.value as LandmarkId);
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
            {(
              [
                ["full", "captureCalibPresetFull", "captureCalibPresetFullShort"],
                [
                  "left",
                  "captureCalibPresetLeft",
                  "captureCalibPresetLeftShort",
                ],
                [
                  "right",
                  "captureCalibPresetRight",
                  "captureCalibPresetRightShort",
                ],
              ] as const
            ).map(([id, fullKey, shortKey]) => (
              <button
                key={id}
                type="button"
                className={preset === id ? "active" : ""}
                title={t(fullKey)}
                aria-pressed={preset === id}
                disabled={computing}
                onClick={() => state.setCaptureCalibPreset(id)}
              >
                {t(shortKey)}
              </button>
            ))}
          </div>
        </div>
        <div className="capture-calib-actions">
          <button
            type="button"
            title={t("captureCalibReset")}
            disabled={computing}
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
            disabled={computing}
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

      <p className="capture-calib-hint">{t("captureCalibHint")}</p>

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
        {layout &&
          points.map((p, i) => {
            const sx = layout.offsetX + p.x * layout.scale;
            const sy = layout.offsetY + p.y * layout.scale;
            const lmId = landmarkIds[i]!;
            const base = landmarkMsgBase(lmId);
            const fullKey = base as MessageKey;
            return (
              <div
                key={i}
                className="capture-calib-handle-wrap"
                style={{ left: sx, top: sy }}
              >
                <button
                  type="button"
                  className="capture-calib-handle"
                  style={
                    {
                      "--handle-color": HANDLE_COLORS[i],
                    } as CSSProperties
                  }
                  title={`${HANDLE_LABELS[i]} · ${t(fullKey)} · ${t("captureCalibHint")}`}
                  aria-label={`${HANDLE_LABELS[i]} ${t(fullKey)}`}
                  onPointerDown={(e) => onHandlePointerDown(i, e)}
                  onPointerMove={onHandlePointerMove}
                  onPointerUp={onHandlePointerUp}
                  onPointerCancel={onHandlePointerUp}
                >
                  {HANDLE_LABELS[i]}
                </button>
                <label className="capture-calib-lm">
                  <select
                    value={lmId}
                    title={t(fullKey)}
                    aria-label={t(fullKey)}
                    disabled={computing}
                    onChange={(e) => onLandmarkChange(i, e)}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {LANDMARK_IDS.map((id) => {
                      const b = landmarkMsgBase(id);
                      return (
                        <option key={id} value={id} title={t(b as MessageKey)}>
                          {t(`${b}Short` as MessageKey)}
                        </option>
                      );
                    })}
                  </select>
                </label>
              </div>
            );
          })}
      </div>
    </div>
  );
}
