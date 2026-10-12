/**
 * Builds data/kwc.json — the single map file used by the web app, the API seed
 * and the Rust engine.
 *
 * Inputs
 *  - GRT GTFS (Region of Waterloo open data): ION line, ION stations, bus routes, bus stops.
 *  - Hand-traced city outlines (approximate; see README).
 *  - Neighbourhood anchor points. Territories = Voronoi cells of the anchors,
 *    clipped to each city outline — that gives the chunky board-game shapes.
 *
 * Usage: npx tsx build-map.ts <gtfsDir> <outFile>
 */
import { readFileSync, writeFileSync } from "node:fs";
import * as turf from "@turf/turf";

type LngLat = [number, number];
const [gtfsDir = "./gtfs", outFile = "./kwc.json"] = process.argv.slice(2);

// ---------- tiny CSV reader (GTFS has no quoted commas in the fields we use) ----------
function csv(path: string): Record<string, string>[] {
  const [head, ...rows] = readFileSync(path, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const keys = head.split(",");
  return rows.map((r) => Object.fromEntries(r.split(",").map((v, i) => [keys[i], v])));
}
const r5 = (n: number) => Math.round(n * 1e5) / 1e5;
const pt = (lat: number, lon: number): LngLat => [lon, lat];

// ---------- cities (approximate outlines, lat/lon, clockwise) ----------
const CITIES: Record<string, { name: string; color: string; ring: LngLat[] }> = {
  waterloo: {
    name: "Waterloo", color: "#d9a43a",
    ring: [pt(43.531, -80.585), pt(43.529, -80.53), pt(43.52, -80.495), pt(43.505, -80.472), pt(43.49, -80.466),
      pt(43.478, -80.484), pt(43.468, -80.497), pt(43.461, -80.507), pt(43.4585, -80.515), pt(43.455, -80.53),
      pt(43.449, -80.546), pt(43.44, -80.566), pt(43.432, -80.59), pt(43.44, -80.613), pt(43.46, -80.626),
      pt(43.49, -80.621), pt(43.515, -80.606)],
  },
  kitchener: {
    name: "Kitchener", color: "#5c9a3c",
    ring: [pt(43.49, -80.466), pt(43.486, -80.425), pt(43.46, -80.402), pt(43.44, -80.392), pt(43.42, -80.395),
      pt(43.405, -80.41), pt(43.385, -80.418), pt(43.369, -80.432), pt(43.372, -80.456), pt(43.379, -80.49), pt(43.385, -80.52), pt(43.4, -80.556),
      pt(43.415, -80.578), pt(43.432, -80.59), pt(43.44, -80.566), pt(43.449, -80.546), pt(43.455, -80.53),
      pt(43.4585, -80.515), pt(43.461, -80.507), pt(43.468, -80.497), pt(43.478, -80.484)],
  },
  cambridge: {
    name: "Cambridge", color: "#c4473a",
    ring: [pt(43.42, -80.395), pt(43.434, -80.378), pt(43.443, -80.34), pt(43.456, -80.31), pt(43.452, -80.285), pt(43.43, -80.25),
      pt(43.395, -80.235), pt(43.355, -80.25), pt(43.33, -80.29), pt(43.33, -80.34), pt(43.35, -80.38),
      pt(43.367, -80.41), pt(43.385, -80.418), pt(43.405, -80.41)],
  },
};

// ---------- neighbourhood anchors → territories ----------
const ANCHORS: Record<string, [string, number, number][]> = {
  waterloo: [
    ["UW Campus", 43.4723, -80.5449], ["Laurier", 43.4738, -80.527], ["Uptown", 43.4635, -80.5215],
    ["Lakeshore", 43.497, -80.537], ["Eastbridge", 43.483, -80.495], ["Westvale", 43.459, -80.567],
    ["Laurelwood", 43.488, -80.583], ["Columbia Forest", 43.468, -80.603],
  ],
  kitchener: [
    ["Downtown", 43.451, -80.49], ["Forest Heights", 43.43, -80.54], ["Williamsburg", 43.403, -80.528],
    ["Laurentian Hills", 43.419, -80.506], ["Country Hills", 43.413, -80.468], ["Fairview", 43.425, -80.44],
    ["Stanley Park", 43.452, -80.455], ["Bridgeport", 43.474, -80.468], ["Doon", 43.398, -80.43],
    ["Victoria Park", 43.438, -80.5],
  ],
  cambridge: [
    ["Preston", 43.395, -80.355], ["Hespeler", 43.43, -80.31], ["Galt", 43.36, -80.315],
    ["Blair", 43.385, -80.395], ["Cambridge Centre", 43.396, -80.318], ["East Galt", 43.362, -80.272],
  ],
};

const cities = Object.entries(CITIES).map(([id, c]) => ({ id, name: c.name, color: c.color, ring: [...c.ring, c.ring[0]] }));

const territories: { id: string; name: string; city: string; ring: LngLat[] }[] = [];
for (const city of cities) {
  const poly = turf.polygon([city.ring]);
  const bbox = turf.bbox(poly);
  const pts = turf.featureCollection(ANCHORS[city.id].map(([name, lat, lon]) => turf.point([lon, lat], { name })));
  const cells = turf.voronoi(pts, { bbox: [bbox[0] - 0.05, bbox[1] - 0.05, bbox[2] + 0.05, bbox[3] + 0.05] });
  cells.features.forEach((cell, i) => {
    if (!cell) return;
    const clipped = turf.intersect(turf.featureCollection([cell, poly]));
    if (!clipped) return;
    // keep the largest piece if clipping produced a MultiPolygon
    const geom = clipped.geometry;
    const rings = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
    const best = rings.sort((a, b) => turf.area(turf.polygon(b)) - turf.area(turf.polygon(a)))[0];
    const name = pts.features[i].properties!.name as string;
    territories.push({
      id: `${city.id}-${name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
      name, city: city.id,
      ring: (best[0] as LngLat[]).map(([x, y]) => [r5(x), r5(y)]),
    });
  });
}

// ---------- GTFS: ION + bus routes as streets ----------
function longestShape(dir: string, routeId: string): LngLat[] {
  const shapeIds = new Set(csv(`${gtfsDir}/${dir}/trips.txt`).filter((t) => t.route_id === routeId).map((t) => t.shape_id));
  const byShape = new Map<string, { s: number; p: LngLat }[]>();
  for (const row of csv(`${gtfsDir}/${dir}/shapes.txt`)) {
    if (!shapeIds.has(row.shape_id)) continue;
    const arr = byShape.get(row.shape_id) ?? [];
    arr.push({ s: +row.shape_pt_sequence, p: [+row.shape_pt_lon, +row.shape_pt_lat] });
    byShape.set(row.shape_id, arr);
  }
  let best: LngLat[] = [];
  for (const arr of byShape.values()) {
    const line = arr.sort((a, b) => a.s - b.s).map((x) => x.p);
    if (line.length > 1 && turf.length(turf.lineString(line)) > (best.length > 1 ? turf.length(turf.lineString(best)) : 0)) best = line;
  }
  // ~8 m tolerance keeps the shape honest while cutting the point count a lot
  return (turf.simplify(turf.lineString(best), { tolerance: 0.00008, highQuality: true }).geometry.coordinates as LngLat[])
    .map(([x, y]) => [r5(x), r5(y)]);
}

const STREETS: [string, string, string][] = [
  // [display name, GRT route id, short description]
  ["King St", "7", "Route 7 King: Conestoga Mall → Uptown → Downtown Kitchener → Fairview"],
  ["University Ave", "202", "iXpress 202 University: across Waterloo, past both campuses"],
  ["Columbia St", "31", "Route 31 Columbia: north Waterloo, east–west"],
  ["Erb St", "5", "Route 5 Erb: Uptown Waterloo out to the west side"],
  ["Weber St", "8", "Route 8 Weber: Waterloo to Fairview, parallel to King"],
  ["Fischer-Hallman Rd", "201", "iXpress 201: the long north–south spine on the west side"],
  ["Ottawa St", "205", "iXpress 205 Ottawa: across south Kitchener"],
  ["Hespeler Rd", "51", "Route 51 Hespeler: Galt up to Hespeler village"],
  ["ION bus to Cambridge", "302", "Route 302: Fairway Station → Cambridge"],
];
const streets = STREETS.map(([name, route, desc]) => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, "-"), name, route, desc, line: longestShape("bus", route),
}));
const ionLine = longestShape("lrt", "301");

const stationMap = new Map<string, LngLat[]>();
for (const s of csv(`${gtfsDir}/lrt/stops.txt`)) {
  const name = s.stop_name.replace(/ - (North|South)bound$/, "").replace("University Of", "University of");
  stationMap.set(name, [...(stationMap.get(name) ?? []), [+s.stop_lon, +s.stop_lat]]);
}
const ionStations = [...stationMap].map(([name, ps]) => ({
  name, at: [r5(ps.reduce((a, p) => a + p[0], 0) / ps.length), r5(ps.reduce((a, p) => a + p[1], 0) / ps.length)] as LngLat,
}));

// bus stops: one entry per stop name (both sides of the road collapse into one)
const stopMap = new Map<string, LngLat>();
for (const s of csv(`${gtfsDir}/bus/stops.txt`)) if (!stopMap.has(s.stop_name)) stopMap.set(s.stop_name, [r5(+s.stop_lon), r5(+s.stop_lat)]);
const busStops = [...stopMap].map(([name, at]) => ({ name, at }));

// approximate landmark positions (hand-placed)
const landmarks = ([
  ["University of Waterloo", 43.4723, -80.5449, "campus"], ["Wilfrid Laurier University", 43.4738, -80.5275, "campus"],
  ["Waterloo Park", 43.4665, -80.53, "park"], ["Conestoga Mall", 43.498, -80.528, "shop"],
  ["Waterloo Public Square", 43.4643, -80.5224, "plaza"], ["Columbia Lake", 43.477, -80.556, "park"],
  ["Kitchener City Hall", 43.452, -80.492, "civic"], ["Victoria Park", 43.4465, -80.499, "park"],
  ["Kitchener Market", 43.447, -80.485, "shop"], ["Grand River Hospital", 43.456, -80.511, "civic"],
  ["Fairview Park Mall", 43.4245, -80.439, "shop"], ["Chicopee", 43.43, -80.422, "park"],
  ["Waterloo Region Museum", 43.404, -80.431, "civic"], ["Cambridge Centre", 43.393, -80.323, "shop"],
  ["Ainslie Terminal (Galt)", 43.359, -80.315, "transit"], ["Hespeler Village", 43.433, -80.31, "plaza"],
  ["Preston Towne Centre", 43.397, -80.35, "plaza"], ["Region of Waterloo Airport", 43.457, -80.384, "airport"],
] as [string, number, number, string][]).map(([name, lat, lon, kind]) => ({ name, kind, at: [lon, lat] as LngLat }));

const out = {
  meta: {
    builtAt: new Date().toISOString().slice(0, 10),
    attribution: "Transit data: Grand River Transit GTFS, contains information provided by the Regional Municipality of Waterloo under licence. City outlines and landmarks are approximate.",
  },
  cities, territories, streets, ion: { line: ionLine, stations: ionStations }, busStops, landmarks,
};
writeFileSync(outFile, JSON.stringify(out));
console.log(`territories=${territories.length} streets=${streets.length} ionPts=${ionLine.length} stations=${ionStations.length} stops=${busStops.length} bytes=${JSON.stringify(out).length}`);
