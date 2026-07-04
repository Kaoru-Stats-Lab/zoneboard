import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBoard } from "../models/defaults";
import { uid } from "../models/id";
import {
  ballAfterDrop,
  ballFollowingPiece,
} from "../models/ballAttach";
import { roleFromPosition } from "../models/pieceRole";
import {
  createScene,
  getActiveScene,
  mapActiveScene,
} from "../models/scene";
import type {
  BoardDocument,
  BoardStore,
  HideHalf,
  LineKind,
  Piece,
  ScenePhase,
  SportId,
  ToolId,
  WatermarkSettings,
} from "../models/types";
import {
  AWAY_COLOR,
  DEFAULT_SELECTION_COLOR,
  HOME_COLOR,
  LINE_COLORS,
  MAX_BOARDS,
  MAX_SCENES,
  ZONE_COLORS,
} from "../models/types";
import { formationPieces } from "../presets/formations";
import {
  applyLineupToScenePieces,
  parseRosterText,
  parseStarterNumbers,
} from "../presets/roster";
import {
  DEFAULT_VIEWPORT,
  VIEW_PRESETS,
  type ViewPresetId,
} from "../presets/viewport";
import type { Viewport } from "../models/types";
import { clampViewport } from "../presets/viewport";
import {
  loadPrefs,
  loadStore,
  loadWatermark,
  savePrefs,
  saveStore,
  saveWatermark,
} from "../storage/persist";

function touch(board: BoardDocument): BoardDocument {
  return { ...board, updatedAt: new Date().toISOString() };
}

