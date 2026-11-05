/**
 * New board Landscape / Portrait creation paths.
 * Run: npx --yes tsx scripts/new-board-orientation-check.ts
 */
import { createBoard } from "../src/models/defaults.ts";
import {
  boardHasContentBlockingOrientationChange,
  planSoccerPitchLookApply,
} from "../src/presets/pitchLook.ts";

let failed = 0;
function assert(c: boolean, msg: string) {
  if (!c) {
    console.error("FAIL:", msg);
    failed += 1;
  }
}

{
  const land = createBoard("soccer", "L", "en", {
    pitchOrientation: "landscape",
  });
  assert(land.pitchOrientation === "landscape", "landscape orient");
  assert(land.scenes[0]!.pieces.length > 0, "landscape has tactical seed");
  assert(
    planSoccerPitchLookApply(land, "portraitFull").action ===
      "blocked_orientation",
    "seeded landscape cannot switch to portrait",
  );
}

{
  const port = createBoard("soccer", "P", "en", {
    pitchOrientation: "portrait",
  });
  assert(port.pitchOrientation === "portrait", "portrait orient");
  assert(port.scenes[0]!.pieces.length === 0, "portrait starts empty pieces");
  assert(port.scenes[0]!.objects.length === 0, "portrait starts empty objects");
  assert(
    !boardHasContentBlockingOrientationChange(port),
    "fresh portrait is pristine",
  );
  assert(
    planSoccerPitchLookApply(port, "landscapeFull").action ===
      "orientation_reset",
    "empty portrait may become landscape",
  );
  // After adding a piece, lock
  const withPiece = {
    ...port,
    scenes: port.scenes.map((s) => ({
      ...s,
      pieces: [
        {
          id: "p1",
          x: 0.5,
          y: 0.5,
          number: "9",
          label: "",
          color: "#fff",
          team: "home" as const,
          facing: 0,
          role: "starter" as const,
        },
      ],
    })),
  };
  assert(
    planSoccerPitchLookApply(withPiece, "landscapeFull").action ===
      "blocked_orientation",
    "portrait with content locked",
  );
}

if (failed) {
  console.error(`new-board-orientation-check: ${failed} failure(s)`);
  process.exit(1);
}
console.log("new-board-orientation-check: PASS");
