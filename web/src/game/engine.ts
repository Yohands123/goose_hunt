import { BBox, LngLat, XY, bboxOf, centroid, dist, inBBox, nearestOnLine, pointInRing, project } from "./geo";

// ---------- map data ----------
export interface MapData {
  meta: { attribution: string; builtAt: string };
  cities: { id: string; name: string; color: string; ring: LngLat[] }[];
  territories: { id: string; name: string; city: string; ring: LngLat[] }[];
  streets: { id: string; name: string; route: string; desc: string; line: LngLat[] }[];
  ion: { line: LngLat[]; stations: { name: string; at: LngLat }[] };
  busStops: { name: string; at: LngLat }[];
  landmarks: { name: string; kind: string; at: LngLat }[];
}
export interface City { id: string; name: string; color: string; ring: XY[]; bbox: BBox }
export interface Territory { id: string; name: string; city: string; ring: XY[]; bbox: BBox; center: XY }
export interface Street { id: string; name: string; route: string; desc: string; line: XY[]; bbox: BBox }
export interface Place { name: string; kind: string; p: XY }

export interface World {
  cities: City[]; territories: Territory[]; streets: Street[];
  ionLine: XY[]; places: Place[]; bbox: BBox; attribution: string;
}

export function buildWorld(d: MapData): World {
  const ring = (r: LngLat[]) => r.map(project);
  const cities = d.cities.map((c) => { const r = ring(c.ring); return { ...c, ring: r, bbox: bboxOf(r) }; });
  const territories = d.territories.map((t) => { const r = ring(t.ring); return { ...t, ring: r, bbox: bboxOf(r), center: centroid(r) }; });
  const streets = d.streets.map((s) => { const l = ring(s.line); return { ...s, line: l, bbox: bboxOf(l) }; });
  const places: Place[] = [
    ...d.landmarks.map((l) => ({ name: l.name, kind: l.kind, p: project(l.at) })),
    ...d.ion.stations.map((s) => ({ name: s.name.endsWith("Station") ? s.name : `${s.name} Station`, kind: "ion", p: project(s.at) })),
    ...d.busStops.map((s) => ({ name: s.name, kind: "bus", p: project(s.at) })),
  ];
  return {
    cities, territories, streets, ionLine: ring(d.ion.line), places,
    bbox: bboxOf(cities.flatMap((c) => c.ring)), attribution: d.meta.attribution,
  };
}

// ---------- zones (the area the goose must stay in) ----------
export const STREET_HALF_WIDTH_M = 250;

export interface Zone { kind: "city" | "street"; id: string; name: string; bbox: BBox; spawn: XY; contains(p: XY): boolean }

export function cityZone(w: World, id: string): Zone {
  const c = w.cities.find((x) => x.id === id)!;
  const ts = w.territories.filter((t) => t.city === id);
  const spawn = ts.reduce((a, t) => (dist(t.center, centroid(c.ring)) < dist(a, centroid(c.ring)) ? t.center : a), ts[0].center);
  return { kind: "city", id, name: c.name, bbox: c.bbox, spawn, contains: (p) => inBBox(p, c.bbox) && pointInRing(p, c.ring) };
}

export function streetZone(w: World, id: string): Zone {
  const s = w.streets.find((x) => x.id === id)!;
  return {
    kind: "street", id, name: s.name, bbox: s.bbox, spawn: s.line[Math.floor(s.line.length / 2)],
    contains: (p) => inBBox(p, s.bbox, STREET_HALF_WIDTH_M) && nearestOnLine(p, s.line).d <= STREET_HALF_WIDTH_M,
  };
}

export function territoryAt(w: World, p: XY): Territory | null {
  for (const t of w.territories) if (inBBox(p, t.bbox) && pointInRing(p, t.ring)) return t;
  return null;
}

// ---------- GPS smoothing + motion classification ----------
export type Motion = "stand" | "waddle" | "drive" | "fly";
export const classify = (kmh: number): Motion => (kmh < 3 ? "stand" : kmh < 15 ? "waddle" : kmh < 150 ? "drive" : "fly");

export interface Fix { p: XY; t: number } // t = simulated seconds
export interface TrackOut { p: XY; kmh: number; motion: Motion }

/**
 * smoothing on:  median of the last 3 fixes (throws away single GPS spikes),
 *                then an exponential moving average, speed measured over a
 *                ~4-fix window, and a new motion state must hold for 3 fixes.
 * smoothing off: every raw fix is believed instantly — the goose twitches.
 */
export class Tracker {
  private raw: Fix[] = [];
  private smoothed: Fix[] = [];
  private motion: Motion = "stand";
  private pending: { m: Motion; n: number } = { m: "stand", n: 0 };
  constructor(public smoothing = true) {}

  /** Plain-JSON copy of the tracker, so a server can keep it in Redis between requests. */
  snapshot() {
    return { smoothing: this.smoothing, raw: this.raw, smoothed: this.smoothed, motion: this.motion, pending: this.pending };
  }
  static restore(s: ReturnType<Tracker["snapshot"]>): Tracker {
    const t = new Tracker(s.smoothing);
    Object.assign(t, { raw: s.raw, smoothed: s.smoothed, motion: s.motion, pending: s.pending });
    return t;
  }

  reset(p: XY, t: number) {
    this.raw = [{ p, t }];
    this.smoothed = [{ p, t }];
    this.motion = "stand";
    this.pending = { m: "stand", n: 0 };
  }

  push(f: Fix): TrackOut {
    this.raw.push(f);
    if (this.raw.length > 6) this.raw.shift();

    if (!this.smoothing) {
      const prev = this.raw[this.raw.length - 2] ?? f;
      const kmh = (dist(prev.p, f.p) / Math.max(1e-6, f.t - prev.t)) * 3.6;
      this.motion = classify(kmh);
      this.smoothed = [f];
      return { p: f.p, kmh, motion: this.motion };
    }

    const last3 = this.raw.slice(-3);
    const med = (k: "x" | "y") => last3.map((x) => x.p[k]).sort((a, b) => a - b)[Math.floor(last3.length / 2)];
    const prev = this.smoothed[this.smoothed.length - 1] ?? f;
    const p = { x: prev.p.x + 0.55 * (med("x") - prev.p.x), y: prev.p.y + 0.55 * (med("y") - prev.p.y) };
    this.smoothed.push({ p, t: f.t });
    if (this.smoothed.length > 5) this.smoothed.shift();

    const first = this.smoothed[0];
    const kmh = (dist(first.p, p) / Math.max(1e-6, f.t - first.t)) * 3.6;
    const m = classify(kmh);
    if (m === this.motion) this.pending = { m, n: 0 };
    else if (m === this.pending.m && ++this.pending.n >= 3) { this.motion = m; this.pending = { m, n: 0 }; }
    else if (m !== this.pending.m) this.pending = { m, n: 1 };
    return { p, kmh, motion: this.motion };
  }
}
