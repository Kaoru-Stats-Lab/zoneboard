/**
 * Shape Integration Group 6 — arrange / appearance helpers.
 * Run: npx --yes tsx scripts/shape-arrange-check.ts
 */
import {
  arrangeDrawObject,
  shapeArrangeCan,
} from "../src/canvas/shapeArrange";
import {
  SHAPE_DEFAULT_FILL_OPACITY,
  createShapeObject,
  opacityToTransparencyPct,
  transparencyPctToOpacity,
} from "../src/models/shapeSanitize";
import { uid } from "../src/models/id";
import type { DrawObject, TextObject } from "../src/models/types";

function assert(c: boolean, m: string): asserts c {
  if (!c) throw new Error(m);
}
function assertClose(a: number, b: number, eps = 1e-9, m = "close") {
  assert(Math.abs(a - b) <= eps, `${m}: ${a} vs ${b}`);
}

const a = createShapeObject("circle", { id: "a", x: 0.1, y: 0.1 });
const b = createShapeObject("rect", { id: "b", x: 0.2, y: 0.2 });
const c = createShapeObject("triangle", { id: "c", x: 0.3, y: 0.3 });
const text: TextObject = {
  id: "t",
  type: "text",
  x: 0.4,
  y: 0.4,
  text: "hi",
  color: "#fff",
  fontSize: 0.035,
};
const objects: DrawObject[] = [a, b, text, c];

console.log("--- arrange front / back ---");
{
  const front = arrangeDrawObject(objects, "a", "front")!;
  assert(front[front.length - 1]!.id === "a", "a to end");
  assert(front[0]!.id === "b", "b stays relative");
  assert(arrangeDrawObject(front, "a", "front") === null, "noop front");

  const back = arrangeDrawObject(objects, "c", "back")!;
  assert(back[0]!.id === "c", "c to start");
  assert(arrangeDrawObject(back, "c", "back") === null, "noop back");
}

console.log("--- arrange forward / backward ---");
{
  // [a,b,text,c] — forward b → swap with text
  const fwd = arrangeDrawObject(objects, "b", "forward")!;
  assert(
    fwd.map((o) => o.id).join(",") === "a,t,b,c",
    `fwd got ${fwd.map((o) => o.id).join(",")}`,
  );
  const bwd = arrangeDrawObject(fwd, "b", "backward")!;
  assert(
    bwd.map((o) => o.id).join(",") === "a,b,t,c",
    "backward restores",
  );
}

console.log("--- can flags ---");
{
  const can0 = shapeArrangeCan(objects, "a");
  assert(can0.back === false && can0.backward === false, "a at back");
  assert(can0.front && can0.forward, "a can go forward");
  const canC = shapeArrangeCan(objects, "c");
  assert(canC.front === false && canC.forward === false, "c at front");
  assert(shapeArrangeCan(objects, "missing").front === false, "missing");
}

console.log("--- transparency mapping ---");
{
  assertClose(opacityToTransparencyPct(1), 0);
  assertClose(opacityToTransparencyPct(0), 100);
  assertClose(opacityToTransparencyPct(SHAPE_DEFAULT_FILL_OPACITY), 55);
  assertClose(transparencyPctToOpacity(55), 0.45, 1e-9);
  assertClose(transparencyPctToOpacity(0), 1);
  assertClose(transparencyPctToOpacity(100), 0);
}

console.log("--- duplicate id uniqueness smoke ---");
{
  const s = createShapeObject("triangle", { id: "src", x: 0.2, y: 0.2 });
  const copy = { ...s, id: uid(), x: s.x + 0.018, y: s.y + 0.018 };
  assert(copy.id !== s.id, "new id");
  assert(copy.fillColor === s.fillColor, "color");
  assert(copy.fillOpacity === s.fillOpacity, "opacity");
}

console.log("shape-arrange-check passed");
