/** Ephemeral OS hint for file-discovery help (not persisted). */

export type HelpOsId = "windows" | "macos" | "linux";

export function detectHelpOs(): HelpOsId | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  const platform =
    // userAgentData is Chromium; fall back to legacy platform / UA.
    (
      navigator as Navigator & {
        userAgentData?: { platform?: string };
      }
    ).userAgentData?.platform ||
    navigator.platform ||
    "";
  const hay = `${platform} ${ua}`.toLowerCase();
  if (/win/.test(hay)) return "windows";
  if (/mac|iphone|ipad|ipod/.test(hay)) return "macos";
  if (/linux|cros|android/.test(hay)) return "linux";
  return null;
}
