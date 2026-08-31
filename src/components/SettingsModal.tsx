import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { loadBallImage } from "../assets/ballImages";
import {
  downloadBlob,
  exportBoardPng,
  exportFilename,
  type ExportCropAnchor,
  type ExportFocusId,
  type ExportPresetId,
} from "../canvas/exportPng";
import type { AppState } from "../hooks/useAppState";
import { normalizeLocale } from "../i18n/locale";
import type { MessageKey } from "../i18n/messages";
import { STREAM_SHARE_BLURB } from "../site/shareCopy";
import { useFeedback } from "./FeedbackProvider";

type Props = {
  state: AppState;
  t: (k: MessageKey) => string;
  watermarkImage: HTMLImageElement | null;
  setWatermarkImage: (img: HTMLImageElement | null) => void;
  exportPreset: ExportPresetId;
  setExportPreset: (p: ExportPresetId) => void;
  exportFocus: ExportFocusId;
  setExportFocus: (f: ExportFocusId) => void;
  exportCropAnchor: ExportCropAnchor;
  exportStageAspect: number;
};

const WM_POSITIONS: { id: string; x: number; y: number; key: MessageKey }[] = [
  { id: "tl", x: 0.12, y: 0.12, key: "wmPosTl" },
  { id: "tr", x: 0.88, y: 0.12, key: "wmPosTr" },
  { id: "center", x: 0.5, y: 0.5, key: "wmPosCenter" },
  { id: "bl", x: 0.12, y: 0.88, key: "wmPosBl" },
  { id: "br", x: 0.88, y: 0.88, key: "wmPosBr" },
];