export function useAppState() {
  const [store, setStore] = useState<BoardStore>(() => loadStore());
  const [watermark, setWatermark] = useState<WatermarkSettings>(() =>
    loadWatermark(),
  );
  const [tool, setTool] = useState<ToolId>("select");
  const [selectedPieceId, setSelectedPieceIdState] = useState<string | null>(
    null,
  );
  /** 駒カードは選択とは別。欲しいときだけ開く（単クリックでは出さない） */
  const [pieceInspectorId, setPieceInspectorId] = useState<string | null>(null);

  /** 移動用の選択。カードは閉じる */
  const setSelectedPieceId = useCallback((id: string | null) => {
    setSelectedPieceIdState(id);
    setPieceInspectorId(null);
  }, []);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedBall, setSelectedBall] = useState(false);
  const [selectionColor, setSelectionColorState] = useState(
    () => loadPrefs().selectionColor ?? DEFAULT_SELECTION_COLOR,
  );
  const [broadcast, setBroadcast] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bakeWm, setBakeWm] = useState(true);
  const history = useRef<BoardDocument[]>([]);
  const future = useRef<BoardDocument[]>([]);
  const saveTimer = useRef<number | null>(null);

  const board = useMemo(() => {
    return (
      store.boards.find((b) => b.id === store.activeBoardId) ??
      store.boards[0] ??
      null
    );
  }, [store]);

  const scene = useMemo(
    () => (board ? getActiveScene(board) : null),
    [board],
  );

  const persist = useCallback((next: BoardStore) => {
    setStore(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveStore(next), 300);
  }, []);

  const flushSave = useCallback(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveStore(store);
  }, [store]);

  const pushHistory = useCallback((prev: BoardDocument) => {
    history.current.push(structuredClone(prev));
    if (history.current.length > 50) history.current.shift();
    future.current = [];
  }, []);

  const updateBoard = useCallback(
    (updater: (b: BoardDocument) => BoardDocument, record = true) => {
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
    [pushHistory],
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
    setStore((s) => {
      const boards = s.boards.map((b) => (b.id === prev.id ? prev : b));
      const next = { ...s, boards };
      saveStore(next);
      return next;
    });
  }, [board]);

  const redo = useCallback(() => {
    const nextB = future.current.pop();
    if (!nextB || !board) return;
    history.current.push(structuredClone(board));
    setStore((s) => {
      const boards = s.boards.map((b) => (b.id === nextB.id ? nextB : b));
      const next = { ...s, boards };
      saveStore(next);
      return next;
    });
  }, [board]);

  const setActiveBoard = useCallback(
    (id: string) => {
      history.current = [];
      future.current = [];
      setSelectedPieceId(null);
      setSelectedObjectId(null);
      setSelectedBall(false);
      persist({ ...store, activeBoardId: id });
    },
    [persist, store],
  );

  const addBoard = useCallback(() => {
    if (store.boards.length >= MAX_BOARDS) return false;
    const b = createBoard(
      board?.sport ?? "soccer",
      `ボード ${store.boards.length + 1}`,
    );
    history.current = [];
    future.current = [];
    persist({
      boards: [...store.boards, b],
      activeBoardId: b.id,
    });
    return true;
  }, [board?.sport, persist, store.boards]);

  const deleteBoard = useCallback(
    (id: string) => {
      let boards = store.boards.filter((b) => b.id !== id);
      if (boards.length === 0) {
        const b = createBoard("soccer", "ボード 1");
        boards = [b];
        persist({ boards, activeBoardId: b.id });
        return;
      }
      const active =
        store.activeBoardId === id ? boards[0].id : store.activeBoardId;
      persist({ boards, activeBoardId: active });
    },
    [persist, store],
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
      if (board.scenes.length >= MAX_SCENES) return false;
      const next = createScene(
        label ?? `局面 ${board.scenes.length + 1}`,
        phase,
        scene,
      );
      updateBoard((b) => ({
        ...b,
        scenes: [...b.scenes, next],
        activeSceneId: next.id,
      }));
      setSelectedPieceId(null);
      return true;
    },
    [board, scene, updateBoard],
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
      updateBoard((b) =>
        mapActiveScene(
          {
            ...b,
            sport,
            pitchView: "full",
            showLanes5: sport === "soccer",
          },
          (s) => ({
            ...s,
            pieces: formationPieces(sport, true, b.benchCount),
            objects: [],
            ball: { x: 0.5, y: 0.5 },
          }),
        ),
      );
      setSelectedPieceId(null);
    },
    [updateBoard],
  );

  const applyFormation = useCallback(() => {
    if (!board) return;
    updateScene((s) => ({
      ...s,
      pieces: formationPieces(board.sport, true, board.benchCount),
      objects: [],
    }));
  }, [board, updateScene]);

  const setBenchCount = useCallback(
    (benchCount: number) => {
      updateBoard((b) =>
        mapActiveScene({ ...b, benchCount }, (s) => ({
          ...s,
          pieces: formationPieces(b.sport, true, benchCount),
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

  const setViewport = useCallback(
    (viewport: Viewport, record = false) => {
      updateBoard(
        (b) => ({ ...b, viewport: clampViewport(viewport) }),
        record,
      );
    },
    [updateBoard],
  );

  const applyViewPreset = useCallback(
    (id: ViewPresetId) => {
      setViewport(VIEW_PRESETS[id], false);
    },
    [setViewport],
  );

  const resetViewport = useCallback(() => {
    setViewport({ ...DEFAULT_VIEWPORT }, false);
  }, [setViewport]);

  /** ベンチ入り名簿を一括インポート（番号,名前） */
  const importRoster = useCallback(
    (team: "home" | "away", text: string) => {
      const players = parseRosterText(text);
      if (players.length === 0) return false;
      updateBoard((b) => ({
        ...b,
        roster: {
          ...b.roster,
          [team]: {
            ...b.roster[team],
            players,
          },
        },
      }));
      return true;
    },
    [updateBoard],
  );

  /** スタメン背番号をセット（発表直後） */
  const setStarters = useCallback(
    (team: "home" | "away", text: string) => {
      const starterNumbers = parseStarterNumbers(text);
      updateBoard((b) => ({
        ...b,
        roster: {
          ...b.roster,
          [team]: {
            ...b.roster[team],
            starterNumbers,
          },
        },
      }));
      return starterNumbers.length > 0;
    },
    [updateBoard],
  );

  /** 名簿＋スタメンから現局面に一括配置 */
  const applyLineup = useCallback(() => {
    if (!board) return;
    const pieces = applyLineupToScenePieces(
      board.sport,
      board.roster.home,
      board.roster.away,
      board.benchCount,
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

  const moveBall = useCallback(
    (x: number, y: number, record: boolean) => {
      // ドラッグ中は吸着解除（ボールだけ動かす）
      updateScene(
        (s) => ({ ...s, ball: { x, y, attachedTo: null } }),
        record,
      );
    },
    [updateScene],
  );

  /** ボールを離したとき、近くの駒にくっつける */
  const dropBall = useCallback(
    (x: number, y: number) => {
      updateScene((s) => ({
        ...s,
        ball: ballAfterDrop(s.pieces, x, y),
      }));
    },
    [updateScene],
  );

  const addPieceAt = useCallback(
    (x: number, y: number, team: "home" | "away") => {
      const role = roleFromPosition(x, y);
      const piece: Piece = {
        id: uid(),
        x,
        y,
        number: "",
        label: "",
        color: team === "home" ? HOME_COLOR : AWAY_COLOR,
        team,
        facing: team === "home" ? 0 : 180,
        role,
      };
      updateScene((s) => ({ ...s, pieces: [...s.pieces, piece] }));
      setSelectedPieceId(piece.id);
      setTool("select");
    },
    [updateScene],
  );

  const movePiece = useCallback(
    (
      id: string,
      x: number,
      y: number,
      record: boolean,
      facing?: number,
    ) => {
      const role = roleFromPosition(x, y);
      updateScene(
        (s) => {
          const pieces = s.pieces.map((p) =>
            p.id === id
              ? { ...p, x, y, role, facing: facing ?? p.facing }
              : p,
          );
          const piece = pieces.find((p) => p.id === id);
          let ball = s.ball;
          if (piece) {
            const followed = ballFollowingPiece(ball, piece);
            if (followed) ball = followed;
          }
          return { ...s, pieces, ball };
        },
        record,
      );
    },
    [updateScene],
  );

  const patchPiece = useCallback(
    (id: string, patch: Partial<Piece>) => {
      updateScene((s) => {
        const pieces = s.pieces.map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        );
        const piece = pieces.find((p) => p.id === id);
        let ball = s.ball;
        if (piece) {
          const followed = ballFollowingPiece(ball, piece);
          if (followed) ball = followed;
        }
        return { ...s, pieces, ball };
      });
    },
    [updateScene],
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
            color: LINE_COLORS[kind],
            strokeWidth: 2,
          },
        ],
      }));
    },
    [updateScene],
  );

  const addZone = useCallback(
    (x: number, y: number, w: number, h: number) => {
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
            color: ZONE_COLORS.fill,
            strokeColor: ZONE_COLORS.stroke,
          },
        ],
      }));
    },
    [updateScene],
  );

  const addPen = useCallback(
    (points: { x: number; y: number }[]) => {
      if (points.length < 2) return;
      updateScene((s) => ({
        ...s,
        objects: [
          ...s.objects,
          {
            id: uid(),
            type: "pen",
            points,
            color: "#111111",
            strokeWidth: 2,
          },
        ],
      }));
    },
    [updateScene],
  );

  const addText = useCallback(
    (x: number, y: number, text: string) => {
      updateScene((s) => ({
        ...s,
        objects: [
          ...s.objects,
          {
            id: uid(),
            type: "text",
            x,
            y,
            text,
            color: "#111111",
            fontSize: 0.035,
          },
        ],
      }));
    },
    [updateScene],
  );

  const deleteSelected = useCallback(() => {
    if (selectedPieceId) {
      updateScene((s) => ({
        ...s,
        pieces: s.pieces.filter((p) => p.id !== selectedPieceId),
        ball:
          s.ball.attachedTo === selectedPieceId
            ? { ...s.ball, attachedTo: null }
            : s.ball,
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
    }
  }, [selectedPieceId, selectedObjectId, setSelectedPieceId, updateScene]);

  const clearDrawings = useCallback(() => {
    updateScene((s) => ({ ...s, objects: [] }));
    setSelectedObjectId(null);
  }, [updateScene]);

  const clearBoard = useCallback(() => {
    updateScene((s) => ({ ...s, pieces: [], objects: [] }));
    setSelectedPieceId(null);
    setSelectedObjectId(null);
  }, [setSelectedPieceId, updateScene]);

  const openPieceInspector = useCallback((id: string) => {
    setSelectedPieceIdState(id);
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

  return {
    store,
    board,
    scene,
    watermark,
    tool,
    setTool,
    selectedPieceId,
    setSelectedPieceId,
    pieceInspectorId,
    openPieceInspector,
    closePieceInspector,
    selectedObjectId,
    setSelectedObjectId,
    selectedBall,
    setSelectedBall,
    selectionColor,
    setSelectionColor,
    moveBall,
    dropBall,
    broadcast,
    drawerOpen,
    setDrawerOpen,
    settingsOpen,
    setSettingsOpen,
    bakeWm,
    setBakeWm,
    updateBoard,
    updateScene,
    undo,
    redo,
    setActiveBoard,
    addBoard,
    deleteBoard,
    setActiveScene,
    addScene,
    deleteScene,
    cycleScene,
    setHideHalf,
    setViewport,
    applyViewPreset,
    resetViewport,
    importRoster,
    setStarters,
    applyLineup,
    changeSport,
    applyFormation,
    setBenchCount,
    updateWatermark,
    enterBroadcast,
    exitBroadcast,
    addPieceAt,
    movePiece,
    patchPiece,
    addLine,
    addZone,
    addPen,
    addText,
    deleteSelected,
    clearDrawings,
    clearBoard,
    flushSave,
  };
}

export type AppState = ReturnType<typeof useAppState>;
