/**
 * P0: landscape ↔ portrait must not wipe content.
 * Run: npx --yes tsx scripts/pitch-orientation-lock-check.ts
 */
import { createBoard } from "../src/models/defaults.ts";
import type {
  BoardDocument,
  LineObject,
  Piece,
  ShapeObject,
} from "../src/models/types.ts";
import {
  boardHasContentBlockingOrientationChange,
  canChangeSoccerPitchOrientation,
  planSoccerPitchLookApply,
  resetAllScenesForOrientationChange,
  soccerPitchLookPresetToBoardFields,
  SOCCER_PITCH_LOOK_ORDER,
  type SoccerPitchLookPreset,
} from "../src/presets/pitchLook.ts";
import { applyLineupToScenePieces } from "../src/presets/roster.ts";
import { kitsFromBoard } from "../src/models/kits.ts";
import {
  portableToJsonString,
  serializeBoardToPortable,
} from "../src/boardio/serializeBoard.ts";
import { parsePortableBoardJson } from "../src/boardio/parseBoard.ts";
import { DEFAULT_VIEWPORT } from "../src/presets/viewport.ts";

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

function emptyPortrait(): BoardDocument {
  return createBoard("soccer", "Empty Portrait", "en", {
    pitchOrientation: "portrait",
  });
}

function emptyLandscapeCleared(): BoardDocument {
  const b = createBoard("soccer", "Empty Landscape", "en");
  // Fresh landscape has tactical seed — clear to true empty.
  return {
    ...b,
    scenes: b.scenes.map((s) => ({
      ...s,
      pieces: [],
      objects: [],
      balls: [{ id: "b1", x: 0.5, y: 0.5, attachedTo: null }],
      viewport: { ...DEFAULT_VIEWPORT },
    })),
    viewport: { ...DEFAULT_VIEWPORT },
  };
}

function withContent(base: BoardDocument): BoardDocument {
  const lineup = applyLineupToScenePieces(
    base.sport,
    {
      players: [
        { number: "1", label: "GK" },
        { number: "9", label: "ST" },
      ],
      starterNumbers: ["1", "9"],
    },
    {
      players: [{ number: "10", label: "CAM" }],
      starterNumbers: ["10"],
    },
    base.benchCount,
    kitsFromBoard(base),
    base.pitchOrientation,
  );
  const manual: Piece = {
    ...lineup[0]!,
    id: "manual-1",
    number: "99",
    label: "Manual",
    x: 0.33,
    y: 0.44,
  };
  const line: LineObject = {
    id: "line-1",
    type: "line",
    kind: "pass",
    points: [
      { x: 0.2, y: 0.2 },
      { x: 0.4, y: 0.3 },
    ],
    color: "#fff",
    strokeWidth: 2,
  };
  const shape: ShapeObject = {
    id: "shape-1",
    type: "shape",
    kind: "rect",
    x: 0.5,
    y: 0.5,
    w: 0.1,
    h: 0.08,
    fillColor: "#00ff00",
    fillOpacity: 0.4,
  };
  const scene0 = base.scenes[0]!;
  const scene1 = {
    ...scene0,
    id: "scene-other",
    label: "Other",
    pieces: lineup.slice(0, 1).map((p) => ({ ...p, id: "other-p0" })),
    objects: [] as typeof scene0.objects,
    balls: [
      {
        id: "ball-other",
        x: 0.2,
        y: 0.8,
        attachedTo: "other-p0",
      },
    ],
  };
  return {
    ...base,
    roster: {
      home: {
        players: [
          { number: "1", label: "GK" },
          { number: "9", label: "ST" },
        ],
        starterNumbers: ["1", "9"],
      },
      away: {
        players: [{ number: "10", label: "CAM" }],
        starterNumbers: ["10"],
      },
    },
    scenes: [
      {
        ...scene0,
        pieces: [...lineup, manual],
        objects: [line, shape],
        balls: [
          {
            id: "ball-1",
            x: 0.5,
            y: 0.5,
            attachedTo: lineup[0]!.id,
          },
          { id: "ball-2", x: 0.1, y: 0.9, attachedTo: null },
        ],
        viewport: { zoom: 1.5, cx: 0.4, cy: 0.6 },
      },
      scene1,
    ],
  };
}

function snapshot(board: BoardDocument) {
  return JSON.stringify({
    orientation: board.pitchOrientation,
    view: board.pitchView,
    flipped: board.pitchFlipped,
    rosterHome: board.roster.home.starterNumbers,
    scenes: board.scenes.map((s) => ({
      id: s.id,
      label: s.label,
      pieces: s.pieces.map((p) => [p.id, p.x, p.y, p.number]),
      objects: s.objects.map((o) => o.id),
      balls: s.balls.map((b) => [b.id, b.x, b.y, b.attachedTo ?? null]),
      viewport: s.viewport,
    })),
  });
}

// --- empty boards may change orientation ---
{
  const p = emptyPortrait();
  assert(!boardHasContentBlockingOrientationChange(p), "empty portrait pristine");
  assert(
    canChangeSoccerPitchOrientation(p, "landscapeFull"),
    "empty portrait → landscape allowed",
  );
  const plan = planSoccerPitchLookApply(p, "landscapeFull");
  assert(plan.action === "orientation_reset", "empty portrait plan reset");
  const next = resetAllScenesForOrientationChange(
    p,
    soccerPitchLookPresetToBoardFields("landscapeFull"),
  );
  assert(next.pitchOrientation === "landscape", "empty → landscape applied");
  assert(next.scenes[0]!.pieces.length === 0, "still empty pieces");
}