export function SettingsModal({
  state,
  t,
  watermarkImage,
  setWatermarkImage,
  exportPreset,
  setExportPreset,
  exportFocus,
  setExportFocus,
  exportCropAnchor,
  exportStageAspect,
}: Props) {
  const { openFeedback } = useFeedback();
  const fileRef = useRef<HTMLInputElement>(null);
  const [bakeCaption, setBakeCaption] = useState(false);
  const [bakeCredit, setBakeCredit] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const broadcastUrl = `${window.location.origin}/board?broadcast=1`;
  const dragRef = useRef<{
    ox: number;
    oy: number;
    sx: number;
    sy: number;
  } | null>(null);

  useEffect(() => {
    if (!state.settingsOpen) setPos(null);
  }, [state.settingsOpen]);

  if (!state.settingsOpen || !state.board || state.broadcast) return null;
  const wm = state.watermark;

  const onHeaderPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const modal = (e.currentTarget as HTMLElement).closest(".modal");
    if (!modal) return;
    const rect = modal.getBoundingClientRect();
    const x = pos?.x ?? rect.left;
    const y = pos?.y ?? rect.top;
    dragRef.current = { ox: e.clientX, oy: e.clientY, sx: x, sy: y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onHeaderPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setPos({
      x: d.sx + (e.clientX - d.ox),
      y: d.sy + (e.clientY - d.oy),
    });
  };

  const onHeaderPointerUp = () => {
    dragRef.current = null;
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await readAsDataUrl(file);
    const compressed = await maybeCompress(dataUrl);
    const img = await loadImage(compressed);
    setWatermarkImage(img);
    state.updateWatermark({
      ...wm,
      enabled: true,
      imageDataUrl: compressed,
    });
  };

  const copyBroadcastUrl = async () => {
    try {
      await navigator.clipboard.writeText(broadcastUrl);
      setUrlCopied(true);
      window.setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      window.prompt(t("obsBroadcastUrl"), broadcastUrl);
    }
  };

  const copyShareBlurb = async () => {
    try {
      await navigator.clipboard.writeText(STREAM_SHARE_BLURB);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1600);
    } catch {
      window.prompt(t("obsShareCopy"), STREAM_SHARE_BLURB);
    }
  };

  const onExport = async () => {
    if (!state.board) return;
    const ballImg = await loadBallImage(state.board.sport);
    const blob = await exportBoardPng(
      state.board,
      state.watermark,
      watermarkImage,
      {
        preset: exportPreset,
        bakeWatermark: state.bakeWm,
        bakeCaption,
        bakeCredit,
        focus: exportFocus,
        selectionColor: state.selectionColor,
        y2cLabel: t("cardY2CLabel"),
        injLabel: t("subInjured"),
        stageAspect: exportStageAspect,
        cropAnchor: exportCropAnchor,
      },
      ballImg,
    );
    downloadBlob(blob, exportFilename(state.board, exportPreset));
  };

  const activePos = WM_POSITIONS.find(
    (p) => Math.abs(p.x - wm.x) < 0.05 && Math.abs(p.y - wm.y) < 0.05,
  )?.id;

  return (
    <div className="modal-backdrop settings-backdrop">
      <div
        className={`modal${pos ? " modal-dragged" : ""}`}
        role="dialog"
        style={
          pos
            ? { left: pos.x, top: pos.y, transform: "none" }
            : undefined
        }
      >
        <header
          className="modal-drag-handle"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          onPointerCancel={onHeaderPointerUp}
        >
          <h2>{t("settings")}</h2>
          <button
            type="button"
            className="modal-close-btn"
            aria-label={t("close")}
            onClick={() => state.setSettingsOpen(false)}
          >
            {t("close")}
          </button>
        </header>

        <section>
          <h3>{t("language")}</h3>
          <label className="field">
            <span className="field-label">{t("language")}</span>
            <select
              value={state.locale}
              onChange={(e) =>
                state.setLocale(normalizeLocale(e.target.value))
              }
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="es">Español</option>
              <option value="pt">Português (BR)</option>
              <option value="pl">Polski</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="tr">Türkçe</option>
            </select>
          </label>
          <p className="hint-muted">{t("languageHint")}</p>
        </section>

        <section>
          <h3>{t("watermark")}</h3>
          <label className="check">
            <input
              type="checkbox"
              checked={wm.enabled}
              onChange={(e) =>
                state.updateWatermark({ ...wm, enabled: e.target.checked })
              }
            />
            {t("enabled")}
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <button type="button" onClick={() => fileRef.current?.click()}>
            {t("uploadLogo")}
          </button>
          <p className="hint-muted">{t("positionDrag")}</p>
          <span className="field-label">{t("wmPos")}</span>
          <div className="wm-pos-grid" role="group" aria-label={t("wmPos")}>
            {WM_POSITIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`wm-pos-btn wm-pos-${p.id}${activePos === p.id ? " active" : ""}`}
                title={t(p.key)}
                onClick={() =>
                  state.updateWatermark({ ...wm, x: p.x, y: p.y })
                }
              >
                <span className="wm-pos-dot" />
              </button>
            ))}
          </div>
          <label>
            {t("size")} ({wm.sizePercent}%)
            <input
              type="range"
              min={8}
              max={55}
              value={wm.sizePercent}
              onChange={(e) =>
                state.updateWatermark({
                  ...wm,
                  sizePercent: Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            {t("opacity")} ({Math.round(wm.opacity * 100)}%)
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(wm.opacity * 100)}
              onChange={(e) =>
                state.updateWatermark({
                  ...wm,
                  opacity: Number(e.target.value) / 100,
                })
              }
            />
          </label>
        </section>

        <section>
          <h3>{t("exportPng")}</h3>
          <p className="hint-muted">{t("exportHint")}</p>
          <p className="hint-muted">{t("exportPreviewHint")}</p>
          <span className="field-label">{t("exportGroupPost")}</span>
          <div className="preset-row">
            {(
              [
                ["ig45", "presetIg45Short", "presetIg45"],
                ["story", "presetStoryShort", "presetStory"],
                ["square", "presetSquareShort", "presetSquare"],
              ] as const
            ).map(([id, short, full]) => (
              <button
                key={id}
                type="button"
                className={exportPreset === id ? "active" : ""}
                title={t(full)}
                onClick={() => setExportPreset(id)}
              >
                {t(short)}
              </button>
            ))}
          </div>
          <span className="field-label">{t("exportGroupLive")}</span>
          <div className="preset-row">
            {(
              [
                ["x169", "presetX169Short", "presetX169"],
                ["native", "presetNativeShort", "presetNative"],
              ] as const
            ).map(([id, short, full]) => (
              <button
                key={id}
                type="button"
                className={exportPreset === id ? "active" : ""}
                title={t(full)}
                onClick={() => setExportPreset(id)}
              >
                {t(short)}
              </button>
            ))}
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={state.bakeWm}
              onChange={(e) => state.setBakeWm(e.target.checked)}
            />
            {t("bakeWm")}
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={bakeCaption}
              onChange={(e) => setBakeCaption(e.target.checked)}
            />
            {t("bakeCaption")}
          </label>
          <p className="hint-muted">{t("bakeCaptionHint")}</p>
          <label className="check">
            <input
              type="checkbox"
              checked={bakeCredit}
              onChange={(e) => setBakeCredit(e.target.checked)}
            />
            {t("bakeCredit")}
          </label>
          <p className="hint-muted">{t("bakeCreditHint")}</p>
          <label>
            {t("exportFocus")}
            <select
              value={exportFocus}
              onChange={(e) =>
                setExportFocus(e.target.value as ExportFocusId)
              }
            >
              <option value="current">{t("focusCurrent")}</option>
              <option value="full">{t("focusFull")}</option>
              <option value="final-third-right">{t("focusFtR")}</option>
              <option value="final-third-left">{t("focusFtL")}</option>
            </select>
          </label>
          <p className="hint-muted">{t("exportFocusHint")}</p>
          <button type="button" className="active" onClick={onExport}>
            {t("exportPng")}
          </button>
        </section>

        <section>
          <h3>{t("obsSection")}</h3>
          <p className="hint-muted">{t("obsIntro")}</p>
          <ol className="obs-checklist">
            <li>{t("obsStep1")}</li>
            <li>{t("obsStep2")}</li>
            <li>{t("obsStep3")}</li>
            <li>{t("obsStep4")}</li>
          </ol>
          <p className="hint-muted obs-warn">{t("obsBrowserWarn")}</p>
          <p className="hint-muted">{t("obsNotIncluded")}</p>
          <ul className="obs-checklist">
            <li>{t("obsFocusCapture")}</li>
            <li>{t("obsFocusObs")}</li>
            <li>{t("obsHotkeys")}</li>
          </ul>
          <span className="field-label">{t("obsBroadcastUrl")}</span>
          <div className="obs-url-row">
            <input
              type="text"
              readOnly
              value={broadcastUrl}
              aria-label={t("obsBroadcastUrl")}
              onFocus={(e) => e.currentTarget.select()}
            />
            <button type="button" onClick={copyBroadcastUrl}>
              {urlCopied ? t("obsUrlCopied") : t("obsUrlCopy")}
            </button>
          </div>
          <p className="hint-muted">{t("obsBroadcastUrlHint")}</p>
          <span className="field-label">{t("obsShareLabel")}</span>
          <div className="obs-url-row">
            <input
              type="text"
              readOnly
              value={STREAM_SHARE_BLURB}
              aria-label={t("obsShareLabel")}
              onFocus={(e) => e.currentTarget.select()}
            />
            <button type="button" onClick={copyShareBlurb}>
              {shareCopied ? t("obsUrlCopied") : t("obsShareCopy")}
            </button>
          </div>
          <p className="hint-muted">{t("obsShareHint")}</p>
          <p className="hint-muted obs-warn">{t("obsSettingsWarn")}</p>
        </section>

        <section>
          <h3>{t("appearance")}</h3>
          {state.board.sport === "soccer" && (
            <>
              <span className="field-label">{t("pitchSurface")}</span>
              <div className="preset-row pitch-surface-row">
                <button
                  type="button"
                  className={!state.board.showGrassPitch ? "active" : ""}
                  onClick={() =>
                    state.updateBoard((b) => ({ ...b, showGrassPitch: false }), false)
                  }
                >
                  {t("pitchSurfaceWhite")}
                </button>
                <button
                  type="button"
                  className={state.board.showGrassPitch ? "active" : ""}
                  onClick={() =>
                    state.updateBoard((b) => ({ ...b, showGrassPitch: true }), false)
                  }
                >
                  {t("pitchSurfaceGrass")}
                </button>
              </div>
              <p className="hint-muted">{t("grassPitchHint")}</p>
            </>
          )}
          <label>
            {t("selectionColor")}
            <input
              type="color"
              value={state.selectionColor}
              onChange={(e) => state.setSelectionColor(e.target.value)}
            />
          </label>
        </section>

        <section className="modal-danger">
          <h3>{t("dangerZone")}</h3>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t("confirmClearDrawings"))) {
                state.clearDrawings();
              }
            }}
          >
            {t("clearDrawings")}
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (window.confirm(t("confirmClear"))) state.clearBoard();
            }}
          >
            {t("resetBoard")}
          </button>
        </section>

        <footer className="modal-footer-row">
          <span>{t("version")}</span>
          <button
            type="button"
            className="modal-footer-fb"
            onClick={() => openFeedback("settings")}
          >
            {t("feedbackOpen")}
          </button>
        </footer>
      </div>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function maybeCompress(dataUrl: string): Promise<string> {
  if (dataUrl.length <= 500_000) return dataUrl;
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const max = 512;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
