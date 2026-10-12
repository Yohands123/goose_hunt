import css from "./styles.css";
import { GOOSE, GooseState, gooseSvg } from "./art";
import { MapData, Motion, Territory, Tracker, World, Zone, buildWorld, cityZone, streetZone, territoryAt, STREET_HALF_WIDTH_M } from "./engine";
import { BBox, GridIndex, XY, dist, nearestOnLine, pathD, project, unproject } from "./geo";
import type { Place } from "./engine";

// ---------- tuning ----------
const TIME_SCALE = 60;        // 1 real second = 1 simulated minute
const FIX_EVERY = 0.2;        // real seconds between GPS fixes
const GPS_NOISE_M = 8;        // typical phone GPS error
const SPIKE_CHANCE = 0.07;    // occasional urban-canyon jump
const GRACE_S = 4;            // real seconds outside the zone before health drains
const DRAIN_PER_S = 5, REGEN_PER_S = 10;
const CLAIM_AFTER_S = 3;      // dwell time (real seconds = 3 simulated minutes)
const NEARBY_M = 600;
const KEY_KMH = { walk: 5, drive: 60, fly: 260 };

type Leg = { to: XY; kmh: number } | { wait: number };
type Ev = { at: string; text: string; tag: string };
type SavedState = { claimed: string[]; visits: Record<string, number>; zone: { kind: "city" | "street"; id: string } };

const MOTION_LABEL: Record<GooseState, string> = {
  stand: "Standing", waddle: "Waddling", drive: "Driving", fly: "Flying", carried: "Picked up", fainted: "Fainted",
};
const KIND_STYLE: Record<string, [string, string]> = {
  ion: ["#006bb7", "I"], bus: ["#3b8f6a", "B"], campus: ["#7b5cc4", "U"], park: ["#4c9a3f", "P"],
  shop: ["#c27a2c", "S"], civic: ["#5f6f8a", "C"], plaza: ["#b8485a", "★"], transit: ["#006bb7", "T"], airport: ["#3f6fb8", "✈"],
};
const ICONS = {
  zone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>`,
  fit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`,
  close: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
};
const SVGNS = "http://www.w3.org/2000/svg";
const STORE_KEY = "goose-turf:v1";

export interface MountOptions { apiBase?: string; deviceId?: string }

