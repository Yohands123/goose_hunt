# Contracts

The interfaces between folders. Changing any of these needs every affected owner to agree
(write the proposal in `HANDOFF.md`). Additive changes (new optional fields) are fine.

## 1. `data/kwc.json` (owner: data)

Coordinates are `[lon, lat]` (GeoJSON order). Rings are closed.

```ts
{
  meta: { builtAt: string; attribution: string };
  cities:      { id: "waterloo" | "kitchener" | "cambridge"; name: string; color: string; ring: [lon, lat][] }[];
  territories: { id: string; name: string; city: string; ring: [lon, lat][] }[];   // id = `${city}-${slug}`
  streets:     { id: string; name: string; route: string; desc: string; line: [lon, lat][] }[];
  ion:         { line: [lon, lat][]; stations: { name: string; at: [lon, lat] }[] };
  busStops:    { name: string; at: [lon, lat] }[];
  landmarks:   { name: string; kind: string; at: [lon, lat] }[];
}
```

Read by: web (`buildWorld`), api (`shared.ts`), engine (`GeofenceIndex::from_json`, uses cities + territories only).

## 2. Engine `POST /v1/locate` (owner: engine, caller: api)

Request `{ "points": [[lon, lat], ...] }` (batch, up to a few thousand).
Response, same order and length:

```json
[{ "territory": "waterloo-uw-campus" | null, "territory_name": "UW Campus" | null, "city": "waterloo" | null }]
```

`GET /health` returns `ok`. Must give the same answer as `territoryAt()` in `web/src/game/engine.ts`
(the Rust test `index_matches_brute_force` and the shared projection constants guard this).

## 3. API `POST /v1/track` (owner: api, caller: web)

Request:
```json
{ "deviceId": "goose-1", "zone": { "kind": "city" | "street", "id": "waterloo" },
  "fixes": [{ "lat": 43.47, "lon": -80.54, "t": 28800 }] }
```
`t` is simulated seconds. Fixes older than the last processed one are ignored.

Response:
```json
{ "events": [{ "type": "enter" | "exit" | "claim" | "zone_exit" | "zone_enter" | "fainted",
               "territory": "...", "territoryName": "...", "zone": "...", "at": 28812, "lat": 0, "lon": 0 }],
  "device": { "territory": "UW Campus", "motion": "stand", "kmh": 0, "health": 100, "inZone": true, "claimed": 1 },
  "latencyMs": 3.1 }
```

Other API routes: `GET /health`, `GET /v1/geofences` (GeoJSON), `GET /v1/devices/:id`, `GET /v1/stats/busiest`.

## 4. Shared projection

Local flat projection centred on lat 43.43, lon -80.45, in metres.
Defined in `web/src/game/geo.ts` and duplicated in `engine/src/lib.rs`. Change both or neither.

## 5. Game thresholds

Motion: stand < 3 km/h, waddle < 15, drive < 150, fly above. Claim after 3 simulated minutes.
Defined in `web/src/game/engine.ts` (motion) and `game.ts` / `api/src/track.ts` (timings). Keep them in sync.
