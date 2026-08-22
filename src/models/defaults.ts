import type {
  BoardDocument,
  BoardStore,
  DrawObject,
  GoalEntry,
  LineObject,
  Scene,
  SportId,
  WatermarkSettings,
} from "./types";
import { PIECE_SCALE } from "./types";
import { uid } from "./id";
import {
  DEFAULT_BENCH_COUNT,
  resolveBenchCount,
  type BenchLevel,
} from "../presets/bench";
import { formationPieces } from "../presets/formations";
import { emptyRoster } from "../presets/roster";
import { DEFAULT_VIEWPORT } from "../presets/viewport";
import { defaultBoardTitle, defaultSceneLabel } from "../i18n/localeDefaults";
import type { Locale } from "../i18n/messages";
import { roleFromPosition } from "./pieceRole";
import { createScene } from "./scene";

/** 旧直線 (x1,y1,x2,y2) → points[] */
function normalizeObjects(objects: DrawObject[]): DrawObject[] {
  return objects.map((obj) => {
    if (obj.type !== "line") return obj;
    const legacy = obj as LineObject & {
      x1?: number;
      y1?: number;
      x2?: number;
      y2?: number;
    };
    if (legacy.points?.length >= 2) return legacy;
    if (
      legacy.x1 != null &&
      legacy.y1 != null &&
      legacy.x2 != null &&
      legacy.y2 != null
    ) {
      const { x1, y1, x2, y2, ...rest } = legacy;
      return {
        ...rest,
        type: "line",
        points: [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
        ],
      };
    }
    return { ...legacy, points: legacy.points ?? [] };
  });
}

export function createBoard(
  sport: SportId = "soccer",
  title?: string,
  locale?: Locale,
): BoardDocument {
  const benchCount = DEFAULT_BENCH_COUNT;
  const scene = createScene(defaultSceneLabel(sport, locale), "pre", {
    pieces: formationPieces(sport, true, benchCount),
    ball: { x: 0.5, y: 0.5 },
    objects: [],
  });
  return {
    schemaVersion: 2,
    id: uid(),
    sport,
    title: title ?? defaultBoardTitle(1, locale),
    matchLabel: "",
    homeTeam: "",
    awayTeam: "",
    goals: [],
    showMatchBanner: sport === "soccer",
    pitchView: sport === "basketball" ? "half" : "full",
    pitchFlipped: false,
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
    pieceScale: PIECE_SCALE.balanced,
    benchCount,
    scenes: [scene],
    activeSceneId: scene.id,
    viewport: { ...DEFAULT_VIEWPORT },
    roster: { home: emptyRoster(), away: emptyRoster() },
    updatedAt: new Date().toISOString(),
  };
}

export function emptyStore(): BoardStore {
  const board = createBoard("soccer");
  return { boards: [board], activeBoardId: board.id };
}

export function defaultWatermark(): WatermarkSettings {
  return {
    enabled: false,
    imageDataUrl: null,
    x: 0.5,
    y: 0.5,
    sizePercent: 28,
    opacity: 0.4,
  };
}

type LegacyBoard = Omit<BoardDocument, "benchCount" | "scenes" | "activeSceneId"> & {
  pieces?: Scene["pieces"];
  ball?: Scene["ball"];
  objects?: Scene["objects"];
  scenes?: Scene[];
  activeSceneId?: string;
  matchLabel?: string;
  schemaVersion?: number;
  viewport?: BoardDocument["viewport"];
  roster?: BoardDocument["roster"];
  benchCount?: number;
  benchLevel?: BenchLevel;
};

