import { useEffect, useMemo, useState } from "react";
import {
  exportAspectRatio,
  type ExportCropAnchor,
  type ExportFocusId,
  type ExportPresetId,
  viewportForFocus,
} from "../canvas/exportPng";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
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
import { Link } from "react-router-dom";
import { BoardCanvas } from "./BoardCanvas";
import { BrandLockup } from "./BrandMark";
import { BoardSwitcher } from "./BoardSwitcher";
import { BroadcastToolMenu } from "./BroadcastToolMenu";
import { Drawer } from "./Drawer";
import { LiveMatchControls } from "./LiveMatchControls";
import { ExportPreviewFrame } from "./ExportPreviewFrame";
import { PieceInspector } from "./PieceInspector";
import { TextInspector } from "./TextInspector";
import { SettingsModal } from "./SettingsModal";
import { HowToModal } from "./HowToModal";
import { ToolRail } from "./ToolRail";
import { maxScenes } from "../lib/plan";
import { useFeedback } from "./FeedbackProvider";

type Props = {
  state: AppState;
};

export function Editor({ state }: Props) {
  const t = (k: MessageKey) => messages[state.locale][k];
  const { openFeedback } = useFeedback();
  const [wmImage, setWmImage] = useState<HTMLImageElement | null>(null);
  const [exportPreset, setExportPreset] = useState<ExportPresetId>("ig45");
  const [exportFocus, setExportFocus] = useState<ExportFocusId>("current");
  const [exportCropAnchor, setExportCropAnchor] = useState<ExportCropAnchor>({
    x: 0.5,
    y: 0.5,
  });
  const [exportStageAspect, setExportStageAspect] = useState(16 / 9);
  const [windowFocused, setWindowFocused] = useState(true);
  const [howToOpen, setHowToOpen] = useState(false);

  useEffect(() => {
    setExportCropAnchor({ x: 0.5, y: 0.5 });
  }, [exportPreset, exportFocus]);

  useEffect(() => {
    if (!state.settingsOpen) {
      setExportCropAnchor({ x: 0.5, y: 0.5 });
    }
  }, [state.settingsOpen]);

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

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        if (typing) return;
        e.preventDefault();
        state.selectAllPieces();
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
        if (howToOpen) {
          setHowToOpen(false);
          return;
        }
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
        if (
          state.selectedPieceIds.length > 0 ||
          state.selectedObjectId ||
          state.selectedBall
        ) {
          state.setSelectedPieceId(null);
          state.setSelectedObjectId(null);
          state.setSelectedBall(false);
          return;
        }
      }

      // ボード選択中の Delete は入力フォーカスより優先
      // （キャンバスをクリックしてもフォーカスがパネル入力に残るケースがある）
      const hasBoardSelection = !!(
        state.selectedPieceIds.length > 0 ||
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

      if (e.key === "F1" && !state.broadcast) {
        e.preventDefault();
        setHowToOpen((open) => !open);
        return;
      }

      if (typing) return;

      if (howToOpen) return;

      if (!state.broadcast && e.key === "?") {
        e.preventDefault();
        setHowToOpen(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        if (state.selectedPieceIds.length === 0) return;
        e.preventDefault();
        state.duplicateSelected();
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key === "1") {
        e.preventDefault();
        state.selectTeam("home");
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key === "2") {
        e.preventDefault();
        state.selectTeam("away");
        return;
      }

      if (state.selectedPieceIds.length > 0) {
        const arrow =
          e.key === "ArrowLeft"
            ? "left"
            : e.key === "ArrowRight"
              ? "right"
              : e.key === "ArrowUp"
                ? "up"
                : e.key === "ArrowDown"
                  ? "down"
                  : null;
        if (arrow) {
          e.preventDefault();
          if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            state.alignSelected(
              arrow === "left"
                ? "left"
                : arrow === "right"
                  ? "right"
                  : arrow === "up"
                    ? "top"
                    : "bottom",
            );
            return;
          }
          if (e.altKey && e.shiftKey) {
            state.distributeSelected(
              arrow === "left" || arrow === "right" ? "x" : "y",
            );
            return;
          }
          const step = e.shiftKey ? 0.04 : 0.012;
          state.nudgeSelected(
            arrow === "left" ? -step : arrow === "right" ? step : 0,
            arrow === "up" ? -step : arrow === "down" ? step : 0,
          );
          return;
        }
      }

      if (
        state.selectedPieceIds.length >= 2 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        if (e.key === "q" || e.key === "Q") {
          e.preventDefault();
          state.rotateSelectedAroundCentroid(-15);
          return;
        }
        if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          state.rotateSelectedAroundCentroid(15);
          return;
        }
        if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          state.scaleSelectedFromCentroid(0.92);
          return;
        }
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          state.scaleSelectedFromCentroid(1.08);
          return;
        }
      }

      if (
        e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        state.selectedPieceIds.length > 0
      ) {
        if (e.key === "h" || e.key === "H") {
          e.preventDefault();
          state.flipSelectedHorizontal();
          return;
        }
        if (e.key === "v" || e.key === "V") {
          e.preventDefault();
          state.flipSelectedVertical();
          return;
        }
      }

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
      if (e.key.toLowerCase() === "r" && state.selectedPieceIds.length > 0 && state.scene) {
        state.captureUndo();
        for (const id of state.selectedPieceIds) {
          const p = state.scene.pieces.find((x) => x.id === id);
          if (p) state.patchPiece(p.id, { facing: (p.facing + 45) % 360 }, false);
        }
        return;
      }
      if ((e.key === "v" || e.key === "V") && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        state.setTool("select");
      }
      if (e.key === "1") state.setTool("pass");
      if (e.key === "2") state.setTool("run");
      if (e.key === "3") state.setTool("dribble");
      if (state.board?.sport === "basketball" && e.key === "4") {
        state.setTool("screen");
      }
      if (e.key === "z" || e.key === "Z") state.setTool("zone");
      if (e.key === "p" || e.key === "P") state.setTool("pen");
      if (e.key === "l" || e.key === "L") state.setTool("link");
      if (e.key === "t" || e.key === "T") state.setTool("text");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, howToOpen]);

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
      link: "link",
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

  const sceneLimit =
    (state.board?.scenes.length ?? 0) >= maxScenes();

  return (
    <div className={`editor${state.broadcast ? " is-broadcast" : ""}`}>
      {!state.broadcast && (
        <header className="topbar">
          <div className="topbar-left">
            <Link className="topbar-brand" to="/" aria-label={t("brand")}>
              <BrandLockup
                className="topbar-lockup"
                markClassName="topbar-mark"
                variant="mark"
                scheme="color"
                on="dark"
                word={t("brand")}
              />
            </Link>
            <button
              type="button"
              className={state.drawerOpen ? "active" : ""}
              onClick={() => state.setDrawerOpen(!state.drawerOpen)}
            >
              {t("drawer")}
            </button>
            <BoardSwitcher state={state} t={t} />
          </div>
          {!state.drawerOpen ? (
            <input
              className="title-input"
              value={state.scene?.label ?? ""}
              onChange={(e) =>
                state.updateScene(
                  (s) => ({ ...s, label: e.target.value }),
                  false,
                )
              }
              aria-label={t("sceneLabel")}
              placeholder={t(sceneLabelPhKey(state.board?.sport))}
            />
          ) : (
            <div className="topbar-title-gap" aria-hidden />
          )}
          <div className="topbar-right">
            <div className="topbar-meta">
              <button
                type="button"
                className="topbar-icon-btn"
                title={t("howTo")}
                aria-label={t("howTo")}
                onClick={() => setHowToOpen(true)}
              >
                ?
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
              <button
                type="button"
                className="topbar-fb"
                onClick={() => openFeedback("editor")}
              >
                {t("feedbackOpen")}
              </button>
            </div>
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
            suppressMatchBanner={state.settingsOpen}
            t={t}
          />
          {exportAspect != null && (
            <ExportPreviewFrame
              aspect={exportAspect}
              anchor={exportCropAnchor}
              onAnchorChange={setExportCropAnchor}
              onStageAspect={setExportStageAspect}
              t={t}
            />
          )}
          <ToolRail state={state} t={t} />
          <PieceInspector state={state} t={t} />
          <TextInspector state={state} t={t} />
          {state.broadcast && !windowFocused && (
            <div className="broadcast-focus-hint" role="status">
              {t("broadcastFocusHint")}
            </div>
          )}
          {state.broadcast &&
            state.board?.showMatchBanner &&
            state.board.sport === "soccer" && (
              <LiveMatchControls state={state} t={t} variant="broadcast" />
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
                <button
                  type="button"
                  className="broadcast-icon-btn broadcast-scene-dup"
                  disabled={sceneLimit}
                  title={t("newScene")}
                  aria-label={t("newScene")}
                  onClick={() => {
                    if (!state.addScene()) window.alert(t("sceneLimit"));
                  }}
                >
                  {t("newSceneShort")}
                </button>
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

      <HowToModal
        open={howToOpen && !state.broadcast}
        onClose={() => setHowToOpen(false)}
        locale={state.locale}
        t={t}
      />
      <SettingsModal
        state={state}
        t={t}
        watermarkImage={wmImage}
        setWatermarkImage={setWmImage}
        exportPreset={exportPreset}
        setExportPreset={setExportPreset}
        exportFocus={exportFocus}
        setExportFocus={setExportFocus}
        exportCropAnchor={exportCropAnchor}
        exportStageAspect={exportStageAspect}
      />
    </div>
  );
}
