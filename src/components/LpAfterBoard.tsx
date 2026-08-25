import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { loadBallImage } from "../assets/ballImages";
import { drawBoard } from "../canvas/drawBoard";
import { outerFillForBoard } from "../canvas/drawPitch";
import { fitField } from "../canvas/layout";
import { APP_LOCALE } from "../i18n/locale";
import type { MessageKey } from "../i18n/messages";
import { messages } from "../i18n/messages";
import { kitsFromBoard } from "../models/kits";
import { createScene } from "../models/scene";
import type { BoardDocument, Scene } from "../models/types";
import {
  createLpHeroData,
  lpHeroSceneComplete,
} from "../presets/lpHeroScene";
import { buildScenePreset } from "../presets/scenePresets";

type AfterTab = "kickoff" | "ck-right";

const TABS: { id: AfterTab; key: MessageKey }[] = [
  { id: "kickoff", key: "sceneDefaultSoccer" },
  { id: "ck-right", key: "scenePresetCkRightZonal" },
];

function frames(): Record<AfterTab, { board: BoardDocument; scene: Scene }> {
  const { board, scene } = createLpHeroData();
  const kickoffScene = lpHeroSceneComplete(scene, board);
  const preset = buildScenePreset(
    "ck-right-zonal",
    "soccer",
    board.benchCount,
    kitsFromBoard(board),
  );
  if (!preset) {
    return {
      kickoff: { board, scene: kickoffScene },
      "ck-right": { board, scene: kickoffScene },
    };
  }
  const ckScene = createScene(preset.label, preset.phase, {
    pieces: preset.pieces,
    ball: preset.ball,
    objects: [],
  });
  return {
    kickoff: { board, scene: kickoffScene },
    "ck-right": {
      board: { ...board, viewport: preset.viewport },
      scene: ckScene,
    },
  };
}

export function LpAfterBoard() {
  const t = (k: MessageKey) => messages[APP_LOCALE][k];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pack = useMemo(() => frames(), []);
  const packRef = useRef(pack);
  const tabRef = useRef<AfterTab>("kickoff");
  const ballImageRef = useRef<HTMLImageElement | null>(null);
  const paintRef = useRef<() => void>(() => {});
  const [tab, setTab] = useState<AfterTab>("kickoff");
  tabRef.current = tab;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let cancelled = false;

    const paint = () => {
      const frame = packRef.current[tabRef.current];
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

      const { board, scene } = frame;
      const { outer, pitch } = fitField(w, h, board, 4, board.viewport, 0);
      drawBoard(ctx, pitch, board, scene, {
        outer,
        background: outerFillForBoard(board),
        ballImage: ballImageRef.current,
      });
    };
    paintRef.current = paint;

    const ro = new ResizeObserver(() => paint());
    ro.observe(wrap);
    paint();
    loadBallImage("soccer").then((img) => {
      if (cancelled) return;
      ballImageRef.current = img;
      paint();
    });

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    paintRef.current();
  }, [tab]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, id: AfterTab) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = TABS.findIndex((item) => item.id === id);
    const next =
      TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    const el = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
      `[data-after-tab="${next.id}"]`,
    );
    el?.focus();
  };

  return (
    <figure className="lp-after-board">
      <div className="lp-after-scenes" role="tablist" aria-label={t("tabScenes")}>
        {TABS.map(({ id, key }) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-after-tab={id}
            id={`lp-after-tab-${id}`}
            aria-selected={tab === id}
            aria-controls="lp-after-panel"
            tabIndex={tab === id ? 0 : -1}
            className={tab === id ? "is-on" : undefined}
            onClick={() => setTab(id)}
            onKeyDown={(e) => onTabKey(e, id)}
          >
            {t(key)}
          </button>
        ))}
      </div>
      <div
        className="lp-board-canvas-wrap lp-after-canvas"
        id="lp-after-panel"
        ref={wrapRef}
        role="tabpanel"
        aria-labelledby={`lp-after-tab-${tab}`}
      >
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
    </figure>
  );
}
