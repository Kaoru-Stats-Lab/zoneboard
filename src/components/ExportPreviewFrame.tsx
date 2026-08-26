import {
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  exportFrameRect,
  type ExportCropAnchor,
} from "../canvas/exportPng";
import type { MessageKey } from "../i18n/messages";

export type { ExportCropAnchor };

type Props = {
  aspect: number;
  anchor: ExportCropAnchor;
  onAnchorChange: (anchor: ExportCropAnchor) => void;
  onStageAspect: (aspect: number) => void;
  t: (k: MessageKey) => string;
};

/** ボード上に PNG の画角枠を重ねる（外側を暗くする）。ドラッグで位置を変えられる。 */
export function ExportPreviewFrame({
  aspect,
  anchor,
  onAnchorChange,
  onStageAspect,
  t,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef(anchor);
  const onAnchorChangeRef = useRef(onAnchorChange);
  const onStageAspectRef = useRef(onStageAspect);
  anchorRef.current = anchor;
  onAnchorChangeRef.current = onAnchorChange;
  onStageAspectRef.current = onStageAspect;

  const [frame, setFrame] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    freeX: 0,
    freeY: 0,
  });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    freeX: number;
    freeY: number;
  } | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => {
      const sw = host.clientWidth;
      const sh = host.clientHeight;
      if (sw <= 0 || sh <= 0 || aspect <= 0) return;
      onStageAspectRef.current(sw / sh);
      const rect = exportFrameRect(sw, sh, aspect, anchorRef.current);
      setFrame({
        ...rect,
        freeX: Math.max(0, sw - rect.w),
        freeY: Math.max(0, sh - rect.h),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    return () => ro.disconnect();
  }, [aspect, anchor]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (frame.freeX < 0.5 && frame.freeY < 0.5) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: frame.x,
      originY: frame.y,
      freeX: frame.freeX,
      freeY: frame.freeY,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const x = drag.originX + (e.clientX - drag.startX);
    const y = drag.originY + (e.clientY - drag.startY);
    onAnchorChangeRef.current({
      x: drag.freeX > 0 ? Math.min(1, Math.max(0, x / drag.freeX)) : 0.5,
      y: drag.freeY > 0 ? Math.min(1, Math.max(0, y / drag.freeY)) : 0.5,
    });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  const canDrag = frame.freeX >= 0.5 || frame.freeY >= 0.5;

  return (
    <div ref={hostRef} className="export-preview" aria-hidden>
      <div
        className={
          canDrag ? "export-preview-frame is-draggable" : "export-preview-frame"
        }
        style={{
          left: frame.x,
          top: frame.y,
          width: frame.w,
          height: frame.h,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="export-preview-label">{t("exportPreviewLabel")}</span>
      </div>
    </div>
  );
}
