import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { loadBallImage } from "../assets/ballImages";
import {
  drawBoard,
  hitTestBall,
  hitTestObject,
  hitTestPiece,
  hitTestPieceFacing,
  hitTestWatermark,
  pitchToWorld,
} from "../canvas/drawBoard";
import {
  BROADCAST_LETTERBOX,
  broadcastFrameRect,
  fitSurfaceLayout,
  toNorm,
  zoomAt,
} from "../canvas/layout";
import { drawMatchBanner, matchBannerHeight } from "../canvas/matchBanner";
import { smoothLinePath } from "../canvas/smoothPath";
import { textOverlayRect } from "../canvas/textOverlayLayout";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import type { BoardDocument, Viewport } from "../models/types";
import { isLineTool } from "../models/types";
import { CanvasTextEditor } from "./CanvasTextEditor";

type TextEditSession = {
  worldX: number;
  worldY: number;
  fontSizeNorm: number;
  objectId?: string;
  draft: string;
  color?: string;
  fontFamily?: import("../models/types").TextFontId;
};

type Props = {
  state: AppState;
  watermarkImage: HTMLImageElement | null;
  /** PNG プレビュー時の画角（設定中・current 以外） */
  viewOverride?: Viewport | null;
  t: (k: MessageKey) => string;
};

function resolveSurfaceLayout(
  canvasW: number,
  canvasH: number,
  board: BoardDocument,
  view: Viewport,
  broadcast: boolean,
) {
  const frame = broadcast ? broadcastFrameRect(canvasW, canvasH) : null;
  const bannerH = matchBannerHeight(
    frame?.w ?? canvasW,
    frame?.h ?? canvasH,
    board,
  );
  const layout = fitSurfaceLayout(
    canvasW,
    canvasH,
    board,
    4,
    view,
    bannerH,
    broadcast,
  );
  return { ...layout, bannerH, frame: layout.frame };
}

type DragState =
  | {
      mode: "piece";
      id: string;
      lastX: number;
      lastY: number;
      /** ドロップ入れ替え用の開始位置 */
      startX: number;
      startY: number;
      recorded: boolean;
      boost: number;
    }
  | {
      mode: "piece-rotate";
      id: string;
      recorded: boolean;
    }
  | { mode: "ball"; recorded: boolean; boost: number }
  | { mode: "watermark"; recorded: boolean }
  | {
      mode: "pan";
      lastClientX: number;
      lastClientY: number;
    }
  | {
      mode: "line";
      kind: import("../models/types").LineKind;
      points: { x: number; y: number }[];
    }
  | {
      mode: "zone";
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    }
  | {
      mode: "pen";
      x0: number;
      y0: number;
      points?: { x: number; y: number }[];
    }
  | {
      mode: "text";
      id: string;
      lastX: number;
      lastY: number;
      recorded: boolean;
    };

