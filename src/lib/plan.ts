/**
 * Free / Pro plan foundation (no checkout yet).
 * Product contract: docs/PRODUCT_NOTE.md §6 — wedge stays free; Pro = libraries.
 *
 * Do not add paywall UI or Stripe here. Flip entitlements only via activePlan().
 */

export type PlanId = "free" | "pro";

/** Named capabilities gated by plan. Free has none of these. */
export type EntitlementId =
  /** 試合をまたぐ名前付き画角テンプレ */
  | "viewportTemplates"
  /** 名前付き選手セット（複数保有）— CRUD は Later */
  | "namedSquadSets";

export const PLAN_LIMITS = {
  free: {
    maxBoards: 3,
    maxScenes: 8,
  },
  /** Provisional until checkout; PRODUCT_NOTE: 緩和 or 無制限 */
  pro: {
    maxBoards: 12,
    maxScenes: 32,
  },
} as const;

const PLAN_ENTITLEMENTS: Record<PlanId, readonly EntitlementId[]> = {
  free: [],
  pro: ["viewportTemplates", "namedSquadSets"],
};

/** localStorage key for DEV-only plan override (never trust in production UI). */
export const PLAN_DEBUG_KEY = "zoneboard:v1:planDebug";

/**
 * Active plan. Always `free` until checkout exists.
 * In `import.meta.env.DEV` only: set localStorage PLAN_DEBUG_KEY to `"pro"` to preview gates.
 */
export function activePlan(): PlanId {
  if (import.meta.env.DEV) {
    try {
      const raw = localStorage.getItem(PLAN_DEBUG_KEY);
      if (raw === "pro" || raw === "free") return raw;
    } catch {
      /* ignore */
    }
  }
  return "free";
}

export function hasEntitlement(id: EntitlementId): boolean {
  return PLAN_ENTITLEMENTS[activePlan()].includes(id);
}

export function maxBoards(): number {
  return PLAN_LIMITS[activePlan()].maxBoards;
}

export function maxScenes(): number {
  return PLAN_LIMITS[activePlan()].maxScenes;
}

/** Persist / migrate ceiling — keep Pro capacity so raising the plan does not drop boards. */
export function storageBoardCeiling(): number {
  return PLAN_LIMITS.pro.maxBoards;
}
