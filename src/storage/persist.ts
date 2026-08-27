import {
  emptyStore,
  defaultWatermark,
  migrateBoard,
  migrateWatermark,
} from "../models/defaults";
import type { BoardStore, Prefs, WatermarkSettings } from "../models/types";
import { MAX_BOARDS } from "../models/types";
import { PREFS_KEY, STORE_KEY, WATERMARK_KEY } from "./keys";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** LP の「続ける / 新規」分岐用。キーが無ければ初回訪問扱い。 */
export function hasPersistedStore(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STORE_KEY) != null;
}

export function loadStore(): BoardStore {
  const data = safeParse<BoardStore>(localStorage.getItem(STORE_KEY));
  if (!data?.boards?.length) return emptyStore();
  const boards = data.boards.slice(0, MAX_BOARDS).map(migrateBoard);
  const active =
    boards.find((b) => b.id === data.activeBoardId)?.id ?? boards[0].id;
  return { boards, activeBoardId: active };
}

export function saveStore(store: BoardStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      const wm = loadWatermark();
      if (wm.imageDataUrl) {
        saveWatermark({ ...wm, imageDataUrl: null, enabled: false });
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
        return;
      }
    }
    throw e;
  }
}

export function loadWatermark(): WatermarkSettings {
  const raw = safeParse<WatermarkSettings & { position?: string }>(
    localStorage.getItem(WATERMARK_KEY),
  );
  if (!raw) return defaultWatermark();
  return migrateWatermark(raw);
}

export function saveWatermark(wm: WatermarkSettings): void {
  try {
    localStorage.setItem(WATERMARK_KEY, JSON.stringify(wm));
  } catch {
    /* ignore */
  }
}

export function loadPrefs(): Prefs {
  return safeParse<Prefs>(localStorage.getItem(PREFS_KEY)) ?? {};
}

export function savePrefs(prefs: Prefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
