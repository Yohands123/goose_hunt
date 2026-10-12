# Goose Turf

A website: a live board-game map of Kitchener, Waterloo and Cambridge where a goose
moves around, claims neighbourhoods (polygon geofences), and loses health outside
its home zone. Built to show real geolocation engineering: geofencing, GPS smoothing,
motion classification, spatial indexing, and a load-tested tracking API.

It is a desktop website. Not a mobile app. No Kotlin/Swift.

## Layout and ownership

Each folder is owned by one agent at a time. Only edit files in the folder you were
assigned. If you need a change somewhere else, write it in `docs/HANDOFF.md` instead.

| Folder    | What it is                                         | Stack                          |
|-----------|----------------------------------------------------|--------------------------------|
| `data/`   | Builds `data/kwc.json` from GRT open data          | TypeScript, turf               |
| `engine/` | Fast polygon lookup service + benchmark            | Rust, axum                     |
| `api/`    | Tracking API: smoothing, events, health, stats     | Node.js, TypeScript, Fastify, Redis, MongoDB |
| `web/`    | The game: map, goose, HUD. Also the Next.js shell  | TypeScript, Next.js            |
| `docs/`   | Contracts, handoff notes, decisions                | Markdown                       |

Shared code: `web/src/game/engine.ts` and `geo.ts` run in both the browser and the API.
They are owned by the **web** agent. The API agent imports them and must not edit them.

## Contracts (read before changing anything that crosses folders)

`docs/CONTRACTS.md` defines the only ways the parts talk to each other:
the `kwc.json` shape, the engine's `POST /v1/locate`, and the API's `POST /v1/track`.
Never change a contract on your own. Propose it in `docs/HANDOFF.md`.

## Rules for every agent

- Run your folder's checks before saying you're done (see its CLAUDE.md).
- Keep the hot path fast: no per-fix network calls beyond one batched engine call per request,
  no allocations in Rust lookup loops, no DOM writes per frame except the goose transform.
- Prefer clear code over clever code. Small functions, names that say what they do.
- Don't add dependencies without a reason written in `docs/HANDOFF.md`.
- Pin dependency versions exactly. The Rust toolchain here is 1.75; check MSRV.
- Map data is approximate: city outlines are hand-traced, transit is from GRT GTFS.
  Keep the attribution line in `kwc.json` and the About panel.
- Never commit `node_modules/`, `engine/target/`, `data/gtfs/`, or `.env` files.

## Running everything

```bash
cd data && npm i && ./fetch-gtfs.sh && npx tsx build-map.ts ./gtfs ./kwc.json
cd engine && cargo run --release            # :7070
cd api && npm i && npm run dev              # :8080 (set ENGINE_URL, REDIS_URL, MONGO_URL)
cd web && npm i && npm run dev              # :3000
docker compose up --build                   # or all of it at once
```

## Working in parallel

Give each agent its own git worktree so they never edit the same checkout:

```bash
git worktree add ../gt-engine -b agent/engine
git worktree add ../gt-api    -b agent/api
git worktree add ../gt-web    -b agent/web
```

Open each worktree in its own VS Code window, start Claude Code there, and tell it
which folder it owns. Merge branches back one at a time and run all checks after each merge.
