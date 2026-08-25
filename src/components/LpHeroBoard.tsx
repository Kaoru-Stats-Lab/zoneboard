import { useEffect, useMemo, useRef } from "react";
import { loadBallImage } from "../assets/ballImages";
import { drawBoard } from "../canvas/drawBoard";
import { outerFillForBoard } from "../canvas/drawPitch";
import { fitField } from "../canvas/layout";
import {
  pointOnPolyline,
  polylineByProgress,
} from "../canvas/smoothPath";
import { APP_LOCALE } from "../i18n/locale";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { ballPosOnPiece } from "../models/ballAttach";
import { sceneViewport } from "../models/scene";
import type { BallState, LineKind, Scene } from "../models/types";
import {
  createLpHeroData,
  dribbleProgress,
  LP_DRIBBLE_POINTS,
  LP_HERO_CYCLE_MS,
  LP_HERO_PIECE,
  LP_PASS_POINTS,
  LP_T_PASS_END,
  LP_T_PASS_START,
  lpHeroDribbleLine,
  lpHeroPassLine,
  passProgress,
  railCollapsed,
} from "../presets/lpHeroScene";

const REDUCED_MOTION_T = 5500;

function lpCaption(): string {
  return messages[APP_LOCALE]["lpHeroCaption" satisfies MessageKey];
}

function heroBallAt(t: number, pieces: Scene["pieces"]): BallState {
  const p8 = pieces.find((p) => p.id === LP_HERO_PIECE.home8);
  const p7 = pieces.find((p) => p.id === LP_HERO_PIECE.home7);
  if (!p8 || !p7) return { x: 0.42, y: 0.32 };

  const pp = passProgress(t);
  if (t < LP_T_PASS_START) {
    const pos = ballPosOnPiece(p8);
    return { ...pos, attachedTo: LP_HERO_PIECE.home8 };
  }
  if (t < LP_T_PASS_END) {
    const pos = pointOnPolyline(LP_PASS_POINTS, pp);
    return { x: pos.x, y: pos.y, attachedTo: null };
  }
  const pos = ballPosOnPiece(p7);
  return { ...pos, attachedTo: LP_HERO_PIECE.home7 };
}

function heroPreviewLine(
  t: number,
): { kind: LineKind; points: { x: number; y: number }[] } | null {
  const pp = passProgress(t);
  const dp = dribbleProgress(t);

  if (pp > 0 && pp < 1) {
    const pts = polylineByProgress(LP_PASS_POINTS, pp);
    if (pts.length >= 2) return { kind: "pass", points: pts };
  }
  if (dp > 0 && dp < 1) {
    const pts = polylineByProgress(LP_DRIBBLE_POINTS, dp);
    if (pts.length >= 2) return { kind: "dribble", points: pts };
  }
  return null;
}

function heroSceneAt(t: number, base: Scene, board: ReturnType<typeof createLpHeroData>["board"]): Scene {
  const passDone = passProgress(t) >= 1;
  const dribbleDone = dribbleProgress(t) >= 1;
  const objects = [];
  if (passDone) objects.push(lpHeroPassLine(board));
  if (dribbleDone) objects.push(lpHeroDribbleLine(board));
  return {
    ...base,
    ball: heroBallAt(t, base.pieces),
    objects,
  };
}

export function LpHeroBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLElement>(null);
  const { board, scene } = useMemo(() => createLpHeroData(), []);
  const ballImageRef = useRef<HTMLImageElement | null>(null);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let cancelled = false;
    let raf = 0;
    let epoch = performance.now();
    let pausedT = 0;
    const lastT = { current: 0 };

    const paint = (t: number) => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 1 || h < 1) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const view = sceneViewport(scene, board.viewport);
      const boardView = { ...board, viewport: view };
      const { outer, pitch } = fitField(w, h, boardView, 4, view, 0);
      const sceneDraw = heroSceneAt(t, scene, board);
      drawBoard(ctx, pitch, boardView, sceneDraw, {
        outer,
        background: outerFillForBoard(board),
        previewLine: heroPreviewLine(t),
        ballImage: ballImageRef.current,
      });

      frameRef.current?.classList.toggle("is-broadcast", railCollapsed(t));
      captionRef.current?.classList.toggle("is-visible", railCollapsed(t));
    };

    const ro = new ResizeObserver(() => {
      if (reducedMotion) paint(REDUCED_MOTION_T);
    });
    ro.observe(wrap);

    if (reducedMotion) {
      paint(REDUCED_MOTION_T);
      loadBallImage("soccer").then((img) => {
        if (!cancelled) {
          ballImageRef.current = img;
          paint(REDUCED_MOTION_T);
        }
      });
      return () => {
        cancelled = true;
        ro.disconnect();
      };
    }

    const loop = (now: number) => {
      if (document.hidden) return;
      const t = (pausedT + now - epoch) % LP_HERO_CYCLE_MS;
      lastT.current = t;
      paint(t);
      raf = requestAnimationFrame(loop);
    };

    const onVis = () => {
      if (document.hidden) {
        pausedT = (pausedT + performance.now() - epoch) % LP_HERO_CYCLE_MS;
        cancelAnimationFrame(raf);
      } else {
        epoch = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    paint(0);
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVis);
    loadBallImage("soccer").then((img) => {
      if (!cancelled) {
        ballImageRef.current = img;
        paint(lastT.current);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
  }, [board, scene, reducedMotion]);

  return (
    <figure className="lp-hero-board" aria-hidden="true">
      <div className="lp-board-stage">
        <div className="lp-board-frame" ref={frameRef}>
          <div className="lp-board-rail" aria-hidden="true">
            <span title="pass" />
            <span title="run" />
            <span title="dribble" />
          </div>
          <div className="lp-board-canvas-wrap" ref={wrapRef}>
            <canvas ref={canvasRef} aria-hidden="true" />
          </div>
        </div>
      </div>
      <figcaption ref={captionRef}>{lpCaption()}</figcaption>
    </figure>
  );
}