{
  const l = emptyLandscapeCleared();
  assert(
    !boardHasContentBlockingOrientationChange(l),
    "cleared landscape pristine",
  );
  assert(
    canChangeSoccerPitchOrientation(l, "portraitFull"),
    "empty landscape → portrait allowed",
  );
}

// --- seeded landscape (default tactical) blocks ---
{
  const seeded = createBoard("soccer", "Seeded", "en");
  assert(
    boardHasContentBlockingOrientationChange(seeded),
    "default landscape seed blocks",
  );
  assert(
    !canChangeSoccerPitchOrientation(seeded, "portraitFull"),
    "seeded → portrait blocked",
  );
  assert(
    planSoccerPitchLookApply(seeded, "portraitFull").action ===
      "blocked_orientation",
    "seeded plan blocked",
  );
}

// --- content board: orientation blocked, same-orientation ok ---
{
  const content = withContent(emptyLandscapeCleared());
  const before = snapshot(content);
  assert(
    planSoccerPitchLookApply(content, "portraitFull").action ===
      "blocked_orientation",
    "content → portrait blocked",
  );
  assert(
    planSoccerPitchLookApply(content, "portraitHalfTop").action ===
      "blocked_orientation",
    "content → portraitHalfTop blocked",
  );
  const half = planSoccerPitchLookApply(content, "landscapeHalfRight");
  assert(half.action === "fields", "same orientation half allowed");
  const afterHalf = { ...content, ...half.fields };
  assert(
    snapshot({ ...content, pitchView: "full" }).includes('"pieces"') &&
      snapshot(afterHalf) !== before
      ? afterHalf.scenes[0]!.pieces.length === content.scenes[0]!.pieces.length
      : true,
    "half switch keeps piece count",
  );
  assert(
    afterHalf.scenes[0]!.pieces.length === content.scenes[0]!.pieces.length,
    "pieces preserved on half",
  );
  assert(
    afterHalf.scenes[0]!.objects.length === content.scenes[0]!.objects.length,
    "objects preserved on half",
  );
  assert(
    afterHalf.scenes[1]!.balls[0]!.attachedTo === "other-p0",
    "other scene ball attach preserved on half",
  );
  // blocked path must not mutate
  assert(snapshot(content) === before, "blocked leaves board untouched");
}

// --- viewport-only edit blocks ---
{
  const b = emptyLandscapeCleared();
  const edited = {
    ...b,
    scenes: b.scenes.map((s) => ({
      ...s,
      viewport: { zoom: 2, cx: 0.5, cy: 0.5 },
    })),
  };
  assert(
    boardHasContentBlockingOrientationChange(edited),
    "custom viewport blocks",
  );
}

// --- moved ball blocks ---
{
  const b = emptyLandscapeCleared();
  const edited = {
    ...b,
    scenes: b.scenes.map((s) => ({
      ...s,
      balls: [{ id: "b1", x: 0.2, y: 0.3, attachedTo: null }],
    })),
  };
  assert(
    boardHasContentBlockingOrientationChange(edited),
    "moved ball blocks",
  );
}

// --- matrix: content never CLEARs via plan ---
{
  const content = withContent(emptyLandscapeCleared());
  for (const from of SOCCER_PITCH_LOOK_ORDER) {
    const startPlan = planSoccerPitchLookApply(
      emptyLandscapeCleared(),
      from,
    );
    let board =
      startPlan.action === "orientation_reset"
        ? resetAllScenesForOrientationChange(
            emptyLandscapeCleared(),
            startPlan.fields,
          )
        : startPlan.action === "fields"
          ? { ...emptyLandscapeCleared(), ...startPlan.fields }
          : emptyLandscapeCleared();
    board = withContent(board);
    const before = snapshot(board);
    for (const to of SOCCER_PITCH_LOOK_ORDER) {
      const plan = planSoccerPitchLookApply(board, to as SoccerPitchLookPreset);
      if (plan.action === "orientation_reset") {
        assert(false, `content ${from}->${to} must not reset`);
      }
      if (plan.action === "blocked_orientation") {
        assert(snapshot(board) === before, `blocked ${from}->${to} immutable`);
      }
    }
  }
}

// --- JSON export after blocked attempt still has content ---
{
  const content = withContent(emptyLandscapeCleared());
  const plan = planSoccerPitchLookApply(content, "portraitFull");
  assert(plan.action === "blocked_orientation", "json case blocked");
  const json = portableToJsonString(serializeBoardToPortable(content));
  const parsed = parsePortableBoardJson(json);
  assert(parsed.scenes[0]!.pieces.length > 0, "json keeps pieces");
  assert(parsed.scenes[0]!.objects.length > 0, "json keeps objects");
  assert(parsed.scenes.length === 2, "json keeps scene count");
}

if (failed) {
  console.error(`pitch-orientation-lock-check: ${failed} failure(s)`);
  process.exit(1);
}
console.log("pitch-orientation-lock-check: PASS");
