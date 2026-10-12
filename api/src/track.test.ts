// Tests for the per-device game logic in track.ts.
// Runs the same pipeline as POST /v1/track (freshFixes -> smooth -> locateBatch -> applyHits)
// with the TypeScript territory lookup and an in-memory state, so no engine, Redis or Mongo is needed.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { applyHits, freshFixes, smooth, type DeviceState, type Fix, type GooseEvent, type TrackRequest } from "./track";
import { locateBatch } from "./locate";
import { mapData } from "./shared";

delete process.env.ENGINE_URL; // always use the in-process TypeScript lookup

// Thresholds in simulated seconds (browser real seconds x 60, see game.ts and docs/CONTRACTS.md).
const GRACE_S = 4 * 60;         // outside the zone this long before health drains
const DRAIN_PER_S = 5 / 60;     // 5 HP per real second
const CLAIM_AFTER_S = 3 * 60;   // 3 simulated minutes in a territory claims it

// Real points from data/kwc.json (territory centroids), as [lon, lat].
type LonLat = [number, number];
const UW_CAMPUS: LonLat = [-80.54791, 43.47167];   // waterloo-uw-campus
const LAURIER: LonLat = [-80.52453, 43.4784];      // waterloo-laurier, next door to UW
const GALT: LonLat = [-80.32238, 43.35265];        // cambridge-galt: a territory, but outside the Waterloo zone
const WEST_OF_WATERLOO: LonLat = [-80.65, 43.47];  // farmland west of Waterloo: no city, no territory

const WATERLOO = { kind: "city", id: "waterloo" } as const;

/** Fixes standing still at `at`, every `step` simulated seconds from `from` to `to` inclusive. */
function stay(at: LonLat, from: number, to: number, step = 10): Fix[] {
  const fixes: Fix[] = [];
  for (let t = from; t <= to; t += step) fixes.push({ lon: at[0], lat: at[1], t });
  return fixes;
}

/** One simulated device. `send` does what the /v1/track handler does, minus HTTP. */
class Goose {
  state: DeviceState | null = null;
  constructor(readonly zone: TrackRequest["zone"] = WATERLOO, readonly deviceId = "test-goose") {}

  async send(fixes: Fix[]): Promise<GooseEvent[]> {
    const req: TrackRequest = { deviceId: this.deviceId, zone: this.zone, fixes };
    req.fixes = freshFixes(this.state, req);
    if (!req.fixes.length) return [];
    const sm = smooth(this.state, req);
    const hits = await locateBatch(sm.points);
    const { state, events } = applyHits(this.state, req, sm, hits);
    this.state = JSON.parse(JSON.stringify(state)); // same JSON round trip as the device store
    return events;
  }

  get health() { return this.state!.health; }
}

const ofType = (events: GooseEvent[], ...types: GooseEvent["type"][]) => events.filter((e) => types.includes(e.type));
const summary = (events: GooseEvent[]) => events.map((e) => `${e.type} ${e.territory} @${e.at}`);
const nameOf = (id: string) => mapData.territories.find((t) => t.id === id)!.name;

describe("entering and exiting territories", () => {
  test("enters a territory on the second agreeing fix, not the first", async () => {
    const goose = new Goose();
    assert.deepEqual(ofType(await goose.send(stay(UW_CAMPUS, 0, 0)), "enter"), []);
    assert.equal(goose.state!.territory, null);

    const enters = ofType(await goose.send(stay(UW_CAMPUS, 10, 10)), "enter");
    assert.deepEqual(summary(enters), ["enter waterloo-uw-campus @10"]);
    assert.equal(enters[0].territoryName, nameOf("waterloo-uw-campus"));
    assert.equal(goose.state!.territory, "waterloo-uw-campus");
    assert.equal(goose.state!.visits["waterloo-uw-campus"], 1);
  });

  test("walking to the next neighbourhood exits the old one, then enters the new one", async () => {
    const goose = new Goose();
    const events = await goose.send([...stay(UW_CAMPUS, 0, 30), ...stay(LAURIER, 40, 110)]);
    const moves = ofType(events, "enter", "exit");
    assert.deepEqual(moves.map((e) => `${e.type} ${e.territory}`), [
      "enter waterloo-uw-campus", "exit waterloo-uw-campus", "enter waterloo-laurier",
    ]);
    assert.equal(moves[1].at, moves[2].at, "exit and enter happen on the same fix");
    assert.equal(moves[1].territoryName, nameOf("waterloo-uw-campus"));
    assert.equal(goose.state!.territory, "waterloo-laurier");
    assert.deepEqual(goose.state!.visits, { "waterloo-uw-campus": 1, "waterloo-laurier": 1 });
  });

  test("leaving the cities exits to no territory and ignores a one-fix pass through another", async () => {
    // The smoothed path from UW to the west crosses Columbia Forest for a single fix; hysteresis must ignore it.
    const goose = new Goose();
    const events = await goose.send([...stay(UW_CAMPUS, 0, 30), ...stay(WEST_OF_WATERLOO, 40, 110)]);
    assert.deepEqual(ofType(events, "enter", "exit").map((e) => `${e.type} ${e.territory}`), [
      "enter waterloo-uw-campus", "exit waterloo-uw-campus",
    ]);
    assert.equal(goose.state!.territory, null);
    assert.equal(goose.state!.territoryName, null);
  });

  test("state carries across requests: same result whether fixes come in one batch or many", async () => {
    const fixes = [...stay(UW_CAMPUS, 0, 30), ...stay(LAURIER, 40, 110)];
    const oneBatch = new Goose();
    const together = await oneBatch.send(fixes);
    const oneByOne = new Goose();
    const apart: GooseEvent[] = [];
    for (const f of fixes) apart.push(...(await oneByOne.send([f])));
    assert.deepEqual(summary(apart), summary(together));
  });
});

