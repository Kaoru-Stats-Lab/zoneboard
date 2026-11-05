import { useId, useState } from "react";
import { detectHelpOs, type HelpOsId } from "../lib/helpOs";
import type { MessageKey } from "../i18n/messages";

type Props = {
  t: (k: MessageKey) => string;
  /** "select" = file picker context; "folder" = empty/wrong folder; "generic" */
  context?: "select" | "folder" | "generic";
  className?: string;
};

const OS_ORDER: HelpOsId[] = ["windows", "macos", "linux"];

/**
 * Expandable recovery help for finding saved boards.
 * OS tabs are session-local UI state only (not persisted / not account settings).
 */
export function FilesFindHelp({
  t,
  context = "generic",
  className,
}: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const detected = detectHelpOs();
  const [os, setOs] = useState<HelpOsId>(detected ?? "windows");

  const title =
    context === "select"
      ? t("filesFindHelpTitleSelect")
      : context === "folder"
        ? t("filesFindHelpTitleFolder")
        : t("filesFindHelpTitle");

  return (
    <div className={className ?? "files-find-help"}>
      <button
        type="button"
        className="files-find-help-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
      </button>
      {open && (
        <div
          id={panelId}
          className="files-find-help-panel"
          role="region"
          aria-label={title}
        >
          <ol className="files-find-help-steps">
            <li>{t("filesFindHelpCommon1")}</li>
            <li>{t("filesFindHelpCommon2")}</li>
            <li>{t("filesFindHelpCommon3")}</li>
            {context !== "folder" && <li>{t("filesFindHelpCommon4")}</li>}
            {context === "folder" && <li>{t("filesFindHelpFolderRoot")}</li>}
          </ol>
          <p className="files-find-help-os-label">{t("filesFindHelpOsLabel")}</p>
          <div
            className="files-find-help-os-tabs"
            role="tablist"
            aria-label={t("filesFindHelpOsLabel")}
          >
            {OS_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={os === id}
                className={
                  os === id
                    ? "files-dash-btn files-dash-btn--small files-dash-btn--primary"
                    : "files-dash-btn files-dash-btn--small"
                }
                onClick={() => setOs(id)}
              >
                {id === "windows"
                  ? t("filesFindHelpOsWindows")
                  : id === "macos"
                    ? t("filesFindHelpOsMac")
                    : t("filesFindHelpOsLinux")}
              </button>
            ))}
          </div>
          {!detected && (
            <p className="files-find-help-detect-note">
              {t("filesFindHelpOsUnknown")}
            </p>
          )}
          <div className="files-find-help-os-body">
            {os === "windows" && (
              <>
                <p>{t("filesFindHelpWin1")}</p>
                {context !== "folder" && <p>{t("filesFindHelpWin2")}</p>}
                <p>{t("filesFindHelpWin3")}</p>
                <p>{t("filesFindHelpWin4")}</p>
                <p>{t("filesFindHelpWin5")}</p>
              </>
            )}
            {os === "macos" && (
              <>
                <p>{t("filesFindHelpMac1")}</p>
                <p>{t("filesFindHelpMac2")}</p>
                <p>{t("filesFindHelpMac3")}</p>
                {context !== "folder" && <p>{t("filesFindHelpMac4")}</p>}
                <p>{t("filesFindHelpMac5")}</p>
              </>
            )}
            {os === "linux" && (
              <>
                <p>{t("filesFindHelpLinux1")}</p>
                <p>{t("filesFindHelpLinux2")}</p>
                <p>{t("filesFindHelpLinux3")}</p>
                {context !== "folder" && <p>{t("filesFindHelpLinux4")}</p>}
                <p>{t("filesFindHelpLinux5")}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
