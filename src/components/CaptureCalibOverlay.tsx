import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from "react";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import {
  imageDisplayLayout,
  screenToImage,
} from "../capture/calibPoints";

const HANDLE_LABELS = ["TL", "TR", "BR", "BL"] as const;
const HANDLE_COLORS = ["#f87171", "#4ade80", "#60a5fa", "#fbbf24"];

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
};

export function CaptureCalibOverlay({ state, t }: Props) {
  const session = state.captureImport;
  const image = session?.image;
  const points = session?.calibSrc4;
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [computing, setComputing] = useState(false);
  const [failed, setFailed] = useState(false);
  const dragRef = useRef<{
    index: number;
    pointerId: number;
  } | null>(null);

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
    setFailed(false);
  }, [points]);

  if (!session || !image || !points || session.phase !== "calib") return null;

  const layout =
    stageSize.w > 0 && stageSize.h > 0
      ? imageDisplayLayout(stageSize.w, stageSize.h, image.width, image.height)
      : null;

  const onApply = async () => {
    setComputing(true);
    setFailed(false);
    const ok = await state.applyCaptureHomography();
    setComputing(false);
    if (!ok) setFailed(true);
  };

  const onHandlePointerDown = (
    index: number,
    e: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, pointerId: e.pointerId };
  };

  const onHandlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      const stage = stageRef.current;
      if (!drag || drag.pointerId !== e.pointerId || !layout || !stage) return;
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
    [image.height, image.width, layout, state],
  );

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="capture-calib-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t("captureCalibTitle")}
    >
      <header className="capture-calib-bar">
        <span className="capture-calib-title">{t("captureCalibTitle")}</span>
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

      {failed && (
        <p className="capture-calib-error" role="alert">
          {t("captureCalibFail")}
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
            return (
              <button
                key={i}
                type="button"
                className="capture-calib-handle"
                style={{
                  left: sx,
                  top: sy,
                  "--handle-color": HANDLE_COLORS[i],
                } as CSSProperties}
                title={`${HANDLE_LABELS[i]} · ${t("captureCalibHint")}`}
                aria-label={HANDLE_LABELS[i]}
                onPointerDown={(e) => onHandlePointerDown(i, e)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onPointerCancel={onHandlePointerUp}
              />
            );
          })}
      </div>
    </div>
  );
}
