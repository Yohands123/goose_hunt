# Goose Turf

A live board-game map of Kitchener, Waterloo and Cambridge. Gus the goose moves around the region,
every neighbourhood is a territory to claim, and Gus loses health if he stays outside his home zone.

Underneath it's a small geolocation platform: polygon geofencing, GPS smoothing and motion
classification, a spatial index in Rust, and a tracking API with Redis and MongoDB.

## What it does

- **Territories are polygon geofences.** 24 neighbourhoods across the three cities. Entering one fires an
  event; staying 3 game-minutes claims it.
- **Gus's pose comes from his GPS fixes only.** Standing, waddling, driving, or flying, from speed
  between fixes. Dragging him with the mouse shows him picked up.
- **Home zones.** Pick a city, or a single street (a 250 m corridor along a real GRT route) for hard mode.
  Outside the zone for more than 4 seconds, health drains; at zero Gus faints.
- **GPS smoothing toggle.** Fixes arrive with realistic noise and occasional jumps. Smoothing rejects
  spikes and requires a new state to hold before switching. Turn it off and the flip counter climbs.
- **Nearby.** ION stations, 1,471 bus stops and landmarks within 600 m, found through a spatial grid.
- **Real transit data.** ION line, stations and bus routes come from Grand River Transit's GTFS feed.

## Architecture

```
web (Next.js + TypeScript)  --POST /v1/track-->  api (Node, Fastify)  --POST /v1/locate-->  engine (Rust)
   game runs fully in the browser;                 smoothing, events, health      polygon lookups, grid index
   optionally mirrors fixes to the API             Redis: device state
                                                   MongoDB: events, stats, 2dsphere geofences
data (TypeScript): GRT GTFS + outlines -> kwc.json, read by all three
```

The smoothing and geofence code in `web/src/game/engine.ts` is shared by the browser and the API.

## Numbers

Measured on a single shared CPU core (so these are conservative):

| What | Result |
|---|---|
| Rust lookups, 1,495 polygon geofences, brute force | ~232,000 / s |
| Rust lookups, grid index | ~5,900,000 / s (26x faster) |
| Full API (Redis + Rust engine), 1,000 devices, 8 in flight | 1,631 fixes/s, p50 18.6 ms, p99 92 ms |
| Same, 64 in flight | 1,791 fixes/s |

Reproduce: `cd engine && cargo run --release --bin bench` and `cd api && npm run loadtest -- 1000 15 8`.

## Run it

```bash
docker compose up --build                  # web :3000, api :8080, engine :7070
```

Or piece by piece:

```bash
cd data && npm i && npm run build           # downloads GTFS, writes kwc.json
cd engine && cargo run --release            # :7070
cd api && npm i && ENGINE_URL=http://localhost:7070 npm run dev    # :8080, memory stores unless REDIS_URL/MONGO_URL set
cd web && npm i && npm run demo             # dist/index.html, single file, no server needed
cd web && NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev     # :3000
```

The single-file demo also mirrors to an API: open `dist/index.html?api=http://localhost:8080`.

## Trade-offs

See `docs/DECISIONS.md`. Short version: hand-traced city outlines checked against bus stop locations,
Voronoi neighbourhoods, a grid index instead of an R-tree at this scale, and no Spark/Airflow because
the data volume doesn't need them.

## Working on it with AI agents

`CLAUDE.md` at the root and in each folder tells Claude Code (or any agent) what it owns, how to check
its work, and which interfaces it must not break (`docs/CONTRACTS.md`). Run agents in separate git
worktrees, one folder each.

## Data and credits

Transit data: Grand River Transit GTFS, contains information provided by the Regional Municipality of
Waterloo under licence. City outlines, neighbourhood shapes and landmark positions are approximate.
Not affiliated with GRT. Goose artwork is original.