/** 旧データ互換: トップレベル pieces をシーンへ昇格 */
export function migrateBoard(raw: LegacyBoard): BoardDocument {
  const benchCount = resolveBenchCount(raw);
  let scenes = raw.scenes;
  let activeSceneId = raw.activeSceneId;

  if (!scenes?.length) {
    const scene = createScene(raw.title || "局面 1", "custom", {
      pieces: (raw.pieces ?? []).map((p) => ({
        ...p,
        role: roleFromPosition(p.x, p.y),
        label: p.label ?? "",
        number: p.number ?? "",
      })),
      ball: raw.ball ?? { x: 0.5, y: 0.5 },
      objects: normalizeObjects(raw.objects ?? []),
    });
    scenes = [scene];
    activeSceneId = scene.id;
  } else {
    scenes = scenes.map((s) => ({
      ...s,
      hideHalf: s.hideHalf ?? "none",
      phase: s.phase ?? "custom",
      label: s.label || "局面",
      pieces: (s.pieces ?? []).map((p) => ({
        ...p,
        // タッチライン際はフルサイズに再分類（旧: 線外=即ベンチ）
        role: roleFromPosition(p.x, p.y),
        label: p.label ?? "",
        number: p.number ?? "",
      })),
      ball: s.ball ?? { x: 0.5, y: 0.5 },
      objects: normalizeObjects(s.objects ?? []),
    }));
    if (!activeSceneId || !scenes.some((s) => s.id === activeSceneId)) {
      activeSceneId = scenes[0].id;
    }
  }

  return {
    schemaVersion: 2,
    id: raw.id,
    sport: raw.sport,
    title: raw.title,
    matchLabel: raw.matchLabel ?? "",
    homeTeam: (raw as { homeTeam?: string }).homeTeam ?? "",
    awayTeam: (raw as { awayTeam?: string }).awayTeam ?? "",
    goals: (raw as { goals?: GoalEntry[] }).goals ?? [],
    showMatchBanner:
      (raw as { showMatchBanner?: boolean }).showMatchBanner ??
      raw.sport === "soccer",
    pitchView: raw.pitchView ?? "full",
    pitchFlipped: raw.pitchFlipped ?? false,
    showLanes5: raw.showLanes5 ?? raw.sport === "soccer",
    showCorridors3:
      raw.showCorridors3 ?? raw.sport === "futsal",
    showPressLines:
      raw.showPressLines ?? raw.sport === "futsal",
    showShotCorridor:
      (raw as { showShotCorridor?: boolean }).showShotCorridor ??
      raw.sport === "beach_soccer",
    showPaintHighlight:
      (raw as { showPaintHighlight?: boolean }).showPaintHighlight ??
      raw.sport === "basketball",
    showThreePointEmphasis:
      (raw as { showThreePointEmphasis?: boolean }).showThreePointEmphasis ??
      raw.sport === "basketball",
    showSpotMarkers:
      (raw as { showSpotMarkers?: boolean }).showSpotMarkers ??
      raw.sport === "basketball",
    showMiddleLine:
      (raw as { showMiddleLine?: boolean }).showMiddleLine ?? false,
    showSlotLines:
      (raw as { showSlotLines?: boolean }).showSlotLines ?? false,
    showWoodCourt:
      (raw as { showWoodCourt?: boolean }).showWoodCourt ?? false,
    showGrassPitch:
      (raw as { showGrassPitch?: boolean }).showGrassPitch ?? false,
    pieceScale: raw.pieceScale ?? PIECE_SCALE.balanced,
    benchCount,
    scenes,
    activeSceneId: activeSceneId!,
    viewport: raw.viewport ?? { ...DEFAULT_VIEWPORT },
    roster: raw.roster ?? { home: emptyRoster(), away: emptyRoster() },
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function migrateWatermark(
  raw: WatermarkSettings & { position?: string },
): WatermarkSettings {
  if (typeof raw.x === "number" && typeof raw.y === "number") {
    return {
      enabled: raw.enabled,
      imageDataUrl: raw.imageDataUrl,
      x: raw.x,
      y: raw.y,
      sizePercent: Math.min(55, Math.max(8, raw.sizePercent ?? 28)),
      opacity: raw.opacity,
    };
  }
  const pos = raw.position ?? "bottom-right";
  const map: Record<string, { x: number; y: number }> = {
    "top-left": { x: 0.12, y: 0.12 },
    "top-right": { x: 0.88, y: 0.12 },
    "bottom-left": { x: 0.12, y: 0.88 },
    "bottom-right": { x: 0.88, y: 0.88 },
  };
  const xy = map[pos] ?? { x: 0.5, y: 0.5 };
  return {
    enabled: raw.enabled,
    imageDataUrl: raw.imageDataUrl,
    x: xy.x,
    y: xy.y,
    sizePercent: Math.min(55, Math.max(8, raw.sizePercent ?? 28)),
    opacity: raw.opacity,
  };
}
