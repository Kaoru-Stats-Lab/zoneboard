import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BrandLockup } from "../components/BrandMark";
import {
  FRAME_EXTRACT_ACCEPT,
  copyFrameBlobToClipboard,
  frameBlobFromVideo,
  isLargeVideoFile,
} from "../capture/frameExtract";
import { normalizeLocale } from "../i18n/locale";
import { messages, type MessageKey } from "../i18n/messages";
import { loadPrefs } from "../storage/persist";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function FrameExtractPage() {
  const locale = normalizeLocale(loadPrefs().locale);
  const t = useCallback((k: MessageKey) => messages[locale][k], [locale]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileUrlRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [largeWarn, setLargeWarn] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    document.title = `${t("captureFrameTitle")} — ZoneBoard`;
  }, [t]);

  useEffect(
    () => () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = null;
      }
    },
    [],
  );

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    const url = URL.createObjectURL(file);
    fileUrlRef.current = url;
    setFileName(file.name);
    setLargeWarn(isLargeVideoFile(file));
    setDuration(0);
    setCurrentTime(0);
    setCopyStatus("idle");
    setReady(false);
    const v = videoRef.current;
    if (v) {
      v.src = url;
      v.load();
    }
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    setReady(true);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = next;
    setCurrentTime(next);
    setCopyStatus("idle");
  };

  const onCopy = async () => {
    const v = videoRef.current;
    if (!v || !ready) return;
    v.pause();
    const blob = await frameBlobFromVideo(v);
    if (!blob) {
      setCopyStatus("fail");
      return;
    }
    const ok = await copyFrameBlobToClipboard(blob);
    setCopyStatus(ok ? "ok" : "fail");
  };

  return (
    <div className="frame-extract-page">
      <header className="frame-extract-page__head">
        <BrandLockup
          className="frame-extract-page__lockup"
          markClassName="frame-extract-page__mark"
          word="ZoneBoard"
          scheme="color"
          on="dark"
        />
        <h1>{t("captureFrameTitle")}</h1>
        <p className="frame-extract-page__hint">{t("captureFramePauseHint")}</p>
      </header>

      <div className="frame-extract-page__body">
        <label className="frame-extract-page__file">
          <span title={t("captureFrameChooseFile")}>
            {t("captureFrameChooseFileShort")}
          </span>
          <input
            type="file"
            accept={FRAME_EXTRACT_ACCEPT}
            onChange={onFile}
          />
        </label>
        {fileName ? (
          <p className="frame-extract-page__name" title={fileName}>
            {fileName}
          </p>
        ) : null}
        {largeWarn ? (
          <p className="frame-extract-page__warn">{t("captureFrameLargeFileWarn")}</p>
        ) : null}

        <div className="frame-extract-page__stage">
          <video
            ref={videoRef}
            className="frame-extract-page__video"
            playsInline
            preload="metadata"
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={() => {
              const v = videoRef.current;
              if (v) setCurrentTime(v.currentTime);
            }}
          />
        </div>

        {ready && duration > 0 ? (
          <label className="frame-extract-page__seek">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.04}
              value={currentTime}
              onChange={onSeek}
              aria-label={t("captureFrameTitle")}
            />
            <span>{formatTime(duration)}</span>
          </label>
        ) : null}

        <div className="frame-extract-page__actions">
          <button
            type="button"
            className="frame-extract-page__btn frame-extract-page__btn--primary"
            disabled={!ready}
            title={t("captureFrameCopy")}
            onClick={() => void onCopy()}
          >
            {t("captureFrameCopyShort")}
          </button>
          <Link className="frame-extract-page__btn" to="/board">
            {t("openBoard")}
          </Link>
        </div>

        {copyStatus === "ok" ? (
          <p className="frame-extract-page__ok">{t("captureFramePasteHint")}</p>
        ) : null}
        {copyStatus === "fail" ? (
          <p className="frame-extract-page__warn">{t("captureFrameCopyFail")}</p>
        ) : null}
      </div>
    </div>
  );
}
