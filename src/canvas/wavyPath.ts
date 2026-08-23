/** 欧米コーチング図式: ドリブル = 進行方向に沿った波線（wavy / serpentine） */

export type Point2 = { x: number; y: number };

function dist(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function polylineLength(pts: Point2[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += dist(pts[i - 1], pts[i]);
  }
  return len;
}

function lerp(a: Point2, b: Point2, t: number): Point2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function sampleQuadratic(p0: Point2, p1: Point2, p2: Point2, spacing: number): Point2[] {
  const chord = dist(p0, p2);
  const steps = Math.max(2, Math.ceil(chord / spacing));
  const out: Point2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    });
  }
  return out;
}

/** strokePolyline と同じ二次曲線上を等間隔サンプル（角を丸めた中心線） */
export function sampleSmoothCenterline(pts: Point2[], spacing: number): Point2[] {
  if (pts.length < 2) return pts.map((p) => ({ ...p }));
  if (pts.length === 2) {
    const len = dist(pts[0], pts[1]);
    const steps = Math.max(2, Math.ceil(len / spacing));
    const out: Point2[] = [];
    for (let i = 0; i <= steps; i++) {
      out.push(lerp(pts[0], pts[1], i / steps));
    }
    return out;
  }

  const out: Point2[] = [{ ...pts[0] }];
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i].x + pts[i + 1].x) / 2;
    const yc = (pts[i].y + pts[i + 1].y) / 2;
    const seg = sampleQuadratic(
      out[out.length - 1],
      { x: pts[i].x, y: pts[i].y },
      { x: xc, y: yc },
      spacing,
    );
    out.push(...seg.slice(1));
  }
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const tail = sampleQuadratic(out[out.length - 1], prev, last, spacing);
  out.push(...tail.slice(1));
  return out;
}

function tangentAt(center: Point2[], i: number): { tx: number; ty: number } {
  const r = 3;
  const i0 = Math.max(0, i - r);
  const i1 = Math.min(center.length - 1, i + r);
  const dx = center[i1].x - center[i0].x;
  const dy = center[i1].y - center[i0].y;
  const len = Math.hypot(dx, dy) || 1;
  return { tx: dx / len, ty: dy / len };
}

function bendFade(center: Point2[], i: number): number {
  if (i <= 0) return 1;
  const a0 = Math.atan2(tangentAt(center, i - 1).ty, tangentAt(center, i - 1).tx);
  const a1 = Math.atan2(tangentAt(center, i).ty, tangentAt(center, i).tx);
  let d = Math.abs(a1 - a0);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return Math.max(0, 1 - d / 0.55);
}

/**
 * ユーザが引いた経路に沿った波線。
 * - 中心線は平滑化曲線（角の折れ波を回避）
 * - 波長は固定。距離が伸びれば波の数が増える（伸ばし伸ばししない）
 */
export function wavyPathFromPolyline(
  pts: Point2[],
  amplitude: number,
): Point2[] {
  if (pts.length < 2) return pts;

  const spacing = Math.max(3, amplitude * 1.1);
  const center = sampleSmoothCenterline(pts, spacing);
  const total = polylineLength(center);
  if (total < 4) return center;

  // 振幅に比例した固定波長（px）。短い線でも最低 ~1 周期は見えるようにする
  const wavelength = Math.max(22, amplitude * 6.5);
  const waveCount = Math.max(1, total / wavelength);

  const arc: number[] = [0];
  for (let i = 1; i < center.length; i++) {
    arc.push(arc[i - 1] + dist(center[i - 1], center[i]));
  }
  const totalS = arc[arc.length - 1] || 1;

  const out: Point2[] = [];
  for (let i = 0; i < center.length; i++) {
    const { tx, ty } = tangentAt(center, i);
    const nx = -ty;
    const ny = tx;
    // 弧長に沿って一定波長で位相を進める（長さで波を引き伸ばさない）
    const phase = (arc[i] / totalS) * waveCount * Math.PI * 2;
    const fade = bendFade(center, i);
    const a = amplitude * fade;
    out.push({
      x: center[i].x + nx * a * Math.sin(phase),
      y: center[i].y + ny * a * Math.sin(phase),
    });
  }
  return out;
}

/** 矢印向きは波の揺れではなく経路全体の終端接線 */
export function endTangentAngle(pts: Point2[]): number {
  const center = sampleSmoothCenterline(pts, 6);
  if (center.length < 2) return 0;
  const tail = Math.max(0, center.length - 4);
  const a = center[tail];
  const b = center[center.length - 1];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function strokeWavyPath(
  ctx: CanvasRenderingContext2D,
  pts: Point2[],
) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i].x + pts[i + 1].x) / 2;
    const yc = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
  }
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
  ctx.stroke();
}

export function drawArrowHeadAt(
  ctx: CanvasRenderingContext2D,
  tip: Point2,
  angle: number,
  lw: number,
  fill: string,
) {
  const head = 8 + lw * 2;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(
    tip.x - head * Math.cos(angle - Math.PI / 7),
    tip.y - head * Math.sin(angle - Math.PI / 7),
  );
  ctx.lineTo(
    tip.x - head * Math.cos(angle + Math.PI / 7),
    tip.y - head * Math.sin(angle + Math.PI / 7),
  );
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
