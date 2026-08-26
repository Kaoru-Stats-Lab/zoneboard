import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBoard } from "../models/defaults";
import { uid } from "../models/id";
import {
  ballAfterDrop,
  ballFollowingPiece,
} from "../models/ballAttach";
import { roleFromPosition } from "../models/pieceRole";
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
  mirrorSceneHorizontal,
  mirrorViewportHorizontal,
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
  ScenePhase,
  SportId,
  TextFontId,
  ToolId,
  Viewport,
  WatermarkSettings,
} from "../models/types";
import {
  AWAY_COLOR,
  DEFAULT_SELECTION_COLOR,
  HOME_COLOR,
  MAX_BOARDS,
  MAX_SCENES,
  MAX_VIEWPORT_TEMPLATES,
} from "../models/types";
import {
  lineColorForBoard,
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
  VIEW_PRESETS,
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
import type { Locale } from "../i18n/messages";
import { normalizeLocale } from "../i18n/locale";
import { clampViewport } from "../presets/viewport";
import { FEATURE_PRO_VIEWPORT_TEMPLATES } from "../lib/features";
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

export type LiveEventKind = "goal" | "card" | "sub";
export type LiveEventRef = { kind: LiveEventKind; id: string };

export function useAppState() {
  const [store, setStore] = useState<BoardStore>(() => loadStore());
  const [watermark, setWatermark] = useState<WatermarkSettings>(() =>
    loadWatermark(),
  );
  const [tool, setTool] = useState<ToolId>("select");
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
  const [selectedBall, setSelectedBall] = useState(false);
  const [selectionColor, setSelectionColorState] = useState(
    () => loadPrefs().selectionColor ?? DEFAULT_SELECTION_COLOR,
  );
  const [locale, setLocaleState] = useState<Locale>(
    () => normalizeLocale(loadPrefs().locale),
  );
  const [broadcast, setBroadcast] = useState(false);
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

  const captureUndo = useCallback(() => {
    if (board) pushHistory(board);
  }, [board, pushHistory]);

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
      setLiveEventStack([]);
      persist({ ...store, activeBoardId: id });
    },
    [persist, store],
  );

  const addBoard = useCallback(() => {
    if (store.boards.length >= MAX_BOARDS) return false;
    const b = createBoard(
      board?.sport ?? "soccer",
      defaultBoardTitle(store.boards.length + 1, locale),
      locale,
    );
    history.current = [];
    future.current = [];
    persist({
      boards: [...store.boards, b],
      activeBoardId: b.id,
    });
    return true;
  }, [board?.sport, locale, persist, store.boards]);

  const deleteBoard = useCallback(
    (id: string) => {
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
        label ?? defaultSceneName(board.scenes.length + 1, board.sport, locale),
        phase,
        {
          pieces: scene.pieces,
          ball: scene.ball,
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
      if (board.scenes.length >= MAX_SCENES) return false;
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
            showGrassPitch: sport === "soccer",
            homeTeam: "",
            awayTeam: "",
            goals: [],
            cards: [],
            subs: [],
            maxSubs: DEFAULT_MAX_SUBS,
            pk: createPkShootout(false),
            showMatchBanner: sport === "soccer",
            benchCount,
          },
          (s) => ({
            ...s,
            label: defaultSceneLabel(sport, locale),
            hideHalf: "none",
            teamFocus: "both",
            pieces: withRosterIdentity(
              formationPieces(sport, true, benchCount, kitsFromBoard(b)),
              b.roster,
              s.pieces,
            ),
            objects: [],
            ball: { x: 0.5, y: 0.5 },
          }),
        );
      });
      setSelectedPieceId(null);
      setTool((t) => (t === "screen" && sport !== "basketball" ? "select" : t));
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
            formationPieces(b.sport, true, benchCount, kitsFromBoard(b)),
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
        ...mirrorSceneHorizontal(s),
        viewport: clampViewport(
          mirrorViewportHorizontal(sceneViewport(s, b.viewport)),
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
      setViewport(VIEW_PRESETS[id], false);
    },
    [setViewport],
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
        facing: team === "home" ? 0 : 180,
        role,
        kit: "outfield",
      };
      updateScene((s) => ({ ...s, pieces: [...s.pieces, piece] }));
      setSelectedPieceId(piece.id);
      setTool("select");
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
        let ball = s.ball;
        if (ball.attachedTo && idSet.has(ball.attachedTo)) {
          const host = pieces.find((p) => p.id === ball.attachedTo);
          if (host) {
            const followed = ballFollowingPiece(ball, host);
            if (followed) ball = followed;
          }
        }
        return { ...s, pieces, ball };
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
        let ball = s.ball;
        if (ball.attachedTo && idSet.has(ball.attachedTo)) {
          const host = pieces.find((p) => p.id === ball.attachedTo);
          if (host) {
            const followed = ballFollowingPiece(ball, host);
            if (followed) ball = followed;
          }
        }
        return { ...s, pieces, ball };
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

  const alignSelected = useCallback(
    (axis: AlignAxis) => applyToSelectedPieces((g) => alignGroup(g, axis)),
    [applyToSelectedPieces],
  );

  const distributeSelected = useCallback(
    (along: "x" | "y") =>
      applyToSelectedPieces((g) => distributeGroup(g, along)),
    [applyToSelectedPieces],
  );

  const duplicateSelected = useCallback(() => {
    if (selectedPieceIds.length === 0 || !scene) return;
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
    setSelectedBall(false);
  }, [scene, selectedPieceIds, updateScene]);

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
        let ball = scene.ball;
        const movedA = pieces.find((p) => p.id === idA);
        const movedB = pieces.find((p) => p.id === idB);
        if (movedA && ball.attachedTo === idA) {
          ball = { ...ball, x: movedA.x, y: movedA.y };
        } else if (movedB && ball.attachedTo === idB) {
          ball = { ...ball, x: movedB.x, y: movedB.y };
        }
        return {
          ...b,
          subs: nextSubs,
          maxSubs: b.maxSubs > 0 ? b.maxSubs : DEFAULT_MAX_SUBS,
          scenes: b.scenes.map((s) =>
            s.id === scene.id ? { ...s, pieces, ball } : s,
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
        let roster = b.roster;
        if (touchesIdentity && identity.number.trim()) {
          roster = {
            ...b.roster,
            [existing.team]: upsertRosterPlayer(
              b.roster[existing.team],
              existing.number,
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
              if (
                touchesIdentity &&
                p.team === existing.team &&
                normalizePieceNumber(p.number) === prevNum
              ) {
                return { ...p, ...identity };
              }
              return p;
            });
            let ball = s.ball;
            if (s.id === b.activeSceneId) {
              const piece = pieces.find((p) => p.id === id);
              if (piece) {
                const followed = ballFollowingPiece(ball, piece);
                if (followed) ball = followed;
              }
            }
            return { ...s, pieces, ball };
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
        const piece = pieces.find((p) => p.id === id);
        let ball = s.ball;
        if (piece) {
          const followed = ballFollowingPiece(ball, piece);
          if (followed) ball = followed;
        }
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
        return { ...s, pieces, ball, objects };
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
            color: penColorForBoard(board),
            strokeWidth: 2,
          },
        ],
      }));
    },
    [board, updateScene],
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
            color: textColorForBoard(board),
            fontSize: 0.035,
            fontFamily: defaultTextFont(),
          },
        ],
      }));
    },
    [board, updateScene],
  );

  const updateText = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim();
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
      },
    ) => {
      updateScene(
        (s) => ({
          ...s,
          objects: s.objects.map((o) =>
            o.id === id && o.type === "text" ? { ...o, ...patch } : o,
          ),
        }),
        false,
      );
    },
    [updateScene],
  );

  const deleteSelected = useCallback(() => {
    if (selectedPieceIds.length > 0) {
      const drop = new Set(selectedPieceIds);
      updateScene((s) => ({
        ...s,
        pieces: s.pieces.filter((p) => !drop.has(p.id)),
        objects: pruneLinkObjects(s.objects, drop),
        ball:
          s.ball.attachedTo && drop.has(s.ball.attachedTo)
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
      return;
    }
    if (selectedBall) {
      updateScene((s) => ({
        ...s,
        ball: { x: 0.5, y: 0.5, attachedTo: null },
      }));
      setSelectedBall(false);
    }
  }, [
    selectedPieceIds,
    selectedObjectId,
    selectedBall,
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

  return {
    store,
    board,
    scene,
    viewport,
    watermark,
    tool,
    setTool,
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
    alignSelected,
    distributeSelected,
    duplicateSelected,
    selectTeam,
    selectPiecesInRect,
    pieceInspectorId,
    openPieceInspector,
    closePieceInspector,
    selectedObjectId,
    setSelectedObjectId,
    selectedBall,
    setSelectedBall,
    selectionColor,
    setSelectionColor,
    locale,
    setLocale,
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
    addLine,
    addZone,
    addPen,
    addLink,
    addText,
    updateText,
    moveText,
    patchText,
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
