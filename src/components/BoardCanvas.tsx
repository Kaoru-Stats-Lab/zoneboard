import {
  useCallback,
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
  hitTestPieceForSwap,
  hitTestPiecePointer,
  hitTestTextObjectHandle,
  hitTestShapeObjectHandle,
  applyTextResize,
  applyShapeResize,
  computeTextGeometry,
  computeShapeGeometry,
  tightDisplayWorldBox,
  previewShapeFromDrag,
  shapeBoxFromDrag,
  normalizeRotationDeg,
  rotationDegFromDrag,
  textResizeCursor,
  shapeResizeCursor,
  pointInTextBox,
  pointInShape,
  pitchToWorld,
  type TextHandleId,
  type ShapeHandleId,
} from "../canvas/drawBoard";
import { fromNorm } from "../canvas/layout";
import { outerFillForBoard } from "../canvas/drawPitch";
import {
  BROADCAST_MATTE,
  broadcastFrameRect,
  fitSurfaceLayout,
  toNorm,
  zoomAt,
} from "../canvas/layout";
import { drawMatchBanner, matchBannerHeight } from "../canvas/matchBanner";
import { activeViewport, boardWithActiveViewport } from "../models/scene";
import { resolveLinkPoints } from "../models/pieceLink";
import { smoothLinePath } from "../canvas/smoothPath";
import {
  textOverlayForObject,
  textOverlayRect,
} from "../canvas/textOverlayLayout";
import {
  TEXT_DEFAULT_FONT_SIZE,
  placeNewTextBox,
} from "../canvas/textGeometry";
import type { AppState } from "../hooks/useAppState";
import type { MessageKey } from "../i18n/messages";
import type { BoardDocument, LineKind, Viewport } from "../models/types";
import { isLineTool } from "../models/types";
import {
  buildCaptureUnderlayCanvas,
  captureUnderlayCacheKey,
} from "../capture/drawCaptureUnderlay";

function zoneDragCorner(
  x0: number,
  y0: number,
  x: number,
  y: number,
  square: boolean,
): { x: number; y: number } {
  if (!square) return { x, y };
  const dx = x - x0;
  const dy = y - y0;
  const side = Math.max(Math.abs(dx), Math.abs(dy));
  return {
    x: x0 + Math.sign(dx || 1) * side,
    y: y0 + Math.sign(dy || 1) * side,
  };
}

const PEN_POINT_MIN_DIST = 0.0008;

function keyboardBlocksSpacePan(): boolean {
  const ae = document.activeElement as HTMLElement | null;
  if (!ae) return false;
  const tag = ae.tagName;
  if (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    ae.isContentEditable
  ) {
    return true;
  }
  return ae.closest('[role="dialog"]') != null;
}

function appendPenWorldPoint(
  points: { x: number; y: number }[],
  world: { x: number; y: number },
): boolean {
  const last = points[points.length - 1];
  if (
    last &&
    Math.hypot(world.x - last.x, world.y - last.y) < PEN_POINT_MIN_DIST
  ) {
    return false;
  }
  points.push({ x: world.x, y: world.y });
  return true;
}

function samplePenPointerEvents(
  nativeEvent: PointerEvent,
  points: { x: number; y: number }[],
  board: BoardDocument,
  normFromClient: (
    clientX: number,
    clientY: number,
  ) => { x: number; y: number } | null,
): boolean {
  const extras =
    typeof nativeEvent.getCoalescedEvents === "function"
      ? nativeEvent.getCoalescedEvents()
      : [];
  const batch = extras.length > 0 ? extras : [nativeEvent];
  let added = false;
  for (const ev of batch) {
    const norm = normFromClient(ev.clientX, ev.clientY);
    if (!norm) continue;
    const world = pitchToWorld(norm.x, norm.y, board);
    if (appendPenWorldPoint(points, world)) added = true;
  }
  return added;
}

import { CanvasTextEditor } from "./CanvasTextEditor";

type TextEditSession = {
  worldX: number;
  worldY: number;
  fontSizeNorm: number;
  /** Explicit width for new / boxed text (world). Legacy edit omits. */
  worldWidth?: number;
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
  /** Settings 中: 試合帯を隠し PNG 書き出しと同じ画角にする */
  suppressMatchBanner?: boolean;
  t: (k: MessageKey) => string;
};

