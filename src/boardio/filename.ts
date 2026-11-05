/** Windows / macOS / Linux shared forbidden filename characters */
const UNSAFE = /[<>:"/\\|?*\u0000-\u001f]/g;

/** Canonical ZoneBoard board file extension (always appended by code). */
export const ZONEBOARD_JSON_EXT = ".zoneboard.json";

const WIN_RESERVED =
  /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export function sanitizeBoardFilenameBase(name: string, fallback: string): string {
  let s = name.trim().replace(UNSAFE, " ").replace(/\s+/g, " ").trim();
  // Avoid trailing dots/spaces (Windows)
  s = s.replace(/[. ]+$/g, "");
  if (!s) s = fallback;
  if (WIN_RESERVED.test(s)) s = `${s}_board`;
  // Keep length reasonable for download attribute
  if (s.length > 80) s = s.slice(0, 80).trim();
  return s;
}

/**
 * Strip `.zoneboard.json` / trailing `.json` so Save As can edit stem only.
 * Also strips path separators if pasted.
 */
export function stripToFilenameStem(raw: string): string {
  let s = raw.trim().replace(/\\/g, "/");
  const slash = s.lastIndexOf("/");
  if (slash >= 0) s = s.slice(slash + 1);
  if (/\.zoneboard\.json$/i.test(s)) {
    s = s.replace(/\.zoneboard\.json$/i, "");
  } else if (/\.json$/i.test(s)) {
    s = s.replace(/\.json$/i, "");
  }
  return s.trim();
}

/** Display heading from a stored file name (without extension). */
export function displayNameFromZoneboardFile(fileName: string): string {
  const stem = stripToFilenameStem(fileName);
  return stem || fileName;
}

/**
 * `<Board名>.zoneboard.json` — UTF-8 content; filename sanitized only.
 */
export function portableBoardFilename(
  boardTitle: string,
  fallback = "ZoneBoard",
): string {
  const base = sanitizeBoardFilenameBase(
    stripToFilenameStem(boardTitle),
    fallback,
  );
  return `${base}${ZONEBOARD_JSON_EXT}`;
}
