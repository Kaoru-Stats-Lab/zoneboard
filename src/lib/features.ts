/**
 * Feature flags derived from plan entitlements (`src/lib/plan.ts`).
 * Do not hardcode Pro UI on/off here — change activePlan() / entitlements instead.
 */
import { hasEntitlement } from "./plan";

/** Pro: 名前付き画角テンプレ UI。`hasEntitlement("viewportTemplates")` まで非表示。 */
export const FEATURE_PRO_VIEWPORT_TEMPLATES = hasEntitlement("viewportTemplates");
