import { useEffect, useMemo, useState } from "react";
import {
  exportAspectRatio,
  type ExportFocusId,
  type ExportPresetId,
  viewportForFocus,
} from "../canvas/exportPng";
import type { AppState } from "../hooks/useAppState";
import type { Locale, MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { BoardCanvas } from "./BoardCanvas";
import { BroadcastToolMenu } from "./BroadcastToolMenu";
import { Drawer } from "./Drawer";
import { ExportPreviewFrame } from "./ExportPreviewFrame";
import { PieceInspector } from "./PieceInspector";
import { SettingsModal } from "./SettingsModal";
import { ToolRail } from "./ToolRail";

type Props = {
  state: AppState;
  locale: Locale;
  onLocale: (l: Locale) => void;
};

export function Editor({ state, locale, onLocale }: Props) {
  const t = (k: MessageKey) => messages[locale][k];
  const [wmImage, setWmImage] = useState<HTMLImageElement | null>(null);
  const [exportPreset, setExportPreset] = useState<ExportPresetId>("ig45");
  const [exportFocus, setExportFocus] = useState<ExportFocusId>("current");

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
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

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
      zone: "zone",
      pen: "pen",
      text: "text",
    };
    return t(map[state.tool] ?? "select");
  })();

  return (
    <div className={`editor${state.broadcast ? " is-broadcast" : ""}`}>
      {!state.broadcast && (
        <header className="topbar">
          <div className="topbar-left">
            <strong className="topbar-brand">{t("brand")}</strong>
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
            placeholder={t("sceneLabel")}
          />
          <div className="topbar-right">
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
          />
          {exportAspect != null && (
            <ExportPreviewFrame aspect={exportAspect} t={t} />
          )}
          <ToolRail state={state} t={t} />
          <PieceInspector state={state} t={t} />
        </div>
        <Drawer state={state} t={t} />
      </div>

      {state.broadcast && (
        <div className="broadcast-chrome">
          <div className="scene-switcher">
            <button type="button" onClick={() => state.cycleScene(-1)}>
              [
            </button>
            <span className="tool-pill scene-pill">
              {state.scene?.label ?? ""}
            </span>
            <button type="button" onClick={() => state.cycleScene(1)}>
              ]
            </button>
          </div>
          <BroadcastToolMenu state={state} t={t} toolLabel={toolLabel} />
          <button type="button" onClick={state.exitBroadcast}>
            {t("exitBroadcast")}
          </button>
        </div>
      )}

      <SettingsModal
        state={state}
        t={t}
        locale={locale}
        onLocale={onLocale}
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
