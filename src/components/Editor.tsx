import { useEffect, useMemo, useState } from "react";
import {
  exportAspectRatio,
  type ExportFocusId,
  type ExportPresetId,
  viewportForFocus,
} from "../canvas/exportPng";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { APP_LOCALE } from "../i18n/locale";
import type { SportId } from "../models/types";

function sceneLabelPhKey(sport: SportId | undefined): MessageKey {
  switch (sport) {
    case "basketball":
      return "sceneLabelPhBasket";
    case "futsal":
      return "sceneLabelPhFutsal";
    case "beach_soccer":
      return "sceneLabelPhBeach";
    case "volleyball":
      return "sceneLabelPhVolley";
    default:
      return "sceneLabelPhSoccer";
  }
}
import { BoardCanvas } from "./BoardCanvas";
import { BrandMark } from "./BrandMark";
import { BroadcastToolMenu } from "./BroadcastToolMenu";
import { Drawer } from "./Drawer";
import { ExportPreviewFrame } from "./ExportPreviewFrame";
import { PieceInspector } from "./PieceInspector";
import { TextInspector } from "./TextInspector";
import { SettingsModal } from "./SettingsModal";
import { ToolRail } from "./ToolRail";
import { useFeedback } from "./FeedbackProvider";

type Props = {
  state: AppState;
};

