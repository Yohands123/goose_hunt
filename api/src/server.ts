import Fastify from "fastify";
import { openStores } from "./stores";
import { engineKind, locateBatch } from "./locate";
import { applyHits, smooth, type TrackRequest } from "./track";
import { mapData, world } from "./shared";

const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "warn" } });
const { devices, events } = await openStores();

// The web app may run on another port in development.
app.addHook("onRequest", async (req, reply) => {
  reply.header("access-control-allow-origin", process.env.CORS_ORIGIN ?? "*");
  reply.header("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return reply.code(204).send();
});

app.get("/health", async () => ({ ok: true, engine: engineKind, deviceStore: devices.kind, eventStore: events.kind }));

app.get("/v1/geofences", async () => ({
  type: "FeatureCollection",
  features: mapData.territories.map((t) => ({ type: "Feature", properties: { id: t.id, name: t.name, city: t.city }, geometry: { type: "Polygon", coordinates: [t.ring] } })),
}));

const trackSchema = {
  body: {
    type: "object", required: ["deviceId", "zone", "fixes"],
    properties: {
      deviceId: { type: "string", minLength: 1, maxLength: 64 },
      zone: { type: "object", required: ["kind", "id"], properties: { kind: { enum: ["city", "street"] }, id: { type: "string" } } },
      fixes: { type: "array", minItems: 1, maxItems: 500, items: { type: "object", required: ["lat", "lon", "t"],
        properties: { lat: { type: "number", minimum: -90, maximum: 90 }, lon: { type: "number", minimum: -180, maximum: 180 }, t: { type: "number" } } } },
    },
  },
};

app.post<{ Body: TrackRequest }>("/v1/track", { schema: trackSchema }, async (req, reply) => {
  const started = performance.now();
  const body = req.body;
  const known = body.zone.kind === "city" ? world.cities.some((c) => c.id === body.zone.id) : world.streets.some((s) => s.id === body.zone.id);
  if (!known) return reply.code(400).send({ error: `Unknown ${body.zone.kind} zone "${body.zone.id}". GET /v1/geofences lists the territories.` });
  body.fixes.sort((a, b) => a.t - b.t);

  const prev = await devices.get(body.deviceId);
  // fixes older than what we've already processed can't be applied (GPS buffers sometimes resend)
  if (prev && prev.zone.id === body.zone.id) body.fixes = body.fixes.filter((f) => f.t > prev.lastT);
  if (!body.fixes.length) return { events: [], device: null, latencyMs: 0, note: "All fixes were older than the last processed fix." };
  const sm = smooth(prev, body);
  const hits = await locateBatch(sm.points);
  const { state, events: evs } = applyHits(prev, body, sm, hits);
  await Promise.all([devices.set(body.deviceId, state), events.insert(evs)]);

  return {
    events: evs.filter((e) => e.type !== "motion"),
    device: { territory: state.territoryName, motion: state.motion, kmh: Math.round(state.kmh), health: Math.round(state.health), inZone: state.inZone, claimed: state.claimed.length },
    latencyMs: Math.round((performance.now() - started) * 10) / 10,
  };
});

app.get<{ Params: { id: string } }>("/v1/devices/:id", async (req, reply) => {
  const s = await devices.get(req.params.id);
  if (!s) return reply.code(404).send({ error: `No device "${req.params.id}" has sent fixes in the last hour.` });
  const { tracker: _t, ...rest } = s;
  return { ...rest, recentEvents: await events.recent(req.params.id, 20) };
});

app.get("/v1/stats/busiest", async () => ({ territories: await events.busiest(10) }));

const port = Number(process.env.PORT ?? 8080);
await app.listen({ port, host: "0.0.0.0" });
console.log(`goose-api on :${port} (engine=${engineKind}, devices=${devices.kind}, events=${events.kind})`);
