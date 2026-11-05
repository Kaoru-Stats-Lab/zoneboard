/**
 * Runtime detection for File System Access Directory APIs.
 * Never gate on browser user-agent strings.
 */

export function isSecureContextOk(): boolean {
  return typeof window !== "undefined" && window.isSecureContext === true;
}

export function canShowDirectoryPicker(): boolean {
  const g = globalThis as typeof globalThis & {
    showDirectoryPicker?: unknown;
  };
  return isSecureContextOk() && typeof g.showDirectoryPicker === "function";
}

/** True when Directory mode UI may be offered. */
export function isDirectoryModeAvailable(): boolean {
  return canShowDirectoryPicker();
}

export type FileMetaSnapshot = {
  name: string;
  size: number;
  lastModified: number;
  /** Content fingerprint of UTF-8 text (empty if unread). */
  contentFinger: string;
};

export function fileMetaFromFile(
  file: File,
  contentFinger: string,
): FileMetaSnapshot {
  return {
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
    contentFinger,
  };
}

export function contentFingerprintText(text: string): string {
  // Fast stable hash-ish: length + djb2 — enough for conflict assist with size+mtime.
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = (h * 33) ^ text.charCodeAt(i);
  }
  return `${text.length}:${(h >>> 0).toString(16)}`;
}

export function isZoneboardJsonName(name: string): boolean {
  return name.toLowerCase().endsWith(".zoneboard.json");
}