export function Editor({ state }: Props) {
  const t = (k: MessageKey) => messages[APP_LOCALE][k];
  const { openFeedback } = useFeedback();
  const [wmImage, setWmImage] = useState<HTMLImageElement | null>(null);
  const [exportPreset, setExportPreset] = useState<ExportPresetId>("ig45");
  const [exportFocus, setExportFocus] = useState<ExportFocusId>("current");
  const [windowFocused, setWindowFocused] = useState(true);

  useEffect(() => {
    if (!state.broadcast) {
      setWindowFocused(true);
      return;
    }
    const sync = () => setWindowFocused(document.hasFocus());
    const onFocus = () => setWindowFocused(true);
    const onBlur = () => setWindowFocused(false);
    sync();
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [state.broadcast]);

  const exportViewOverride = useMemo(() => {
    if (!state.settingsOpen || !state.board || exportFocus === "current") {
      return null;
    }
    return viewportForFocus(state.board, exportFocus);
  }, [state.settingsOpen, state.board, exportFocus]);

  const exportAspect = useMemo(() => {
    if (!state.settingsOpen || !state.board) return null;
    return exportAspectRatio(state.board, exportPreset);
  }, [state.settingsOpen, state.board, exportPreset]);

  useEffect(() => {
    const src = state.watermark.imageDataUrl;
    if (!src) {
      setWmImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => setWmImage(img);
    img.src = src;
  }, [state.watermark.imageDataUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        !!el?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        state.flushSave();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        state.undo();
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        state.redo();
        return;
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Backspace" &&
        !e.shiftKey
      ) {
        if (typing) return;
        e.preventDefault();
        state.wipeDrawing();
        return;
      }

      if (e.key === "Escape") {
        if (state.pieceInspectorId) {
          state.closePieceInspector();
          return;
        }
        if (state.settingsOpen) {
          state.setSettingsOpen(false);
          return;
        }
        if (state.broadcast) {
          state.exitBroadcast();
          return;
        }
      }

      // ボード選択中の Delete は入力フォーカスより優先
      // （キャンバスをクリックしてもフォーカスがパネル入力に残るケースがある）
      const hasBoardSelection = !!(
        state.selectedPieceId ||
        state.selectedObjectId ||
        state.selectedBall
      );
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        hasBoardSelection
      ) {
        if (typing && e.key === "Backspace") {
          // 入力中の文字削除は邪魔しない
          return;
        }
        e.preventDefault();
        state.deleteSelected();
        return;
      }

      if (typing) return;

      if (e.key.toLowerCase() === "b") {
        if (state.broadcast) state.exitBroadcast();
        else state.enterBroadcast();
        return;
      }
      if (e.key === "[" || e.key === "PageUp") {
        e.preventDefault();
        state.cycleScene(-1);
        return;
      }
      if (e.key === "]" || e.key === "PageDown") {
        e.preventDefault();
        state.cycleScene(1);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        state.deleteSelected();
        return;
      }
      if (e.key.toLowerCase() === "r" && state.selectedPieceId && state.scene) {
        const p = state.scene.pieces.find(
          (x) => x.id === state.selectedPieceId,
        );
        if (p) state.patchPiece(p.id, { facing: (p.facing + 45) % 360 });
        return;
      }
      if (e.key === "v" || e.key === "V") state.setTool("select");
      if (e.key === "1") state.setTool("pass");
      if (e.key === "2") state.setTool("run");
      if (e.key === "3") state.setTool("dribble");
      if (state.board?.sport === "basketball" && e.key === "4") {
        state.setTool("screen");
      }
      if (e.key === "z" || e.key === "Z") state.setTool("zone");
      if (e.key === "p" || e.key === "P") state.setTool("pen");
      if (e.key === "t" || e.key === "T") state.setTool("text");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  const toolLabel = (() => {
    const map: Record<string, MessageKey> = {
      select: "select",
      "piece-home": "pieceHome",
      "piece-away": "pieceAway",
      ball: "ball",
      pass: "pass",
      run: "run",
      dribble: "dribble",
      screen: "screen",
      zone: "zone",
      pen: "pen",
      text: "text",
    };
    return t(map[state.tool] ?? "select");
  })();

  const sceneFullLabel = state.scene?.label?.trim() ?? "";
  const sceneIndex =
    state.board?.scenes.findIndex((s) => s.id === state.scene?.id) ?? -1;
  const sceneShort =
    sceneFullLabel.length > 0
      ? sceneFullLabel.length > 8
        ? `${sceneFullLabel.slice(0, 7)}…`
        : sceneFullLabel
      : sceneIndex >= 0
        ? String(sceneIndex + 1)
        : "";

  return (
    <div className={`editor${state.broadcast ? " is-broadcast" : ""}`}>
      {!state.broadcast && (
        <header className="topbar">
          <div className="topbar-left">
            <strong className="topbar-brand">
              <BrandMark className="topbar-mark" title={t("brand")} />
              {t("brand")}
            </strong>
            <button
              type="button"
              className={state.drawerOpen ? "active" : ""}
              onClick={() => state.setDrawerOpen(!state.drawerOpen)}
            >
              {t("drawer")}
            </button>
            <button
              type="button"
              className="topbar-icon-btn"
              title={t("settings")}
              aria-label={t("settings")}
              onClick={() => state.setSettingsOpen(true)}
            >
              ⚙
            </button>
          </div>
          <input
            className="title-input"
            value={state.scene?.label ?? ""}
            onChange={(e) =>
              state.updateScene((s) => ({ ...s, label: e.target.value }), false)
            }
            aria-label={t("sceneLabel")}
            placeholder={t(sceneLabelPhKey(state.board?.sport))}
          />
          <div className="topbar-right">
            <button
              type="button"
              className="topbar-fb"
              onClick={() => openFeedback("editor")}
            >
              {t("feedbackOpen")}
            </button>
            <button
              type="button"
              className="broadcast-btn"
              onClick={state.enterBroadcast}
            >
              {t("broadcast")}
            </button>
          </div>
        </header>
      )}

      <div className="editor-body">
        <div className="board-stage">
          <BoardCanvas
            state={state}
            watermarkImage={wmImage}
            viewOverride={exportViewOverride}
            t={t}
          />
          {exportAspect != null && (
            <ExportPreviewFrame aspect={exportAspect} t={t} />
          )}
          <ToolRail state={state} t={t} />
          <PieceInspector state={state} t={t} />
          <TextInspector state={state} t={t} />
          {state.broadcast && !windowFocused && (
            <div className="broadcast-focus-hint" role="status">
              {t("broadcastFocusHint")}
            </div>
          )}
          {state.broadcast && (
            <div className="broadcast-chrome" aria-label={t("broadcast")}>
              <div className="broadcast-chrome-inner">
                <div className="scene-switcher">
                  <button
                    type="button"
                    className="broadcast-icon-btn"
                    onClick={() => state.cycleScene(-1)}
                    aria-label="Previous scene"
                  >
                    [
                  </button>
                  {sceneShort ? (
                    <span
                      className="broadcast-scene"
                      title={sceneFullLabel || undefined}
                    >
                      {sceneShort}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="broadcast-icon-btn"
                    onClick={() => state.cycleScene(1)}
                    aria-label="Next scene"
                  >
                    ]
                  </button>
                </div>
                <BroadcastToolMenu state={state} t={t} toolLabel={toolLabel} />
                <button
                  type="button"
                  className="broadcast-exit"
                  title={t("exitBroadcastHint")}
                  onClick={state.exitBroadcast}
                >
                  {t("exitBroadcastShort")}
                </button>
              </div>
            </div>
          )}
        </div>
        <Drawer state={state} t={t} />
      </div>

      <SettingsModal
        state={state}
        t={t}
        watermarkImage={wmImage}
        setWatermarkImage={setWmImage}
        exportPreset={exportPreset}
        setExportPreset={setExportPreset}
        exportFocus={exportFocus}
        setExportFocus={setExportFocus}
      />
    </div>
  );
}