export function mount(root: HTMLElement, data: MapData, opts: MountOptions = {}) {
  injectAssets();
  const world: World = buildWorld(data);
  const saved = load();

  // ---------------- state ----------------
  const visits: Record<string, number> = saved?.visits ?? {};
  const claimed = new Set<string>(saved?.claimed ?? []);
  let zone: Zone = makeZone(saved?.zone ?? { kind: "city", id: "waterloo" });
  let truePos: XY = { ...zone.spawn };
  let shown: XY = { ...truePos };       // where the goose is drawn (eases toward the tracked fix)
  let tracked: XY = { ...truePos };     // output of the tracker (what geofencing uses)
  const tracker = new Tracker(true);
  let simT = 8 * 3600;                  // simulated clock starts 08:00
  tracker.reset(truePos, simT);
  let kmh = 0, motion: Motion = "stand", gooseState: GooseState = "stand", facing = 1;
  let health = 100, outsideFor = 0, inZone = true, fainted = false;
  let here: Territory | null = null, candidate: Territory | null = null, candidateN = 0, dwell = 0;
  let fixTimer = 0, uiTimer = 0, dragging = false, follow = false;
  let autopilot = true, legs: Leg[] = [], legWait = 0;
  const keys = new Set<string>();
  const flips: number[] = [];
  const events: Ev[] = [];
  const index = new GridIndex<Place>(world.places, 500);
  let nearby: { item: Place; d: number }[] = [];
  const outbox: { lat: number; lon: number; t: number }[] = [];
  let serverStatus = opts.apiBase ? "connecting" : "";

  // ---------------- DOM ----------------
  root.innerHTML = template(world);
  const $ = <T extends Element = HTMLElement>(ref: string) => root.querySelector(`[data-ref="${ref}"]`) as unknown as T;
  const gt = $("gt"), svg = $<SVGSVGElement>("svg");
  drawMap();
  const gooseEl = $<SVGGElement>("goose"), gooseArt = $<SVGGElement>("gooseArt"), bubble = $<SVGGElement>("bubble");
  const badgeEls = new Map<string, SVGGElement>();
  root.querySelectorAll<SVGGElement>("[data-badge]").forEach((g) => badgeEls.set(g.dataset.badge!, g));
  const terrEls = new Map<string, SVGPathElement>();
  root.querySelectorAll<SVGPathElement>("[data-terr]").forEach((p) => terrEls.set(p.dataset.terr!, p));
  const scaled = Array.from(root.querySelectorAll<SVGGElement>("[data-at]"));

  // ---------------- camera ----------------
  let view = { x: 0, y: 0, w: 1, h: 1 };
  const pxPerM = () => Math.min(svg.clientWidth / view.w, svg.clientHeight / view.h) || 0.03;
  function setView(v: typeof view) {
    view = v;
    svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
    const k = 1 / pxPerM();
    for (const g of scaled) g.setAttribute("transform", `translate(${g.dataset.at}) scale(${k})`);
    const hatch = $<SVGPatternElement>("hatch");
    hatch.setAttribute("width", String(10 * k)); hatch.setAttribute("height", String(10 * k));
    $<SVGRectElement>("hatchBar").setAttribute("width", String(4 * k)); $<SVGRectElement>("hatchBar").setAttribute("height", String(10 * k));
    const shadow = $<SVGElement>("shadow");
    shadow.setAttribute("dy", String(6 * k)); shadow.setAttribute("stdDeviation", String(2 * k));
    const mpp = k; // metres per pixel
    gt.classList.toggle("z-far", mpp < 55);
    gt.classList.toggle("z-mid", mpp < 14);
    gt.classList.toggle("z-near", mpp < 6);
  }
  /** Fit a box into the part of the screen not covered by the side panels. */
  function fit(b: BBox) {
    const cw = svg.clientWidth || 1200, ch = svg.clientHeight || 800;
    const wide = cw > 860;
    const pad = wide ? { l: 60, r: 280, t: 80, b: 120 } : { l: 20, r: 20, t: 150, b: 260 };
    const aw = Math.max(100, cw - pad.l - pad.r), ah = Math.max(100, ch - pad.t - pad.b);
    const s = Math.max((b.maxX - b.minX) / aw, (b.maxY - b.minY) / ah);
    const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
    const x = cx - (pad.l + aw / 2) * s, y = cy - (pad.t + ah / 2) * s;
    setView({ x, y, w: cw * s, h: ch * s });
  }
  function zoomAt(f: number, sx: number, sy: number) {
    const p = toWorld(sx, sy);
    const w = Math.min(90_000, Math.max(600, view.w * f)), h = view.h * (w / view.w);
    setView({ x: p.x - (p.x - view.x) * (w / view.w), y: p.y - (p.y - view.y) * (h / view.h), w, h });
  }
  function toWorld(cx: number, cy: number): XY {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }
  function toScreen(p: XY) {
    const m = svg.getScreenCTM(), r = root.getBoundingClientRect();
    if (!m) return { x: 0, y: 0 };
    const s = new DOMPoint(p.x, p.y).matrixTransform(m);
    return { x: s.x - r.left, y: s.y - r.top };
  }

  // ---------------- map drawing (once) ----------------
  function drawMap() {
    const terrLayer = $<SVGGElement>("terr"), badges = $<SVGGElement>("badges"), labels = $<SVGGElement>("labels");
    let terrHtml = "", badgeHtml = "", labelHtml = "";
    for (const t of world.territories) {
      const c = world.cities.find((x) => x.id === t.city)!;
      terrHtml += `<path class="gt-terr" data-terr="${t.id}" fill="${c.color}" vector-effect="non-scaling-stroke" d="${pathD(t.ring, true)}"/>`;
      terrHtml += `<path class="gt-terr-shine" vector-effect="non-scaling-stroke" d="${pathD(t.ring, true)}" transform="translate(0 -40)"/>`;
      badgeHtml += `<g class="gt-badge" data-badge="${t.id}" data-at="${t.center.x} ${t.center.y}"><circle r="13" stroke="${c.color}"/><text>0</text></g>`;
      labelHtml += `<g data-at="${t.center.x} ${t.center.y}"><text class="gt-label gt-terr-label" y="27" text-anchor="middle">${esc(t.name)}</text></g>`;
    }
    for (const c of world.cities) {
      terrHtml += `<path class="gt-city-edge" vector-effect="non-scaling-stroke" d="${pathD(c.ring, true)}"/>`;
      // city names sit outside their coastline, Risk-style: Waterloo west, Kitchener south-west, Cambridge south
      const b = c.bbox, midY = (b.minY + b.maxY) / 2;
      const [ax, ay, anchor, dx, dy] = c.id === "cambridge" ? [b.maxX, midY, "start", 14, 0] : [b.minX, midY, "end", -14, 0];
      labelHtml += `<g data-at="${ax} ${ay}"><text class="gt-label gt-city-label" x="${dx}" y="${dy}" text-anchor="${anchor}">${esc(c.name)}</text></g>`;
    }
    for (const [name, lat, lon] of [["Woolwich", 43.565, -80.5], ["Wilmot", 43.37, -80.62], ["North Dumfries", 43.315, -80.4]] as const) {
      const p = project([lon, lat]);
      labelHtml += `<g data-at="${p.x} ${p.y}"><text class="gt-label gt-township" text-anchor="middle">${name}</text></g>`;
    }
    terrLayer.innerHTML = terrHtml;
    $("streets").innerHTML = world.streets.map((s) =>
      `<path class="gt-street" data-street="${s.id}" vector-effect="non-scaling-stroke" d="${pathD(s.line)}"/>`).join("");
    $("ion").innerHTML = `<path class="gt-ion-casing" vector-effect="non-scaling-stroke" d="${pathD(world.ionLine)}"/>
      <path class="gt-ion" vector-effect="non-scaling-stroke" d="${pathD(world.ionLine)}"/>` +
      world.places.filter((p) => p.kind === "ion").map((s) =>
        `<g data-at="${s.p.x} ${s.p.y}"><circle class="gt-station" r="5"/><text class="gt-label gt-station-label" x="9" y="4">${esc(s.name.replace(" Station", ""))}</text></g>`).join("");
    // all bus stops as one path: thousands of dots, one DOM node
    $("stops").setAttribute("d", world.places.filter((p) => p.kind === "bus")
      .map((s) => `M${(s.p.x - 18).toFixed(0)} ${s.p.y.toFixed(0)}a18 18 0 1 0 36 0a18 18 0 1 0 -36 0`).join(""));
    $("region").setAttribute("d", regionBlob());
    badges.innerHTML = badgeHtml;
    labels.innerHTML = labelHtml;
    const b = world.bbox, step = 5000, grid: string[] = [];
    for (let x = Math.floor((b.minX - 40000) / step) * step; x < b.maxX + 40000; x += step) grid.push(`M${x} ${b.minY - 40000}V${b.maxY + 40000}`);
    for (let y = Math.floor((b.minY - 40000) / step) * step; y < b.maxY + 40000; y += step) grid.push(`M${b.minX - 40000} ${y}H${b.maxX + 40000}`);
    $("grid").setAttribute("d", grid.join(""));
  }
  function regionBlob() {
    // the Region of Waterloo backdrop: convex hull of every bus stop, pushed outward a little
    const pts = world.places.filter((p) => p.kind === "bus").map((p) => p.p);
    const hull = convexHull(pts);
    const c = hull.reduce((a, p) => ({ x: a.x + p.x / hull.length, y: a.y + p.y / hull.length }), { x: 0, y: 0 });
    return pathD(hull.map((p) => ({ x: c.x + (p.x - c.x) * 1.16, y: c.y + (p.y - c.y) * 1.16 })), true);
  }
  function drawZone() {
    const fill = $<SVGPathElement>("zoneFill"), line = $<SVGPathElement>("zoneLine"), maskShape = $<SVGPathElement>("maskShape");
    root.querySelectorAll(".gt-street.is-zone").forEach((e) => e.classList.remove("is-zone"));
    if (zone.kind === "city") {
      const c = world.cities.find((x) => x.id === zone.id)!;
      const d = pathD(c.ring, true);
      fill.setAttribute("d", d); line.setAttribute("d", "");
      maskShape.setAttribute("d", d); maskShape.setAttribute("fill", "#000"); maskShape.removeAttribute("stroke");
    } else {
      const s = world.streets.find((x) => x.id === zone.id)!;
      const d = pathD(s.line);
      fill.setAttribute("d", ""); line.setAttribute("d", d); line.setAttribute("stroke-width", String(STREET_HALF_WIDTH_M * 2));
      maskShape.setAttribute("d", d); maskShape.setAttribute("fill", "none"); maskShape.setAttribute("stroke", "#000");
      maskShape.setAttribute("stroke-width", String(STREET_HALF_WIDTH_M * 2)); maskShape.setAttribute("stroke-linecap", "round");
      root.querySelector(`[data-street="${s.id}"]`)?.classList.add("is-zone");
    }
    const sw = $("zoneSwatch");
    sw.style.background = zone.kind === "city" ? world.cities.find((c) => c.id === zone.id)!.color : "var(--gt-gold)";
    $("zoneName").textContent = zone.name;
    $("zoneKind").textContent = zone.kind === "city" ? "Stay inside the city" : `Stay within ${STREET_HALF_WIDTH_M} m of the street`;
  }

  // ---------------- zones & autopilot ----------------
  function makeZone(z: { kind: "city" | "street"; id: string }): Zone {
    try { return z.kind === "city" ? cityZone(world, z.id) : streetZone(world, z.id); }
    catch { return cityZone(world, "waterloo"); }
  }
  function setZone(z: { kind: "city" | "street"; id: string }) {
    zone = makeZone(z);
    drawZone();
    respawn(false);
    fit(zone.bbox);
    log(`Home zone set to ${zone.name}`, "zone");
    save();
  }
  function respawn(announce = true) {
    truePos = { ...zone.spawn }; shown = { ...truePos }; tracked = { ...truePos };
    tracker.reset(truePos, simT);
    health = 100; outsideFor = 0; fainted = false; here = null; candidate = null; dwell = 0;
    legs = []; legWait = 0; autopilot = true;
    $("faint").classList.remove("show");
    if (announce) { log(`Goose respawned in ${zone.name}`, "zone"); say("I'm back!"); }
    syncButtons();
  }
  function buildLegs(): Leg[] {
    const out: Leg[] = [];
    const waddleAround = (c: XY) => {
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        out.push({ to: { x: c.x + Math.cos(a) * 140, y: c.y + Math.sin(a) * 140 }, kmh: 5 });
      }
    };
    const excursion = (from: XY, dir: XY) => {
      const n = Math.hypot(dir.x, dir.y) || 1;
      const away = { x: from.x + (dir.x / n) * 3500, y: from.y + (dir.y / n) * 3500 };
      out.push({ to: away, kmh: 260 }, { wait: 5.5 }, { to: from, kmh: 260 }, { wait: 1 });
    };
    if (zone.kind === "city") {
      const ts = world.territories.filter((t) => t.city === zone.id);
      const order: Territory[] = [];
      let cur = truePos;
      const left = [...ts];
      while (left.length) {
        left.sort((a, b) => dist(cur, a.center) - dist(cur, b.center));
        const t = left.shift()!;
        order.push(t); cur = t.center;
      }
      order.forEach((t, i) => {
        out.push({ to: t.center, kmh: 50 }, { wait: 2 });
        waddleAround(t.center);
        out.push({ wait: 1.5 });
        if (i === Math.floor(order.length / 2)) {
          const c = world.cities.find((x) => x.id === zone.id)!;
          const mid = { x: (c.bbox.minX + c.bbox.maxX) / 2, y: (c.bbox.minY + c.bbox.maxY) / 2 };
          const edgeDir = { x: t.center.x - mid.x, y: t.center.y - mid.y };
          excursion(t.center, edgeDir);
        }
      });
    } else {
      const s = world.streets.find((x) => x.id === zone.id)!;
      const near = nearestOnLine(truePos, s.line);
      const line = near.seg < s.line.length / 2 ? s.line.slice(near.seg) : s.line.slice(0, near.seg + 2).reverse();
      out.push({ to: line[0], kmh: 40 });
      line.forEach((p, i) => {
        out.push({ to: p, kmh: 55 });
        if (i === Math.floor(line.length / 3)) { out.push({ wait: 2 }); waddleAround(p); out.push({ to: p, kmh: 5 }, { wait: 1 }); }
      });
      const end = line[line.length - 1], prev = line[line.length - 2] ?? line[0];
      out.push({ wait: 2 });
      excursion(end, { x: -(end.y - prev.y), y: end.x - prev.x });
    }
    return out;
  }
  function stepAutopilot(dt: number): XY | null {
    if (legWait > 0) { legWait -= dt; return null; }
    if (!legs.length) legs = buildLegs();
    const leg = legs[0];
    if ("wait" in leg) { legWait = leg.wait; legs.shift(); return null; }
    const v = (leg.kmh / 3.6) * TIME_SCALE * dt;
    const d = dist(truePos, leg.to);
    if (d <= v) { legs.shift(); return { ...leg.to }; }
    return { x: truePos.x + ((leg.to.x - truePos.x) / d) * v, y: truePos.y + ((leg.to.y - truePos.y) / d) * v };
  }

  // ---------------- GPS fixes, geofencing, events ----------------
  function gauss() { return Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(2 * Math.PI * Math.random()); }
  function takeFix() {
    let p = truePos;
    if (!dragging) {
      p = { x: p.x + gauss() * GPS_NOISE_M, y: p.y + gauss() * GPS_NOISE_M };
      if (Math.random() < SPIKE_CHANCE) {
        const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 60;
        p = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };
      }
    }
    const out = tracker.push({ p, t: simT });
    tracked = out.p; kmh = out.kmh;
    if (out.motion !== motion) { motion = out.motion; flips.push(performance.now()); }
    const [lon, lat] = unproject(p);
    if (opts.apiBase) outbox.push({ lat, lon, t: Math.round(simT) });

    // geofence: which territory? (with hysteresis when smoothing is on)
    const t = territoryAt(world, tracked);
    if (t?.id !== here?.id) {
      if (tracker.smoothing) {
        if (t?.id === candidate?.id) candidateN++; else { candidate = t; candidateN = 1; }
        if (candidateN >= 2) changeTerritory(t);
      } else changeTerritory(t);
    } else { candidate = null; candidateN = 0; }

    const nowIn = zone.contains(tracked);
    if (nowIn !== inZone) {
      inZone = nowIn;
      log(nowIn ? `Back inside ${zone.name}` : `Left ${zone.name}`, nowIn ? "zone" : "warn");
      if (!nowIn) say("Uh oh");
    }
    nearby = index.near(tracked, NEARBY_M).slice(0, 7);
  }
  function changeTerritory(t: Territory | null) {
    if (here) { log(`Exited ${here.name}`, "exit"); terrEls.get(here.id)?.classList.remove("is-here"); }
    here = t; dwell = 0; candidate = null; candidateN = 0;
    flips.push(performance.now());
    if (t) {
      visits[t.id] = (visits[t.id] ?? 0) + 1;
      log(`Entered ${t.name}`, "enter");
      terrEls.get(t.id)?.classList.add("is-here");
      updateBadge(t.id, true);
      say("HONK!");
      save();
    }
  }
  function claim(t: Territory) {
    claimed.add(t.id);
    terrEls.get(t.id)?.classList.add("is-claimed");
    updateBadge(t.id, true);
    log(`Claimed ${t.name} (stayed ${CLAIM_AFTER_S} min)`, "claim");
    say("Mine!");
    renderCities();
    save();
  }
  function updateBadge(id: string, pop = false) {
    const g = badgeEls.get(id); if (!g) return;
    g.querySelector("text")!.textContent = String(visits[id] ?? 0);
    g.classList.toggle("is-claimed", claimed.has(id));
    const c = world.cities.find((x) => x.id === world.territories.find((t) => t.id === id)!.city)!;
    g.querySelector("circle")!.setAttribute("fill", claimed.has(id) ? c.color : "");
    if (pop) { g.classList.remove("pop"); void g.getBoundingClientRect(); g.classList.add("pop"); }
  }
  function faint() {
    fainted = true; autopilot = false; legs = [];
    log("Goose fainted outside the zone", "warn");
    $("faintZone").textContent = zone.name;
    $("faint").classList.add("show");
    syncButtons();
  }

  // ---------------- server mirror (optional) ----------------
  async function flush() {
    if (!opts.apiBase || !outbox.length) return;
    const fixes = outbox.splice(0, outbox.length);
    try {
      const res = await fetch(`${opts.apiBase}/v1/track`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId: opts.deviceId ?? "goose-1", zone: { kind: zone.kind, id: zone.id }, fixes }),
      });
      const body = await res.json();
      serverStatus = `server ok, ${body.latencyMs ?? "?"} ms`;
      for (const e of body.events ?? []) log(`${e.type.replace("_", " ")} ${e.territoryName ?? e.zone ?? ""}`, "server");
    } catch { serverStatus = "server unreachable"; }
  }
  if (opts.apiBase) setInterval(flush, 1000);

  // ---------------- UI text ----------------
  const fmtClock = (s: number) => { const m = Math.floor(s / 60) % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
  function log(text: string, tag: string) {
    events.unshift({ at: fmtClock(simT), text, tag });
    if (events.length > 40) events.pop();
    if (activeTab === "events") renderList();
  }
  let bubbleTimer = 0;
  function say(text: string) {
    bubble.querySelector("text")!.textContent = text;
    const w = Math.max(54, text.length * 9 + 22);
    const r = bubble.querySelector("rect")!;
    r.setAttribute("x", String(-w / 2)); r.setAttribute("width", String(w));
    bubble.style.opacity = "1"; bubbleTimer = 1.3;
  }
  let activeTab: "nearby" | "events" = "nearby";
  function renderList() {
    const ul = $("list");
    if (activeTab === "nearby") {
      ul.innerHTML = nearby.length ? nearby.map(({ item, d }) => {
        const [bg, ch] = KIND_STYLE[item.kind] ?? ["#666", "•"];
        const ang = Math.atan2(item.p.y - tracked.y, item.p.x - tracked.x) * (180 / Math.PI) + 90;
        return `<li><span class="gt-ico" style="background:${bg}">${ch}</span><span>${esc(item.name)}</span>
          <span class="gt-dist"><span class="gt-arrow" style="transform:rotate(${ang.toFixed(0)}deg)">↑</span>${fmtDist(d)}</span></li>`;
      }).join("") : `<li class="gt-empty">Nothing within ${NEARBY_M} m. Open field, good grazing.</li>`;
    } else {
      ul.innerHTML = events.length ? events.slice(0, 18).map((e) =>
        `<li><span class="gt-ico" style="background:${TAG_COLOR[e.tag] ?? "#555"}">${TAG_CHAR[e.tag] ?? "•"}</span><span>${esc(e.text)}</span><span class="gt-dist">${e.at}</span></li>`).join("")
        : `<li class="gt-empty">No events yet. Move the goose across a border.</li>`;
    }
  }
  function renderCities() {
    $("cities").innerHTML = world.cities.map((c) => {
      const ts = world.territories.filter((t) => t.city === c.id);
      const n = ts.filter((t) => claimed.has(t.id)).length;
      return `<div class="gt-panel gt-city"><span class="gt-swatch" style="background:${c.color}"></span><b>${c.name}</b>
        <span class="gt-count">${n}/${ts.length}</span><span class="gt-bar"><i style="width:${(n / ts.length) * 100}%"></i></span></div>`;
    }).join("");
  }
  let lastAvatar: GooseState | null = null;
  function renderHud() {
    const scr = toScreen(shown);
    const [lon, lat] = unproject(tracked);
    $("speed").textContent = String(Math.round(kmh));
    $("motion").textContent = MOTION_LABEL[gooseState];
    $("latlon").textContent = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    $("screen").textContent = `${Math.round(scr.x)}, ${Math.round(scr.y)} px`;
    $("terrName").textContent = here ? here.name : inZone ? "Between neighbourhoods" : "Outside the cities";
    $("clock").textContent = fmtClock(simT);
    if (serverStatus) $("server").textContent = serverStatus;
    const hb = $("healthFill");
    hb.style.width = `${health}%`;
    hb.style.backgroundColor = health > 60 ? "var(--gt-good)" : health > 30 ? "var(--gt-warn)" : "var(--gt-bad)";
    $("healthNum").textContent = `${Math.ceil(health)} HP`;
    $("banner").textContent = MOTION_LABEL[gooseState];
    if (lastAvatar !== gooseState) { $("avatar").innerHTML = gooseSvg(gooseState); lastAvatar = gooseState; }
    const now = performance.now();
    while (flips.length && now - flips[0] > 60_000) flips.shift();
    $("flips").textContent = `${flips.length} icon or border flips in the last minute`;
    const warn = $("warn");
    if (!inZone && !fainted) {
      warn.classList.add("show");
      const left = Math.ceil(GRACE_S - outsideFor);
      warn.textContent = left > 0 ? `Outside ${zone.name}! Health drains in ${left}s` : `Goose is weakening. Get back to ${zone.name}!`;
    } else warn.classList.remove("show");
    if (activeTab === "nearby") renderList();
  }
  function syncButtons() {
    $("autoBtn").setAttribute("aria-pressed", String(autopilot));
    $("autoSub").textContent = autopilot ? "Goose tours your zone" : "Drag the goose or use the arrow keys";
    $("smoothBtn").setAttribute("aria-pressed", String(tracker.smoothing));
    $("followBtn").setAttribute("aria-pressed", String(follow));
  }

  // ---------------- main loop ----------------
  let last = performance.now();
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!fainted) {
      simT += dt * TIME_SCALE;
      let next: XY | null = null;
      const kx = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
      const ky = (keys.has("ArrowDown") || keys.has("s") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("w") ? 1 : 0);
      if (!dragging && (kx || ky)) {
        const speed = keys.has(" ") ? KEY_KMH.fly : keys.has("Shift") ? KEY_KMH.drive : KEY_KMH.walk;
        const v = (speed / 3.6) * TIME_SCALE * dt, n = Math.hypot(kx, ky);
        next = { x: truePos.x + (kx / n) * v, y: truePos.y + (ky / n) * v };
      } else if (autopilot && !dragging) next = stepAutopilot(dt);
      if (next) { if (Math.abs(next.x - truePos.x) > 0.01) facing = next.x < truePos.x ? -1 : 1; truePos = next; }

      fixTimer += dt;
      while (fixTimer >= FIX_EVERY) { fixTimer -= FIX_EVERY; takeFix(); }

      // health
      if (inZone) { outsideFor = 0; health = Math.min(100, health + REGEN_PER_S * dt); }
      else { outsideFor += dt; if (outsideFor > GRACE_S) health -= DRAIN_PER_S * dt; }
      if (health <= 0) { health = 0; faint(); }

      // dwell → claim
      if (here) { dwell += dt; if (dwell >= CLAIM_AFTER_S && !claimed.has(here.id)) claim(here); }
    }
    gooseState = fainted ? "fainted" : dragging ? "carried" : motion;

    // draw goose: smoothing on = glide toward the filtered fix; off = jump to raw fixes
    const target = dragging ? truePos : tracked;
    const ease = dragging || !tracker.smoothing ? 1 : 1 - Math.exp(-dt * 10);
    shown = { x: shown.x + (target.x - shown.x) * ease, y: shown.y + (target.y - shown.y) * ease };
    const k = 1 / pxPerM();
    gooseEl.setAttribute("transform", `translate(${shown.x} ${shown.y}) scale(${k * 0.95})`);
    if (gooseArt.dataset.state !== gooseState || gooseArt.dataset.facing !== String(facing)) {
      gooseArt.dataset.state = gooseState; gooseArt.dataset.facing = String(facing);
      gooseArt.innerHTML = GOOSE[gooseState];
      gooseArt.setAttribute("transform", `scale(${gooseState === "fainted" || gooseState === "carried" ? 1 : facing} 1)`);
    }
    gooseEl.classList.toggle("is-carried", dragging);
    if (bubbleTimer > 0 && (bubbleTimer -= dt) <= 0) bubble.style.opacity = "0";

    if (follow && !dragging) {
      const cx = view.x + view.w / 2, cy = view.y + view.h / 2, f = 1 - Math.exp(-dt * 3);
      setView({ ...view, x: view.x + (shown.x - cx) * f, y: view.y + (shown.y - cy) * f });
    }
    if ((uiTimer += dt) > 0.1) { uiTimer = 0; renderHud(); }
    requestAnimationFrame(frame);
  }

  // ---------------- input ----------------
  const pointers = new Map<number, { x: number; y: number }>();
  let panStart: { x: number; y: number; view: typeof view } | null = null, pinchStart = 0;
  gooseEl.addEventListener("pointerdown", (e) => {
    if (fainted) return;
    e.stopPropagation();
    dragging = true; autopilot = false; legs = []; legWait = 0;
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    say("Put me down!");
    syncButtons();
  });
  svg.addEventListener("pointerdown", (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    svg.setPointerCapture(e.pointerId);
    if (pointers.size === 1) { panStart = { x: e.clientX, y: e.clientY, view: { ...view } }; svg.classList.add("is-panning"); }
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchStart = Math.hypot(a.x - b.x, a.y - b.y); panStart = null; }
  });
  svg.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId)!;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dragging) {
      const p = toWorld(e.clientX, e.clientY);
      if (Math.abs(p.x - truePos.x) > 1) facing = p.x < truePos.x ? -1 : 1;
      truePos = p;
      return;
    }
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart) zoomAt(pinchStart / d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinchStart = d; return;
    }
    if (panStart) {
      const s = 1 / pxPerM();
      setView({ ...view, x: view.x - (e.clientX - prev.x) * s, y: view.y - (e.clientY - prev.y) * s });
    }
  });
  const endPointer = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (dragging && !pointers.size) { dragging = false; tracker.reset(truePos, simT); tracked = { ...truePos }; }
    if (!pointers.size) { panStart = null; svg.classList.remove("is-panning"); }
  };
  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);
  svg.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(Math.exp(e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });

  const onKey = (down: boolean) => (e: KeyboardEvent) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", " ", "Shift"].includes(k)) return;
    if ((e.target as HTMLElement)?.closest?.("button") && k === " ") return;
    if (k.startsWith("Arrow") || k === " ") e.preventDefault();
    if (down) keys.add(k); else keys.delete(k);
    if (down && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(k) && autopilot) {
      autopilot = false; legs = []; legWait = 0; syncButtons();
    }
  };
  window.addEventListener("keydown", onKey(true));
  window.addEventListener("keyup", onKey(false));
  window.addEventListener("blur", () => keys.clear());
  window.addEventListener("resize", () => setView(view));

  root.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
    if (!el) return;
    const act = el.dataset.act!;
    if (act === "zone") { renderPicker(pickerTab); $("picker").classList.add("show"); }
    if (act === "help") $("about").classList.add("show");
    if (act === "layers") $("layers").classList.toggle("show");
    if (act === "close") el.closest(".gt-modal")?.classList.remove("show");
    if (act === "pickTab") { pickerTab = el.dataset.tab as "city" | "street"; renderPicker(pickerTab); }
    if (act === "pick") { setZone({ kind: el.dataset.kind as "city" | "street", id: el.dataset.id! }); $("picker").classList.remove("show"); }
    if (act === "auto") { autopilot = !autopilot; legs = []; legWait = 0; syncButtons(); }
    if (act === "smooth") { tracker.smoothing = !tracker.smoothing; tracker.reset(tracked, simT); log(`GPS smoothing ${tracker.smoothing ? "on" : "off"}`, "zone"); syncButtons(); }
    if (act === "follow") { follow = !follow; if (follow && view.w > 9000) zoomAt(6000 / view.w, ...centerPx()); syncButtons(); }
    if (act === "zin") zoomAt(0.7, ...centerPx());
    if (act === "zout") zoomAt(1.4, ...centerPx());
    if (act === "fit") { follow = false; fit(zone.bbox); syncButtons(); }
    if (act === "respawn") respawn();
    if (act === "tab") {
      activeTab = el.dataset.tab as "nearby" | "events";
      root.querySelectorAll("[data-act=tab]").forEach((t) => t.setAttribute("aria-selected", String(t === el)));
      renderList();
    }
  });
  root.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    if (input.dataset.layer) gt.classList.toggle(`gt-hide-${input.dataset.layer}`, !input.checked);
  });
  const centerPx = (): [number, number] => { const r = svg.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  let pickerTab: "city" | "street" = zone.kind;
  function renderPicker(tab: "city" | "street") {
    root.querySelectorAll("[data-act=pickTab]").forEach((t) => t.setAttribute("aria-selected", String((t as HTMLElement).dataset.tab === tab)));
    $("picks").innerHTML = tab === "city"
      ? world.cities.map((c) => {
        const n = world.territories.filter((t) => t.city === c.id).length;
        return `<button class="gt-pick" data-act="pick" data-kind="city" data-id="${c.id}" aria-current="${zone.kind === "city" && zone.id === c.id}">
          <span class="gt-swatch" style="background:${c.color}"></span><b>${c.name}</b><small>${n} neighbourhoods to claim</small></button>`;
      }).join("")
      : world.streets.map((s) => `<button class="gt-pick" data-act="pick" data-kind="street" data-id="${s.id}" aria-current="${zone.kind === "street" && zone.id === s.id}">
          <span class="gt-swatch" style="background:var(--gt-gold)"></span><b>${esc(s.name)}</b><small>${esc(s.desc)}</small></button>`).join("");
  }

  // ---------------- persistence ----------------
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ claimed: [...claimed], visits, zone: { kind: zone.kind, id: zone.id } } satisfies SavedState)); } catch { /* storage unavailable */ }
  }

  // ---------------- start ----------------
  for (const t of world.territories) { updateBadge(t.id); if (claimed.has(t.id)) terrEls.get(t.id)?.classList.add("is-claimed"); }
  drawZone(); renderCities(); syncButtons(); renderList();
  requestAnimationFrame(() => {
    fit(svg.clientWidth > 1100 ? world.bbox : zone.bbox);
    log(`Goose landed in ${zone.name}`, "zone");
    say("HONK!");
    requestAnimationFrame(frame);
  });
}

