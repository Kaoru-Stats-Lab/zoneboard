/** Longest edge cap for frame PNG (720p-class proxy — no 4K decode export). */
export const FRAME_EXTRACT_MAX_EDGE = 1280;

/** Soft warning threshold — decode still allowed. */
export const FRAME_EXTRACT_LARGE_FILE_BYTES = 500 * 1024 * 1024;

export const FRAME_EXTRACT_ACCEPT =
  "video/mp4,video/webm,.mp4,.webm,video/quicktime";

export function isLargeVideoFile(file: File): boolean {
  return file.size > FRAME_EXTRACT_LARGE_FILE_BYTES;
}

/** Draw current video frame to canvas (capped) and return PNG blob. */
export async function frameBlobFromVideo(
  video: HTMLVideoElement,
): Promise<Blob | null> {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const maxEdge = Math.max(vw, vh);
  const scale =
    maxEdge > FRAME_EXTRACT_MAX_EDGE ? FRAME_EXTRACT_MAX_EDGE / maxEdge : 1;
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
}

export async function copyFrameBlobToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write) return false;
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
