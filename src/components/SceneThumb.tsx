import { useEffect, useState } from "react";
import type { BoardDocument, Scene } from "../models/types";
import {
  getSceneThumbDataUrl,
  sceneThumbCssSize,
  sceneThumbRevision,
} from "../canvas/sceneThumb";

type Props = {
  board: BoardDocument;
  scene: Scene;
  /** CSS width in px (chip ≈40, dialog ≈140) */
  width: number;
  className?: string;
};

/** Cached offscreen pitch silhouette. Empty placeholder if paint fails. */
export function SceneThumb({ board, scene, width, className }: Props) {
  const rev = sceneThumbRevision(board, scene);
  const fallback = sceneThumbCssSize(width);
  const [thumb, setThumb] = useState<{
    url: string;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = window.requestAnimationFrame(() => {
      const next = getSceneThumbDataUrl(board, scene, width);
      if (!cancelled) setThumb(next);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
    };
    // rev captures pitch content; skip re-paint on parent identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.id, scene.id, width, rev]);

  if (!thumb) {
    return (
      <span
        className={`scene-thumb scene-thumb--empty${className ? ` ${className}` : ""}`}
        style={{ width: fallback.w, height: fallback.h }}
        aria-hidden
      />
    );
  }

  return (
    <img
      className={`scene-thumb${className ? ` ${className}` : ""}`}
      src={thumb.url}
      alt=""
      width={thumb.w}
      height={thumb.h}
      draggable={false}
    />
  );
}
