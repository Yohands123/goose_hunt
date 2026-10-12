**Play it live: https://goose-hunt-gold.vercel.app** (runs in your browser, nothing to install)

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

## What to try

1. **Switch off GPS smoothing** (gold card, bottom right). Raw fixes make Gus twitch between poses and
   flicker across borders, and the flip counter climbs. Switch it back on and the flips stop.
2. **Claim a neighbourhood.** Drag Gus (or use the arrow keys) across a border and open the Events tab:
   you'll see the exit and enter events. Leave him there for 3 seconds (3 game minutes) to claim it.
3. **Play hard mode.** Click the home-zone chip at the top left, pick a street under "Streets (harder)", then
   hold Shift and an arrow key to drive Gus off it. After a 4-second grace period his health drains until he faints.

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

Measured on one CPU core of a desktop PC. For the load test, every service and the load generator were
pinned to that same core under Docker, so they compete with each other.

| What | Result |
|---|---|
| Rust lookups, 1,495 polygon geofences, brute force | ~280,000 / s |
| Rust lookups, grid index | ~8,200,000 / s (29x faster) |
| Lookup time inside the running engine, under load (`GET /v1/stats`) | ~340 ns per point |
| Full stack (API + Rust engine + Redis + MongoDB), 1,000 devices, 8 requests in flight | ~4,600 fixes/s, p50 7.5 ms, p99 26 ms |
| Same, 64 requests in flight | ~5,300 fixes/s, p50 53 ms, p99 ~140 ms |
| Automated tests | 17 for the tracking logic (`api`), 5 for the engine |

Load-test figures are from warm runs. The first run after a cold start is slower (~3,200 fixes/s at 8 in flight).

Reproduce: `cd engine && cargo run --release --bin bench`, then `docker compose up -d`,
`docker update --cpuset-cpus 0 $(docker compose ps -q)` and `cd api && npm run loadtest -- 1000 15 8`.

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
