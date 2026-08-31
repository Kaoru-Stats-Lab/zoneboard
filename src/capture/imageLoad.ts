import type { CaptureImportImage } from "./session";

const MAX_EDGE = 4096;

/**
 * Load clipboard / drop blob into a short-lived object URL.
 * Downscales so the longest edge ≤ MAX_EDGE (broadcast-safe).
 */
export async function loadCaptureImage(
  blob: Blob,
): Promise<CaptureImportImage | null> {
  if (!blob.type.startsWith("image/")) return null;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return null;
  }

  try {
    let { width, height } = bitmap;
    const maxEdge = Math.max(width, height);

    if (maxEdge <= MAX_EDGE) {
      const url = URL.createObjectURL(blob);
      return { width, height, url };
    }

    const scale = MAX_EDGE / maxEdge;
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const resized = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
    if (!resized) return null;

    const url = URL.createObjectURL(resized);
    return { width, height, url };
  } finally {
    bitmap.close();
  }
}

/** First image/* item from DataTransfer (paste or drop). */
export function imageBlobFromDataTransfer(dt: DataTransfer): Blob | null {
  for (const item of dt.items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }
  return null;
}
