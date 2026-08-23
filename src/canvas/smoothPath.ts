export type Point2 = { x: number; y: number };

function dist(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(points: Point2[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += dist(points[i - 1], points[i]);
  }
  return len;
}

function perpendicularDistance(p: Point2, a: Point2, b: Point2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-12) return dist(p, a);
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq),
  );
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/** 軽い移動平均で手ブレを抑える（端点はそのまま） */
function lightSmooth(points: Point2[]): Point2[] {
  if (points.length <= 2) return points.map((p) => ({ ...p }));
  const out: Point2[] = [{ ...points[0] }];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    out.push({
      x: (a.x + b.x * 2 + c.x) / 4,
      y: (a.y + b.y * 2 + c.y) / 4,
    });
  }
  out.push({ ...points[points.length - 1] });
  return out;
}

function rdp(points: Point2[], epsilon: number): Point2[] {
  if (points.length <= 2) return points.map((p) => ({ ...p }));

  const start = points[0];
  const end = points[points.length - 1];
  let maxDist = 0;
  let idx = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      idx = i;
    }
  }

  if (maxDist <= epsilon) {
    return [{ ...start }, { ...end }];
  }

  const left = rdp(points.slice(0, idx + 1), epsilon);
  const right = rdp(points.slice(idx), epsilon);
  return [...left.slice(0, -1), ...right];
}

function isNearlyStraight(points: Point2[], threshold: number): boolean {
  if (points.length <= 2) return true;
  const start = points[0];
  const end = points[points.length - 1];
  if (dist(start, end) < 0.015) return true;
  let maxDev = 0;
  for (let i = 1; i < points.length - 1; i++) {
    maxDev = Math.max(
      maxDev,
      perpendicularDistance(points[i], start, end),
    );
  }
  return maxDev < threshold;
}

function subsample(points: Point2[], maxCount: number): Point2[] {
  if (points.length <= maxCount) return points;
  const out: Point2[] = [];
  for (let i = 0; i < maxCount; i++) {
    const t = i / (maxCount - 1);
    const idx = t * (points.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(points.length - 1, lo + 1);
    const f = idx - lo;
    out.push({
      x: points[lo].x * (1 - f) + points[hi].x * f,
      y: points[lo].y * (1 - f) + points[hi].y * f,
    });
  }
  return out;
}

/**
 * 自由描画の点列を FastDraw 系のなめらかな弧へ。
 * 始点・終点はユーザ入力を保持。直線に近い stroke は2点に潰す。
 */
export function smoothLinePath(points: Point2[]): Point2[] {
  if (points.length <= 2) return points.map((p) => ({ ...p }));

  const start = { ...points[0] };
  const end = { ...points[points.length - 1] };

  const filtered = lightSmooth(points);
  const len = pathLength(filtered);
  const straightThreshold = Math.max(0.008, len * 0.06);

  if (isNearlyStraight(filtered, straightThreshold)) {
    return [start, end];
  }

  const epsilon = Math.max(0.005, Math.min(0.018, len * 0.035));
  let simplified = rdp(filtered, epsilon);

  if (simplified.length > 10) {
    simplified = subsample(simplified, 10);
  }

  simplified[0] = start;
  simplified[simplified.length - 1] = end;
  return simplified;
}

/** 先頭から t (0–1) までの部分点列（プレビュー線の伸び用） */
export function polylineByProgress(points: Point2[], t: number): Point2[] {
  if (points.length === 0) return [];
  if (points.length === 1) return [{ ...points[0] }, { ...points[0] }];
  if (t <= 0) return [{ ...points[0] }, { ...points[0] }];
  if (t >= 1) return points.map((p) => ({ ...p }));

  const total = pathLength(points);
  if (total < 1e-9) return [{ ...points[0] }, { ...points[0] }];
  const target = total * t;
  let acc = 0;
  const out: Point2[] = [{ ...points[0] }];
  for (let i = 1; i < points.length; i++) {
    const seg = dist(points[i - 1], points[i]);
    if (acc + seg >= target) {
      const f = seg > 0 ? (target - acc) / seg : 0;
      out.push({
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * f,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * f,
      });
      return out;
    }
    acc += seg;
    out.push({ ...points[i] });
  }
  return out;
}

/** 点列上の t (0–1) 位置 */
export function pointOnPolyline(points: Point2[], t: number): Point2 {
  const partial = polylineByProgress(points, t);
  return partial[partial.length - 1] ?? points[0];
}
