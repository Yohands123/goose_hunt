// Geometry for the game. World units are metres on a local flat projection,
// which is accurate to well under 1% across a 40 km area like KW-Cambridge.

export type LngLat = [number, number];
export type XY = { x: number; y: number };

const LAT0 = 43.43;
const LON0 = -80.45;
const M_PER_DEG_LAT = 110_574;
const M_PER_DEG_LON = 111_320 * Math.cos((LAT0 * Math.PI) / 180);

export const project = ([lon, lat]: LngLat): XY => ({
  x: (lon - LON0) * M_PER_DEG_LON,
  y: (LAT0 - lat) * M_PER_DEG_LAT,
});
export const unproject = ({ x, y }: XY): LngLat => [x / M_PER_DEG_LON + LON0, LAT0 - y / M_PER_DEG_LAT];

export const dist = (a: XY, b: XY) => Math.hypot(a.x - b.x, a.y - b.y);

export type BBox = { minX: number; minY: number; maxX: number; maxY: number };
export function bboxOf(pts: XY[]): BBox {
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const p of pts) {
    if (p.x < b.minX) b.minX = p.x;
    if (p.y < b.minY) b.minY = p.y;
    if (p.x > b.maxX) b.maxX = p.x;
    if (p.y > b.maxY) b.maxY = p.y;
  }
  return b;
}
export const inBBox = (p: XY, b: BBox, pad = 0) =>
  p.x >= b.minX - pad && p.x <= b.maxX + pad && p.y >= b.minY - pad && p.y <= b.maxY + pad;

/** Ray casting. Ring may be open or closed. */
export function pointInRing(p: XY, ring: XY[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** Shortest distance from p to a polyline, plus the closest point on it. */
export function nearestOnLine(p: XY, line: XY[]): { d: number; at: XY; seg: number } {
  let best = { d: Infinity, at: line[0], seg: 0 };
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i], b = line[i + 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    const at = { x: a.x + t * dx, y: a.y + t * dy };
    const d = dist(p, at);
    if (d < best.d) best = { d, at, seg: i };
  }
  return best;
}

export function centroid(ring: XY[]): XY {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j].x * ring[i].y - ring[i].x * ring[j].y;
    a += f;
    cx += (ring[j].x + ring[i].x) * f;
    cy += (ring[j].y + ring[i].y) * f;
  }
  return a ? { x: cx / (3 * a), y: cy / (3 * a) } : ring[0];
}

/** Uniform grid for "what's near me" lookups: O(cells touched) instead of O(all points). */
export class GridIndex<T extends { p: XY }> {
  private cells = new Map<string, T[]>();
  constructor(items: T[], private size = 500) {
    for (const it of items) {
      const k = this.key(Math.floor(it.p.x / size), Math.floor(it.p.y / size));
      (this.cells.get(k) ?? this.cells.set(k, []).get(k)!).push(it);
    }
  }
  private key = (cx: number, cy: number) => `${cx},${cy}`;
  near(p: XY, radius: number): { item: T; d: number }[] {
    const out: { item: T; d: number }[] = [];
    const r = Math.ceil(radius / this.size);
    const cx = Math.floor(p.x / this.size), cy = Math.floor(p.y / this.size);
    for (let x = cx - r; x <= cx + r; x++)
      for (let y = cy - r; y <= cy + r; y++)
        for (const item of this.cells.get(this.key(x, y)) ?? []) {
          const d = dist(p, item.p);
          if (d <= radius) out.push({ item, d });
        }
    return out.sort((a, b) => a.d - b.d);
  }
}

export const pathD = (pts: XY[], close = false) =>
  pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join("") + (close ? "Z" : "");