// ---------------- helpers ----------------
const TAG_COLOR: Record<string, string> = { enter: "#4c9a3f", exit: "#7a6a58", claim: "#c99a1f", warn: "#e5533d", zone: "#006bb7", server: "#7b5cc4" };
const TAG_CHAR: Record<string, string> = { enter: "→", exit: "←", claim: "★", warn: "!", zone: "◎", server: "S" };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);

function load(): SavedState | null {
  try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function injectAssets() {
  if (!document.getElementById("gt-style")) {
    const st = document.createElement("style"); st.id = "gt-style"; st.textContent = css; document.head.appendChild(st);
  }
  if (!document.getElementById("gt-fonts")) {
    const l = document.createElement("link"); l.id = "gt-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;700;800;900&display=swap";
    document.head.appendChild(l);
  }
}
function convexHull(pts: XY[]): XY[] {
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: XY, a: XY, b: XY) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: XY[] = [], upper: XY[] = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function template(world: World) {
  const states: [GooseState, string][] = [
    ["stand", "Standing: not moving"], ["waddle", "Waddling: walking pace"], ["drive", "Driving: 15 to 150 km/h"],
    ["fly", "Flying: faster than any car"], ["carried", "Picked up: you're dragging it"], ["fainted", "Fainted: health hit zero"],
  ];
  return `
<div class="gt" data-ref="gt">
  <svg class="gt-map" data-ref="svg" role="img" aria-label="Board-game map of Kitchener, Waterloo and Cambridge with a goose">
    <defs>
      <pattern id="gt-hatch" data-ref="hatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
        <rect data-ref="hatchBar" width="4" height="10" fill="rgba(255,226,140,.45)"/></pattern>
      <filter id="gt-land-shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow data-ref="shadow" dx="0" dy="200" stdDeviation="60" flood-color="#000" flood-opacity=".55"/></filter>
      <mask id="gt-focus" maskUnits="userSpaceOnUse" x="-200000" y="-200000" width="400000" height="400000">
        <rect x="-200000" y="-200000" width="400000" height="400000" fill="#fff"/>
        <path data-ref="maskShape"/></mask>
    </defs>
    <path class="gt-grid" data-ref="grid" vector-effect="non-scaling-stroke"/>
    <g filter="url(#gt-land-shadow)"><path class="gt-region" data-ref="region" vector-effect="non-scaling-stroke"/></g>
    <g filter="url(#gt-land-shadow)" data-ref="terr"></g>
    <g class="gt-streets" data-ref="streets"></g>
    <path class="gt-stops" data-ref="stops"/>
    <g class="gt-ion-layer" data-ref="ion"></g>
    <rect class="gt-dim" x="-200000" y="-200000" width="400000" height="400000" mask="url(#gt-focus)"/>
    <path class="gt-zone-fill" data-ref="zoneFill" vector-effect="non-scaling-stroke"/>
    <path class="gt-zone-line" data-ref="zoneLine"/>
    <g data-ref="labels"></g>
    <g data-ref="badges"></g>
    <g class="gt-goose" data-ref="goose">
      <circle r="36" fill="transparent"/>
      <ellipse class="gt-goose-shadow" cx="0" cy="28" rx="16" ry="4"/>
      <g data-ref="gooseArt"></g>
      <g class="gt-bubble" data-ref="bubble" transform="translate(0 -52)" style="opacity:0;pointer-events:none">
        <rect x="-30" y="-14" width="60" height="28" rx="12"/><path d="M-6 13 L0 22 L6 13" fill="#fff" stroke="#1d1a17" stroke-width="2"/>
        <rect x="-8" y="10" width="16" height="5" fill="#fff"/><text>HONK!</text></g>
    </g>
  </svg>

  <div class="gt-tl">
    <button class="gt-iconbtn" data-act="zone" aria-label="Choose home zone" title="Choose home zone">${ICONS.zone}</button>
    <button class="gt-iconbtn" data-act="help" aria-label="How it works" title="How it works">${ICONS.help}</button>
    <button class="gt-iconbtn" data-act="layers" aria-label="Map layers" title="Map layers">${ICONS.layers}</button>
    <button class="gt-panel gt-zonechip" data-act="zone"><span class="gt-swatch" data-ref="zoneSwatch"></span>
      <span><b data-ref="zoneName"></b><small data-ref="zoneKind"></small></span></button>
  </div>
  <div class="gt-panel gt-layers" data-ref="layers">
    <label><input type="checkbox" checked data-layer="streets"> Bus routes (streets)</label>
    <label><input type="checkbox" checked data-layer="ion"> ION light rail</label>
    <label><input type="checkbox" checked data-layer="stops"> Bus stops (zoom in)</label>
  </div>

  <section class="gt-panel gt-stats" aria-label="Goose GPS">
    <div class="gt-speed"><b data-ref="speed">0</b><span>km/h</span></div>
    <div class="gt-motion" data-ref="motion">Standing</div>
    <dl class="gt-kv">
      <dt>Where</dt><dd data-ref="terrName">-</dd>
      <dt>GPS</dt><dd data-ref="latlon">-</dd>
      <dt class="gt-kv-extra">On screen</dt><dd class="gt-kv-extra" data-ref="screen">-</dd>
      <dt class="gt-kv-extra">Time</dt><dd class="gt-kv-extra" data-ref="clock">08:00</dd>
      ${"" /* server status row only shows when an API is connected */}
      <dt class="gt-kv-extra">Engine</dt><dd class="gt-kv-extra" data-ref="server">in this browser</dd>
    </dl>
  </section>
  <div class="gt-cities" data-ref="cities"></div>

  <section class="gt-panel gt-bl" aria-label="Nearby and events">
    <div class="gt-tabs" role="tablist">
      <button class="gt-tab" role="tab" aria-selected="true" data-act="tab" data-tab="nearby">Nearby</button>
      <button class="gt-tab" role="tab" aria-selected="false" data-act="tab" data-tab="events">Events</button>
    </div>
    <ul class="gt-list" data-ref="list"></ul>
  </section>

  <section class="gt-panel gt-hud" aria-label="Goose status">
    <div class="gt-avatar" data-ref="avatar"></div>
    <div>
      <div class="gt-hud-name">Gus the Goose <small data-ref="healthNum" style="font-family:var(--gt-body);font-size:12px;opacity:.8">100 HP</small></div>
      <div class="gt-health" role="progressbar" aria-label="Health"><i data-ref="healthFill"></i></div>
      <span class="gt-banner" data-ref="banner">Standing</span>
    </div>
  </section>

  <div class="gt-br">
    <button class="gt-panel gt-toggle" data-act="smooth" data-ref="smoothBtn" aria-pressed="true">
      <span class="gt-switch"></span><span><b>GPS smoothing</b><small data-ref="flips"></small></span></button>
    <button class="gt-panel gt-toggle" data-act="auto" data-ref="autoBtn" aria-pressed="true">
      <span class="gt-switch"></span><span><b>Autopilot</b><small data-ref="autoSub"></small></span></button>
    <button class="gt-panel gt-toggle" data-act="follow" data-ref="followBtn" aria-pressed="false">
      <span class="gt-switch"></span><span><b>Follow goose</b><small>Camera tracks Gus</small></span></button>
    <div class="gt-zoom">
      <button class="gt-iconbtn" data-act="zout" aria-label="Zoom out">${ICONS.minus}</button>
      <button class="gt-iconbtn" data-act="fit" aria-label="Fit home zone">${ICONS.fit}</button>
      <button class="gt-iconbtn" data-act="zin" aria-label="Zoom in">${ICONS.plus}</button>
    </div>
  </div>
  <div class="gt-warn" data-ref="warn" role="status"></div>

  <div class="gt-modal" data-ref="picker" role="dialog" aria-label="Choose home zone">
    <div class="gt-panel gt-card">
      <button class="gt-iconbtn gt-close" data-act="close" aria-label="Close">${ICONS.close}</button>
      <h2>Choose a home zone</h2>
      <p>Gus stays healthy inside it. Leave for more than ${GRACE_S} seconds and health starts draining.</p>
      <div class="gt-tabs" role="tablist" style="padding:0">
        <button class="gt-tab" role="tab" data-act="pickTab" data-tab="city">Cities</button>
        <button class="gt-tab" role="tab" data-act="pickTab" data-tab="street">Streets (harder)</button>
      </div>
      <div class="gt-picks" data-ref="picks"></div>
    </div>
  </div>

  <div class="gt-modal" data-ref="about" role="dialog" aria-label="How it works">
    <div class="gt-panel gt-card">
      <button class="gt-iconbtn gt-close" data-act="close" aria-label="Close">${ICONS.close}</button>
      <h2>Goose Turf</h2>
      <p>A live map of Kitchener, Waterloo and Cambridge, played like a board game. Gus the goose moves around the region, and every neighbourhood is a territory you can claim.</p>
      <h3>How to play</h3>
      <ul>
        <li>Pick a home zone: a whole city, or a single street if you want it harder.</li>
        <li>Gus loses health if he stays outside the zone too long, and faints at zero.</li>
        <li>Enter a neighbourhood to raise its counter. Stay ${CLAIM_AFTER_S} minutes of game time to claim it.</li>
        <li>Drag Gus with the mouse, or use the arrow keys. Hold Shift to drive, Space to fly.</li>
      </ul>
      <h3>What Gus is doing</h3>
      <div class="gt-states">${states.map(([s, l]) => `<div>${gooseSvg(s)}<span>${l}</span></div>`).join("")}</div>
      <p>His pose comes only from his GPS fixes: how far he moved between readings, and how fast.</p>
      <h3>Under the hood</h3>
      <ul>
        <li>Each neighbourhood is a polygon geofence. Every GPS fix is checked against them, and crossing a border fires an enter or exit event.</li>
        <li>Fake GPS readings arrive every ${FIX_EVERY}s with realistic error and the occasional jump, like a phone downtown.</li>
        <li>GPS smoothing throws out single bad readings and waits for a new speed to hold before changing Gus's pose. Turn it off to see the twitching it prevents, and watch the flip counter.</li>
        <li>Street zones are corridors ${STREET_HALF_WIDTH_M} m either side of the route.</li>
        <li>The Nearby list searches ION stations, ${world.places.filter((p) => p.kind === "bus").length} bus stops and landmarks with a spatial grid, so it only checks points close to Gus.</li>
        <li>Game time runs ${TIME_SCALE}× faster than real time.</li>
      </ul>
      <h3>About the map</h3>
      <p>${esc(world.attribution)} Neighbourhood shapes are simplified for the game. Not affiliated with Grand River Transit.</p>
    </div>
  </div>

  <div class="gt-modal" data-ref="faint" role="alertdialog" aria-label="Gus fainted">
    <div class="gt-panel gt-card" style="text-align:center">
      <div style="width:120px;margin:0 auto">${gooseSvg("fainted")}</div>
      <h2>Gus fainted</h2>
      <p>He spent too long outside <span data-ref="faintZone"></span>. Your claimed neighbourhoods are safe.</p>
      <button class="gt-primary" data-act="respawn">Respawn Gus</button>
    </div>
  </div>
</div>`;
}