describe("claiming", () => {
  test("claims a territory exactly 3 simulated minutes after entering it, once", async () => {
    const goose = new Goose();
    const first = await goose.send(stay(UW_CAMPUS, 0, 180));
    const enteredAt = ofType(first, "enter")[0].at;
    assert.equal(enteredAt, 10);
    assert.deepEqual(ofType(first, "claim"), [], "179 s or less inside is not enough");

    const later = await goose.send(stay(UW_CAMPUS, 190, 600));
    assert.deepEqual(summary(ofType(later, "claim")), [`claim waterloo-uw-campus @${enteredAt + CLAIM_AFTER_S}`]);
    assert.equal(ofType(later, "claim")[0].territoryName, nameOf("waterloo-uw-campus"));
    assert.deepEqual(goose.state!.claimed, ["waterloo-uw-campus"]);
  });

  test("leaving before 3 minutes does not claim, and the dwell clock restarts in the next territory", async () => {
    const goose = new Goose();
    const events = await goose.send([...stay(UW_CAMPUS, 0, 120), ...stay(LAURIER, 130, 600)]);
    const enterLaurier = ofType(events, "enter").find((e) => e.territory === "waterloo-laurier")!;
    assert.deepEqual(summary(ofType(events, "claim")), [`claim waterloo-laurier @${enterLaurier.at + CLAIM_AFTER_S}`]);
    assert.deepEqual(goose.state!.claimed, ["waterloo-laurier"]);
  });

  test("a claimed territory is not claimed again on a later visit", async () => {
    const goose = new Goose();
    await goose.send([...stay(UW_CAMPUS, 0, 300), ...stay(LAURIER, 310, 400), ...stay(UW_CAMPUS, 410, 900)]);
    assert.deepEqual(goose.state!.claimed, ["waterloo-uw-campus"]);
    assert.equal(goose.state!.visits["waterloo-uw-campus"], 2);
  });
});

describe("zone health", () => {
  // A new device starts "in zone"; its first fix in Galt (outside Waterloo) is the zone exit,
  // and the tracker starts exactly at that fix, so outsideSince is exactly 1000.
  const OUT_AT = 1000;

  test("leaving the zone emits zone_exit but costs no health during the grace period", async () => {
    const goose = new Goose();
    const events = await goose.send(stay(GALT, OUT_AT, OUT_AT + GRACE_S, 60));
    assert.deepEqual(ofType(events, "zone_exit").map((e) => [e.at, e.zone]), [[OUT_AT, "Waterloo"]]);
    assert.equal(goose.state!.inZone, false);
    assert.equal(goose.state!.outsideSince, OUT_AT);
    assert.equal(goose.health, 100);
  });

  test("after the grace period health drains 5 HP per 60 simulated seconds", async () => {
    const goose = new Goose();
    await goose.send(stay(GALT, OUT_AT, OUT_AT + GRACE_S, 60));
    await goose.send(stay(GALT, OUT_AT + GRACE_S + 60, OUT_AT + GRACE_S + 60));
    assert.equal(goose.health, 95);
    await goose.send(stay(GALT, OUT_AT + GRACE_S + 120, OUT_AT + GRACE_S + 120));
    assert.equal(goose.health, 90);
  });

  test("sparse fixes only drain for the time past the grace period", async () => {
    // fixes 200 s apart: at OUT_AT+400 only 160 s are past grace, so health = 100 - 160 * 5/60
    const goose = new Goose();
    await goose.send(stay(GALT, OUT_AT, OUT_AT + 400, 200));
    assert.ok(Math.abs(goose.health - (100 - 160 * DRAIN_PER_S)) < 1e-9, `health was ${goose.health}`);
  });

  test("coming back inside the grace period costs nothing and resets the clock", async () => {
    const goose = new Goose();
    const events = await goose.send([...stay(GALT, OUT_AT, OUT_AT + 100), ...stay(UW_CAMPUS, OUT_AT + 110, OUT_AT + 300)]);
    assert.deepEqual(ofType(events, "zone_exit", "zone_enter").map((e) => e.type), ["zone_exit", "zone_enter"]);
    assert.ok(ofType(events, "zone_enter")[0].at - OUT_AT < GRACE_S);
    assert.equal(goose.state!.inZone, true);
    assert.equal(goose.state!.outsideSince, null);
    assert.equal(goose.health, 100);
  });
});