export function BoardCanvas({
  state,
  watermarkImage,
  viewOverride = null,
  t,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardSurfaceRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const [dragTick, setDragTick] = useState(0);
  const [textEdit, setTextEdit] = useState<TextEditSession | null>(null);
  const textEditRef = useRef<TextEditSession | null>(null);
  const [ballImage, setBallImage] = useState<HTMLImageElement | null>(null);
  const raf = useRef<number | null>(null);

  textEditRef.current = textEdit;

  const { board, scene } = state;
  const view = board ? (viewOverride ?? board.viewport) : null;
  const viewLocked = viewOverride != null;

  useEffect(() => {
    if (!board) return;
    let cancelled = false;
    loadBallImage(board.sport).then((img) => {
      if (!cancelled) setBallImage(img);
    });
    return () => {
      cancelled = true;
    };
  }, [board?.sport]);

  /** タブレット / 大型タッチ: ピンチズーム・2本指パン（ホットキー不要） */
  useEffect(() => {
    const el = boardSurfaceRef.current;
    if (!el || !board || !view || viewLocked) return;

    let lastDist = 0;
    let lastMidX = 0;
    let lastMidY = 0;

    const touchDist = (a: Touch, b: Touch) =>
      Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const touchMid = (a: Touch, b: Touch) => ({
      x: (a.clientX + b.clientX) / 2,
      y: (a.clientY + b.clientY) / 2,
    });

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        drag.current = null;
        lastDist = touchDist(e.touches[0], e.touches[1]);
        const mid = touchMid(e.touches[0], e.touches[1]);
        lastMidX = mid.x;
        lastMidY = mid.y;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !board) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dist = touchDist(e.touches[0], e.touches[1]);
      const mid = touchMid(e.touches[0], e.touches[1]);
      const { pitch } = resolveSurfaceLayout(
        canvas.clientWidth,
        canvas.clientHeight,
        board,
        view,
        state.broadcast,
      );

      if (lastDist > 0) {
        const factor = dist / lastDist;
        const focus = toNorm(mid.x, mid.y, canvas, pitch);
        const fx = focus?.x ?? view.cx;
        const fy = focus?.y ?? view.cy;
        let vp = zoomAt(view, fx, fy, factor);
        const dx = (mid.x - lastMidX) / pitch.w;
        const dy = (mid.y - lastMidY) / pitch.h;
        vp = {
          ...vp,
          cx: vp.cx - dx,
          cy: vp.cy - dy,
        };
        state.setViewport(vp);
      }
      lastDist = dist;
      lastMidX = mid.x;
      lastMidY = mid.y;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [board, state, state.broadcast, view, viewLocked]);

  /** Ctrl+ホイール（Mac はピンチも ctrl 扱い）でカーソル位置ズーム */
  useEffect(() => {
    const el = boardSurfaceRef.current;
    if (!el || !board || !view || viewLocked) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { pitch } = resolveSurfaceLayout(
        canvas.clientWidth,
        canvas.clientHeight,
        board,
        view,
        state.broadcast,
      );
      const norm = toNorm(e.clientX, e.clientY, canvas, pitch);
      const focusX = norm?.x ?? view.cx;
      const focusY = norm?.y ?? view.cy;
      const factor = Math.exp(-e.deltaY * 0.002);
      if (Math.abs(factor - 1) < 0.001) return;
      state.setViewport(zoomAt(view, focusX, focusY, factor));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [board, state, state.broadcast, view, viewLocked]);

  const paint = () => {
    const canvas = canvasRef.current;
    const surface = boardSurfaceRef.current;
    if (!canvas || !surface || !board || !scene || !view) return;
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = surface;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { outer, pitch, bannerH, frame } = resolveSurfaceLayout(
      w,
      h,
      board,
      view,
      state.broadcast,
    );
    const d = drag.current;
    const frameArea = frame ? frame.w * frame.h : w * h;
    const pitchArea = (pitch.w * pitch.h) / frameArea;
    drawBoard(ctx, pitch, board, scene, {
      selectedPieceId: state.selectedPieceId,
      selectedObjectId: state.selectedObjectId,
      selectedBall: state.selectedBall,
      selectionColor: state.selectionColor,
      watermark: state.watermark,
      watermarkImage,
      outer,
      background: BROADCAST_LETTERBOX,
      dragVisual:
        d?.mode === "piece"
          ? { pieceId: d.id, boost: d.boost }
          : d?.mode === "ball"
            ? { ball: true, boost: d.boost }
            : null,
      previewLine:
        d?.mode === "line" && d.points.length >= 2
          ? { kind: d.kind, points: smoothLinePath(d.points) }
          : null,
      previewZone:
        d?.mode === "zone"
          ? { x0: d.x0, y0: d.y0, x1: d.x1, y1: d.y1 }
          : null,
      previewPen:
        d?.mode === "pen" && d.points && d.points.length >= 1
          ? d.points
          : null,
      ballImage,
      editingTextId: textEdit?.objectId ?? null,
    });
    if (bannerH > 0) {
      if (frame) {
        ctx.save();
        ctx.translate(frame.x, frame.y);
        drawMatchBanner(ctx, frame.w, bannerH, board, t("cardY2CLabel"));
        ctx.restore();
      } else {
        drawMatchBanner(ctx, w, bannerH, board, t("cardY2CLabel"));
      }
    }
    surface.dataset.pitchRatio = String(pitchArea);
  };

  useEffect(() => {
    const surface = boardSurfaceRef.current;
    if (!surface || !board || !scene) return;
    paint();
    const ro = new ResizeObserver(() => paint());
    ro.observe(surface);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    board,
    scene,
    state.selectedPieceId,
    state.selectedObjectId,
    state.selectedBall,
    state.selectionColor,
    state.watermark,
    watermarkImage,
    ballImage,
    state.broadcast,
    dragTick,
    view,
    textEdit,
  ]);

  if (!board || !scene || !view) return null;

  const getNorm = (e: ReactPointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { pitch } = resolveSurfaceLayout(
      canvas.clientWidth,
      canvas.clientHeight,
      board,
      view,
      state.broadcast,
    );
    return { norm: toNorm(e.clientX, e.clientY, canvas, pitch), pitch };
  };

  const bumpDragVisual = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      setDragTick((n) => n + 1);
    });
  };

  const pieceAtEvent = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { pitch } = resolveSurfaceLayout(
      canvas.clientWidth,
      canvas.clientHeight,
      board,
      view,
      state.broadcast,
    );
    const norm = toNorm(e.clientX, e.clientY, canvas, pitch);
    if (!norm) return null;
    return hitTestPiece(board, scene, pitch, norm.x, norm.y);
  };

  const commitTextEdit = (value: string) => {
    const session = textEditRef.current;
    if (!session) return;
    const trimmed = value.trim();
    if (session.objectId) {
      state.updateText(session.objectId, trimmed);
      state.setSelectedObjectId(trimmed ? session.objectId : null);
    } else if (trimmed) {
      state.addText(session.worldX, session.worldY, trimmed);
    }
    setTextEdit(null);
  };

  const cancelTextEdit = () => {
    setTextEdit(null);
  };

  const openTextEdit = (opts: {
    worldX: number;
    worldY: number;
    initial: string;
    objectId?: string;
    fontSizeNorm?: number;
    color?: string;
    fontFamily?: import("../models/types").TextFontId;
  }) => {
    if (textEditRef.current) commitTextEdit(textEditRef.current.draft);
    setTextEdit({
      worldX: opts.worldX,
      worldY: opts.worldY,
      fontSizeNorm: opts.fontSizeNorm ?? 0.035,
      objectId: opts.objectId,
      draft: opts.initial,
      color: opts.color,
      fontFamily: opts.fontFamily,
    });
  };

  const objectAtEvent = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { pitch } = resolveSurfaceLayout(
      canvas.clientWidth,
      canvas.clientHeight,
      board,
      view,
      state.broadcast,
    );
    const norm = toNorm(e.clientX, e.clientY, canvas, pitch);
    if (!norm) return null;
    return hitTestObject(board, scene, norm.x, norm.y);
  };

  /** ダブルクリックは移動操作と衝突しやすいのでトリプルクリック */
  const onClick = (e: ReactMouseEvent) => {
    if (state.broadcast || state.tool !== "select") return;
    if (e.detail !== 3) return;
    const piece = pieceAtEvent(e);
    if (piece) {
      e.preventDefault();
      state.openPieceInspector(piece.id);
    }
  };

  const onDoubleClick = (e: ReactMouseEvent) => {
    if (state.broadcast || state.tool !== "select" || viewLocked) return;
    const obj = objectAtEvent(e);
    if (obj?.type !== "text") return;
    e.preventDefault();
    state.setSelectedBall(false);
    state.setSelectedPieceId(null);
    state.setSelectedObjectId(obj.id);
    openTextEdit({
      worldX: obj.x,
      worldY: obj.y,
      initial: obj.text,
      objectId: obj.id,
      fontSizeNorm: obj.fontSize,
      color: obj.color,
      fontFamily: obj.fontFamily,
    });
  };

  const onContextMenu = (e: ReactMouseEvent) => {
    if (state.broadcast) return;
    const piece = pieceAtEvent(e);
    if (piece) {
      e.preventDefault();
      state.openPieceInspector(piece.id);
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // パネルの input にフォーカスが残ると Delete が効かないことがある
    const ae = document.activeElement as HTMLElement | null;
    if (
      ae &&
      ae !== canvas &&
      (ae.tagName === "INPUT" ||
        ae.tagName === "TEXTAREA" ||
        ae.tagName === "SELECT" ||
        ae.isContentEditable)
    ) {
      ae.blur();
    }
    const hit = getNorm(e);
    if (!hit?.norm) return;
    const { norm, pitch } = hit;
    const world = pitchToWorld(norm.x, norm.y, board);

    // 中ボタン or Alt+ドラッグ = パン
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      drag.current = {
        mode: "pan",
        lastClientX: e.clientX,
        lastClientY: e.clientY,
      };
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    if (state.tool === "ball") {
      state.moveBall(world.x, world.y, true);
      state.setSelectedBall(true);
      state.setSelectedPieceId(null);
      drag.current = { mode: "ball", recorded: true, boost: 1.2 };
      canvas.setPointerCapture(e.pointerId);
      bumpDragVisual();
      return;
    }

    if (state.tool === "select") {
      // ボール → 駒 → 描画（パス等）→ ロゴ
      if (hitTestBall(board, scene, pitch, norm.x, norm.y)) {
        state.setSelectedBall(true);
        state.setSelectedPieceId(null);
        state.setSelectedObjectId(null);
        drag.current = { mode: "ball", recorded: false, boost: 1.2 };
        canvas.setPointerCapture(e.pointerId);
        bumpDragVisual();
        return;
      }
      // 向き三角／外周 → その場回転。本体 → 移動
      const facingPiece = hitTestPieceFacing(
        board,
        scene,
        pitch,
        norm.x,
        norm.y,
      );
      if (facingPiece) {
        state.setSelectedBall(false);
        state.setSelectedPieceId(facingPiece.id);
        state.setSelectedObjectId(null);
        const facing =
          (Math.atan2(world.y - facingPiece.y, world.x - facingPiece.x) *
            180) /
          Math.PI;
        state.patchPiece(facingPiece.id, { facing }, true);
        drag.current = {
          mode: "piece-rotate",
          id: facingPiece.id,
          recorded: true,
        };
        canvas.setPointerCapture(e.pointerId);
        bumpDragVisual();
        return;
      }
      const piece = hitTestPiece(board, scene, pitch, norm.x, norm.y);
      if (piece) {
        state.setSelectedBall(false);
        state.setSelectedPieceId(piece.id);
        state.setSelectedObjectId(null);
        drag.current = {
          mode: "piece",
          id: piece.id,
          lastX: world.x,
          lastY: world.y,
          startX: piece.x,
          startY: piece.y,
          recorded: false,
          boost: 1.18,
        };
        canvas.setPointerCapture(e.pointerId);
        bumpDragVisual();
        return;
      }
      const obj = hitTestObject(board, scene, norm.x, norm.y);
      if (obj) {
        state.setSelectedBall(false);
        state.setSelectedPieceId(null);
        state.setSelectedObjectId(obj.id);
        if (obj.type === "text") {
          drag.current = {
            mode: "text",
            id: obj.id,
            lastX: world.x,
            lastY: world.y,
            recorded: false,
          };
          canvas.setPointerCapture(e.pointerId);
          bumpDragVisual();
        }
        return;
      }
      if (
        hitTestWatermark(pitch, state.watermark, norm.x, norm.y, watermarkImage)
      ) {
        state.setSelectedBall(false);
        state.setSelectedPieceId(null);
        state.setSelectedObjectId(null);
        drag.current = { mode: "watermark", recorded: false };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      state.setSelectedBall(false);
      state.setSelectedPieceId(null);
      state.setSelectedObjectId(null);
      return;
    }

    if (state.tool === "piece-home") {
      state.addPieceAt(world.x, world.y, "home");
      return;
    }
    if (state.tool === "piece-away") {
      state.addPieceAt(world.x, world.y, "away");
      return;
    }

    if (isLineTool(state.tool)) {
      drag.current = {
        mode: "line",
        kind: state.tool,
        points: [{ x: world.x, y: world.y }],
      };
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    if (state.tool === "zone") {
      drag.current = {
        mode: "zone",
        x0: world.x,
        y0: world.y,
        x1: world.x,
        y1: world.y,
      };
      canvas.setPointerCapture(e.pointerId);
      bumpDragVisual();
      return;
    }

    if (state.tool === "pen") {
      drag.current = {
        mode: "pen",
        x0: world.x,
        y0: world.y,
        points: [{ x: world.x, y: world.y }],
      };
      canvas.setPointerCapture(e.pointerId);
      bumpDragVisual();
      return;
    }

    if (state.tool === "text") {
      e.preventDefault();
      openTextEdit({
        worldX: world.x,
        worldY: world.y,
        initial: "",
      });
      return;
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;

    if (d.mode === "pan") {
      if (viewLocked) return;
      const canvas = canvasRef.current;
      if (!canvas || !board) return;
      const { pitch } = resolveSurfaceLayout(
        canvas.clientWidth,
        canvas.clientHeight,
        board,
        view,
        state.broadcast,
      );
      const dx = (e.clientX - d.lastClientX) / pitch.w;
      const dy = (e.clientY - d.lastClientY) / pitch.h;
      d.lastClientX = e.clientX;
      d.lastClientY = e.clientY;
      state.setViewport({
        ...view,
        cx: view.cx - dx,
        cy: view.cy - dy,
      });
      return;
    }

    const hit = getNorm(e);
    if (!hit?.norm) return;
    const world = pitchToWorld(hit.norm.x, hit.norm.y, board);

    if (d.mode === "watermark") {
      state.updateWatermark({
        ...state.watermark,
        x: Math.min(1, Math.max(0, hit.norm.x)),
        y: Math.min(1, Math.max(0, hit.norm.y)),
      });
      return;
    }

    if (d.mode === "ball") {
      const prev = scene.ball;
      const dist = Math.hypot(world.x - prev.x, world.y - prev.y);
      if (dist > 0.003) d.boost = Math.min(1.32, 1.14 + dist * 10);
      state.moveBall(world.x, world.y, !d.recorded);
      d.recorded = true;
      bumpDragVisual();
      return;
    }

    if (d.mode === "piece-rotate") {
      const piece = scene.pieces.find((p) => p.id === d.id);
      if (piece) {
        const facing =
          (Math.atan2(world.y - piece.y, world.x - piece.x) * 180) / Math.PI;
        state.patchPiece(d.id, { facing }, false);
        bumpDragVisual();
      }
      return;
    }

    if (d.mode === "piece") {
      const dx = world.x - d.lastX;
      const dy = world.y - d.lastY;
      const dist = Math.hypot(dx, dy);
      let facing: number | undefined;
      if (dist > 0.004) {
        facing = (Math.atan2(dy, dx) * 180) / Math.PI;
        d.lastX = world.x;
        d.lastY = world.y;
        d.boost = Math.min(1.28, 1.12 + dist * 8);
      }
      state.movePiece(d.id, world.x, world.y, !d.recorded, facing);
      d.recorded = true;
      bumpDragVisual();
      return;
    }

    if (d.mode === "line") {
      const last = d.points[d.points.length - 1];
      const dist = Math.hypot(world.x - last.x, world.y - last.y);
      // 近すぎる点は間引く（離すと平滑化で弧を描く）
      if (dist >= 0.008) {
        d.points.push({ x: world.x, y: world.y });
        bumpDragVisual();
      }
      return;
    }

    if (d.mode === "zone") {
      d.x1 = world.x;
      d.y1 = world.y;
      bumpDragVisual();
      return;
    }

    if (d.mode === "text") {
      const textObj = scene.objects.find(
        (o) => o.id === d.id && o.type === "text",
      );
      if (textObj && textObj.type === "text") {
        const dx = world.x - d.lastX;
        const dy = world.y - d.lastY;
        if (Math.hypot(dx, dy) > 0.001) {
          state.moveText(
            d.id,
            textObj.x + dx,
            textObj.y + dy,
            !d.recorded,
          );
          d.recorded = true;
          d.lastX = world.x;
          d.lastY = world.y;
          bumpDragVisual();
        }
      }
      return;
    }

    if (d.mode === "pen" && d.points) {
      d.points.push({ x: world.x, y: world.y });
      bumpDragVisual();
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    bumpDragVisual();
    if (!d) return;
    const hit = getNorm(e);
    if (!hit?.norm) return;
    const world = pitchToWorld(hit.norm.x, hit.norm.y, board);

    if (d.mode === "ball") {
      // 駒の近くにドロップするとくっつく（マルチ選択不要）
      state.dropBall(world.x, world.y);
      return;
    }

    if (d.mode === "piece") {
      // 別の駒の上にドロップ → 位置入れ替え（交代・解説用）
      const target = hitTestPiece(
        board,
        scene,
        hit.pitch,
        hit.norm.x,
        hit.norm.y,
        d.id,
      );
      if (target) {
        state.swapPieces(d.id, target.id, {
          x: d.startX,
          y: d.startY,
        });
        state.setSelectedPieceId(d.id);
      }
      return;
    }

    if (d.mode === "line") {
      const last = d.points[d.points.length - 1];
      if (
        Math.hypot(world.x - last.x, world.y - last.y) >= 0.008
      ) {
        d.points.push({ x: world.x, y: world.y });
      }
      if (d.points.length >= 2) {
        state.addLine(d.kind, smoothLinePath(d.points));
      }
    } else if (d.mode === "zone") {
      const x = Math.min(d.x0, world.x);
      const y = Math.min(d.y0, world.y);
      const w = Math.abs(world.x - d.x0);
      const h = Math.abs(world.y - d.y0);
      if (w > 0.01 && h > 0.01) state.addZone(x, y, w, h);
    } else if (d.mode === "pen" && d.points) {
      state.addPen(d.points);
    }
  };

  const surface = boardSurfaceRef.current;
  const textOverlay =
    textEdit && surface
      ? textOverlayRect(
          surface.clientWidth,
          surface.clientHeight,
          board,
          view,
          textEdit.worldX,
          textEdit.worldY,
          textEdit.fontSizeNorm,
          state.broadcast,
        )
      : null;

  return (
    <div
      className={`board-surface${state.broadcast ? " broadcast" : ""}`}
      ref={boardSurfaceRef}
      data-board-surface="true"
      data-tool={state.tool}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      />
      {textEdit && textOverlay && (
        <CanvasTextEditor
          board={board}
          left={textOverlay.left}
          top={textOverlay.top}
          fontSize={textOverlay.fontSize}
          value={textEdit.draft}
          placeholder={t("textPlaceholder")}
          color={textEdit.color}
          fontFamily={textEdit.fontFamily}
          onChange={(draft) =>
            setTextEdit((prev) => (prev ? { ...prev, draft } : null))
          }
          onCommit={commitTextEdit}
          onCancel={cancelTextEdit}
        />
      )}
    </div>
  );
}