function resolveSurfaceLayout(
  canvasW: number,
  canvasH: number,
  board: BoardDocument,
  view: Viewport,
  broadcast: boolean,
  suppressMatchBanner = false,
) {
  // 配信: 帯高は 16:9 フレーム基準（帯はフレーム内上端）
  const frame = broadcast ? broadcastFrameRect(canvasW, canvasH) : null;
  const bannerH =
    suppressMatchBanner
      ? 0
      : matchBannerHeight(
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
      /** 一緒に動かす選択。単体なら [id] */
      ids: string[];
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
  | { mode: "ball"; id: string; recorded: boolean; boost: number }
  | {
      mode: "pan";
      lastClientX: number;
      lastClientY: number;
    }
  | {
      mode: "line";
      kind: LineKind;
      points: { x: number; y: number }[];
    }
  | {
      mode: "piece-line";
      kind: "run" | "dribble";
      id: string;
      startX: number;
      startY: number;
      lastX: number;
      lastY: number;
      points: { x: number; y: number }[];
      recorded: boolean;
      boost: number;
    }
  | {
      mode: "zone";
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    }
  | {
      /** Create Shape via former Zone tool (CSS px drag). */
      mode: "shape-create";
      kind: "circle" | "rect" | "triangle";
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      lockAspect: boolean;
    }
  | {
      mode: "pen";
      x0: number;
      y0: number;
      points?: { x: number; y: number }[];
      /** Shift 押下開始 → 始点–終点の直線のみ（Figma 型） */
      straight: boolean;
    }
  | {
      mode: "text";
      id: string;
      lastX: number;
      lastY: number;
      recorded: boolean;
    }
  | {
      mode: "text-resize";
      id: string;
      handle: TextHandleId;
      startX: number;
      startY: number;
      startW: number;
      startH: number;
      startRotationDeg: number;
      pointerX: number;
      pointerY: number;
      recorded: boolean;
    }
  | {
      mode: "text-rotate";
      id: string;
      /** CSS px box centre at drag start */
      centerX: number;
      centerY: number;
      startRotationDeg: number;
      /** CSS client pointer at drag start */
      pointerX: number;
      pointerY: number;
      /** Live (possibly unnormalized) angle for badge */
      liveDeg: number;
      recorded: boolean;
    }
  | {
      mode: "shape";
      id: string;
      lastX: number;
      lastY: number;
      recorded: boolean;
    }
  | {
      mode: "shape-resize";
      id: string;
      handle: ShapeHandleId;
      kind: "circle" | "rect" | "triangle";
      startX: number;
      startY: number;
      startW: number;
      startH: number;
      startRotationDeg: number;
      pointerX: number;
      pointerY: number;
      recorded: boolean;
    }
  | {
      mode: "shape-rotate";
      id: string;
      centerX: number;
      centerY: number;
      startRotationDeg: number;
      pointerX: number;
      pointerY: number;
      liveDeg: number;
      recorded: boolean;
    }
  | {
      mode: "marquee";
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      additive: boolean;
    }
  | {
      mode: "capture-draft-piece";
      id: string;
      lastX: number;
      lastY: number;
      boost: number;
    }
  | { mode: "capture-draft-ball"; boost: number };

export function BoardCanvas({
  state,
  watermarkImage,
  viewOverride = null,
  suppressMatchBanner = false,
  t,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardSurfaceRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const selectedIdsRef = useRef<string[]>([]);
  const [dragTick, setDragTick] = useState(0);
  const [textEdit, setTextEdit] = useState<TextEditSession | null>(null);
  const textEditRef = useRef<TextEditSession | null>(null);
  const [ballImage, setBallImage] = useState<HTMLImageElement | null>(null);
  const [fontsEpoch, setFontsEpoch] = useState(0);
  const [linkDraftIds, setLinkDraftIds] = useState<string[]>([]);
  const [linkHoverWorld, setLinkHoverWorld] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const raf = useRef<number | null>(null);
  const spaceHeldRef = useRef(false);
  const [spacePanReady, setSpacePanReady] = useState(false);
  const [spacePanning, setSpacePanning] = useState(false);
  const captureSourceRef = useRef<HTMLImageElement | null>(null);
  const captureSourceUrlRef = useRef<string | null>(null);
  const underlayCacheRef = useRef<{
    key: string;
    canvas: HTMLCanvasElement;
  } | null>(null);

  textEditRef.current = textEdit;
  selectedIdsRef.current = state.selectedPieceIds;

  const { board, scene } = state;
  const view = board
    ? (viewOverride ?? activeViewport(board))
    : null;
  const viewLocked = viewOverride != null;

  useEffect(() => {
    if (state.tool !== "link") {
      setLinkDraftIds([]);
      setLinkHoverWorld(null);
    }
  }, [state.tool]);

  const finishLinkChain = useCallback(
    (ids: string[]) => {
      state.addLink(ids);
      setLinkDraftIds([]);
      setLinkHoverWorld(null);
    },
    [state],
  );

  useEffect(() => {
    if (state.tool !== "link" || state.broadcast) return;
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      if (
        ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.tagName === "SELECT" ||
          ae.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setLinkDraftIds([]);
        setLinkHoverWorld(null);
        return;
      }
      if (e.key === "Enter" && linkDraftIds.length >= 2) {
        e.preventDefault();
        finishLinkChain(linkDraftIds);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.tool, state.broadcast, finishLinkChain, linkDraftIds]);

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

  useEffect(() => {
    const url = state.captureImport?.image?.url ?? null;
    if (!url) {
      captureSourceRef.current = null;
      captureSourceUrlRef.current = null;
      underlayCacheRef.current = null;
      return;
    }
    if (captureSourceUrlRef.current === url && captureSourceRef.current) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      captureSourceRef.current = img;
      captureSourceUrlRef.current = url;
      underlayCacheRef.current = null;
      setDragTick((n) => n + 1);
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [state.captureImport?.image?.url]);

  useEffect(() => {
    if (state.captureImport?.phase !== "place") {
      underlayCacheRef.current = null;
    }
  }, [state.captureImport?.phase, state.captureImport?.homography]);

  useEffect(() => {
    let alive = true;
    const bump = () => {
      if (alive) setFontsEpoch((n) => n + 1);
    };
    void document.fonts.load('700 16px "Noto Sans JP"').then(bump);
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener("loadingdone", bump);
    };
  }, []);

  /** Space+ドラッグ = パン（入力中・モーダルでは Space を奪わない） */
  useEffect(() => {
    const clearSpace = () => {
      spaceHeldRef.current = false;
      setSpacePanReady(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      if (keyboardBlocksSpacePan()) return;
      e.preventDefault();
      spaceHeldRef.current = true;
      setSpacePanReady(true);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      clearSpace();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearSpace);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearSpace);
    };
  }, []);

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
        suppressMatchBanner,
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
        suppressMatchBanner,
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
    const pixelW = Math.max(1, Math.floor(w * dpr));
    const pixelH = Math.max(1, Math.floor(h * dpr));
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { outer, pitch, bannerH, frame } = resolveSurfaceLayout(
      w,
      h,
      board,
      view,
      state.broadcast,
      suppressMatchBanner,
    );
    const d = drag.current;
    const draggingPieceId =
      d?.mode === "piece" || d?.mode === "piece-line" || d?.mode === "piece-rotate"
        ? d.id
        : d?.mode === "capture-draft-piece"
          ? d.id
          : null;
    // 配信の面積比は 16:9 フレーム基準（マット外は分母に入れない）
    const frameArea = frame ? frame.w * frame.h : w * h;
    const pitchArea = (pitch.w * pitch.h) / frameArea;
    const ground = state.broadcast
      ? BROADCAST_MATTE
      : outerFillForBoard(board);

    let captureUnderlay: {
      canvas: HTMLCanvasElement;
      opacity: number;
    } | null = null;
    const cap = state.captureImport;
    if (
      !state.broadcast &&
      cap?.phase === "place" &&
      cap.homography &&
      cap.image &&
      captureSourceRef.current
    ) {
      const cacheKey = captureUnderlayCacheKey(
        cap.image.url,
        cap.homography,
        pitch.w,
        pitch.h,
      );
      if (underlayCacheRef.current?.key !== cacheKey) {
        const built = buildCaptureUnderlayCanvas(
          captureSourceRef.current,
          cap.homography,
          pitch.w,
          pitch.h,
        );
        underlayCacheRef.current = built
          ? { key: cacheKey, canvas: built }
          : null;
      }
      if (underlayCacheRef.current) {
        captureUnderlay = {
          canvas: underlayCacheRef.current.canvas,
          opacity: cap.underlayOpacity,
        };
      }
    }

    drawBoard(ctx, pitch, boardWithActiveViewport(board), scene, {
      selectedPieceId: draggingPieceId ?? state.selectedPieceId,
      selectedPieceIds: selectedIdsRef.current,
      selectedObjectId: state.selectedObjectId,
      selectedBallId:
        d?.mode === "ball" ? d.id : state.selectedBallId,
      selectionColor: state.selectionColor,
      interactiveChrome: !state.broadcast,
      watermark: state.watermark,
      watermarkImage,
      outer,
      background: ground,
      broadcastFrame: frame,
      dragVisual:
        d?.mode === "piece" || d?.mode === "piece-line"
          ? { pieceId: d.id, boost: d.boost }
          : d?.mode === "ball"
            ? { ballId: d.id, ball: true, boost: d.boost }
            : null,
      previewLine:
        (d?.mode === "line" || d?.mode === "piece-line") &&
        d.points.length >= 2
          ? { kind: d.kind, points: smoothLinePath(d.points) }
          : null,
      previewZone:
        d?.mode === "zone"
          ? { x0: d.x0, y0: d.y0, x1: d.x1, y1: d.y1 }
          : null,
      previewShape:
        d?.mode === "shape-create"
          ? previewShapeFromDrag(
              d.kind,
              { x: d.x0, y: d.y0 },
              { x: d.x1, y: d.y1 },
              board,
              pitch,
              { lockAspect: d.lockAspect },
            )
          : null,
      previewMarquee:
        d?.mode === "marquee"
          ? { x0: d.x0, y0: d.y0, x1: d.x1, y1: d.y1 }
          : null,
      previewPen:
        d?.mode === "pen" && d.points && d.points.length >= 1
          ? d.points
          : null,
      previewLink: (() => {
        if (state.tool !== "link" || !scene || linkDraftIds.length === 0) {
          return null;
        }
        const pts = resolveLinkPoints(scene.pieces, linkDraftIds);
        if (linkHoverWorld) pts.push(linkHoverWorld);
        return pts.length >= 1 ? pts : null;
      })(),
      ballImage,
      editingTextId: textEdit?.objectId ?? null,
      liveTextRotation:
        d?.mode === "text-rotate"
          ? { id: d.id, deg: d.liveDeg }
          : null,
      liveShapeRotation:
        d?.mode === "shape-rotate"
          ? { id: d.id, deg: d.liveDeg }
          : null,
      captureUnderlay,
      draftPieces:
        cap?.phase === "place" ? cap.draftPieces : undefined,
      draftBall: cap?.phase === "place" ? cap.draftBall : undefined,
      selectedDraftPieceId:
        cap?.phase === "place" ? cap.selectedDraftPieceId : undefined,
      selectedDraftBall:
        cap?.phase === "place" ? cap.selectedDraftBall : undefined,
      draftDragPieceId:
        d?.mode === "capture-draft-piece" ? d.id : undefined,
      draftDragBall: d?.mode === "capture-draft-ball",
    });
    if (bannerH > 0) {
      if (frame) {
        ctx.save();
        ctx.translate(frame.x, frame.y);
        drawMatchBanner(
          ctx,
          frame.w,
          frame.h,
          board,
          t("cardY2CLabel"),
          t("subInjured"),
        );
        ctx.restore();
      } else {
        drawMatchBanner(ctx, w, h, board, t("cardY2CLabel"), t("subInjured"));
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
    state.selectedPieceIds,
    state.selectedObjectId,
    state.selectedBallId,
    state.selectionColor,
    state.watermark,
    watermarkImage,
    ballImage,
    state.broadcast,
    dragTick,
    view,
    textEdit,
    fontsEpoch,
    linkDraftIds,
    linkHoverWorld,
    state.tool,
    state.captureImport,
  ]);

  if (!board || !scene || !view) return null;

  const getNorm = (e: ReactPointerEvent) => {
    const norm = normFromClient(e.clientX, e.clientY);
    if (!norm) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { pitch } = resolveSurfaceLayout(
      canvas.clientWidth,
      canvas.clientHeight,
      board,
      view,
      state.broadcast,
      suppressMatchBanner,
    );
    return { norm, pitch };
  };

  const normFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { pitch } = resolveSurfaceLayout(
      canvas.clientWidth,
      canvas.clientHeight,
      board,
      view,
      state.broadcast,
      suppressMatchBanner,
    );
    return toNorm(clientX, clientY, canvas, pitch);
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
      suppressMatchBanner,
    );
    const norm = toNorm(e.clientX, e.clientY, canvas, pitch);
    if (!norm) return null;
    return hitTestPiece(board, scene, pitch, norm.x, norm.y);
  };

  const commitTextEdit = (value: string) => {
    const session = textEditRef.current;
    if (!session) return;
    const trimmed = value.replace(/^\s+|\s+$/g, "");
    const fromTextTool = state.tool === "text";
    if (session.objectId) {
      state.updateText(session.objectId, trimmed);
      state.setSelectedObjectId(trimmed ? session.objectId : null);
    } else if (trimmed) {
      state.addText(session.worldX, session.worldY, trimmed, {
        width: session.worldWidth,
      });
    }
    setTextEdit(null);
    if (fromTextTool) state.setTool("select");
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
    worldWidth?: number;
    color?: string;
    fontFamily?: import("../models/types").TextFontId;
  }) => {
    if (textEditRef.current) commitTextEdit(textEditRef.current.draft);
    setTextEdit({
      worldX: opts.worldX,
      worldY: opts.worldY,
      fontSizeNorm: opts.fontSizeNorm ?? TEXT_DEFAULT_FONT_SIZE,
      worldWidth: opts.worldWidth,
      objectId: opts.objectId,
      draft: opts.initial,
      color: opts.color,
      fontFamily: opts.fontFamily,
    });
  };

  // Inspector / touch: open inline editor for selected text
  useEffect(() => {
    const id = state.textEditRequestId;
    if (!id || !board || !scene) return;
    const obj = scene.objects.find((o) => o.id === id && o.type === "text");
    state.clearTextEditRequest();
    if (!obj || obj.type !== "text") return;
    state.setSelectedBall(false);
    state.setSelectedPieceId(null);
    state.setSelectedObjectId(obj.id);
    openTextEdit({
      worldX: obj.x,
      worldY: obj.y,
      initial: obj.text,
      objectId: obj.id,
      fontSizeNorm: obj.fontSize,
      worldWidth: obj.width,
      color: obj.color,
      fontFamily: obj.fontFamily,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.textEditRequestId]);

  const objectAtEvent = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { pitch } = resolveSurfaceLayout(
      canvas.clientWidth,
      canvas.clientHeight,
      board,
      view,
      state.broadcast,
      suppressMatchBanner,
    );
    const norm = toNorm(e.clientX, e.clientY, canvas, pitch);
    if (!norm) return null;
    return hitTestObject(board, scene, norm.x, norm.y, pitch);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { pitch } = resolveSurfaceLayout(
      canvas.clientWidth,
      canvas.clientHeight,
      board,
      view,
      state.broadcast,
      suppressMatchBanner,
    );
    const norm = toNorm(e.clientX, e.clientY, canvas, pitch);
    if (!norm) return;
    if (state.selectedObjectId) {
      const selText = scene.objects.find(
        (o) => o.id === state.selectedObjectId && o.type === "text",
      );
      if (
        selText?.type === "text" &&
        hitTestTextObjectHandle(selText, board, pitch, norm.x, norm.y)
      ) {
        return;
      }
      const selShape = scene.objects.find(
        (o) => o.id === state.selectedObjectId && o.type === "shape",
      );
      if (
        selShape?.type === "shape" &&
        hitTestShapeObjectHandle(selShape, board, pitch, norm.x, norm.y)
      ) {
        return;
      }
    }
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
      worldWidth: obj.width,
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

    // 中ボタン or Alt+ドラッグ or Space+ドラッグ = パン
    if (
      !viewLocked &&
      (e.button === 1 ||
        (e.button === 0 && (e.altKey || spaceHeldRef.current)))
    ) {
      e.preventDefault();
      drag.current = {
        mode: "pan",
        lastClientX: e.clientX,
        lastClientY: e.clientY,
      };
      setSpacePanning(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    const cap = state.captureImport;
    const inCapturePlace =
      !state.broadcast &&
      cap?.phase === "place" &&
      !!cap.homography;

    if (inCapturePlace) {
      const draftScene = {
        ...scene,
        pieces: cap.draftPieces,
        balls: cap.draftBall
          ? [
              {
                id: scene.balls[0]?.id ?? "draft-ball",
                ...cap.draftBall,
              },
            ]
          : scene.balls,
      };

      if (state.tool === "ball") {
        state.setCaptureDraftBall(world.x, world.y);
        state.setSelectedBall(false);
        drag.current = { mode: "capture-draft-ball", boost: 1.2 };
        canvas.setPointerCapture(e.pointerId);
        paint();
        return;
      }

      if (state.tool === "piece-home") {
        state.addCaptureDraftPiece(world.x, world.y, "home");
        paint();
        return;
      }
      if (state.tool === "piece-away") {
        state.addCaptureDraftPiece(world.x, world.y, "away");
        paint();
        return;
      }

      if (
        cap.draftBall &&
        hitTestBall(board, draftScene, pitch, norm.x, norm.y)
      ) {
        state.selectCaptureDraftBall();
        drag.current = { mode: "capture-draft-ball", boost: 1.2 };
        canvas.setPointerCapture(e.pointerId);
        paint();
        return;
      }

      const pieceHit = hitTestPiecePointer(
        board,
        draftScene,
        pitch,
        norm.x,
        norm.y,
      );
      const draftPiece = pieceHit?.piece ?? null;
      if (draftPiece) {
        state.selectCaptureDraftPiece(draftPiece.id);
        drag.current = {
          mode: "capture-draft-piece",
          id: draftPiece.id,
          lastX: world.x,
          lastY: world.y,
          boost: 1.18,
        };
        canvas.setPointerCapture(e.pointerId);
        paint();
        return;
      }

      state.selectCaptureDraftPiece(null);
      return;
    }

    if (state.tool === "ball") {
      const targetId =
        state.selectedBallId &&
        scene.balls.some((b) => b.id === state.selectedBallId)
          ? state.selectedBallId
          : scene.balls[scene.balls.length - 1]?.id ??
            scene.balls[0]?.id;
      if (!targetId) return;
      state.moveBall(targetId, world.x, world.y, true);
      state.setSelectedBallId(targetId);
      state.setSelectedPieceId(null);
      state.setSelectedObjectId(null);
      drag.current = {
        mode: "ball",
        id: targetId,
        recorded: true,
        boost: 1.2,
      };
      canvas.setPointerCapture(e.pointerId);
      paint();
      return;
    }

    if (state.tool === "select") {
      // Text / Shape handles beat piece/ball/object (selected object only)
      if (
        !state.broadcast &&
        state.selectedObjectId &&
        textEditRef.current?.objectId !== state.selectedObjectId
      ) {
        const selText = scene.objects.find(
          (o) => o.id === state.selectedObjectId && o.type === "text",
        );
        if (selText?.type === "text") {
          const handle = hitTestTextObjectHandle(
            selText,
            board,
            pitch,
            norm.x,
            norm.y,
          );
          if (handle) {
            const geom = computeTextGeometry(selText, board, pitch);
            if (geom) {
              e.preventDefault();
              state.setSelectedBall(false);
              state.setSelectedPieceId(null);
              if (handle === "rotate") {
                const rect = canvas.getBoundingClientRect();
                drag.current = {
                  mode: "text-rotate",
                  id: selText.id,
                  centerX: rect.left + geom.cx,
                  centerY: rect.top + geom.cy,
                  startRotationDeg: geom.rotationDeg,
                  pointerX: e.clientX,
                  pointerY: e.clientY,
                  liveDeg: geom.rotationDeg,
                  recorded: false,
                };
              } else {
                drag.current = {
                  mode: "text-resize",
                  id: selText.id,
                  handle,
                  startX: geom.worldX,
                  startY: geom.worldY,
                  startW: geom.worldW,
                  startH: geom.worldH,
                  startRotationDeg: geom.rotationDeg,
                  pointerX: world.x,
                  pointerY: world.y,
                  recorded: false,
                };
              }
              canvas.setPointerCapture(e.pointerId);
              bumpDragVisual();
              return;
            }
          }
        }
        const selShape = scene.objects.find(
          (o) => o.id === state.selectedObjectId && o.type === "shape",
        );
        if (selShape?.type === "shape") {
          const handle = hitTestShapeObjectHandle(
            selShape,
            board,
            pitch,
            norm.x,
            norm.y,
          );
          if (handle) {
            const geom = computeShapeGeometry(selShape, board, pitch);
            if (geom) {
              e.preventDefault();
              state.setSelectedBall(false);
              state.setSelectedPieceId(null);
              if (handle === "rotate") {
                if (!geom.showRotateHandle) return;
                const rect = canvas.getBoundingClientRect();
                drag.current = {
                  mode: "shape-rotate",
                  id: selShape.id,
                  centerX: rect.left + geom.cx,
                  centerY: rect.top + geom.cy,
                  startRotationDeg: geom.rotationDeg,
                  pointerX: e.clientX,
                  pointerY: e.clientY,
                  liveDeg: geom.rotationDeg,
                  recorded: false,
                };
              } else {
                // Start from tight display box so letterboxed circle/triangle
                // don't keep empty padding after the first resize.
                const tight = tightDisplayWorldBox(geom, board);
                drag.current = {
                  mode: "shape-resize",
                  id: selShape.id,
                  handle,
                  kind: selShape.kind,
                  startX: tight.x,
                  startY: tight.y,
                  startW: tight.w,
                  startH: tight.h,
                  startRotationDeg: geom.rotationDeg,
                  pointerX: world.x,
                  pointerY: world.y,
                  recorded: false,
                };
              }
              canvas.setPointerCapture(e.pointerId);
              bumpDragVisual();
              return;
            }
          }
        }
      }
      // ボール → 駒 → 描画。ロゴ透かしは描画のみ（位置は Settings）
      const ballHit = hitTestBall(board, scene, pitch, norm.x, norm.y);
      if (ballHit) {
        state.captureUndo();
        state.setSelectedBallId(ballHit.id);
        state.setSelectedPieceId(null);
        state.setSelectedObjectId(null);
        drag.current = {
          mode: "ball",
          id: ballHit.id,
          recorded: true,
          boost: 1.2,
        };
        canvas.setPointerCapture(e.pointerId);
        paint();
        return;
      }
      // 重なりは上の駒を優先。本体 → 移動、空き地の向き三角 → 回転
      const pieceHit = hitTestPiecePointer(
        board,
        scene,
        pitch,
        norm.x,
        norm.y,
      );
      if (
        pieceHit?.action === "rotate" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const facingPiece = pieceHit.piece;
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
        paint();
        return;
      }
      const piece = pieceHit?.piece ?? null;
      if (piece) {
        const toggle = e.ctrlKey || e.metaKey;
        const add = e.shiftKey && !toggle;
        if (toggle || add) {
          const cur = selectedIdsRef.current;
          const next = toggle
            ? cur.includes(piece.id)
              ? cur.filter((id) => id !== piece.id)
              : [...cur, piece.id]
            : cur.includes(piece.id)
              ? cur
              : [...cur, piece.id];
          selectedIdsRef.current = next;
          if (toggle) state.togglePieceSelected(piece.id);
          else state.addPieceSelected(piece.id);
          state.setSelectedBall(false);
          state.setSelectedObjectId(null);
          paint();
          return;
        }
        const group =
          selectedIdsRef.current.includes(piece.id) &&
          selectedIdsRef.current.length > 0
            ? selectedIdsRef.current
            : [piece.id];
        selectedIdsRef.current = group;
        state.captureUndo();
        state.setSelectedBall(false);
        if (group.length === 1) state.setSelectedPieceId(piece.id);
        state.setSelectedObjectId(null);
        drag.current = {
          mode: "piece",
          id: piece.id,
          ids: group,
          lastX: world.x,
          lastY: world.y,
          startX: piece.x,
          startY: piece.y,
          recorded: true,
          boost: 1.18,
        };
        canvas.setPointerCapture(e.pointerId);
        paint();
        return;
      }
      const obj = hitTestObject(board, scene, norm.x, norm.y, pitch);
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
        } else if (obj.type === "shape") {
          drag.current = {
            mode: "shape",
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
      drag.current = {
        mode: "marquee",
        x0: world.x,
        y0: world.y,
        x1: world.x,
        y1: world.y,
        additive: e.ctrlKey || e.metaKey || e.shiftKey,
      };
      canvas.setPointerCapture(e.pointerId);
      bumpDragVisual();
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
      const pieceHit = hitTestPiecePointer(
        board,
        scene,
        pitch,
        norm.x,
        norm.y,
      );
      if (pieceHit?.action === "rotate") {
        const facingPiece = pieceHit.piece;
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
        paint();
        return;
      }
      const piece = pieceHit?.piece ?? null;
      if (
        piece &&
        (state.tool === "run" || state.tool === "dribble")
      ) {
        state.captureUndo();
        state.setSelectedBall(false);
        state.setSelectedPieceId(piece.id);
        state.setSelectedObjectId(null);
        drag.current = {
          mode: "piece-line",
          kind: state.tool,
          id: piece.id,
          startX: piece.x,
          startY: piece.y,
          lastX: world.x,
          lastY: world.y,
          points: [{ x: piece.x, y: piece.y }],
          recorded: true,
          boost: 1.18,
        };
        canvas.setPointerCapture(e.pointerId);
        paint();
        return;
      }
      const lineStart = piece
        ? { x: piece.x, y: piece.y }
        : { x: world.x, y: world.y };
      if (piece) {
        state.setSelectedBall(false);
        state.setSelectedPieceId(piece.id);
        state.setSelectedObjectId(null);
      }
      drag.current = {
        mode: "line",
        kind: state.tool,
        points: [lineStart],
      };
      canvas.setPointerCapture(e.pointerId);
      bumpDragVisual();
      return;
    }

    if (state.tool === "zone") {
      // Shape tool: edit selected / existing shapes first (PP / Slides),
      // then drag empty pitch to create. Avoid forcing a Select round-trip.
      if (!state.broadcast && state.selectedObjectId) {
        const selShape = scene.objects.find(
          (o) => o.id === state.selectedObjectId && o.type === "shape",
        );
        if (selShape?.type === "shape") {
          const handle = hitTestShapeObjectHandle(
            selShape,
            board,
            pitch,
            norm.x,
            norm.y,
          );
          if (handle) {
            const geom = computeShapeGeometry(selShape, board, pitch);
            if (geom) {
              e.preventDefault();
              state.setSelectedBall(false);
              state.setSelectedPieceId(null);
              if (handle === "rotate") {
                if (!geom.showRotateHandle) return;
                const rect = canvas.getBoundingClientRect();
                drag.current = {
                  mode: "shape-rotate",
                  id: selShape.id,
                  centerX: rect.left + geom.cx,
                  centerY: rect.top + geom.cy,
                  startRotationDeg: geom.rotationDeg,
                  pointerX: e.clientX,
                  pointerY: e.clientY,
                  liveDeg: geom.rotationDeg,
                  recorded: false,
                };
              } else {
                const tight = tightDisplayWorldBox(geom, board);
                drag.current = {
                  mode: "shape-resize",
                  id: selShape.id,
                  handle,
                  kind: selShape.kind,
                  startX: tight.x,
                  startY: tight.y,
                  startW: tight.w,
                  startH: tight.h,
                  startRotationDeg: geom.rotationDeg,
                  pointerX: world.x,
                  pointerY: world.y,
                  recorded: false,
                };
              }
              canvas.setPointerCapture(e.pointerId);
              bumpDragVisual();
              return;
            }
          }
          const geom = computeShapeGeometry(selShape, board, pitch);
          if (geom && pointInShape(geom, norm.x, norm.y)) {
            state.setSelectedBall(false);
            state.setSelectedPieceId(null);
            drag.current = {
              mode: "shape",
              id: selShape.id,
              lastX: world.x,
              lastY: world.y,
              recorded: false,
            };
            canvas.setPointerCapture(e.pointerId);
            bumpDragVisual();
            return;
          }
        }
      }
      const hitShape = hitTestObject(board, scene, norm.x, norm.y, pitch);
      if (hitShape?.type === "shape") {
        state.setSelectedBall(false);
        state.setSelectedPieceId(null);
        state.setSelectedObjectId(hitShape.id);
        drag.current = {
          mode: "shape",
          id: hitShape.id,
          lastX: world.x,
          lastY: world.y,
          recorded: false,
        };
        canvas.setPointerCapture(e.pointerId);
        bumpDragVisual();
        return;
      }
      // Empty pitch → new shape (sticky tool). Clear selection so a follow-up
      // drag cannot be mistaken for moving the previous create.
      state.setSelectedBall(false);
      state.setSelectedPieceId(null);
      state.setSelectedObjectId(null);
      const css = fromNorm(norm.x, norm.y, pitch);
      const rectLock =
        state.shapeKind === "rect" && state.shapeAspectLock;
      drag.current = {
        mode: "shape-create",
        kind: state.shapeKind,
        x0: css.x,
        y0: css.y,
        x1: css.x,
        y1: css.y,
        lockAspect: e.shiftKey || rectLock,
      };
      canvas.setPointerCapture(e.pointerId);
      bumpDragVisual();
      return;
    }

    if (state.tool === "link") {
      e.preventDefault();
      const piece = hitTestPiece(board, scene, pitch, norm.x, norm.y);
      if (piece) {
        const last = linkDraftIds[linkDraftIds.length - 1];
        if (last === piece.id) {
          if (linkDraftIds.length >= 2) finishLinkChain(linkDraftIds);
          else {
            setLinkDraftIds([]);
            setLinkHoverWorld(null);
          }
          paint();
          return;
        }
        if (linkDraftIds.includes(piece.id)) {
          paint();
          return;
        }
        setLinkDraftIds([...linkDraftIds, piece.id]);
        setLinkHoverWorld(null);
        state.setSelectedPieceId(piece.id);
        state.setSelectedObjectId(null);
        state.setSelectedBall(false);
        paint();
        return;
      }
      if (linkDraftIds.length >= 2) {
        finishLinkChain(linkDraftIds);
      } else {
        setLinkDraftIds([]);
        setLinkHoverWorld(null);
      }
      paint();
      return;
    }

    if (state.tool === "pen") {
      drag.current = {
        mode: "pen",
        x0: world.x,
        y0: world.y,
        points: [{ x: world.x, y: world.y }],
        straight: e.shiftKey,
      };
      canvas.setPointerCapture(e.pointerId);
      bumpDragVisual();
      return;
    }

    if (state.tool === "text") {
      e.preventDefault();
      const placed = placeNewTextBox(world.x, world.y);
      openTextEdit({
        worldX: placed.x,
        worldY: placed.y,
        worldWidth: placed.width,
        initial: "",
      });
      return;
    }
  };

  const setCanvasCursor = (cursor: string) => {
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = cursor;
  };

  const updateHoverCursor = (e: ReactPointerEvent) => {
    if (state.broadcast || state.tool !== "select" || viewLocked) {
      setCanvasCursor("");
      return;
    }
    if (textEditRef.current) {
      setCanvasCursor("text");
      return;
    }
    const hit = getNorm(e);
    if (!hit?.norm || !board || !scene) {
      setCanvasCursor("");
      return;
    }
    if (state.selectedObjectId) {
      const selText = scene.objects.find(
        (o) => o.id === state.selectedObjectId && o.type === "text",
      );
      if (selText?.type === "text") {
        const handle = hitTestTextObjectHandle(
          selText,
          board,
          hit.pitch,
          hit.norm.x,
          hit.norm.y,
        );
        if (handle === "rotate") {
          setCanvasCursor("grab");
          return;
        }
        if (handle) {
          const geom = computeTextGeometry(selText, board, hit.pitch);
          setCanvasCursor(
            textResizeCursor(handle, geom?.rotationDeg ?? 0),
          );
          return;
        }
        const geom = computeTextGeometry(selText, board, hit.pitch);
        if (
          geom &&
          pointInTextBox(geom, hit.norm.x, hit.norm.y, 0.004)
        ) {
          setCanvasCursor("move");
          return;
        }
      }
      const selShape = scene.objects.find(
        (o) => o.id === state.selectedObjectId && o.type === "shape",
      );
      if (selShape?.type === "shape") {
        const handle = hitTestShapeObjectHandle(
          selShape,
          board,
          hit.pitch,
          hit.norm.x,
          hit.norm.y,
        );
        if (handle === "rotate") {
          setCanvasCursor("grab");
          return;
        }
        if (handle) {
          const geom = computeShapeGeometry(selShape, board, hit.pitch);
          setCanvasCursor(
            shapeResizeCursor(handle, geom?.rotationDeg ?? 0),
          );
          return;
        }
        const geom = computeShapeGeometry(selShape, board, hit.pitch);
        if (geom && pointInShape(geom, hit.norm.x, hit.norm.y)) {
          setCanvasCursor("move");
          return;
        }
      }
    }
    const obj = hitTestObject(
      board,
      scene,
      hit.norm.x,
      hit.norm.y,
      hit.pitch,
    );
    if (obj?.type === "text" || obj?.type === "shape") {
      setCanvasCursor("move");
      return;
    }
    setCanvasCursor("");
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (
      state.tool === "link" &&
      linkDraftIds.length > 0 &&
      !drag.current
    ) {
      const hit = getNorm(e);
      if (hit?.norm && board) {
        const world = pitchToWorld(hit.norm.x, hit.norm.y, board);
        setLinkHoverWorld(world);
        bumpDragVisual();
      }
      return;
    }

    if (!drag.current) {
      updateHoverCursor(e);
    } else if (
      drag.current.mode === "text-rotate" ||
      drag.current.mode === "shape-rotate"
    ) {
      setCanvasCursor("grabbing");
    } else if (drag.current.mode === "text-resize") {
      setCanvasCursor(
        textResizeCursor(
          drag.current.handle,
          drag.current.startRotationDeg,
        ),
      );
    } else if (drag.current.mode === "shape-resize") {
      setCanvasCursor(
        shapeResizeCursor(
          drag.current.handle,
          drag.current.startRotationDeg,
        ),
      );
    } else if (
      drag.current.mode === "text" ||
      drag.current.mode === "shape"
    ) {
      setCanvasCursor("move");
    }

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
        suppressMatchBanner,
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

    if (d.mode === "marquee") {
      d.x1 = world.x;
      d.y1 = world.y;
      bumpDragVisual();
      return;
    }

    if (d.mode === "capture-draft-ball") {
      state.setCaptureDraftBall(world.x, world.y);
      bumpDragVisual();
      return;
    }

    if (d.mode === "capture-draft-piece") {
      const grab = state.captureImport?.draftPieces.find((p) => p.id === d.id);
      if (!grab) return;
      const dx = world.x - grab.x;
      const dy = world.y - grab.y;
      const dist = Math.hypot(dx, dy);
      let facing: number | undefined;
      if (dist > 0.004) {
        facing = (Math.atan2(dy, dx) * 180) / Math.PI;
        d.lastX = world.x;
        d.lastY = world.y;
        d.boost = Math.min(1.28, 1.12 + dist * 8);
      }
      state.moveCaptureDraftPiece(d.id, world.x, world.y, facing);
      bumpDragVisual();
      return;
    }

    if (d.mode === "ball") {
      const prev = scene.balls.find((b) => b.id === d.id);
      if (!prev) return;
      const dist = Math.hypot(world.x - prev.x, world.y - prev.y);
      if (dist > 0.003) d.boost = Math.min(1.32, 1.14 + dist * 10);
      state.moveBall(d.id, world.x, world.y, !d.recorded);
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
      const grab = scene.pieces.find((p) => p.id === d.id);
      if (!grab) return;
      const dx = world.x - grab.x;
      const dy = world.y - grab.y;
      const dist = Math.hypot(dx, dy);
      let facing: number | undefined;
      if (dist > 0.004) {
        facing = (Math.atan2(dy, dx) * 180) / Math.PI;
        d.lastX = world.x;
        d.lastY = world.y;
        d.boost = Math.min(1.28, 1.12 + dist * 8);
      }
      state.movePiecesBy(d.ids, dx, dy, false, d.id, facing);
      bumpDragVisual();
      return;
    }

    if (d.mode === "piece-line") {
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
      state.movePiece(d.id, world.x, world.y, false, facing);
      const last = d.points[d.points.length - 1]!;
      if (Math.hypot(world.x - last.x, world.y - last.y) >= 0.008) {
        d.points.push({ x: world.x, y: world.y });
      }
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
      const corner = zoneDragCorner(d.x0, d.y0, world.x, world.y, e.shiftKey);
      d.x1 = corner.x;
      d.y1 = corner.y;
      bumpDragVisual();
      return;
    }

    if (d.mode === "shape-create") {
      const css = fromNorm(hit.norm.x, hit.norm.y, hit.pitch);
      d.x1 = css.x;
      d.y1 = css.y;
      d.lockAspect =
        e.shiftKey || (d.kind === "rect" && state.shapeAspectLock);
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

    if (d.mode === "shape") {
      const shapeObj = scene.objects.find(
        (o) => o.id === d.id && o.type === "shape",
      );
      if (shapeObj && shapeObj.type === "shape") {
        const dx = world.x - d.lastX;
        const dy = world.y - d.lastY;
        if (Math.hypot(dx, dy) > 0.001) {
          state.moveShape(
            d.id,
            shapeObj.x + dx,
            shapeObj.y + dy,
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

    if (d.mode === "text-resize") {
      const next = applyTextResize(
        {
          x: d.startX,
          y: d.startY,
          width: d.startW,
          height: d.startH,
          rotationDeg: d.startRotationDeg,
        },
        d.handle,
        world.x,
        world.y,
        { x: d.pointerX, y: d.pointerY },
        board,
        hit.pitch,
      );
      state.patchText(
        d.id,
        {
          x: next.x,
          y: next.y,
          width: next.width,
          height: next.height,
        },
        !d.recorded,
      );
      d.recorded = true;
      bumpDragVisual();
      return;
    }

    if (d.mode === "text-rotate") {
      // Angles in CSS client space (isotropic) — matches Canvas rotate()
      const live = rotationDegFromDrag(
        { x: d.centerX, y: d.centerY },
        { x: d.pointerX, y: d.pointerY },
        { x: e.clientX, y: e.clientY },
        d.startRotationDeg,
        e.shiftKey,
      );
      d.liveDeg = live;
      state.patchText(
        d.id,
        { rotationDeg: normalizeRotationDeg(live) },
        !d.recorded,
      );
      d.recorded = true;
      bumpDragVisual();
      return;
    }

    if (d.mode === "shape-resize") {
      const next = applyShapeResize(
        {
          x: d.startX,
          y: d.startY,
          w: d.startW,
          h: d.startH,
          rotationDeg: d.startRotationDeg,
          kind: d.kind,
        },
        d.handle,
        world.x,
        world.y,
        { x: d.pointerX, y: d.pointerY },
        board,
        hit.pitch,
        {
          lockAspect:
            e.shiftKey || (d.kind === "rect" && state.shapeAspectLock),
        },
      );
      state.patchShape(
        d.id,
        { x: next.x, y: next.y, w: next.w, h: next.h },
        !d.recorded,
      );
      d.recorded = true;
      bumpDragVisual();
      return;
    }

    if (d.mode === "shape-rotate") {
      const live = rotationDegFromDrag(
        { x: d.centerX, y: d.centerY },
        { x: d.pointerX, y: d.pointerY },
        { x: e.clientX, y: e.clientY },
        d.startRotationDeg,
        e.shiftKey,
      );
      d.liveDeg = live;
      state.patchShape(
        d.id,
        { rotationDeg: normalizeRotationDeg(live) },
        !d.recorded,
      );
      d.recorded = true;
      bumpDragVisual();
      return;
    }

    if (d.mode === "pen" && d.points) {
      if (d.straight) {
        d.points.length = 0;
        d.points.push({ x: d.x0, y: d.y0 }, { x: world.x, y: world.y });
        bumpDragVisual();
      } else if (
        samplePenPointerEvents(e.nativeEvent, d.points, board, normFromClient)
      ) {
        bumpDragVisual();
      }
    }
  };

  const onPointerCancel = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (
      d?.mode === "text-rotate" ||
      d?.mode === "text-resize" ||
      d?.mode === "shape-rotate" ||
      d?.mode === "shape-resize" ||
      d?.mode === "shape"
    ) {
      drag.current = null;
      if (d.recorded) {
        // Drop the history entry pushed on first move; restore pre-drag board
        state.rollbackLastHistory();
      }
      bumpDragVisual();
      try {
        (e.target as Element)?.releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }
    onPointerUp(e);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d?.mode === "pan") setSpacePanning(false);
    bumpDragVisual();
    if (!d) return;
    if (d.mode === "text-rotate") {
      // Commit normalized angle (history already recorded on first move)
      state.patchText(
        d.id,
        { rotationDeg: normalizeRotationDeg(d.liveDeg) },
        false,
      );
      return;
    }
    if (d.mode === "shape-rotate") {
      state.patchShape(
        d.id,
        { rotationDeg: normalizeRotationDeg(d.liveDeg) },
        false,
      );
      return;
    }
    const hit = getNorm(e);
    if (!hit?.norm) return;
    const world = pitchToWorld(hit.norm.x, hit.norm.y, board);

    if (d.mode === "marquee") {
      d.x1 = world.x;
      d.y1 = world.y;
      const tiny =
        Math.abs(d.x1 - d.x0) < 0.012 && Math.abs(d.y1 - d.y0) < 0.012;
      if (tiny) {
        if (!d.additive) {
          state.setSelectedBall(false);
          state.setSelectedPieceId(null);
          state.setSelectedObjectId(null);
        }
        return;
      }
      state.selectPiecesInRect(d.x0, d.y0, d.x1, d.y1, d.additive);
      return;
    }

    if (d.mode === "ball") {
      // 駒の近くにドロップするとくっつく（マルチ選択不要）
      state.dropBall(d.id, world.x, world.y);
      return;
    }

    if (d.mode === "piece") {
      if (d.ids.length > 1) return;
      // 別の駒の上にドロップ → 位置入れ替え（交代・解説用）
      const target = hitTestPieceForSwap(
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

    if (d.mode === "piece-line") {
      const last = d.points[d.points.length - 1]!;
      if (Math.hypot(world.x - last.x, world.y - last.y) >= 0.008) {
        d.points.push({ x: world.x, y: world.y });
      }
      const facing =
        (Math.atan2(world.y - d.startY, world.x - d.startX) * 180) / Math.PI;
      state.movePieceWithLine(
        d.id,
        world.x,
        world.y,
        d.kind,
        d.points,
        facing,
      );
      state.setSelectedPieceId(d.id);
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
      const corner = zoneDragCorner(d.x0, d.y0, world.x, world.y, e.shiftKey);
      const x = Math.min(d.x0, corner.x);
      const y = Math.min(d.y0, corner.y);
      const w = Math.abs(corner.x - d.x0);
      const h = Math.abs(corner.y - d.y0);
      if (w > 0.01 && h > 0.01) {
        state.addZone(x, y, w, h);
      }
    } else if (d.mode === "shape-create") {
      const css = fromNorm(hit.norm.x, hit.norm.y, hit.pitch);
      const box = shapeBoxFromDrag(
        d.kind,
        { x: d.x0, y: d.y0 },
        { x: css.x, y: css.y },
        board,
        hit.pitch,
        {
          lockAspect:
            e.shiftKey ||
            d.lockAspect ||
            (d.kind === "rect" && state.shapeAspectLock),
        },
      );
      if (box.w >= 0.01 && box.h >= 0.01) {
        state.addShape(d.kind, box);
      }
    } else if (d.mode === "pen" && d.points) {
      if (d.straight) {
        d.points.length = 0;
        d.points.push({ x: d.x0, y: d.y0 }, { x: world.x, y: world.y });
      } else {
        samplePenPointerEvents(e.nativeEvent, d.points, board, normFromClient);
      }
      const end = d.points[d.points.length - 1]!;
      if (
        d.points.length >= 2 &&
        Math.hypot(end.x - d.x0, end.y - d.y0) >= 0.008
      ) {
        state.addPen(d.points);
      }
    }
  };

  const surface = boardSurfaceRef.current;
  const editingObj =
    textEdit?.objectId != null
      ? scene.objects.find(
          (o) => o.id === textEdit.objectId && o.type === "text",
        )
      : null;
  const textOverlay =
    textEdit && surface
      ? editingObj && editingObj.type === "text"
        ? textOverlayForObject(
            surface.clientWidth,
            surface.clientHeight,
            board,
            view,
            {
              ...editingObj,
              text: textEdit.draft,
              x: textEdit.worldX,
              y: textEdit.worldY,
            },
            state.broadcast,
          )
        : textOverlayRect(
            surface.clientWidth,
            surface.clientHeight,
            board,
            view,
            textEdit.worldX,
            textEdit.worldY,
            textEdit.fontSizeNorm,
            state.broadcast,
            textEdit.worldWidth,
          )
      : null;

  return (
    <div
      className={`board-surface${state.broadcast ? " broadcast" : ""}`}
      ref={boardSurfaceRef}
      data-board-surface="true"
      data-tool={state.tool}
      data-space-pan={spacePanReady || spacePanning ? "true" : undefined}
      data-space-panning={spacePanning ? "true" : undefined}
      style={{
        background: state.broadcast
          ? BROADCAST_MATTE
          : outerFillForBoard(board),
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      />
      {state.tool === "link" && linkDraftIds.length > 0 && (
        <div className="link-draft-status" role="status">
          {t("linkDraftStatus").replace("{n}", String(linkDraftIds.length))}
        </div>
      )}
      {textEdit && textOverlay && (
        <CanvasTextEditor
          board={board}
          left={textOverlay.left}
          top={textOverlay.top}
          fontSize={textOverlay.fontSize}
          width={textOverlay.width}
          lineHeight={textOverlay.lineHeight}
          wrap={textOverlay.wrap}
          rotationDeg={textOverlay.rotationDeg}
          originX={textOverlay.originX}
          originY={textOverlay.originY}
          align={textOverlay.align}
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