describe("fainting", () => {
  const OUT_AT = 1000;
  const FAINT_AT = OUT_AT + GRACE_S + 100 / DRAIN_PER_S; // 240 s grace + 1200 s of draining

  test("faints when health reaches zero, emits fainted once, and health stays at zero", async () => {
    const goose = new Goose();
    const before = await goose.send(stay(GALT, OUT_AT, FAINT_AT - 60, 60));
    assert.deepEqual(ofType(before, "fainted"), []);
    assert.equal(goose.health, 5);
    assert.equal(goose.state!.fainted, false);

    const at = await goose.send(stay(GALT, FAINT_AT, FAINT_AT));
    assert.deepEqual(ofType(at, "fainted").map((e) => [e.at, e.zone]), [[FAINT_AT, "Waterloo"]]);
    assert.equal(goose.health, 0);
    assert.equal(goose.state!.fainted, true);

    const after = await goose.send(stay(GALT, FAINT_AT + 60, FAINT_AT + 1200, 60));
    assert.deepEqual(ofType(after, "fainted"), [], "fainted is emitted once, not on every fix");
    assert.equal(goose.health, 0);
  });
});

describe("out-of-order fixes", () => {
  test("freshFixes sorts a batch and drops fixes at or before the last processed one", async () => {
    const goose = new Goose();
    await goose.send(stay(UW_CAMPUS, 0, 100));
    const req: TrackRequest = { deviceId: goose.deviceId, zone: WATERLOO, fixes: [130, 50, 100, 110].map((t) => ({ lon: UW_CAMPUS[0], lat: UW_CAMPUS[1], t })) };
    assert.deepEqual(freshFixes(goose.state, req).map((f) => f.t), [110, 130]);
    assert.deepEqual(req.fixes.map((f) => f.t), [130, 50, 100, 110], "the request is not mutated");
  });

  test("a resent old batch changes nothing", async () => {
    const goose = new Goose();
    await goose.send(stay(UW_CAMPUS, 0, 300));
    const before = structuredClone(goose.state);
    const events = await goose.send(stay(LAURIER, 0, 300)); // stale fixes from somewhere else entirely
    assert.deepEqual(events, []);
    assert.deepEqual(goose.state, before);
  });

  test("stale fixes mixed into a new batch are skipped, the fresh ones still apply", async () => {
    const goose = new Goose();
    await goose.send(stay(UW_CAMPUS, 0, 100));
    const events = await goose.send([...stay(WEST_OF_WATERLOO, 0, 100), ...stay(UW_CAMPUS, 110, 300)]);
    assert.deepEqual(ofType(events, "exit", "zone_exit"), [], "the stale fixes west of Waterloo were ignored");
    assert.deepEqual(goose.state!.claimed, ["waterloo-uw-campus"]);
    assert.equal(goose.state!.lastT, 300);
  });

  test("fixes inside one batch are applied in time order", async () => {
    const goose = new Goose();
    const events = await goose.send([30, 10, 20, 0].map((t) => ({ lon: UW_CAMPUS[0], lat: UW_CAMPUS[1], t })));
    assert.deepEqual(summary(ofType(events, "enter")), ["enter waterloo-uw-campus @10"]);
    assert.equal(goose.state!.lastT, 30);
  });

  test("a fix for a different zone is not filtered against the old zone's clock", async () => {
    const goose = new Goose();
    await goose.send(stay(UW_CAMPUS, 0, 300));
    const req: TrackRequest = { deviceId: goose.deviceId, zone: { kind: "city", id: "kitchener" }, fixes: stay(UW_CAMPUS, 100, 100) };
    assert.deepEqual(freshFixes(goose.state, req).map((f) => f.t), [100]);
  });
});
