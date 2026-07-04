import { useLayoutEffect, useRef, useState } from "react";
import type { MessageKey } from "../i18n/messages";

type Props = {
  aspect: number;
  t: (k: MessageKey) => string;
};

/** ボード上に PNG の画角枠を重ねる（外側を暗くする） */
export function ExportPreviewFrame({ aspect, t }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ x: 0, y: 0, w: 0, h: 0 });

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => {
      const sw = host.clientWidth;
      const sh = host.clientHeight;
      if (sw <= 0 || sh <= 0 || aspect <= 0) return;
      let w = sw;
      let h = w / aspect;
      if (h > sh) {
        h = sh;
        w = h * aspect;
      }
      setFrame({
        x: (sw - w) / 2,
        y: (sh - h) / 2,
        w,
        h,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    return () => ro.disconnect();
  }, [aspect]);

  return (
    <div ref={hostRef} className="export-preview" aria-hidden>
      <div
        className="export-preview-frame"
        style={{
          left: frame.x,
          top: frame.y,
          width: frame.w,
          height: frame.h,
        }}
      >
        <span className="export-preview-label">{t("exportPreviewLabel")}</span>
      </div>
    </div>
  );
}
