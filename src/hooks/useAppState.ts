import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBoard } from "../models/defaults";
import { uid } from "../models/id";
import {
  displayNameFromZoneboardFile,
  exportBoardJsonDownload,
  parsePortableBoardJson,
  parsePortableBoardJsonForOpen,
  PortableImportError,
  portableBoardFilename,
  portableToJsonString,
  serializeBoardToPortable,
  type PortableImportErrorCode,
} from "../boardio";
import {
  boardContentFingerprint,
  clearFileSessionDraft,
  isFileSessionContentDirty,
  readFileSessionDraft,
  writeFileSessionDraft,
} from "../storage/fileSessionDraft";
import type { FileMetaSnapshot } from "../lib/fileSystemAccess";
import {
  detectSaveConflict,
  readFileSnapshot,
  writeBoardToFileHandle,
  type SaveToSourceResult,
} from "../storage/directorySave";
import {
  normalizeSaveAsFileName,
  saveBoardAsNewInDirectory,
  type SaveAsPhase,
  type SaveAsToFolderResult,
} from "../storage/directorySaveAs";
import { boardDisplayName } from "../lib/boardLabel";
import { ballAfterDrop } from "../models/ballAttach";
import {
  ballsAfterPieceDelete,
  ballsFollowingMovedPieces,
  createBallObject,
  normalizeSceneBalls,
  offsetBallCopy,
} from "../models/ballSanitize";
import type { BallObject } from "../models/types";
import { roleFromPosition } from "../models/pieceRole";
import {
  defaultFacingForTeam,
  setGroupFacing,
  setGroupFacingToTeamAttack,
} from "../models/pieceFacing";
import {
  DEFAULT_MAX_SUBS,
  statusesAfterSub,
} from "../models/matchStatus";
import {
  createPkShootout,
  cyclePkResult,
  emptyPkSlot,
} from "../models/pkShootout";
import type { PkKickResult } from "../models/types";
import {
  activeViewport,
  createScene,
  getActiveScene,
  isPieceDrawn,
  mapActiveScene,
  swapSceneEnds,
  swapViewportEnds,
  sceneViewport,
} from "../models/scene";
import type {
  BoardDocument,
  BoardStore,
  HideHalf,
  TeamFocus,
  LineKind,
  Piece,
  CardKind,
  GoalKind,
  PitchOrientation,
  ScenePhase,
  ShapeKind,
  ShapeObject,
  SportId,
  TextFontId,
  ToolId,
  Viewport,
  WatermarkSettings,
} from "../models/types";
import {
  arrangeDrawObject,
  type ShapeArrangeOp,
} from "../canvas/shapeArrange";
import {
  SHAPE_DEFAULT_FILL_COLOR,
  SHAPE_DEFAULT_FILL_OPACITY,
  clampShapeFillOpacity,
  createShapeObject,
  sanitizeShapeFillColor,
  sanitizeShapeObject,
} from "../models/shapeSanitize";
import {
  AWAY_COLOR,
  DEFAULT_SELECTION_COLOR,
  HOME_COLOR,
  MAX_VIEWPORT_TEMPLATES,
} from "../models/types";
import {
  lineColorForBoard,
  linkColorForBoard,
  penColorForBoard,
  textColorForBoard,
  zoneColorsForBoard,
} from "../canvas/drawingInk";
import { pruneLinkObjects } from "../models/pieceLink";
import { smoothLinePath, softenPenPoints } from "../canvas/smoothPath";
import {
  normalizePieceColor,
  normalizePieceNumber,
} from "../canvas/pieceInk";
import {
  colorForKit,
  kitsFromBoard,
  paintPiecesWithKits,
  type PieceKit,
} from "../models/kits";
import { formationPieces } from "../presets/formations";
import {
  planSoccerPitchLookApply,
  resetAllScenesForOrientationChange,
  type SoccerPitchLookPreset,
} from "../presets/pitchLook";
import {
  buildScenePreset,
  type ScenePresetId,
} from "../presets/scenePresets";
import {
  applyLineupToScenePieces,
  applyTeamLineupToScenePieces,
  missingStarterNumbers,
  parseRosterText,
  parseStarterNumbers,
  STARTER_COUNT,
  upsertRosterPlayer,
  withRosterIdentity,
} from "../presets/roster";
import {
  DEFAULT_VIEWPORT,
  resolveViewPreset,
  type ViewPresetId,
} from "../presets/viewport";
import { defaultTextFont } from "../presets/textStyle";
import {
  alignGroup,
  distributeGroup,
  duplicatePieces,
  flipGroupHorizontal,
  flipGroupVertical,
  mergePieces,
  nudgePieces,
  piecesInRect,
  rotateGroupAroundCentroid,
  scaleGroupFromCentroid,
  type AlignAxis,
} from "../models/pieceCommands";
import {
  defaultBoardTitle,
  defaultSceneLabel,
  defaultSceneName,
} from "../i18n/localeDefaults";
import type { Locale, MessageKey } from "../i18n/messages";
import { normalizeLocale } from "../i18n/locale";
import { clampViewport } from "../presets/viewport";
import { FEATURE_PRO_VIEWPORT_TEMPLATES } from "../lib/features";
import { maxBoards, maxScenes } from "../lib/plan";
import {
  loadPrefs,
  loadStore,
  loadWatermark,
  savePrefs,
  saveStore,
  saveWatermark,
} from "../storage/persist";
import {
  captureImportEligibility,
  type CaptureImportBlockReason,
} from "../capture/eligibility";
import { isCaptureImportEnabled } from "../lib/captureImportGate";
import { imageBlobFromDataTransfer, loadCaptureImage } from "../capture/imageLoad";
import {
  clampUnderlayOpacity,
  DEFAULT_UNDERLAY_OPACITY,
} from "../capture/drawCaptureUnderlay";
import type { Point } from "../capture/homography";
import { computeHomographyAsync } from "../capture/homographyAsync";
import {
  emptyCaptureImportSession,
  type CaptureImportSession,
} from "../capture/session";
import {
  dst4FromLandmarkIds,
  hasDuplicateLandmarkIds,
  initialCalibSrcPoints,
  isLandmarkDstDegenerate,
  landmarkPresetIds,
  landmarkPresetNeedsGoalSide,
  resolveCalibLandmarkIds,
  type CalibGoalSide,
  type CalibLandmarkPreset,
  type LandmarkId,
  type LandmarkQuad,
} from "../capture/pitchLandmarks";

function touch(board: BoardDocument): BoardDocument {
  return { ...board, updatedAt: new Date().toISOString() };
}

export type LiveEventKind = "goal" | "card" | "sub";
export type LiveEventRef = { kind: LiveEventKind; id: string };

function captureImportBlockKey(
  reason: CaptureImportBlockReason,
): MessageKey {
  return reason === "unsupportedSport"
    ? "captureImportUnsupportedSport"
    : "captureImportUnsupportedPitch";
}

