/** 欧米コーチング図式: ドリブル = 進行方向に沿った波線（wavy / serpentine） */

export type Point2 = { x: number; y: number };

function polylineLength(pts: Point2[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

/** 弧長 t 上の点と接線（正規化） */
function pointAtLength(
  pts: Point2[],
  t: number,
): { x: number; y: number; tx: number; ty: number } {
  if (pts.length === 1) {
    return { x: pts[0].x, y: pts[0].y, tx: 1, ty: 0 };
  }
  let remain = Math.max(0, t);
  for (let i = 1; i < pts.length; i++) {
    const ax = pts[i - 1].x;
    const ay = pts[i - 1].y;
    const bx = pts[i].x;
    const by = pts[i].y;
    const seg = Math.hypot(bx - ax, by - ay);
    if (seg < 1e-9) continue;
    if (remain <= seg || i === pts.length - 1) {
      const u = seg < 1e-9 ? 0 : Math.min(1, remain / seg);
      const tx = (bx - ax) / seg;
      const ty = (by - ay) / seg;
      return {
        x: ax + (bx - ax) * u,
        y: ay + (by - ay) * u,
        tx,
        ty,
      };
    }
    remain -= seg;
  }
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const seg = Math.hypot(last.x - prev.x, last.y - prev.y) || 1;
  return {
    x: last.x,
    y: last.y,
    tx: (last.x - prev.x) / seg,
    ty: (last.y - prev.y) / seg,
  };
}

/**
 * ユーザが引いた経路（直線・曲線）に沿って波線を生成。
 * FA / US Youth / Hobbit 等の「wavy arrow = dribble」慣習。
 */
export function wavyPathFromPolyline(
  pts: Point2[],
  amplitude: number,
): Point2[] {
  if (pts.length < 2) return pts;
  const total = polylineLength(pts);
  if (total < 2) return pts;

  const waveLen = Math.max(10, amplitude * 4.2);
  const waveCount = Math.max(1.5, total / waveLen);
  const steps = Math.max(28, Math.ceil(waveCount * 14));

  const out: Point2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * total;
    const { x, y, tx, ty } = pointAtLength(pts, t);
    const nx = -ty;
    const ny = tx;
    const phase = (t / total) * waveCount * Math.PI * 2;
    out.push({
      x: x + nx * amplitude * Math.sin(phase),
      y: y + ny * amplitude * Math.sin(phase),
    });
  }
  return out;
}

/** 矢印向きは波の揺れではなく経路全体の終端接線を使う */
export function endTangentAngle(pts: Point2[]): number {
  const total = polylineLength(pts);
  const tail = Math.max(0, total - Math.min(18, total * 0.15));
  const a = pointAtLength(pts, tail);
  const b = pointAtLength(pts, total);
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function strokePointChain(
  ctx: CanvasRenderingContext2D,
  pts: Point2[],
) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
}

export function drawArrowHeadAt(
  ctx: CanvasRenderingContext2D,
  tip: Point2,
  angle: number,
  lw: number,
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
  ctx.fillStyle = ctx.strokeStyle as string;
  ctx.fill();
}
