/**
 * サッカー全表示（横/縦 × フル/ハーフ）の描画寸法が FIFA 105×68 と一致するか。
 * drawPitch.ts の式をミラーして検証。
 * Run: npx --yes tsx scripts/soccer-pitch-markings-audit.ts
 */
import { pitchToWorld, worldToPitch } from "../src/canvas/drawBoard.ts";
import type { BoardDocument } from "../src/models/types.ts";
import { aspectFor } from "../src/presets/sports.ts";
import {
  SOCCER_NORM,
  SOCCER_PITCH_M,
} from "../src/presets/soccerPitch.ts";

let failed = 0;
function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failed += 1;
}

const tol = 0.02; // m
function nearM(got: number, want: number, label: string) {
  if (Math.abs(got - want) > tol) {
    fail(`${label}: want ${want}m, got ${got.toFixed(3)}m`);
  }
}

type Mode = {
  id: string;
  portrait: boolean;
  half: boolean;
  /** ゴール↔ゴール方向 px */
  lengthPx: number;
  /** タッチライン方向 px */
  widthPx: number;
};

const MODES: Mode[] = [
  {
    id: "landscape-full",
    portrait: false,
    half: false,
    lengthPx: 1050,
    widthPx: 680,
  },
  {
    id: "landscape-half",
    portrait: false,
    half: true,
    lengthPx: 525,
    widthPx: 680,
  },
  {
    id: "portrait-full",
    portrait: true,
    half: false,
    lengthPx: 1050,
    widthPx: 680,
  },
  {
    id: "portrait-half",
    portrait: true,
    half: true,
    lengthPx: 525,
    widthPx: 680,
  },
];

const N = SOCCER_NORM;
const M = SOCCER_PITCH_M;
const penWidthM = M.penaltyAreaSide * 2 + M.goalWidth;

for (const mode of MODES) {
  const visLenM = mode.half ? M.length / 2 : M.length;
  const mPerLen = visLenM / mode.lengthPx;
  const mPerWid = M.width / mode.widthPx;

  const aspect = aspectFor(
    "soccer",
    mode.half ? "half" : "full",
    mode.portrait ? "portrait" : "landscape",
  );
  const pitchAspect = mode.portrait
    ? mode.widthPx / mode.lengthPx
    : mode.lengthPx / mode.widthPx;
  if (Math.abs(pitchAspect - aspect) > 1e-6) {
    fail(`${mode.id}: pitch aspect ${pitchAspect} != aspectFor ${aspect}`);
  }

  const crPx = N.centerR * mode.widthPx;
  nearM(crPx * mPerLen, M.centerCircleR, `${mode.id} center circle`);

  const penDepthPx =
    (mode.half ? N.penDepth * 2 : N.penDepth) * mode.lengthPx;
  nearM(penDepthPx * mPerLen, M.penaltyAreaDepth, `${mode.id} pen depth`);

  const penWidePx = N.penHalfH * 2 * mode.widthPx;
  nearM(penWidePx * mPerWid, penWidthM, `${mode.id} pen width`);

  const spotPx =
    (mode.half ? N.penSpot * 2 : N.penSpot) * mode.lengthPx;
  nearM(spotPx * mPerLen, M.penaltySpot, `${mode.id} pen spot`);

  const arcPx = (M.centerCircleR / visLenM) * mode.lengthPx;
  nearM(arcPx * mPerLen, M.centerCircleR, `${mode.id} pen arc`);

  const cornerPx = N.cornerR * mode.widthPx;
  nearM(cornerPx * mPerWid, M.cornerArcR, `${mode.id} corner arc`);
}

function roundtrip(mode: Mode, wx: number, wy: number) {
  const board = {
    sport: "soccer",
    pitchView: mode.half ? "half" : "full",
    pitchOrientation: mode.portrait ? "portrait" : "landscape",
    pitchFlipped: false,
  } as BoardDocument;
  const p = worldToPitch(wx, wy, board);
  if (!p) {
    fail(`${mode.id} worldToPitch null at ${wx},${wy}`);
    return;
  }
  const back = pitchToWorld(p.x, p.y, board);
  if (Math.abs(back.x - wx) > 1e-6 || Math.abs(back.y - wy) > 1e-6) {
    fail(
      `${mode.id} roundtrip (${wx},${wy}) -> (${p.x},${p.y}) -> (${back.x},${back.y})`,
    );
  }
}

for (const mode of MODES) {
  roundtrip(mode, 0.75, 0.5);
  if (!mode.half) {
    roundtrip(mode, 0.25, 0.3);
  }
}

if (failed) {
  console.error(`soccer-pitch-markings-audit failed (${failed})`);
  process.exit(1);
}
console.log("soccer-pitch-markings-audit passed (4 modes × markings + roundtrip)");