export function useAppState() {
  const [store, setStore] = useState<BoardStore>(() => loadStore());
  const [watermark, setWatermark] = useState<WatermarkSettings>(() =>
    loadWatermark(),
  );
  const [tool, setToolState] = useState<ToolId>("select");
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const setTool = useCallback((id: ToolId) => {
    setToolState(id);
  }, []);
  /** Shape create kind for the Zone→Shape tool (circle / rect / triangle). Session-sticky. */
  const [shapeKind, setShapeKind] = useState<ShapeKind>("rect");
  /**
   * Rectangle 1:1 lock for touch/pen (OR with Shift). Circle/Triangle ignore —
   * they stay equilateral / circular in geometry.
   */
  const [shapeAspectLock, setShapeAspectLock] = useState(false);
  /** In-app Shape clipboard (session only — not OS clipboard / not persisted). */
  const shapeClipboardRef = useRef<ShapeObject | null>(null);
  /**
   * Last Shape appearance applied in this session — reused by addShape so
   * consecutive creates inherit color / opacity / outline without touching
   * other existing shapes. Not persisted.
   */
  const shapeCreateStyleRef = useRef<{
    fillColor: string;
    fillOpacity: number;
    strokeEnabled: boolean;
  }>({
    fillColor: SHAPE_DEFAULT_FILL_COLOR,
    fillOpacity: SHAPE_DEFAULT_FILL_OPACITY,
    strokeEnabled: true,
  });
  const [selectedPieceIds, setSelectedPieceIds] = useState<string[]>([]);
  const selectedPieceId =
    selectedPieceIds[selectedPieceIds.length - 1] ?? null;
  /** 駒カードは選択とは別。欲しいときだけ開く（単クリックでは出さない） */
  const [pieceInspectorId, setPieceInspectorId] = useState<string | null>(null);

  /** 単独選択。カードは閉じる */
  const setSelectedPieceId = useCallback((id: string | null) => {
    setSelectedPieceIds(id ? [id] : []);
    setPieceInspectorId(null);
  }, []);

  const togglePieceSelected = useCallback((id: string) => {
    setSelectedPieceIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
    setPieceInspectorId(null);
  }, []);

  const addPieceSelected = useCallback((id: string) => {
    setSelectedPieceIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
    setPieceInspectorId(null);
  }, []);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  /** Inspector / touch: BoardCanvas opens inline edit when this id is set. */
  const [textEditRequestId, setTextEditRequestId] = useState<string | null>(
    null,
  );
  const requestTextEdit = useCallback((id: string) => {
    setTextEditRequestId(id);
  }, []);
  const clearTextEditRequest = useCallback(() => {
    setTextEditRequestId(null);
  }, []);
  const [selectedBallId, setSelectedBallId] = useState<string | null>(null);
  const selectedBall = selectedBallId != null;
  const setSelectedBall = useCallback((on: boolean) => {
    if (!on) setSelectedBallId(null);
  }, []);
  /** Session clipboard for ball copy/paste (not OS clipboard). */
  const ballClipboardRef = useRef<BallObject | null>(null);
  const [selectionColor, setSelectionColorState] = useState(
    () => loadPrefs().selectionColor ?? DEFAULT_SELECTION_COLOR,
  );
  const [locale, setLocaleState] = useState<Locale>(
    () => normalizeLocale(loadPrefs().locale),
  );
  const [broadcast, setBroadcast] = useState(false);
  const [captureImport, setCaptureImport] =
    useState<CaptureImportSession | null>(null);
  const captureImportRef = useRef<CaptureImportSession | null>(null);
  captureImportRef.current = captureImport;
  const captureImageUrlRef = useRef<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [settingsOpen, setSettingsOpenState] = useState(false);
  /** 配信中の誤入力取り消し用（永続しない。追加順スタック） */
  const [liveEventStack, setLiveEventStack] = useState<LiveEventRef[]>([]);
  const setSettingsOpen = useCallback((open: boolean) => {
    if (open && broadcast) return;
    setSettingsOpenState(open);
  }, [broadcast]);
  const [bakeWm, setBakeWm] = useState(true);
  const history = useRef<BoardDocument[]>([]);
  const future = useRef<BoardDocument[]>([]);
  const saveTimer = useRef<number | null>(null);
  const fileSessionDraftTimer = useRef<number | null>(null);

  /**
   * Local-file editing session — in-memory only. Never written to BoardStore /
   * `zoneboard:v1:store`. Optional sessionStorage draft is a separate key.
   */
  type FileSessionDirectorySource = {
    fileHandle: FileSystemFileHandle;
    directorySessionId: string;
    /** File Library entry id (cacheScope / Dashboard patch target). */
    libraryEntryId: string;
    openSnapshot: FileMetaSnapshot;
  };

  type FileSessionSaveUi =
    | "idle"
    | "saving"
    | "saved"
    | "failed"
    | "conflict"
    | "permission_denied"
    | "missing"
    | "no_handle";

  type FileSessionState = {
    board: BoardDocument;
    sourceName: string;
    openedAt: number;
    baselineFinger: string;
    dirty: boolean;
    /**
     * New local board that has never been written to a file.
     * Stays dirty until first successful Directory Save / Save As.
     * Download alone does not clear this.
     */
    neverSavedToFile: boolean;
    draftSaveOk: boolean;
    /**
     * Blob download was requested (not proof the OS saved the file).
     * Does not clear dirty. Directory Save uses markFileSessionSavedToSource.
     */
    lastDownloadRequestedAt: number | null;
    /** Present only for Directory mode Open. Never persisted. */
    directorySource: FileSessionDirectorySource | null;
    saveUi: FileSessionSaveUi;
    /** Last conflict snapshot for UI (memory only). */
    saveConflictCurrent: FileMetaSnapshot | null;
  };
  const [fileSession, setFileSession] = useState<FileSessionState | null>(
    null,
  );
  const fileSessionRef = useRef<FileSessionState | null>(null);
  fileSessionRef.current = fileSession;
  /** Boot-time draft awaiting user confirm (does not auto-open). */
  const [pendingFileSessionRestore, setPendingFileSessionRestore] = useState<
    | {
        sourceName: string;
        openedAt: number;
        baselineFinger: string;
        board: BoardDocument;
        neverSavedToFile: boolean;
      }
    | null
  >(null);

  const board = useMemo(() => {
    if (fileSession) return fileSession.board;
    return (
      store.boards.find((b) => b.id === store.activeBoardId) ??
      store.boards[0] ??
      null
    );
  }, [fileSession, store]);

  const scene = useMemo(
    () => (board ? getActiveScene(board) : null),
    [board],
  );

  const isFileSession = fileSession != null;

  const persist = useCallback((next: BoardStore) => {
    // File Session must never redirect Store writes — callers should not
    // mutate store while in File Session; this is a hard guard.
    if (fileSessionRef.current) return;
    setStore(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveStore(next), 300);
  }, []);

  const flushSave = useCallback(() => {
    if (fileSessionRef.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveStore(store);
  }, [store]);

  const scheduleFileSessionDraft = useCallback((fs: FileSessionState) => {
    if (fileSessionDraftTimer.current) {
      window.clearTimeout(fileSessionDraftTimer.current);
    }
    fileSessionDraftTimer.current = window.setTimeout(() => {
      const ok = writeFileSessionDraft({
        sourceName: fs.sourceName,
        openedAt: fs.openedAt,
        baselineFinger: fs.baselineFinger,
        board: fs.board,
        neverSavedToFile: fs.neverSavedToFile,
      });
      setFileSession((cur) =>
        cur && cur.openedAt === fs.openedAt
          ? { ...cur, draftSaveOk: ok }
          : cur,
      );
    }, 400);
  }, []);

  const pushHistory = useCallback((prev: BoardDocument) => {
    history.current.push(structuredClone(prev));
    if (history.current.length > 50) history.current.shift();
    future.current = [];
  }, []);

  const captureUndo = useCallback(() => {
    if (board) pushHistory(board);
  }, [board, pushHistory]);

  const applyFileSessionBoard = useCallback(
    (nextBoard: BoardDocument, fs: FileSessionState) => {
      const nextFs: FileSessionState = {
        ...fs,
        board: nextBoard,
        dirty: isFileSessionContentDirty(
          nextBoard,
          fs.baselineFinger,
          fs.neverSavedToFile,
        ),
      };
      fileSessionRef.current = nextFs;
      setFileSession(nextFs);
      scheduleFileSessionDraft(nextFs);
    },
    [scheduleFileSessionDraft],
  );

  const updateBoard = useCallback(
    (updater: (b: BoardDocument) => BoardDocument, record = true) => {
      const fs = fileSessionRef.current;
      if (fs) {
        const current = fs.board;
        if (record) pushHistory(current);
        const nextBoard = touch(updater(current));
        applyFileSessionBoard(nextBoard, fs);
        return;
      }
      setStore((prev) => {
        const current =
          prev.boards.find((b) => b.id === prev.activeBoardId) ??
          prev.boards[0];
        if (!current) return prev;
        if (record) pushHistory(current);
        const nextBoard = touch(updater(current));
        const boards = prev.boards.map((b) =>
          b.id === nextBoard.id ? nextBoard : b,
        );
        const next = { ...prev, boards };
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => saveStore(next), 300);
        return next;
      });
    },
    [applyFileSessionBoard, pushHistory],
  );

  const updateScene = useCallback(
    (
      updater: (s: ReturnType<typeof getActiveScene>) => ReturnType<
        typeof getActiveScene
      >,
      record = true,
    ) => {
      updateBoard((b) => mapActiveScene(b, updater), record);
    },
    [updateBoard],
  );

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (!prev || !board) return;
    future.current.push(structuredClone(board));
    const fs = fileSessionRef.current;
    if (fs) {
      applyFileSessionBoard(prev, fs);
      return;
    }
    setStore((s) => {
      const boards = s.boards.map((b) => (b.id === prev.id ? prev : b));
      const next = { ...s, boards };
      saveStore(next);
      return next;
    });
  }, [applyFileSessionBoard, board]);

  /**
   * Cancel a drag that already recorded history: restore the pushed snapshot
   * without adding a redo entry (unlike undo()).
   */
  const rollbackLastHistory = useCallback(() => {
    const prev = history.current.pop();
    if (!prev) return false;
    const fs = fileSessionRef.current;
    if (fs) {
      applyFileSessionBoard(prev, fs);
      return true;
    }
    setStore((s) => {
      const boards = s.boards.map((b) => (b.id === prev.id ? prev : b));
      const next = { ...s, boards };
      saveStore(next);
      return next;
    });
    return true;
  }, [applyFileSessionBoard]);

  const redo = useCallback(() => {
    const nextB = future.current.pop();
    if (!nextB || !board) return;
    history.current.push(structuredClone(board));
    const fs = fileSessionRef.current;
    if (fs) {
      applyFileSessionBoard(nextB, fs);
      return;
    }
    setStore((s) => {
      const boards = s.boards.map((b) => (b.id === nextB.id ? nextB : b));
      const next = { ...s, boards };
      saveStore(next);
      return next;
    });
  }, [applyFileSessionBoard, board]);

  const setActiveBoard = useCallback(
    (id: string) => {
      if (fileSessionRef.current) return;
      history.current = [];
      future.current = [];
      setSelectedPieceId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
      setLiveEventStack([]);
      persist({ ...store, activeBoardId: id });
    },
    [persist, store],
  );

  const addBoard = useCallback(
    (opts?: { pitchOrientation?: PitchOrientation }) => {
      if (fileSessionRef.current) return false;
      if (store.boards.length >= maxBoards()) return false;
      const b = createBoard(
        board?.sport ?? "soccer",
        defaultBoardTitle(store.boards.length + 1, locale),
        locale,
        opts?.pitchOrientation
          ? { pitchOrientation: opts.pitchOrientation }
          : undefined,
      );
      history.current = [];
      future.current = [];
      persist({
        boards: [...store.boards, b],
        activeBoardId: b.id,
      });
      return true;
    },
    [board?.sport, locale, persist, store.boards],
  );

  const addBoardReplacing = useCallback(
    (
      replaceId: string,
      opts?: { pitchOrientation?: PitchOrientation },
    ) => {
      if (fileSessionRef.current) return false;
      const remaining = store.boards.filter((b) => b.id !== replaceId);
      if (remaining.length !== store.boards.length - 1) return false;
      const b = createBoard(
        board?.sport ?? "soccer",
        defaultBoardTitle(remaining.length + 1, locale),
        locale,
        opts?.pitchOrientation
          ? { pitchOrientation: opts.pitchOrientation }
          : undefined,
      );
      history.current = [];
      future.current = [];
      persist({
        boards: [...remaining, b],
        activeBoardId: b.id,
      });
      return true;
    },
    [board?.sport, locale, persist, store.boards],
  );

  /**
   * Soccer pitch look presets. Landscape ↔ portrait is blocked when any scene
   * has pieces/objects or non-pristine balls/viewports (P0: no silent wipe).
   */
  const applySoccerPitchLook = useCallback(
    (
      preset: SoccerPitchLookPreset,
    ): "applied" | "unchanged" | "blocked_orientation" => {
      if (!board || board.sport !== "soccer") return "unchanged";
      const plan = planSoccerPitchLookApply(board, preset);
      if (plan.action === "noop") return "unchanged";
      if (plan.action === "blocked_orientation") return "blocked_orientation";
      captureUndo();
      if (plan.action === "orientation_reset") {
        setSelectedPieceId(null);
        setSelectedObjectId(null);
        setSelectedBall(false);
        updateBoard(
          (b) => resetAllScenesForOrientationChange(b, plan.fields),
          false,
        );
        return "applied";
      }
      updateBoard((b) => ({ ...b, ...plan.fields }), false);
      return "applied";
    },
    [board, captureUndo, updateBoard],
  );

  /** 空きがなければ replaceOldestIfFull で最古ボードを差し替え（?new=1 用）。 */
  const requestNewBoard = useCallback(
    (opts?: { replaceOldestIfFull?: boolean }) => {
      if (store.boards.length < maxBoards()) return addBoard();
      if (!opts?.replaceOldestIfFull) return false;
      const oldest = [...store.boards].sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      )[0];
      if (!oldest) return false;
      return addBoardReplacing(oldest.id);
    },
    [addBoard, addBoardReplacing, store.boards],
  );

  const deleteBoard = useCallback(
    (id: string) => {
      if (fileSessionRef.current) return;
      let boards = store.boards.filter((b) => b.id !== id);
      if (boards.length === 0) {
        const b = createBoard("soccer", defaultBoardTitle(1, locale), locale);
        boards = [b];
        persist({ boards, activeBoardId: b.id });
        return;
      }
      const active =
        store.activeBoardId === id ? boards[0].id : store.activeBoardId;
      persist({ boards, activeBoardId: active });
    },
    [locale, persist, store],
  );

  /** Download current board as portable JSON. Does not mutate board / undo. */
  const exportBoardJson = useCallback((): boolean => {
    const fs = fileSessionRef.current;
    if (fs) {
      try {
        exportBoardJsonDownload(fs.board, {
          fallbackTitle:
            fs.sourceName.replace(/\.zoneboard\.json$/i, "") || "ZoneBoard",
        });
        // Download ≠ confirmed save — keep dirty / draft / baseline.
        const nextFs = {
          ...fs,
          lastDownloadRequestedAt: Date.now(),
        };
        fileSessionRef.current = nextFs;
        setFileSession(nextFs);
        return true;
      } catch {
        return false;
      }
    }
    if (!board) return false;
    try {
      exportBoardJsonDownload(board, { fallbackTitle: defaultBoardTitle(1, locale) });
      return true;
    } catch {
      return false;
    }
  }, [board, locale]);

  /**
   * Parse portable JSON text and append as a new board (never overwrite).
   * Returns null on success, or an error code. Does not touch store until valid.
   */
  const importBoardJsonText = useCallback(
    (text: string, byteLength?: number): PortableImportErrorCode | null => {
      if (fileSessionRef.current) return "unknown";
      if (store.boards.length >= maxBoards()) return "limit";
      let nextBoard: BoardDocument;
      try {
        nextBoard = parsePortableBoardJson(text, byteLength);
      } catch (e) {
        if (e instanceof PortableImportError) return e.code;
        return "unknown";
      }
      const nextStore: BoardStore = {
        boards: [...store.boards, nextBoard],
        activeBoardId: nextBoard.id,
      };
      try {
        saveStore(nextStore);
      } catch {
        return "quota";
      }
      history.current = [];
      future.current = [];
      setSelectedPieceId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
      setStore(nextStore);
      return null;
    },
    [store.boards, setSelectedPieceId],
  );

  const setActiveScene = useCallback(
    (sceneId: string) => {
      if (!board) return;
      setSelectedPieceId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
      updateBoard((b) => ({ ...b, activeSceneId: sceneId }), false);
    },
    [board, updateBoard],
  );

  const addScene = useCallback(
    (label?: string, phase: ScenePhase = "custom") => {
      if (!board || !scene) return false;
      if (board.scenes.length >= maxScenes()) return false;
      const next = createScene(
        label ?? defaultSceneName(board.scenes.length + 1, board.sport, locale),
        phase,
        {
          pieces: scene.pieces,
          balls: scene.balls,
          objects: scene.objects,
          viewport: { ...activeViewport(board) },
        },
      );
      updateBoard((b) => ({
        ...b,
        scenes: [...b.scenes, next],
        activeSceneId: next.id,
      }));
      setSelectedPieceId(null);
      return true;
    },
    [board, locale, scene, updateBoard],
  );

  const addSceneFromPreset = useCallback(
    (presetId: ScenePresetId) => {
      if (!board) return false;
      if (board.scenes.length >= maxScenes()) return false;
      const preset = buildScenePreset(
        presetId,
        board.sport,
        board.benchCount,
        kitsFromBoard(board),
        locale,
      );
      if (!preset) return false;
      const next = createScene(preset.label, preset.phase, {
        pieces: preset.pieces,
        ball: preset.ball,
        objects: [],
        viewport: { ...preset.viewport },
      });
      updateBoard((b) => ({
        ...b,
        scenes: [...b.scenes, next],
        activeSceneId: next.id,
      }));
      setSelectedPieceId(null);
      setSelectedBall(false);
      return true;
    },
    [board, locale, updateBoard],
  );

  const deleteScene = useCallback(
    (sceneId: string) => {
      if (!board) return;
      if (board.scenes.length <= 1) return;
      updateBoard((b) => {
        const scenes = b.scenes.filter((s) => s.id !== sceneId);
        const activeSceneId =
          b.activeSceneId === sceneId ? scenes[0].id : b.activeSceneId;
        return { ...b, scenes, activeSceneId };
      });
      setSelectedPieceId(null);
    },
    [board, updateBoard],
  );

  const cycleScene = useCallback(
    (dir: 1 | -1) => {
      if (!board || board.scenes.length < 2) return;
      const idx = board.scenes.findIndex((s) => s.id === board.activeSceneId);
      const next =
        board.scenes[(idx + dir + board.scenes.length) % board.scenes.length];
      setActiveScene(next.id);
    },
    [board, setActiveScene],
  );

  const changeSport = useCallback(
    (sport: SportId) => {
      const fiveAside = sport === "futsal" || sport === "beach_soccer";
      updateBoard((b) => {
        const wasFive =
          b.sport === "futsal" || b.sport === "beach_soccer";
        const benchCount = fiveAside
          ? wasFive
            ? b.benchCount
            : 7
          : b.benchCount;
        return mapActiveScene(
          {
            ...b,
            sport,
            pitchView: sport === "basketball" ? "half" : "full",
            showLanes5: sport === "soccer",
            showCorridors3: sport === "futsal",
            showPressLines: sport === "futsal",
            showShotCorridor: sport === "beach_soccer",
            showPaintHighlight: sport === "basketball",
            showThreePointEmphasis: sport === "basketball",
            showSpotMarkers: sport === "basketball",
            showMiddleLine: false,
            showSlotLines: false,
            showWoodCourt: false,
            soccerPitchSurface: sport === "soccer" ? "grass" : "paper",
            homeTeam: "",
            awayTeam: "",
            goals: [],
            cards: [],
            subs: [],
            maxSubs: DEFAULT_MAX_SUBS,
            pk: createPkShootout(false),
            showMatchBanner: sport === "soccer",
            pitchOrientation: "landscape",
            benchCount,
          },
          (s) => ({
            ...s,
            label: defaultSceneLabel(sport, locale),
            hideHalf: "none",
            teamFocus: "both",
            pieces: withRosterIdentity(
              formationPieces(
                sport,
                true,
                benchCount,
                kitsFromBoard(b),
                "landscape",
              ),
              b.roster,
              s.pieces,
            ),
            objects: [],
            balls: [createBallObject()],
          }),
        );
      });
      setSelectedPieceId(null);
      setToolState((t) =>
        t === "screen" && sport !== "basketball" ? "select" : t,
      );
    },
    [locale, updateBoard],
  );

  const applyFormation = useCallback(() => {
    if (!board) return;
    updateScene((s) => ({
      ...s,
      pieces: withRosterIdentity(
        formationPieces(
          board.sport,
          true,
          board.benchCount,
          kitsFromBoard(board),
          board.pitchOrientation,
        ),
        board.roster,
        s.pieces,
      ),
      objects: [],
    }));
  }, [board, updateScene]);

  const setBenchCount = useCallback(
    (benchCount: number) => {
      updateBoard((b) =>
        mapActiveScene({ ...b, benchCount }, (s) => ({
          ...s,
          pieces: withRosterIdentity(
            formationPieces(
              b.sport,
              true,
              benchCount,
              kitsFromBoard(b),
              b.pitchOrientation,
            ),
            b.roster,
            s.pieces,
          ),
        })),
      );
    },
    [updateBoard],
  );

  const setHideHalf = useCallback(
    (hideHalf: HideHalf) => {
      updateScene((s) => ({ ...s, hideHalf }), false);
    },
    [updateScene],
  );

  const setTeamFocus = useCallback(
    (teamFocus: TeamFocus) => {
      updateScene((s) => ({ ...s, teamFocus }), false);
      if (!scene) return;
      const focusScene = { ...scene, teamFocus };
      setSelectedPieceIds((ids) => {
        if (!ids.length) return ids;
        const next = ids.filter((id) => {
          const p = scene.pieces.find((x) => x.id === id);
          return p ? isPieceDrawn(p, focusScene) : false;
        });
        return next.length === ids.length ? ids : next;
      });
      setPieceInspectorId((id) => {
        if (!id) return id;
        const p = scene.pieces.find((x) => x.id === id);
        if (!p) return null;
        return isPieceDrawn(p, focusScene) ? id : null;
      });
    },
    [updateScene, scene],
  );

  /** 前後半のエンドチェンジ: 現局面の配置をピッチ中心で左右入れ替え */
  const mirrorSceneEnds = useCallback(() => {
    updateBoard((b) =>
      mapActiveScene(b, (s) => ({
        ...swapSceneEnds(s),
        viewport: clampViewport(
          swapViewportEnds(sceneViewport(s, b.viewport)),
        ),
      })),
    );
  }, [updateBoard]);

  const setViewport = useCallback(
    (viewport: Viewport, record = false) => {
      updateScene(
        (s) => ({ ...s, viewport: clampViewport(viewport) }),
        record,
      );
    },
    [updateScene],
  );

  const applyViewPreset = useCallback(
    (id: ViewPresetId) => {
      if (!board) return;
      setViewport(
        resolveViewPreset(board.sport, board.pitchOrientation, id),
        false,
      );
    },
    [setViewport, board],
  );

  const resetViewport = useCallback(() => {
    setViewport({ ...DEFAULT_VIEWPORT }, false);
  }, [setViewport]);

  const saveViewportTemplate = useCallback(
    (label: string) => {
      if (!FEATURE_PRO_VIEWPORT_TEMPLATES || !board) return false;
      const trimmed = label.trim();
      if (!trimmed) return false;
      const templates = board.viewportTemplates ?? [];
      if (templates.length >= MAX_VIEWPORT_TEMPLATES) return false;
      const vp = activeViewport(board);
      updateBoard((b) => ({
        ...b,
        viewportTemplates: [
          ...(b.viewportTemplates ?? []),
          { id: uid(), label: trimmed, viewport: { ...vp } },
        ],
      }));
      return true;
    },
    [board, updateBoard],
  );

  const applyViewportTemplate = useCallback(
    (templateId: string) => {
      if (!FEATURE_PRO_VIEWPORT_TEMPLATES || !board) return false;
      const tpl = board.viewportTemplates?.find((t) => t.id === templateId);
      if (!tpl) return false;
      setViewport(tpl.viewport, false);
      return true;
    },
    [board, setViewport],
  );

  const deleteViewportTemplate = useCallback(
    (templateId: string) => {
      if (!FEATURE_PRO_VIEWPORT_TEMPLATES || !board) return false;
      updateBoard((b) => ({
        ...b,
        viewportTemplates: (b.viewportTemplates ?? []).filter(
          (t) => t.id !== templateId,
        ),
      }));
      return true;
    },
    [board, updateBoard],
  );

  /** アクティブ局面の画角（描画・Export 正本） */
  const viewport = useMemo(
    () => (board ? activeViewport(board) : null),
    [board],
  );

  /** ベンチ入り名簿を一括インポート。同チームを XI＋控えでピッチに載せ直す */
  const importRoster = useCallback(
    (team: "home" | "away", text: string) => {
      const players = parseRosterText(text);
      if (players.length === 0) return false;
      updateBoard((b) => {
        const nStart = STARTER_COUNT[b.sport];
        const prevXi = b.roster[team].starterNumbers ?? [];
        const keptXi = prevXi.filter((n) =>
          players.some(
            (p) =>
              normalizePieceNumber(p.number) === normalizePieceNumber(n),
          ),
        );
        const starterNumbers =
          keptXi.length > 0
            ? keptXi.slice(0, nStart)
            : players.slice(0, nStart).map((p) => p.number);
        const nextTeam = {
          ...b.roster[team],
          players,
          starterNumbers,
        };
        const roster = {
          ...b.roster,
          [team]: nextTeam,
        };
        const kits = kitsFromBoard({ ...b, roster });
        return {
          ...b,
          roster,
          scenes: b.scenes.map((s) => ({
            ...s,
            pieces: applyTeamLineupToScenePieces(
              s.pieces,
              b.sport,
              team,
              nextTeam,
              b.benchCount,
              kits,
              b.pitchOrientation,
            ),
          })),
        };
      });
      setSelectedPieceId(null);
      return true;
    },
    [setSelectedPieceId, updateBoard],
  );

  /**
   * スタメン背番号をセットし、そのチームをピッチ＋ベンチに反映。
   * 空配列可（名簿先頭から自動XI）。
   * 戻り値: 名簿にない背番号（空なら全部ヒット）
   */
  const setStarterNumbers = useCallback(
    (team: "home" | "away", starterNumbers: string[]): string[] => {
      let missing: string[] = [];
      updateBoard((b) => {
        const nextTeam = {
          ...b.roster[team],
          starterNumbers,
        };
        missing = missingStarterNumbers(nextTeam);
        if (nextTeam.players.length === 0) {
          return {
            ...b,
            roster: { ...b.roster, [team]: nextTeam },
          };
        }
        const roster = { ...b.roster, [team]: nextTeam };
        const kits = kitsFromBoard({ ...b, roster });
        return {
          ...b,
          roster,
          scenes: b.scenes.map((s) => ({
            ...s,
            pieces: applyTeamLineupToScenePieces(
              s.pieces,
              b.sport,
              team,
              nextTeam,
              b.benchCount,
              kits,
              b.pitchOrientation,
            ),
          })),
        };
      });
      setSelectedPieceId(null);
      return missing;
    },
    [setSelectedPieceId, updateBoard],
  );

  /**
   * テキストからスタメンをセット。非空なのに番号ゼロなら false。
   */
  const setStarters = useCallback(
    (team: "home" | "away", text: string): false | string[] => {
      const starterNumbers = parseStarterNumbers(text);
      if (text.trim() !== "" && starterNumbers.length === 0) return false;
      return setStarterNumbers(team, starterNumbers);
    },
    [setStarterNumbers],
  );

  /** 名簿＋スタメンから現局面に一括配置 */
  const applyLineup = useCallback(() => {
    if (!board) return;
    const pieces = applyLineupToScenePieces(
      board.sport,
      board.roster.home,
      board.roster.away,
      board.benchCount,
      kitsFromBoard(board),
      board.pitchOrientation,
    );
    if (pieces.length === 0) return false;
    updateScene((s) => ({
      ...s,
      pieces,
      objects: [],
    }));
    setSelectedPieceId(null);
    return true;
  }, [board, updateScene]);

  const updateWatermark = useCallback((wm: WatermarkSettings) => {
    setWatermark(wm);
    saveWatermark(wm);
  }, []);

  const enterBroadcast = useCallback(() => {
    setBroadcast(true);
    setDrawerOpen(false);
    setSettingsOpen(false);
  }, []);

  const exitBroadcast = useCallback(() => {
    setBroadcast(false);
  }, []);

  const setSelectionColor = useCallback((color: string) => {
    setSelectionColorState(color);
    savePrefs({ ...loadPrefs(), selectionColor: color });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    const localeNext = normalizeLocale(next);
    setLocaleState(localeNext);
    savePrefs({ ...loadPrefs(), locale: localeNext });
  }, []);

  const moveBall = useCallback(
    (ballId: string, x: number, y: number, record: boolean) => {
      // ドラッグ中は吸着解除（ボールだけ動かす）
      updateScene(
        (s) => ({
          ...s,
          balls: s.balls.map((b) =>
            b.id === ballId ? { ...b, x, y, attachedTo: null } : b,
          ),
        }),
        record,
      );
    },
    [updateScene],
  );

  /** ボールを離したとき、近くの駒にくっつける */
  const dropBall = useCallback(
    (ballId: string, x: number, y: number) => {
      updateScene((s) => ({
        ...s,
        balls: s.balls.map((b) => {
          if (b.id !== ballId) return b;
          const drop = ballAfterDrop(s.pieces, x, y);
          return { ...b, ...drop };
        }),
      }));
    },
    [updateScene],
  );

  const addPieceAt = useCallback(
    (x: number, y: number, team: "home" | "away") => {
      const kits = board ? kitsFromBoard(board) : undefined;
      const role = roleFromPosition(x, y);
      const piece: Piece = {
        id: uid(),
        x,
        y,
        number: "",
        label: "",
        color: kits
          ? colorForKit(kits, team, "outfield")
          : team === "home"
            ? HOME_COLOR
            : AWAY_COLOR,
        team,
        facing: defaultFacingForTeam(
          team,
          board?.pitchOrientation ?? "landscape",
        ),
        role,
        kit: "outfield",
      };
      updateScene((s) => ({ ...s, pieces: [...s.pieces, piece] }));
      setSelectedPieceId(piece.id);
    },
    [board, updateScene],
  );

  const movePiece = useCallback(
    (
      id: string,
      x: number,
      y: number,
      record: boolean,
      facing?: number,
    ) => {
      // コート上の人数上限は設けない（解説で「Aの動き／Bの動き」を並べるため）
      const role = roleFromPosition(x, y);
      updateScene(
        (s) => {
          const pieces = s.pieces.map((p) =>
            p.id === id
              ? { ...p, x, y, role, facing: facing ?? p.facing }
              : p,
          );
          const balls = ballsFollowingMovedPieces(
            s.balls,
            pieces,
            new Set([id]),
          );
          return { ...s, pieces, balls };
        },
        record,
      );
    },
    [updateScene],
  );

  const movePiecesBy = useCallback(
    (
      ids: string[],
      dx: number,
      dy: number,
      record: boolean,
      facingId?: string,
      facing?: number,
    ) => {
      if (ids.length === 0) return;
      if (dx === 0 && dy === 0 && facing === undefined) return;
      const idSet = new Set(ids);
      updateScene((s) => {
        const pieces = s.pieces.map((p) => {
          if (!idSet.has(p.id)) return p;
          const x = p.x + dx;
          const y = p.y + dy;
          return {
            ...p,
            x,
            y,
            role: roleFromPosition(x, y),
            facing:
              p.id === facingId && facing !== undefined ? facing : p.facing,
          };
        });
        const balls = ballsFollowingMovedPieces(s.balls, pieces, idSet);
        return { ...s, pieces, balls };
      }, record);
    },
    [updateScene],
  );

  const selectAllPieces = useCallback(() => {
    if (!scene) return;
    setSelectedPieceIds(
      scene.pieces.filter((p) => isPieceDrawn(p, scene)).map((p) => p.id),
    );
    setPieceInspectorId(null);
    setSelectedObjectId(null);
    setSelectedBall(false);
  }, [scene]);

  const applyToSelectedPieces = useCallback(
    (transform: (group: Piece[]) => Piece[], record = true) => {
      if (selectedPieceIds.length === 0) return;
      const idSet = new Set(selectedPieceIds);
      updateScene((s) => {
        const group = s.pieces.filter((p) => idSet.has(p.id));
        if (group.length === 0) return s;
        const nextGroup = transform(group).map((p) => ({
          ...p,
          role: roleFromPosition(p.x, p.y),
        }));
        const pieces = mergePieces(s.pieces, nextGroup);
        const balls = ballsFollowingMovedPieces(s.balls, pieces, idSet);
        return { ...s, pieces, balls };
      }, record);
    },
    [selectedPieceIds, updateScene],
  );

  const nudgeSelected = useCallback(
    (dx: number, dy: number) =>
      applyToSelectedPieces((g) => nudgePieces(g, dx, dy)),
    [applyToSelectedPieces],
  );

  const rotateSelectedAroundCentroid = useCallback(
    (degrees: number) =>
      applyToSelectedPieces((g) => rotateGroupAroundCentroid(g, degrees)),
    [applyToSelectedPieces],
  );

  const scaleSelectedFromCentroid = useCallback(
    (factor: number) =>
      applyToSelectedPieces((g) => scaleGroupFromCentroid(g, factor)),
    [applyToSelectedPieces],
  );

  const flipSelectedHorizontal = useCallback(
    () => applyToSelectedPieces(flipGroupHorizontal),
    [applyToSelectedPieces],
  );

  const flipSelectedVertical = useCallback(
    () => applyToSelectedPieces(flipGroupVertical),
    [applyToSelectedPieces],
  );

  const setSelectedFacing = useCallback(
    (facing: number, record = true) =>
      applyToSelectedPieces((g) => setGroupFacing(g, facing), record),
    [applyToSelectedPieces],
  );

  const faceSelectedTeamAttack = useCallback(() => {
    const orientation = board?.pitchOrientation ?? "landscape";
    applyToSelectedPieces((g) =>
      setGroupFacingToTeamAttack(g, orientation),
    );
  }, [applyToSelectedPieces, board?.pitchOrientation]);

  const alignSelected = useCallback(
    (axis: AlignAxis) => applyToSelectedPieces((g) => alignGroup(g, axis)),
    [applyToSelectedPieces],
  );

  const distributeSelected = useCallback(
    (along: "x" | "y") =>
      applyToSelectedPieces((g) => distributeGroup(g, along)),
    [applyToSelectedPieces],
  );

  /** World-norm nudge ≈ small CSS offset; zoom-stable (not DPR-dependent). */
  const SHAPE_DUP_OFFSET = 0.018;

  const insertShapeCopy = useCallback(
    (source: ShapeObject, afterId: string | null): ShapeObject | null => {
      const copy = sanitizeShapeObject({
        ...source,
        id: uid(),
        x: source.x + SHAPE_DUP_OFFSET,
        y: source.y + SHAPE_DUP_OFFSET,
      });
      if (!copy) return null;
      updateScene((s) => {
        const objects = [...s.objects];
        const at = afterId
          ? objects.findIndex((o) => o.id === afterId)
          : -1;
        if (at >= 0) objects.splice(at + 1, 0, copy);
        else objects.push(copy);
        return { ...s, objects };
      });
      setSelectedObjectId(copy.id);
      setSelectedPieceId(null);
      setSelectedBall(false);
      setPieceInspectorId(null);
      return copy;
    },
    [updateScene],
  );

  const insertBallCopy = useCallback(
    (source: BallObject): BallObject | null => {
      const copy = offsetBallCopy(source);
      updateScene((s) => ({
        ...s,
        balls: [...s.balls, copy],
      }));
      setSelectedBallId(copy.id);
      setSelectedPieceId(null);
      setSelectedObjectId(null);
      setPieceInspectorId(null);
      return copy;
    },
    [updateScene, setSelectedPieceId],
  );

  const duplicateSelected = useCallback(() => {
    if (!scene) return;
    if (selectedPieceIds.length > 0) {
      const idSet = new Set(selectedPieceIds);
      const group = scene.pieces.filter((p) => idSet.has(p.id));
      if (group.length === 0) return;
      const copies = duplicatePieces(group).map((p) => ({
        ...p,
        role: roleFromPosition(p.x, p.y),
      }));
      updateScene((s) => ({ ...s, pieces: [...s.pieces, ...copies] }));
      setSelectedPieceIds(copies.map((p) => p.id));
      setPieceInspectorId(null);
      setSelectedObjectId(null);
      setSelectedBallId(null);
      return;
    }
    if (selectedBallId) {
      const src = scene.balls.find((b) => b.id === selectedBallId);
      if (!src) return;
      insertBallCopy(src);
      return;
    }
    if (!selectedObjectId) return;
    const obj = scene.objects.find((o) => o.id === selectedObjectId);
    if (!obj || obj.type !== "shape") return;
    insertShapeCopy(obj, obj.id);
  }, [
    scene,
    selectedPieceIds,
    selectedBallId,
    selectedObjectId,
    updateScene,
    insertShapeCopy,
    insertBallCopy,
  ]);

  const copySelectedShape = useCallback(() => {
    if (!scene || !selectedObjectId) return false;
    const obj = scene.objects.find((o) => o.id === selectedObjectId);
    if (!obj || obj.type !== "shape") return false;
    const snap = sanitizeShapeObject({ ...obj, id: obj.id });
    if (!snap) return false;
    shapeClipboardRef.current = structuredClone(snap);
    return true;
  }, [scene, selectedObjectId]);

  const pasteShape = useCallback(() => {
    const src = shapeClipboardRef.current;
    if (!src || !scene) return false;
    // Clipboard already holds a clone from copy/last paste time.
    const base = sanitizeShapeObject({ ...src, id: src.id });
    if (!base) return false;
    const placed = insertShapeCopy(base, selectedObjectId);
    if (!placed) return false;
    // Cascade subsequent pastes from the newly placed shape.
    shapeClipboardRef.current = structuredClone(placed);
    return true;
  }, [scene, selectedObjectId, insertShapeCopy]);

  const hasShapeClipboard = useCallback(
    () => shapeClipboardRef.current != null,
    [],
  );

  const copySelectedBall = useCallback(() => {
    if (!scene || !selectedBallId) return false;
    const src = scene.balls.find((b) => b.id === selectedBallId);
    if (!src) return false;
    ballClipboardRef.current = structuredClone({
      ...src,
      attachedTo: null,
    });
    return true;
  }, [scene, selectedBallId]);

  const pasteBall = useCallback(() => {
    const src = ballClipboardRef.current;
    if (!src || !scene) return false;
    const placed = insertBallCopy(src);
    if (!placed) return false;
    // Cascade subsequent pastes from the newly placed ball.
    ballClipboardRef.current = structuredClone({
      ...placed,
      attachedTo: null,
    });
    return true;
  }, [scene, insertBallCopy]);

  const hasBallClipboard = useCallback(
    () => ballClipboardRef.current != null,
    [],
  );

  const selectTeam = useCallback(
    (team: "home" | "away") => {
      if (!scene) return;
      setSelectedPieceIds(
        scene.pieces
          .filter((p) => p.team === team && isPieceDrawn(p, scene))
          .map((p) => p.id),
      );
      setPieceInspectorId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
    },
    [scene],
  );

  const selectPiecesInRect = useCallback(
    (x0: number, y0: number, x1: number, y1: number, additive: boolean) => {
      if (!scene) return;
      const visible = scene.pieces.filter((p) =>
        isPieceDrawn(p, scene),
      );
      const hit = piecesInRect(visible, x0, y0, x1, y1).map((p) => p.id);
      setSelectedPieceIds((cur) => {
        if (!additive) return hit;
        const next = new Set(cur);
        for (const id of hit) next.add(id);
        return [...next];
      });
      setPieceInspectorId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
    },
    [scene],
  );

  /**
   * 駒同士のドロップ入れ替え（交代・位置交換）。
   * starter↔bench のとき matchStatus を out/in にし、subs に1件足す。
   * 座標ロックはしない（OUT でもあとから芝へ戻してよい）。
   */
  const swapPieces = useCallback(
    (
      idA: string,
      idB: string,
      startA: { x: number; y: number },
    ) => {
      updateBoard((b) => {
        const scene = getActiveScene(b);
        const a = scene.pieces.find((p) => p.id === idA);
        const bPiece = scene.pieces.find((p) => p.id === idB);
        if (!a || !bPiece) return b;
        const ax = startA.x;
        const ay = startA.y;
        const bx = bPiece.x;
        const by = bPiece.y;
        const roleA = roleFromPosition(bx, by);
        const roleB = roleFromPosition(ax, ay);
        const aWasOn = a.role === "starter";
        const bWasOn = bPiece.role === "starter";
        let statusA = a.matchStatus;
        let statusB = bPiece.matchStatus;
        let nextSubs = b.subs ?? [];
        if (aWasOn && !bWasOn && a.team === bPiece.team) {
          statusA = "out";
          statusB = "in";
          const outN = normalizePieceNumber(a.number);
          const inN = normalizePieceNumber(bPiece.number);
          if (outN && inN) {
            nextSubs = [
              ...nextSubs,
              {
                id: uid(),
                team: a.team,
                outNumber: outN,
                inNumber: inN,
              },
            ];
          }
        } else if (!aWasOn && bWasOn && a.team === bPiece.team) {
          statusA = "in";
          statusB = "out";
          const outN = normalizePieceNumber(bPiece.number);
          const inN = normalizePieceNumber(a.number);
          if (outN && inN) {
            nextSubs = [
              ...nextSubs,
              {
                id: uid(),
                team: a.team,
                outNumber: outN,
                inNumber: inN,
              },
            ];
          }
        }
        const pieces = scene.pieces.map((p) => {
          if (p.id === idA)
            return { ...p, x: bx, y: by, role: roleA, matchStatus: statusA };
          if (p.id === idB)
            return { ...p, x: ax, y: ay, role: roleB, matchStatus: statusB };
          return p;
        });
        const balls = ballsFollowingMovedPieces(
          scene.balls,
          pieces,
          new Set([idA, idB]),
        );
        return {
          ...b,
          subs: nextSubs,
          maxSubs: b.maxSubs > 0 ? b.maxSubs : DEFAULT_MAX_SUBS,
          scenes: b.scenes.map((s) =>
            s.id === scene.id ? { ...s, pieces, balls } : s,
          ),
        };
      });
    },
    [updateBoard],
  );

  const patchPiece = useCallback(
    (id: string, patch: Partial<Piece>, record = true) => {
      const touchesIdentity =
        patch.label !== undefined ||
        patch.number !== undefined ||
        patch.preferredFoot !== undefined ||
        patch.heightCm !== undefined ||
        patch.weightKg !== undefined;

      updateBoard((b) => {
        const scene = getActiveScene(b);
        const existing = scene.pieces.find((p) => p.id === id);
        if (!existing) return b;
        const normalized: Partial<Piece> = { ...patch };
        if (patch.number !== undefined) {
          normalized.number = normalizePieceNumber(patch.number);
        }
        if (patch.kit !== undefined) {
          normalized.color = colorForKit(
            kitsFromBoard(b),
            existing.team,
            patch.kit === "gk" ? "gk" : "outfield",
          );
        } else if (patch.color !== undefined) {
          normalized.color = normalizePieceColor(
            patch.color,
            existing.team === "home" ? HOME_COLOR : AWAY_COLOR,
          );
        }
        const nextPiece = { ...existing, ...normalized };
        const incomingLabel =
          patch.label !== undefined ? patch.label.trim() : undefined;
        const identity = {
          number: nextPiece.number,
          // カードから空にしたときは名簿も空にする（再編集で頭文字が消えない問題の解消）
          label:
            incomingLabel !== undefined
              ? incomingLabel
              : nextPiece.label.trim() || existing.label.trim(),
          preferredFoot: nextPiece.preferredFoot,
          heightCm: nextPiece.heightCm,
          weightKg: nextPiece.weightKg,
        };
        const prevNum = normalizePieceNumber(existing.number);
        const nextNum = normalizePieceNumber(identity.number);
        const numberChanged =
          patch.number !== undefined && nextNum !== prevNum;
        /** 他駒が旧番号のまま残るなら名簿の旧行は消さず、新番号を足す */
        const siblingsKeepPrev =
          numberChanged &&
          prevNum.length > 0 &&
          b.scenes.some((s) =>
            s.pieces.some(
              (p) =>
                p.id !== id &&
                p.team === existing.team &&
                normalizePieceNumber(p.number) === prevNum,
            ),
          );
        let roster = b.roster;
        if (touchesIdentity && identity.number.trim()) {
          roster = {
            ...b.roster,
            [existing.team]: upsertRosterPlayer(
              b.roster[existing.team],
              siblingsKeepPrev ? identity.number : existing.number,
              {
                number: identity.number,
                label: identity.label,
                preferredFoot: identity.preferredFoot,
                heightCm: identity.heightCm,
                weightKg: identity.weightKg,
              },
              { replaceLabel: incomingLabel !== undefined },
            ),
          };
        }
        return {
          ...b,
          roster,
          scenes: b.scenes.map((s) => {
            const pieces = s.pieces.map((p) => {
              if (p.id === id) {
                const merged = { ...p, ...normalized };
                if (patch.label !== undefined) {
                  merged.label = patch.label.trim();
                }
                return merged;
              }
              // 同番号の他駒へは名前等だけ共有。番号変更は選択中だけ（重複を解けないバグ防止）
              if (
                touchesIdentity &&
                p.team === existing.team &&
                normalizePieceNumber(p.number) === prevNum
              ) {
                return {
                  ...p,
                  label: identity.label,
                  preferredFoot: identity.preferredFoot,
                  heightCm: identity.heightCm,
                  weightKg: identity.weightKg,
                };
              }
              return p;
            });
            const balls =
              s.id === b.activeSceneId
                ? ballsFollowingMovedPieces(s.balls, pieces, new Set([id]))
                : s.balls;
            return { ...s, pieces, balls };
          }),
        };
      }, record);
    },
    [updateBoard],
  );

  const setKitColor = useCallback(
    (team: "home" | "away", kit: PieceKit, color: string) => {
      updateBoard((b) => {
        const fallback =
          team === "home"
            ? kit === "gk"
              ? b.homeGkColor
              : b.homeColor
            : kit === "gk"
              ? b.awayGkColor
              : b.awayColor;
        const nextColor = normalizePieceColor(color, fallback);
        const next: BoardDocument = { ...b };
        if (team === "home") {
          if (kit === "gk") next.homeGkColor = nextColor;
          else next.homeColor = nextColor;
        } else if (kit === "gk") {
          next.awayGkColor = nextColor;
        } else {
          next.awayColor = nextColor;
        }
        const kits = kitsFromBoard(next);
        return {
          ...next,
          scenes: next.scenes.map((s) => ({
            ...s,
            pieces: paintPiecesWithKits(s.pieces, kits),
          })),
        };
      });
    },
    [updateBoard],
  );

  /** Outfield accent ring only — does not repaint piece.color. */
  const setKitAccent = useCallback(
    (team: "home" | "away", color: string | null) => {
      updateBoard((b) => {
        const next: BoardDocument = { ...b };
        if (color == null || !color.trim()) {
          if (team === "home") delete next.homeAccentColor;
          else delete next.awayAccentColor;
          return next;
        }
        const primary = team === "home" ? b.homeColor : b.awayColor;
        const n = normalizePieceColor(color, primary);
        if (team === "home") next.homeAccentColor = n;
        else next.awayAccentColor = n;
        return next;
      });
    },
    [updateBoard],
  );

  const addLine = useCallback(
    (kind: LineKind, points: { x: number; y: number }[]) => {
      if (points.length < 2) return;
      updateScene((s) => ({
        ...s,
        objects: [
          ...s.objects,
          {
            id: uid(),
            type: "line",
            kind,
            points,
            color: lineColorForBoard(board, kind),
            strokeWidth: 2,
          },
        ],
      }));
    },
    [board, updateScene],
  );

  const LINE_TRAIL_MIN = 0.012;

  const movePieceWithLine = useCallback(
    (
      id: string,
      x: number,
      y: number,
      kind: LineKind,
      points: { x: number; y: number }[],
      facing?: number,
    ) => {
      const start = points[0];
      const end = points[points.length - 1];
      const smoothed = points.length >= 2 ? smoothLinePath(points) : [];
      const trail =
        !!start &&
        !!end &&
        points.length >= 2 &&
        Math.hypot(end.x - start.x, end.y - start.y) >= LINE_TRAIL_MIN &&
        smoothed.length >= 2;

      updateScene((s) => {
        const role = roleFromPosition(x, y);
        const pieces = s.pieces.map((p) =>
          p.id === id
            ? { ...p, x, y, role, facing: facing ?? p.facing }
            : p,
        );
        const balls = ballsFollowingMovedPieces(
          s.balls,
          pieces,
          new Set([id]),
        );
        const objects = trail
          ? [
              ...s.objects,
              {
                id: uid(),
                type: "line" as const,
                kind,
                points: smoothed,
                color: lineColorForBoard(board, kind),
                strokeWidth: 2,
              },
            ]
          : s.objects;
        return { ...s, pieces, balls, objects };
      });
    },
    [board, updateScene],
  );

  const addZone = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const zoneInk = zoneColorsForBoard(board);
      updateScene((s) => ({
        ...s,
        objects: [
          ...s.objects,
          {
            id: uid(),
            type: "zone",
            x,
            y,
            w,
            h,
            color: zoneInk.fill,
            strokeColor: zoneInk.stroke,
          },
        ],
      }));
    },
    [board, updateScene],
  );

  const addPen = useCallback(
    (points: { x: number; y: number }[]) => {
      if (points.length < 2) return;
      const stored = softenPenPoints(points);
      updateScene((s) => ({
        ...s,
        objects: [
          ...s.objects,
          {
            id: uid(),
            type: "pen",
            points: stored,
            color: penColorForBoard(board),
            strokeWidth: 2,
          },
        ],
      }));
    },
    [board, updateScene],
  );

  const addLink = useCallback(
    (pieceIds: string[]) => {
      const ids = pieceIds.filter(Boolean);
      if (ids.length < 2) return;
      updateScene((s) => ({
        ...s,
        objects: [
          ...s.objects,
          {
            id: uid(),
            type: "link",
            pieceIds: ids,
            color: linkColorForBoard(board),
            strokeWidth: 2,
          },
        ],
      }));
    },
    [board, updateScene],
  );

  const addText = useCallback(
    (
      x: number,
      y: number,
      text: string,
      opts?: { width?: number; height?: number },
    ) => {
      updateScene((s) => ({
        ...s,
        objects: [
          ...s.objects,
          {
            id: uid(),
            type: "text" as const,
            x,
            y,
            text,
            color: textColorForBoard(board),
            fontSize: 0.035,
            fontFamily: defaultTextFont(),
            ...(opts?.width != null && Number.isFinite(opts.width) && opts.width > 0
              ? { width: opts.width }
              : {}),
            ...(opts?.height != null &&
            Number.isFinite(opts.height) &&
            opts.height > 0
              ? { height: opts.height }
              : {}),
          },
        ],
      }));
    },
    [board, updateScene],
  );

  const updateText = useCallback(
    (id: string, text: string) => {
      // Trim ends only — keep internal newlines for multiline wrap
      const trimmed = text.replace(/^\s+|\s+$/g, "");
      updateScene((s) => {
        if (!trimmed) {
          return { ...s, objects: s.objects.filter((o) => o.id !== id) };
        }
        return {
          ...s,
          objects: s.objects.map((o) =>
            o.id === id && o.type === "text" ? { ...o, text: trimmed } : o,
          ),
        };
      });
    },
    [updateScene],
  );

  const moveText = useCallback(
    (id: string, x: number, y: number, record: boolean) => {
      updateScene(
        (s) => ({
          ...s,
          objects: s.objects.map((o) =>
            o.id === id && o.type === "text" ? { ...o, x, y } : o,
          ),
        }),
        record,
      );
    },
    [updateScene],
  );

  const patchText = useCallback(
    (
      id: string,
      patch: {
        color?: string;
        fontFamily?: TextFontId;
        fontSize?: number;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        align?: "left" | "center" | "right";
        rotationDeg?: number;
      },
      record = false,
    ) => {
      updateScene(
        (s) => ({
          ...s,
          objects: s.objects.map((o) => {
            if (o.id !== id || o.type !== "text") return o;
            const next = { ...o, ...patch };
            if (patch.width !== undefined) {
              if (
                !Number.isFinite(patch.width) ||
                patch.width <= 0
              ) {
                delete next.width;
              }
            }
            if (patch.height !== undefined) {
              if (
                !Number.isFinite(patch.height) ||
                patch.height <= 0
              ) {
                delete next.height;
              }
            }
            if (patch.rotationDeg !== undefined) {
              if (!Number.isFinite(patch.rotationDeg)) {
                delete next.rotationDeg;
              } else {
                let d = patch.rotationDeg % 360;
                if (d < 0) d += 360;
                if (Math.abs(d) < 1e-9 || Math.abs(d - 360) < 1e-9) {
                  delete next.rotationDeg;
                } else {
                  next.rotationDeg = d;
                }
              }
            }
            if (patch.align !== undefined) {
              if (
                patch.align !== "left" &&
                patch.align !== "center" &&
                patch.align !== "right"
              ) {
                delete next.align;
              } else if (patch.align === "left") {
                // Unspecified = left — omit to keep legacy rows lean
                delete next.align;
              } else {
                next.align = patch.align;
              }
            }
            if (patch.fontSize !== undefined) {
              if (!Number.isFinite(patch.fontSize) || patch.fontSize <= 0) {
                next.fontSize = 0.035;
              } else {
                // Clamp to UI bounds (0.012–0.072)
                const ui = Math.round(patch.fontSize * 1000);
                const clamped = Math.min(72, Math.max(12, ui));
                next.fontSize = clamped / 1000;
              }
            }
            return next;
          }),
        }),
        record,
      );
    },
    [updateScene],
  );

  /**
   * Insert a shape behind other DrawObjects (array front = drawn first).
   * Group 5 wires create-drag UI onto this API.
   */
  const addShape = useCallback(
    (
      kind: ShapeKind,
      box: { x: number; y: number; w: number; h: number },
      opts?: {
        fillColor?: string;
        fillOpacity?: number;
        strokeEnabled?: boolean;
        rotationDeg?: number;
        select?: boolean;
      },
    ) => {
      const style = shapeCreateStyleRef.current;
      const shape = createShapeObject(kind, {
        ...box,
        fillColor: opts?.fillColor ?? style.fillColor,
        fillOpacity: opts?.fillOpacity ?? style.fillOpacity,
        strokeEnabled: opts?.strokeEnabled ?? style.strokeEnabled,
        rotationDeg: opts?.rotationDeg,
      });
      updateScene((s) => ({
        ...s,
        objects: [shape, ...s.objects],
      }));
      if (opts?.select !== false) {
        setSelectedObjectId(shape.id);
        setSelectedPieceId(null);
        setSelectedBall(false);
      }
      return shape.id;
    },
    [updateScene],
  );

  const moveShape = useCallback(
    (id: string, x: number, y: number, record = false) => {
      updateScene(
        (s) => ({
          ...s,
          objects: s.objects.map((o) =>
            o.id === id && o.type === "shape" ? { ...o, x, y } : o,
          ),
        }),
        record,
      );
    },
    [updateScene],
  );

  const patchShape = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          ShapeObject,
          | "x"
          | "y"
          | "w"
          | "h"
          | "rotationDeg"
          | "fillColor"
          | "fillOpacity"
          | "strokeEnabled"
          | "kind"
        >
      >,
      record = false,
    ) => {
      updateScene(
        (s) => ({
          ...s,
          objects: s.objects.map((o) => {
            if (o.id !== id || o.type !== "shape") return o;
            const merged: ShapeObject = { ...o, ...patch };
            // Prevent fully invisible unselectable shapes (opacity 0 + outline off).
            const nextOpacity = clampShapeFillOpacity(
              merged.fillOpacity ?? SHAPE_DEFAULT_FILL_OPACITY,
            );
            const nextStroke = merged.strokeEnabled !== false;
            if (nextOpacity <= 0 && !nextStroke) {
              if (patch.strokeEnabled === false) {
                merged.fillOpacity = 0.05;
                merged.strokeEnabled = false;
              } else {
                merged.fillOpacity = nextOpacity;
                delete merged.strokeEnabled; // outline ON
              }
            }
            const next = sanitizeShapeObject(merged);
            if (!next) return o;
            if (
              patch.fillColor !== undefined ||
              patch.fillOpacity !== undefined ||
              patch.strokeEnabled !== undefined
            ) {
              shapeCreateStyleRef.current = {
                fillColor: sanitizeShapeFillColor(next.fillColor),
                fillOpacity: clampShapeFillOpacity(
                  next.fillOpacity ?? SHAPE_DEFAULT_FILL_OPACITY,
                ),
                strokeEnabled: next.strokeEnabled !== false,
              };
            }
            return next;
          }),
        }),
        record,
      );
    },
    [updateScene],
  );

  const arrangeSelectedShape = useCallback(
    (op: ShapeArrangeOp) => {
      if (!selectedObjectId || !board) return false;
      const sc = getActiveScene(board);
      if (!sc) return false;
      const obj = sc.objects.find((o) => o.id === selectedObjectId);
      if (!obj || obj.type !== "shape") return false;
      const nextObjs = arrangeDrawObject(sc.objects, selectedObjectId, op);
      if (!nextObjs) return false;
      updateScene((s) => ({ ...s, objects: nextObjs }), true);
      return true;
    },
    [board, selectedObjectId, updateScene],
  );

  /**
   * Open a local Portable JSON as File Session (no BoardStore insert, no ID remap).
   * Replaces any existing File Session. Caller should confirm if current is dirty.
   * Directory mode may attach a FileHandle (memory only; never persisted).
   */
  const openFileSession = useCallback(
    (
      text: string,
      sourceName: string,
      byteLengthOrOpts?:
        | number
        | {
            byteLength?: number;
            directorySource?: FileSessionDirectorySource | null;
          },
    ): PortableImportErrorCode | null => {
      const opts =
        typeof byteLengthOrOpts === "number"
          ? { byteLength: byteLengthOrOpts }
          : byteLengthOrOpts ?? {};
      let nextBoard: BoardDocument;
      try {
        nextBoard = parsePortableBoardJsonForOpen(text, opts.byteLength);
      } catch (e) {
        if (e instanceof PortableImportError) return e.code;
        return "unknown";
      }
      history.current = [];
      future.current = [];
      setSelectedPieceId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
      setLiveEventStack([]);
      setPendingFileSessionRestore(null);
      const openedAt = Date.now();
      const baselineFinger = boardContentFingerprint(nextBoard);
      const nextFs: FileSessionState = {
        board: nextBoard,
        sourceName: sourceName.trim() || "board.zoneboard.json",
        openedAt,
        baselineFinger,
        dirty: false,
        neverSavedToFile: false,
        draftSaveOk: true,
        lastDownloadRequestedAt: null,
        directorySource: opts.directorySource ?? null,
        saveUi: "idle",
        saveConflictCurrent: null,
      };
      fileSessionRef.current = nextFs;
      setFileSession(nextFs);
      clearFileSessionDraft();
      return null;
    },
    [],
  );

  /**
   * Create a brand-new BoardDocument as File Session (not BoardStore).
   * Starts never-saved / dirty. Does not consume Store slot limits.
   * Caller must confirm discard of any existing dirty File Session first.
   */
  const createNewLocalBoardFileSession = useCallback(
    (opts?: { pitchOrientation?: PitchOrientation }): boolean => {
      const nextBoard = createBoard(
        "soccer",
        defaultBoardTitle(1, locale),
        locale,
        opts?.pitchOrientation
          ? { pitchOrientation: opts.pitchOrientation }
          : undefined,
      );
      history.current = [];
      future.current = [];
      setSelectedPieceId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
      setLiveEventStack([]);
      setPendingFileSessionRestore(null);
      const openedAt = Date.now();
      const baselineFinger = boardContentFingerprint(nextBoard);
      const nextFs: FileSessionState = {
        board: nextBoard,
        sourceName: "untitled.zoneboard.json",
        openedAt,
        baselineFinger,
        dirty: true,
        neverSavedToFile: true,
        draftSaveOk: true,
        lastDownloadRequestedAt: null,
        directorySource: null,
        saveUi: "idle",
        saveConflictCurrent: null,
      };
      fileSessionRef.current = nextFs;
      setFileSession(nextFs);
      scheduleFileSessionDraft(nextFs);
      return true;
    },
    [locale, scheduleFileSessionDraft],
  );

  /** Discard File Session and return to Store Mode. Does not touch BoardStore. */
  const closeFileSession = useCallback((opts?: { discardDraft?: boolean }) => {
    if (fileSessionDraftTimer.current) {
      window.clearTimeout(fileSessionDraftTimer.current);
      fileSessionDraftTimer.current = null;
    }
    history.current = [];
    future.current = [];
    setSelectedPieceId(null);
    setSelectedObjectId(null);
    setSelectedBall(false);
    setLiveEventStack([]);
    fileSessionRef.current = null;
    setFileSession(null);
    if (opts?.discardDraft !== false) clearFileSessionDraft();
  }, []);

  /**
   * Request Blob download (Save As). Does **not** mark clean — browsers cannot
   * confirm the OS finished writing. Keeps dirty + draft intact.
   */
  const downloadFileSessionJson = useCallback((): boolean => {
    const fs = fileSessionRef.current;
    if (!fs) return false;
    try {
      exportBoardJsonDownload(fs.board, {
        fallbackTitle: fs.sourceName.replace(/\.zoneboard\.json$/i, "") || "ZoneBoard",
      });
      const nextFs: FileSessionState = {
        ...fs,
        lastDownloadRequestedAt: Date.now(),
      };
      fileSessionRef.current = nextFs;
      setFileSession(nextFs);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Call only after a confirmed write+close to the source file.
   * Blob download must never call this. If `expectedFinger` is provided and the
   * live board has diverged (edits during Save), dirty stays true.
   */
  const markFileSessionSavedToSource = useCallback(
    (opts?: {
      expectedFinger?: string;
      openSnapshot?: FileMetaSnapshot;
    }) => {
      const fs = fileSessionRef.current;
      if (!fs) return;
      const finger = boardContentFingerprint(fs.board);
      const stillSame =
        opts?.expectedFinger == null || opts.expectedFinger === finger;
      const nextDir =
        fs.directorySource && opts?.openSnapshot
          ? { ...fs.directorySource, openSnapshot: opts.openSnapshot }
          : fs.directorySource;
      // If edits landed during Save, baseline becomes the written content;
      // live board stays dirty until it matches that written finger.
      const baselineFinger = stillSame
        ? finger
        : (opts?.expectedFinger ?? fs.baselineFinger);
      const nextFs: FileSessionState = {
        ...fs,
        baselineFinger,
        neverSavedToFile: false,
        dirty: isFileSessionContentDirty(
          fs.board,
          baselineFinger,
          false,
        ),
        draftSaveOk: true,
        lastDownloadRequestedAt: null,
        directorySource: nextDir,
        saveUi: stillSame ? "saved" : "idle",
        saveConflictCurrent: null,
      };
      fileSessionRef.current = nextFs;
      setFileSession(nextFs);
      if (!nextFs.dirty) clearFileSessionDraft();
      else scheduleFileSessionDraft(nextFs);
    },
    [scheduleFileSessionDraft],
  );

  const saveBusyRef = useRef(false);

  /**
   * Directory Save: permission → conflict check → write → close → verify → clean.
   * Returns structured result for UI (conflict dialog / errors).
   */
  const saveFileSessionToSource = useCallback(
    async (opts?: {
      allowOverwriteConflict?: boolean;
    }): Promise<
      SaveToSourceResult & {
        libraryPatch?: {
          entryId: string;
          board: BoardDocument;
          text: string;
          byteSize: number;
          openSnapshot: FileMetaSnapshot;
          displayTitle: string;
          sceneCount: number;
          boardUpdatedAt: string | null;
        };
      }
    > => {
      const fs = fileSessionRef.current;
      if (!fs) return { ok: false, reason: "no_handle" };
      if (!fs.directorySource) {
        const nextFs = { ...fs, saveUi: "no_handle" as const };
        fileSessionRef.current = nextFs;
        setFileSession(nextFs);
        return { ok: false, reason: "no_handle" };
      }
      if (saveBusyRef.current) return { ok: false, reason: "busy" };
      saveBusyRef.current = true;
      // Freeze identity + board at Save start so a later session switch cannot
      // mark a different File Session clean or patch the wrong library entry.
      const saveTarget = {
        fileHandle: fs.directorySource.fileHandle,
        libraryEntryId: fs.directorySource.libraryEntryId,
        openedSnapshot: fs.directorySource.openSnapshot,
        board: structuredClone(fs.board),
        expectedFinger: boardContentFingerprint(fs.board),
      };
      const savingFs = {
        ...fs,
        saveUi: "saving" as const,
        saveConflictCurrent: null,
      };
      fileSessionRef.current = savingFs;
      setFileSession(savingFs);

      try {
        const result = await writeBoardToFileHandle(
          saveTarget.fileHandle,
          saveTarget.board,
          {
            allowOverwriteConflict: opts?.allowOverwriteConflict,
            openedSnapshot: saveTarget.openedSnapshot,
          },
        );

        if (!result.ok) {
          const ui: FileSessionSaveUi =
            result.reason === "permission_denied"
              ? "permission_denied"
              : result.reason === "conflict"
                ? "conflict"
                : result.reason === "missing"
                  ? "missing"
                  : "failed";
          const live = fileSessionRef.current;
          // Only stamp failure UI onto the same Directory session that started Save.
          if (
            live?.directorySource?.libraryEntryId === saveTarget.libraryEntryId &&
            live.directorySource.fileHandle === saveTarget.fileHandle
          ) {
            const nextFs: FileSessionState = {
              ...live,
              saveUi: ui,
              saveConflictCurrent: result.current ?? null,
            };
            fileSessionRef.current = nextFs;
            setFileSession(nextFs);
          }
          return result;
        }

        // Library reflects what was written (board at Save start), not later edits.
        const writtenBoard = saveTarget.board;
        const text = portableToJsonString(
          serializeBoardToPortable(writtenBoard),
        );
        const live = fileSessionRef.current;
        if (
          live?.directorySource?.libraryEntryId === saveTarget.libraryEntryId &&
          live.directorySource.fileHandle === saveTarget.fileHandle
        ) {
          markFileSessionSavedToSource({
            expectedFinger: saveTarget.expectedFinger,
            openSnapshot: result.snapshot,
          });
        }

        return {
          ok: true,
          snapshot: result.snapshot,
          libraryPatch: {
            entryId: saveTarget.libraryEntryId,
            board: structuredClone(writtenBoard),
            text,
            byteSize: new TextEncoder().encode(text).length,
            openSnapshot: result.snapshot,
            // Local Files Dashboard primary = file stem (not board.title).
            displayTitle: displayNameFromZoneboardFile(
              result.snapshot.name || fs.sourceName,
            ),
            sceneCount: writtenBoard.scenes.length,
            boardUpdatedAt:
              typeof writtenBoard.updatedAt === "string"
                ? writtenBoard.updatedAt
                : null,
          },
        };
      } finally {
        saveBusyRef.current = false;
      }
    },
    [locale, markFileSessionSavedToSource],
  );

  const saveAsBusyRef = useRef(false);

  /**
   * Save As into a connected folder (new file; conflict → rename, no silent overwrite).
   * Does not mutate board.title. Does not insert into BoardStore.
   * On success for File Session, rebinds directorySource to the new file.
   */
  const saveBoardAsToFolder = useCallback(
    async (opts: {
      directoryHandle: FileSystemDirectoryHandle;
      directorySessionId: string;
      fileName: string;
      allowOverwrite?: boolean;
      onPhase?: (phase: SaveAsPhase) => void;
    }): Promise<
      SaveAsToFolderResult & {
        libraryEntry?: {
          id: string;
          board: BoardDocument;
          text: string;
          byteSize: number;
          openSnapshot: FileMetaSnapshot;
          displayTitle: string;
          sceneCount: number;
          boardUpdatedAt: string | null;
          fileName: string;
          fileHandle: FileSystemFileHandle;
          directorySessionId: string;
        };
      }
    > => {
      const fs = fileSessionRef.current;
      const activeBoard = fs?.board ?? board;
      if (!activeBoard) return { ok: false, reason: "no_directory" };
      if (saveAsBusyRef.current || saveBusyRef.current) {
        return { ok: false, reason: "write_failed" };
      }

      const normalized = normalizeSaveAsFileName(
        opts.fileName,
        boardDisplayName(activeBoard, defaultBoardTitle(1, locale)),
        defaultBoardTitle(1, locale),
      );
      if (!normalized) return { ok: false, reason: "invalid_name" };

      saveAsBusyRef.current = true;
      try {
        const result = await saveBoardAsNewInDirectory(
          opts.directoryHandle,
          activeBoard,
          normalized,
          {
            allowOverwrite: opts.allowOverwrite,
            onPhase: opts.onPhase,
          },
        );
        if (!result.ok) return result;

        // Keep board.title as authored — Save As only chooses the file name.
        const writtenBoard = structuredClone(activeBoard);
        const text = portableToJsonString(
          serializeBoardToPortable(writtenBoard),
        );
        const entryId = uid();
        const expectedFinger = boardContentFingerprint(writtenBoard);

        if (fs) {
          const nextDir = {
            fileHandle: result.fileHandle,
            directorySessionId: opts.directorySessionId,
            libraryEntryId: entryId,
            openSnapshot: result.snapshot,
          };
          const live = fileSessionRef.current;
          if (live && live.openedAt === fs.openedAt) {
            const nextFs: FileSessionState = {
              ...live,
              sourceName: result.fileName,
              directorySource: nextDir,
              baselineFinger: expectedFinger,
              neverSavedToFile: false,
              dirty: isFileSessionContentDirty(
                live.board,
                expectedFinger,
                false,
              ),
              saveUi:
                boardContentFingerprint(live.board) === expectedFinger
                  ? "saved"
                  : "idle",
              saveConflictCurrent: null,
              lastDownloadRequestedAt: null,
              draftSaveOk: true,
            };
            fileSessionRef.current = nextFs;
            setFileSession(nextFs);
            if (!nextFs.dirty) clearFileSessionDraft();
            else scheduleFileSessionDraft(nextFs);
          }
        }

        return {
          ok: true,
          fileName: result.fileName,
          fileHandle: result.fileHandle,
          snapshot: result.snapshot,
          overwritten: result.overwritten,
          libraryEntry: {
            id: entryId,
            board: writtenBoard,
            text,
            byteSize: new TextEncoder().encode(text).length,
            openSnapshot: result.snapshot,
            displayTitle: displayNameFromZoneboardFile(result.fileName),
            sceneCount: writtenBoard.scenes.length,
            boardUpdatedAt:
              typeof writtenBoard.updatedAt === "string"
                ? writtenBoard.updatedAt
                : null,
            fileName: result.fileName,
            fileHandle: result.fileHandle,
            directorySessionId: opts.directorySessionId,
          },
        };
      } finally {
        opts.onPhase?.("idle");
        saveAsBusyRef.current = false;
      }
    },
    [board, locale, scheduleFileSessionDraft],
  );

  const suggestSaveAsFileName = useCallback((): string => {
    const active = fileSessionRef.current?.board ?? board;
    if (!active) return portableBoardFilename("ZoneBoard", "ZoneBoard");
    const fs = fileSessionRef.current;
    // New unsaved: suggest from board title (not placeholder untitled).
    if (fs?.neverSavedToFile) {
      return portableBoardFilename(
        boardDisplayName(active, defaultBoardTitle(1, locale)),
        defaultBoardTitle(1, locale),
      );
    }
    if (fs?.sourceName && fs.sourceName !== "untitled.zoneboard.json") {
      return portableBoardFilename(
        displayNameFromZoneboardFile(fs.sourceName),
        defaultBoardTitle(1, locale),
      );
    }
    return portableBoardFilename(
      boardDisplayName(active, defaultBoardTitle(1, locale)),
      defaultBoardTitle(1, locale),
    );
  }, [board, locale]);

  /** Pre-check conflict without writing (for UI). */
  const checkFileSessionSaveConflict = useCallback(async (): Promise<{
    kind: ReturnType<typeof detectSaveConflict>;
    current: FileMetaSnapshot | null;
  }> => {
    const fs = fileSessionRef.current;
    if (!fs?.directorySource) {
      return { kind: "missing", current: null };
    }
    const current = await readFileSnapshot(fs.directorySource.fileHandle);
    return {
      kind: detectSaveConflict(fs.directorySource.openSnapshot, current),
      current,
    };
  }, []);

  /**
   * If a dirty File Session is active, ask before discarding.
   * Returns true when it is safe to proceed (no session, clean close, or user confirmed).
   */
  const confirmDiscardFileSessionIfNeeded = useCallback(
    (message: string): boolean => {
      const fs = fileSessionRef.current;
      if (!fs) return true;
      if (fs.dirty) {
        const ok = window.confirm(message);
        if (!ok) return false;
      }
      closeFileSession({ discardDraft: true });
      return true;
    },
    [closeFileSession],
  );

  const acceptFileSessionRestore = useCallback(() => {
    const pending = pendingFileSessionRestore;
    if (!pending) return;
    history.current = [];
    future.current = [];
    setSelectedPieceId(null);
    setSelectedObjectId(null);
    setSelectedBall(false);
    setLiveEventStack([]);
    const neverSaved = pending.neverSavedToFile;
    const nextFs: FileSessionState = {
      board: pending.board,
      sourceName: pending.sourceName,
      openedAt: pending.openedAt,
      baselineFinger: pending.baselineFinger,
      neverSavedToFile: neverSaved,
      dirty: isFileSessionContentDirty(
        pending.board,
        pending.baselineFinger,
        neverSaved,
      ),
      draftSaveOk: true,
      lastDownloadRequestedAt: null,
      directorySource: null,
      saveUi: "no_handle",
      saveConflictCurrent: null,
    };
    fileSessionRef.current = nextFs;
    setFileSession(nextFs);
    setPendingFileSessionRestore(null);
  }, [pendingFileSessionRestore]);

  const dismissFileSessionRestore = useCallback(() => {
    setPendingFileSessionRestore(null);
    clearFileSessionDraft();
  }, []);

  // Boot: detect sessionStorage draft (user must confirm — never auto-open).
  useEffect(() => {
    const draft = readFileSessionDraft();
    if (!draft) return;
    setPendingFileSessionRestore({
      sourceName: draft.sourceName,
      openedAt: draft.openedAt,
      baselineFinger: draft.baselineFinger,
      board: draft.board,
      neverSavedToFile: draft.neverSavedToFile === true,
    });
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedPieceIds.length > 0) {
      const drop = new Set(selectedPieceIds);
      updateScene((s) => ({
        ...s,
        pieces: s.pieces.filter((p) => !drop.has(p.id)),
        objects: pruneLinkObjects(s.objects, drop),
        balls: ballsAfterPieceDelete(s.balls, drop),
      }));
      setSelectedPieceId(null);
      return;
    }
    if (selectedObjectId) {
      updateScene((s) => ({
        ...s,
        objects: s.objects.filter((o) => o.id !== selectedObjectId),
      }));
      setSelectedObjectId(null);
      return;
    }
    if (selectedBallId) {
      // Last ball is undeletable — no-op, no history.
      if (!scene || scene.balls.length <= 1) return;
      const id = selectedBallId;
      updateScene((s) => {
        if (s.balls.length <= 1) return s;
        const next = s.balls.filter((b) => b.id !== id);
        return next.length === 0 ? s : { ...s, balls: next };
      });
      setSelectedBallId(null);
    }
  }, [
    selectedPieceIds,
    selectedObjectId,
    selectedBallId,
    scene,
    setSelectedPieceId,
    updateScene,
  ]);

  const clearDrawings = useCallback(() => {
    updateScene((s) => ({ ...s, objects: [] }));
    setSelectedObjectId(null);
  }, [updateScene]);

  const wipeDrawing = useCallback(() => {
    updateScene((s) => {
      if (s.objects.length === 0) return s;
      if (selectedObjectId) {
        const has = s.objects.some((o) => o.id === selectedObjectId);
        if (has) {
          return {
            ...s,
            objects: s.objects.filter((o) => o.id !== selectedObjectId),
          };
        }
      }
      return { ...s, objects: s.objects.slice(0, -1) };
    });
    if (selectedObjectId) setSelectedObjectId(null);
  }, [selectedObjectId, updateScene]);

  const clearBoard = useCallback(() => {
    updateScene((s) => ({ ...s, pieces: [], objects: [] }));
    setSelectedPieceId(null);
    setSelectedObjectId(null);
  }, [setSelectedPieceId, updateScene]);

  const pushLiveEvent = useCallback((kind: LiveEventKind, id: string) => {
    setLiveEventStack((prev) => [...prev, { kind, id }].slice(-24));
  }, []);

  const pruneLiveEvent = useCallback((id: string) => {
    setLiveEventStack((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addGoal = useCallback(
    (
      team: "home" | "away",
      scorer: string,
      minute?: string,
      kind: GoalKind = "normal",
    ) => {
      const name = scorer.trim();
      if (!name) return;
      const id = uid();
      updateBoard((b) => ({
        ...b,
        goals: [
          ...b.goals,
          {
            id,
            team,
            scorer: name,
            kind,
            minute: minute?.trim() || undefined,
          },
        ],
      }));
      pushLiveEvent("goal", id);
    },
    [pushLiveEvent, updateBoard],
  );

  const removeGoal = useCallback(
    (goalId: string) => {
      updateBoard((b) => ({
        ...b,
        goals: b.goals.filter((g) => g.id !== goalId),
      }));
      pruneLiveEvent(goalId);
    },
    [pruneLiveEvent, updateBoard],
  );

  const addCard = useCallback(
    (
      team: "home" | "away",
      player: string,
      kind: CardKind,
      minute?: string,
    ) => {
      const name = player.trim();
      if (!name) return;
      const id = uid();
      updateBoard((b) => ({
        ...b,
        cards: [
          ...(b.cards ?? []),
          {
            id,
            team,
            player: name,
            kind,
            minute: minute?.trim() || undefined,
          },
        ],
      }));
      pushLiveEvent("card", id);
    },
    [pushLiveEvent, updateBoard],
  );

  const removeCard = useCallback(
    (cardId: string) => {
      updateBoard((b) => ({
        ...b,
        cards: (b.cards ?? []).filter((c) => c.id !== cardId),
      }));
      pruneLiveEvent(cardId);
    },
    [pruneLiveEvent, updateBoard],
  );

  /** Broadcast / Match: 交代を記録し、番号一致の駒に out/in（injured）を付与。座標は動かさない。 */
  const addSub = useCallback(
    (
      team: "home" | "away",
      outNumber: string,
      inNumber: string,
      minute?: string,
      injured = false,
    ) => {
      const outN = normalizePieceNumber(outNumber);
      const inN = normalizePieceNumber(inNumber);
      if (!outN || !inN || outN === inN) return;
      const id = uid();
      updateBoard((b) => {
        const scene = getActiveScene(b);
        const pieces = statusesAfterSub(
          scene.pieces,
          team,
          outN,
          inN,
          injured,
        );
        return {
          ...b,
          maxSubs: b.maxSubs > 0 ? b.maxSubs : DEFAULT_MAX_SUBS,
          subs: [
            ...(b.subs ?? []),
            {
              id,
              team,
              outNumber: outN,
              inNumber: inN,
              minute: minute?.trim() || undefined,
              injured: injured || undefined,
            },
          ],
          scenes: b.scenes.map((s) =>
            s.id === scene.id ? { ...s, pieces } : s,
          ),
        };
      });
      pushLiveEvent("sub", id);
    },
    [pushLiveEvent, updateBoard],
  );

  const removeSub = useCallback(
    (subId: string) => {
      updateBoard((b) => ({
        ...b,
        subs: (b.subs ?? []).filter((s) => s.id !== subId),
      }));
      pruneLiveEvent(subId);
    },
    [pruneLiveEvent, updateBoard],
  );

  /** 直前の Goal / Card / Sub を1件取り消す */
  const undoLastLiveEvent = useCallback(() => {
    let last: LiveEventRef | undefined;
    setLiveEventStack((prev) => {
      if (prev.length === 0) return prev;
      last = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    if (!last) return;
    const { kind, id } = last;
    if (kind === "goal") {
      updateBoard((b) => ({
        ...b,
        goals: b.goals.filter((g) => g.id !== id),
      }));
    } else if (kind === "card") {
      updateBoard((b) => ({
        ...b,
        cards: (b.cards ?? []).filter((c) => c.id !== id),
      }));
    } else {
      updateBoard((b) => ({
        ...b,
        subs: (b.subs ?? []).filter((s) => s.id !== id),
      }));
    }
  }, [updateBoard]);

  /** PK ストリップ ON/OFF。ON 時スロットが空なら 5 本で初期化 */
  const setPkActive = useCallback(
    (active: boolean) => {
      updateBoard((b) => {
        const pk = b.pk ?? createPkShootout(false);
        if (active && pk.home.length === 0) {
          return { ...b, pk: createPkShootout(true) };
        }
        return {
          ...b,
          pk: { ...pk, active },
        };
      });
    },
    [updateBoard],
  );

  /** スロットクリック: 未 → ○ → ✕ → 未 */
  const cyclePkSlot = useCallback(
    (team: "home" | "away", slotId: string) => {
      updateBoard((b) => {
        const pk = b.pk ?? createPkShootout(false);
        const row = pk[team].map((s) =>
          s.id === slotId
            ? { ...s, result: cyclePkResult(s.result) }
            : s,
        );
        return { ...b, pk: { ...pk, [team]: row } };
      });
    },
    [updateBoard],
  );

  const setPkSlotResult = useCallback(
    (
      team: "home" | "away",
      slotId: string,
      result: PkKickResult | undefined,
    ) => {
      updateBoard((b) => {
        const pk = b.pk ?? createPkShootout(false);
        const row = pk[team].map((s) =>
          s.id === slotId ? { ...s, result } : s,
        );
        return { ...b, pk: { ...pk, [team]: row } };
      });
    },
    [updateBoard],
  );

  const setPkSlotNumber = useCallback(
    (team: "home" | "away", slotId: string, number: string) => {
      const n = number.trim();
      updateBoard((b) => {
        const pk = b.pk ?? createPkShootout(false);
        const row = pk[team].map((s) =>
          s.id === slotId
            ? { ...s, number: n || undefined }
            : s,
        );
        return { ...b, pk: { ...pk, [team]: row } };
      });
    },
    [updateBoard],
  );

  /** サドンデス: 両チームに空スロットを1本足す */
  const addPkRound = useCallback(() => {
    updateBoard((b) => {
      const pk = b.pk ?? createPkShootout(true);
      return {
        ...b,
        pk: {
          ...pk,
          active: true,
          home: [...pk.home, emptyPkSlot()],
          away: [...pk.away, emptyPkSlot()],
        },
      };
    });
  }, [updateBoard]);

  const resetPk = useCallback(() => {
    updateBoard((b) => ({
      ...b,
      pk: createPkShootout(b.pk?.active ?? false),
    }));
  }, [updateBoard]);

  const openPieceInspector = useCallback((id: string) => {
    setSelectedPieceIds([id]);
    setSelectedBall(false);
    setSelectedObjectId(null);
    setPieceInspectorId(id);
  }, []);

  const closePieceInspector = useCallback(() => {
    setPieceInspectorId(null);
  }, []);

  useEffect(() => {
    if (broadcast) setDrawerOpen(false);
  }, [broadcast]);

  const revokeCaptureImageUrl = useCallback(() => {
    if (captureImageUrlRef.current) {
      URL.revokeObjectURL(captureImageUrlRef.current);
      captureImageUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokeCaptureImageUrl(), [revokeCaptureImageUrl]);

  const clearCaptureImport = useCallback(() => {
    const restore = captureImportRef.current?.toolBeforePlace;
    revokeCaptureImageUrl();
    setCaptureImport(null);
    if (restore != null) setToolState(restore);
  }, [revokeCaptureImageUrl]);

  useEffect(() => {
    if (!isCaptureImportEnabled() && captureImportRef.current) {
      clearCaptureImport();
    }
  }, [clearCaptureImport]);

  const startCaptureImport = useCallback((): MessageKey | null => {
    if (!isCaptureImportEnabled()) return null;
    const block = captureImportEligibility(board);
    if (block) return captureImportBlockKey(block);
    const cur = captureImportRef.current;
    if (cur && !cur.image && (cur.phase === "idle" || cur.phase === "image")) {
      return null;
    }
    clearCaptureImport();
    setCaptureImport(emptyCaptureImportSession("idle"));
    return null;
  }, [board, clearCaptureImport]);

  const setCaptureImageFromBlob = useCallback(
    async (blob: Blob): Promise<MessageKey | null> => {
      if (!isCaptureImportEnabled()) return null;
      const block = captureImportEligibility(board);
      if (block) return captureImportBlockKey(block);

      const image = await loadCaptureImage(blob);
      if (!image) return null;

      revokeCaptureImageUrl();
      captureImageUrlRef.current = image.url;
      setCaptureImport({
        phase: "image",
        image,
        calibSrc4: null,
        calibSrcMoved: false,
        calibLandmarkIds: null,
        calibGoalSide: null,
        calibPreset: null,
        calibFocusIndex: null,
        homography: null,
        draftPieces: [],
        draftBall: null,
        selectedDraftPieceId: null,
        selectedDraftBall: false,
        toolBeforePlace: null,
        underlayOpacity: DEFAULT_UNDERLAY_OPACITY,
      });
      return null;
    },
    [board, revokeCaptureImageUrl],
  );

  const ingestCaptureImportDataTransfer = useCallback(
    async (dt: DataTransfer): Promise<MessageKey | null> => {
      if (!isCaptureImportEnabled()) return null;
      const blob = imageBlobFromDataTransfer(dt);
      if (!blob) return null;
      return setCaptureImageFromBlob(blob);
    },
    [setCaptureImageFromBlob],
  );

  const beginCaptureCalib = useCallback(() => {
    setCaptureImport((prev) => {
      if (!prev?.image) return prev;
      return {
        ...prev,
        phase: "calib",
        calibSrc4: null,
        calibSrcMoved: false,
        calibLandmarkIds: null,
        calibGoalSide: null,
        calibPreset: null,
        calibFocusIndex: null,
        homography: null,
      };
    });
  }, []);

  const setCaptureCalibPoint = useCallback(
    (index: number, point: Point) => {
      setCaptureImport((prev) => {
        if (!prev?.calibSrc4 || index < 0 || index > 3) return prev;
        const calibSrc4 = prev.calibSrc4.map((p, i) =>
          i === index ? point : p,
        );
        return {
          ...prev,
          calibSrc4,
          calibSrcMoved: true,
          calibFocusIndex: index,
        };
      });
    },
    [],
  );

  const setCaptureCalibLandmark = useCallback(
    (index: number, id: LandmarkId) => {
      setCaptureImport((prev) => {
        if (!prev || index < 0 || index > 3) return prev;
        const base = resolveCalibLandmarkIds(prev.calibLandmarkIds);
        const calibLandmarkIds = base.map((v, i) =>
          i === index ? id : v,
        ) as LandmarkQuad;
        return { ...prev, calibLandmarkIds, calibFocusIndex: index };
      });
    },
    [],
  );

  const setCaptureCalibFocus = useCallback((index: number | null) => {
    setCaptureImport((prev) =>
      prev ? { ...prev, calibFocusIndex: index } : prev,
    );
  }, []);

  const applyCalibPresetState = (
    prev: CaptureImportSession,
    preset: CalibLandmarkPreset,
    goalSide: CalibGoalSide | null,
  ): CaptureImportSession => {
    if (!prev.image) return prev;
    const side =
      landmarkPresetNeedsGoalSide(preset) ? goalSide : null;
    const ids = landmarkPresetIds(preset, side);
    if (!ids) {
      return {
        ...prev,
        calibPreset: preset,
        calibGoalSide: side,
        calibLandmarkIds: null,
        calibSrc4: null,
        calibSrcMoved: false,
        calibFocusIndex: null,
        homography: null,
      };
    }
    return {
      ...prev,
      calibPreset: preset,
      calibGoalSide: side,
      calibLandmarkIds: ids,
      calibSrc4: initialCalibSrcPoints(
        prev.image.width,
        prev.image.height,
        side,
      ),
      calibSrcMoved: false,
      calibFocusIndex: 0,
      homography: null,
    };
  };

  const setCaptureCalibPreset = useCallback((preset: CalibLandmarkPreset) => {
    setCaptureImport((prev) => {
      if (!prev?.image) return prev;
      const side = landmarkPresetNeedsGoalSide(preset)
        ? prev.calibGoalSide
        : null;
      return applyCalibPresetState(prev, preset, side);
    });
  }, []);

  const setCaptureCalibGoalSide = useCallback((side: CalibGoalSide) => {
    setCaptureImport((prev) => {
      if (!prev?.image) return prev;
      const preset = prev.calibPreset ?? "mixed";
      return applyCalibPresetState(prev, preset, side);
    });
  }, []);

  const resetCaptureCalibPoints = useCallback(() => {
    setCaptureImport((prev) => {
      if (!prev?.image) return prev;
      return {
        ...prev,
        calibSrc4: initialCalibSrcPoints(
          prev.image.width,
          prev.image.height,
          prev.calibGoalSide,
        ),
        calibSrcMoved: false,
      };
    });
  }, []);

  const backCaptureCalib = useCallback(() => {
    setCaptureImport((prev) =>
      prev
        ? {
            ...prev,
            phase: "image",
            homography: null,
            calibSrc4: null,
            calibSrcMoved: false,
            calibLandmarkIds: null,
            calibPreset: null,
            calibGoalSide: null,
            calibFocusIndex: null,
          }
        : prev,
    );
  }, []);

  const reopenCaptureCalib = useCallback(() => {
    setCaptureImport((prev) =>
      prev
        ? {
            ...prev,
            phase: "calib",
            homography: null,
            draftPieces: [],
            draftBall: null,
            selectedDraftPieceId: null,
            selectedDraftBall: false,
            calibFocusIndex: 0,
            calibSrc4: prev.image
              ? initialCalibSrcPoints(
                  prev.image.width,
                  prev.image.height,
                  prev.calibGoalSide,
                )
              : null,
            calibSrcMoved: false,
            calibLandmarkIds: resolveCalibLandmarkIds(prev.calibLandmarkIds),
            calibPreset: prev.calibPreset ?? "full",
          }
        : prev,
    );
  }, []);

  const setCaptureUnderlayOpacity = useCallback((opacity: number) => {
    setCaptureImport((prev) =>
      prev
        ? { ...prev, underlayOpacity: clampUnderlayOpacity(opacity) }
        : prev,
    );
  }, []);

  const applyCaptureHomography = useCallback(async (): Promise<
    boolean | "dup" | "degenerate" | "undragged"
  > => {
    const cap = captureImportRef.current;
    const src4 = cap?.calibSrc4;
    if (!src4 || src4.length !== 4 || !cap?.calibLandmarkIds) return false;
    if (!cap.calibSrcMoved) return "undragged";
    const ids = resolveCalibLandmarkIds(cap.calibLandmarkIds);
    if (hasDuplicateLandmarkIds(ids)) return "dup";
    if (isLandmarkDstDegenerate(ids)) return "degenerate";
    const dst4 = dst4FromLandmarkIds(ids);
    const H = await computeHomographyAsync(src4, dst4);
    if (!H) return false;
    const savedTool = toolRef.current;
    setCaptureImport((prev) =>
      prev
        ? {
            ...prev,
            homography: H,
            phase: "place",
            calibSrc4: src4,
            calibLandmarkIds: ids,
            draftPieces: [],
            draftBall: null,
            selectedDraftPieceId: null,
            selectedDraftBall: false,
            toolBeforePlace: savedTool,
          }
        : prev,
    );
    return true;
  }, []);

  const addCaptureDraftPiece = useCallback(
    (x: number, y: number, team: "home" | "away") => {
      if (!board) return;
      const kits = kitsFromBoard(board);
      const role = roleFromPosition(x, y);
      const piece: Piece = {
        id: uid(),
        x,
        y,
        number: "",
        label: "",
        color: colorForKit(kits, team, "outfield") ?? (team === "home" ? HOME_COLOR : AWAY_COLOR),
        team,
        facing: defaultFacingForTeam(team, board.pitchOrientation),
        role,
        kit: "outfield",
      };
      setCaptureImport((prev) => {
        if (!prev || prev.phase !== "place" || !prev.homography) return prev;
        return {
          ...prev,
          draftPieces: [...prev.draftPieces, piece],
          selectedDraftPieceId: piece.id,
          selectedDraftBall: false,
        };
      });
      setSelectedPieceId(null);
      setSelectedBall(false);
      setSelectedObjectId(null);
    },
    [board, setSelectedPieceId],
  );

  const moveCaptureDraftPiece = useCallback(
    (id: string, x: number, y: number, facing?: number) => {
      const role = roleFromPosition(x, y);
      setCaptureImport((prev) => {
        if (!prev || prev.phase !== "place") return prev;
        return {
          ...prev,
          draftPieces: prev.draftPieces.map((p) =>
            p.id === id
              ? { ...p, x, y, role, facing: facing ?? p.facing }
              : p,
          ),
        };
      });
    },
    [],
  );

  const setCaptureDraftBall = useCallback((x: number, y: number) => {
    setCaptureImport((prev) => {
      if (!prev || prev.phase !== "place" || !prev.homography) return prev;
      return {
        ...prev,
        draftBall: { x, y, attachedTo: null },
        selectedDraftPieceId: null,
        selectedDraftBall: true,
      };
    });
    setSelectedPieceId(null);
    setSelectedObjectId(null);
  }, [setSelectedPieceId]);

  const selectCaptureDraftPiece = useCallback((id: string | null) => {
    setCaptureImport((prev) =>
      prev
        ? { ...prev, selectedDraftPieceId: id, selectedDraftBall: false }
        : prev,
    );
    if (id) {
      setSelectedPieceId(null);
      setSelectedBall(false);
      setSelectedObjectId(null);
    }
  }, [setSelectedPieceId]);

  const selectCaptureDraftBall = useCallback(() => {
    setCaptureImport((prev) =>
      prev
        ? { ...prev, selectedDraftPieceId: null, selectedDraftBall: true }
        : prev,
    );
    setSelectedPieceId(null);
    setSelectedBall(false);
    setSelectedObjectId(null);
  }, [setSelectedPieceId]);

  const deleteCaptureDraftSelected = useCallback(() => {
    setCaptureImport((prev) => {
      if (!prev || prev.phase !== "place") return prev;
      if (prev.selectedDraftPieceId) {
        const drop = prev.selectedDraftPieceId;
        return {
          ...prev,
          draftPieces: prev.draftPieces.filter((p) => p.id !== drop),
          selectedDraftPieceId: null,
        };
      }
      if (prev.selectedDraftBall && prev.draftBall) {
        return {
          ...prev,
          draftBall: null,
          selectedDraftBall: false,
        };
      }
      return prev;
    });
  }, []);

  const applyCaptureToScene = useCallback(
    (asNewScene: boolean): boolean => {
      const cap = captureImportRef.current;
      if (!cap || cap.phase !== "place" || !cap.homography || !board || !scene) {
        return false;
      }

      captureUndo();

      if (asNewScene) {
        if (board.scenes.length >= maxScenes()) return false;
        const next = createScene(
          defaultSceneName(board.scenes.length + 1, board.sport, locale),
          "custom",
          {
            pieces: cap.draftPieces,
            balls: cap.draftBall
              ? normalizeSceneBalls(undefined, cap.draftBall)
              : scene.balls,
            objects: [],
            viewport: { ...activeViewport(board) },
          },
        );
        updateBoard(
          (b) => ({
            ...b,
            scenes: [...b.scenes, next],
            activeSceneId: next.id,
          }),
          false,
        );
      } else {
        updateScene(
          (s) => ({
            ...s,
            pieces: cap.draftPieces,
            balls: cap.draftBall
              ? normalizeSceneBalls(undefined, cap.draftBall)
              : s.balls,
          }),
          false,
        );
      }

      const restore = cap.toolBeforePlace;
      revokeCaptureImageUrl();
      setCaptureImport(null);
      setSelectedPieceId(null);
      if (restore != null) setToolState(restore);
      return true;
    },
    [
      board,
      scene,
      locale,
      captureUndo,
      updateBoard,
      updateScene,
      revokeCaptureImageUrl,
      setSelectedPieceId,
    ],
  );

  useEffect(() => {
    if (!broadcast) return;
    revokeCaptureImageUrl();
    setCaptureImport(null);
  }, [broadcast, revokeCaptureImageUrl]);

  return {
    store,
    board,
    scene,
    viewport,
    watermark,
    /** True while editing a local JSON File Session (not in BoardStore). */
    isFileSession,
    fileSession,
    pendingFileSessionRestore,
    openFileSession,
    createNewLocalBoardFileSession,
    closeFileSession,
    downloadFileSessionJson,
    markFileSessionSavedToSource,
    saveFileSessionToSource,
    saveBoardAsToFolder,
    suggestSaveAsFileName,
    checkFileSessionSaveConflict,
    confirmDiscardFileSessionIfNeeded,
    acceptFileSessionRestore,
    dismissFileSessionRestore,
    tool,
    setTool,
    shapeKind,
    setShapeKind,
    shapeAspectLock,
    setShapeAspectLock,
    selectedPieceId,
    selectedPieceIds,
    setSelectedPieceId,
    togglePieceSelected,
    addPieceSelected,
    selectAllPieces,
    movePiecesBy,
    nudgeSelected,
    rotateSelectedAroundCentroid,
    scaleSelectedFromCentroid,
    flipSelectedHorizontal,
    flipSelectedVertical,
    setSelectedFacing,
    faceSelectedTeamAttack,
    alignSelected,
    distributeSelected,
    duplicateSelected,
    copySelectedShape,
    pasteShape,
    hasShapeClipboard,
    selectTeam,
    selectPiecesInRect,
    pieceInspectorId,
    openPieceInspector,
    closePieceInspector,
    selectedObjectId,
    setSelectedObjectId,
    textEditRequestId,
    requestTextEdit,
    clearTextEditRequest,
    selectedBall,
    selectedBallId,
    setSelectedBall,
    setSelectedBallId,
    copySelectedBall,
    pasteBall,
    hasBallClipboard,
    selectionColor,
    setSelectionColor,
    locale,
    setLocale,
    moveBall,
    dropBall,
    broadcast,
    captureImport,
    startCaptureImport,
    clearCaptureImport,
    setCaptureImageFromBlob,
    ingestCaptureImportDataTransfer,
    beginCaptureCalib,
    setCaptureCalibPoint,
    setCaptureCalibLandmark,
    setCaptureCalibPreset,
    setCaptureCalibGoalSide,
    setCaptureCalibFocus,
    resetCaptureCalibPoints,
    backCaptureCalib,
    reopenCaptureCalib,
    setCaptureUnderlayOpacity,
    applyCaptureHomography,
    addCaptureDraftPiece,
    moveCaptureDraftPiece,
    setCaptureDraftBall,
    selectCaptureDraftPiece,
    selectCaptureDraftBall,
    deleteCaptureDraftSelected,
    applyCaptureToScene,
    drawerOpen,
    setDrawerOpen,
    settingsOpen,
    setSettingsOpen,
    bakeWm,
    setBakeWm,
    applySoccerPitchLook,
    updateBoard,
    updateScene,
    undo,
    redo,
    rollbackLastHistory,
    setActiveBoard,
    addBoard,
    addBoardReplacing,
    requestNewBoard,
    deleteBoard,
    exportBoardJson,
    importBoardJsonText,
    setActiveScene,
    addScene,
    addSceneFromPreset,
    deleteScene,
    cycleScene,
    setHideHalf,
    setTeamFocus,
    mirrorSceneEnds,
    setViewport,
    applyViewPreset,
    resetViewport,
    saveViewportTemplate,
    applyViewportTemplate,
    deleteViewportTemplate,
    importRoster,
    setStarters,
    setStarterNumbers,
    applyLineup,
    changeSport,
    applyFormation,
    setBenchCount,
    updateWatermark,
    enterBroadcast,
    exitBroadcast,
    addPieceAt,
    movePiece,
    movePieceWithLine,
    swapPieces,
    patchPiece,
    captureUndo,
    setKitColor,
    setKitAccent,
    addLine,
    addZone,
    addPen,
    addLink,
    addText,
    updateText,
    moveText,
    patchText,
    addShape,
    moveShape,
    patchShape,
    arrangeSelectedShape,
    deleteSelected,
    clearDrawings,
    wipeDrawing,
    clearBoard,
    addGoal,
    removeGoal,
    addCard,
    removeCard,
    addSub,
    removeSub,
    undoLastLiveEvent,
    liveEventStack,
    setPkActive,
    cyclePkSlot,
    setPkSlotResult,
    setPkSlotNumber,
    addPkRound,
    resetPk,
    flushSave,
  };
}

export type AppState = ReturnType<typeof useAppState>;
