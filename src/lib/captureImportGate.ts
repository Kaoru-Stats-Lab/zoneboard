const QUERY = "captureImport";
export const CAPTURE_IMPORT_LS_KEY = "zoneboard:v1:captureImportBeta";

export function isCaptureImportEnabled(
  search = window.location.search,
): boolean {
  if (import.meta.env.DEV) return true;
  const params = new URLSearchParams(search);
  if (params.get(QUERY) === "1") {
    try {
      localStorage.setItem(CAPTURE_IMPORT_LS_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  }
  try {
    return localStorage.getItem(CAPTURE_IMPORT_LS_KEY) === "1";
  } catch {
    return false;
  }
}
