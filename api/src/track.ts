// Turns a batch of raw GPS fixes into game events for one device.
import { Tracker, project, unproject, zoneFor, type LngLat, type Motion } from "./shared";
import type { Hit } from "./locate";

// Server time is simulated seconds (the web app runs 60x real time).
const GRACE_S = 240, DRAIN_PER_S = 5 / 60, REGEN_PER_S = 10 / 60, CLAIM_AFTER_S = 180;

export interface Fix { lat: number; lon: number; t: number }
export interface TrackRequest { deviceId: string; zone: { kind: "city" | "street"; id: string }; fixes: Fix[] }
export type EventType = "enter" | "exit" | "claim" | "zone_exit" | "zone_enter" | "fainted" | "motion";
export interface GooseEvent {
  deviceId: string; type: EventType; at: number; lat: number; lon: number;
  territory?: string | null; territoryName?: string | null; zone?: string; motion?: Motion; createdAt: Date;
}
export interface DeviceState {
  deviceId: string; zone: TrackRequest["zone"]; tracker: ReturnType<Tracker["snapshot"]>;
  territory: string | null; territoryName: string | null; enteredAt: number;
  candidate: string | null; candidateN: number;
  inZone: boolean; outsideSince: number | null; health: number; fainted: boolean;
  motion: Motion; kmh: number; lastT: number; lat: number; lon: number;
  claimed: string[]; visits: Record<string, number>;
}

/**
 * Pass 0: the fixes this request can still apply, oldest first. Fixes at or before the last
 * processed fix for the same zone are dropped (GPS buffers sometimes resend old fixes).
 */
export function freshFixes(state: DeviceState | null, req: TrackRequest): Fix[] {
  const sorted = [...req.fixes].sort((a, b) => a.t - b.t);
  return state && state.zone.id === req.zone.id ? sorted.filter((f) => f.t > state.lastT) : sorted;
}

/** Pass 1: smooth the fixes. The caller looks up territories for the smoothed points. */
export function smooth(state: DeviceState | null, req: TrackRequest) {
  const first = req.fixes[0];
  const tracker = state ? Tracker.restore(state.tracker) : new Tracker(true);
  if (!state) tracker.reset(project([first.lon, first.lat]), first.t);
  const outs = req.fixes.map((f) => tracker.push({ p: project([f.lon, f.lat]), t: f.t }));
  return { tracker, outs, points: outs.map((o) => unproject(o.p) as LngLat) };
}

/** Pass 2: apply geofence hits, health and claims; emit events. */
export function applyHits(state: DeviceState | null, req: TrackRequest, sm: ReturnType<typeof smooth>, hits: Hit[]) {
  const zone = zoneFor(req.zone.kind, req.zone.id);
  const s: DeviceState = state && state.zone.id === req.zone.id ? state : {
    deviceId: req.deviceId, zone: req.zone, tracker: sm.tracker.snapshot(), territory: null, territoryName: null, enteredAt: 0,
    candidate: null, candidateN: 0, inZone: true, outsideSince: null, health: 100, fainted: false,
    motion: "stand", kmh: 0, lastT: req.fixes[0].t, lat: req.fixes[0].lat, lon: req.fixes[0].lon,
    claimed: state?.claimed ?? [], visits: state?.visits ?? {},
  };
  const events: GooseEvent[] = [];
  const emit = (type: EventType, t: number, at: LngLat, extra: Partial<GooseEvent> = {}) =>
    events.push({ deviceId: req.deviceId, type, at: t, lon: at[0], lat: at[1], createdAt: new Date(), ...extra });

  req.fixes.forEach((f, i) => {
    const out = sm.outs[i], at = sm.points[i], hit = hits[i];
    const dt = Math.max(0, f.t - s.lastT);
    s.lastT = f.t; s.kmh = out.kmh; [s.lon, s.lat] = at;
    if (out.motion !== s.motion) { s.motion = out.motion; emit("motion", f.t, at, { motion: out.motion }); }

    // territory change needs two agreeing fixes (same hysteresis as the browser)
    if (hit.territory !== s.territory) {
      if (hit.territory === s.candidate) s.candidateN++; else { s.candidate = hit.territory; s.candidateN = 1; }
      if (s.candidateN >= 2) {
        if (s.territory) emit("exit", f.t, at, { territory: s.territory, territoryName: s.territoryName });
        s.territory = hit.territory; s.territoryName = hit.territoryName; s.enteredAt = f.t; s.candidate = null; s.candidateN = 0;
        if (hit.territory) {
          s.visits[hit.territory] = (s.visits[hit.territory] ?? 0) + 1;
          emit("enter", f.t, at, { territory: hit.territory, territoryName: hit.territoryName });
        }
      }
    } else { s.candidate = null; s.candidateN = 0; }

    if (s.territory && !s.claimed.includes(s.territory) && f.t - s.enteredAt >= CLAIM_AFTER_S) {
      s.claimed.push(s.territory);
      emit("claim", f.t, at, { territory: s.territory, territoryName: s.territoryName });
    }

    const inside = zone.contains(out.p);
    if (inside !== s.inZone) { s.inZone = inside; s.outsideSince = inside ? null : f.t; emit(inside ? "zone_enter" : "zone_exit", f.t, at, { zone: zone.name }); }
    if (inside) s.health = Math.min(100, s.health + REGEN_PER_S * dt);
    else if (s.outsideSince !== null) {
      // only the part of dt that is past the grace period drains (fixes can be far apart)
      const pastGrace = f.t - s.outsideSince - GRACE_S;
      if (pastGrace > 0) s.health = Math.max(0, s.health - DRAIN_PER_S * Math.min(dt, pastGrace));
    }
    if (s.health <= 0 && !s.fainted) { s.fainted = true; emit("fainted", f.t, at, { zone: zone.name }); }
    if (s.health > 0) s.fainted = false;
  });
  s.tracker = sm.tracker.snapshot();
  return { state: s, events };
}
